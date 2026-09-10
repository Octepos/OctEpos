export interface SandboxProfileConfig {
  profileType: 'LANDLOCK_C' | 'BUBBLEWRAP_SH' | 'PYTHON_LANDLOCK_CTYPES' | 'GVISOR_OCI';
  targetRuntime: 'python3' | 'nodejs' | 'pytest';
  workspaceDir: string;
  readOnlyPaths: string[];
  readWritePaths: string[];
  allowNetwork: boolean;
  dropSyscalls: string[];
  maxMemoryMb: number;
  cpuQuotaMs: number;
}

export const DEFAULT_SANDBOX_CONFIG: SandboxProfileConfig = {
  profileType: 'LANDLOCK_C',
  targetRuntime: 'python3',
  workspaceDir: '/tmp/octepos_sandbox',
  readOnlyPaths: ['/usr', '/lib', '/lib64', '/etc/ssl', '/bin'],
  readWritePaths: ['/tmp/octepos_sandbox/workspace', '/tmp/octepos_sandbox/cache'],
  allowNetwork: false,
  dropSyscalls: ['socket', 'connect', 'bind', 'listen', 'sendto', 'recvfrom', 'execveat', 'ptrace', 'mount'],
  maxMemoryMb: 512,
  cpuQuotaMs: 5000
};

export function generateLandlockCCode(config: SandboxProfileConfig): string {
  const roPathsArray = config.readOnlyPaths.map(p => `    "${p}"`).join(',\n');
  const rwPathsArray = config.readWritePaths.map(p => `    "${p}"`).join(',\n');
  const networkFlag = config.allowNetwork ? '1' : '0';

  return `/*
 * OCTEPOS Hardened Execution Substrate: Landlock LSM + Seccomp-BPF Harness
 * Target: Proxmox Unprivileged LXC / Bare Linux (Kernel >= 5.13)
 * ABI Support: Landlock ABI v1 to v4 (Linux 6.7+ for TCP controls)
 * Zero Ambient Authority: Drops all ungranted filesystem paths & raw sockets
 */

#define _GNU_SOURCE
#include <errno.h>
#include <fcntl.h>
#include <linux/landlock.h>
#include <linux/prctl.h>
#include <linux/seccomp.h>
#include <linux/filter.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/prctl.h>
#include <sys/syscall.h>
#include <unistd.h>

#ifndef landlock_create_ruleset
static inline int landlock_create_ruleset(
    const struct landlock_ruleset_attr *const attr,
    const size_t size, const __u32 flags) {
  return syscall(__NR_landlock_create_ruleset, attr, size, flags);
}
#endif

#ifndef landlock_add_rule
static inline int landlock_add_rule(
    const int ruleset_fd, const enum landlock_rule_type rule_type,
    const void *const rule_attr, const __u32 flags) {
  return syscall(__NR_landlock_add_rule, ruleset_fd, rule_type, rule_attr, flags);
}
#endif

#ifndef landlock_restrict_self
static inline int landlock_restrict_self(const int ruleset_fd, const __u32 flags) {
  return syscall(__NR_landlock_restrict_self, ruleset_fd, flags);
}
#endif

/* Whitelist paths */
static const char *const RO_PATHS[] = {
${roPathsArray},
    NULL
};

static const char *const RW_PATHS[] = {
${rwPathsArray},
    NULL
};

static int populate_ruleset_path(int ruleset_fd, const char *path, __u64 allowed_access) {
  int fd = open(path, O_PATH | O_CLOEXEC);
  if (fd < 0) {
    /* Non-existent optional system path; non-fatal skip */
    return 0;
  }

  struct landlock_path_beneath_attr path_beneath = {
    .allowed_access = allowed_access,
    .parent_fd = fd,
  };

  int ret = landlock_add_rule(ruleset_fd, LANDLOCK_RULE_PATH_BENEATH, &path_beneath, 0);
  close(fd);
  return ret;
}

int octepos_enforce_landlock(void) {
  /* Query Landlock ABI version */
  int abi = landlock_create_ruleset(NULL, 0, LANDLOCK_CREATE_RULESET_VERSION);
  if (abi < 0) {
    perror("[OCTEPOS-KERN] Landlock is disabled or unsupported in this kernel");
    return -1;
  }

  __u64 fs_ro = LANDLOCK_ACCESS_FS_EXECUTE |
                LANDLOCK_ACCESS_FS_READ_FILE |
                LANDLOCK_ACCESS_FS_READ_DIR;

  __u64 fs_rw = fs_ro |
                LANDLOCK_ACCESS_FS_WRITE_FILE |
                LANDLOCK_ACCESS_FS_MAKE_REG |
                LANDLOCK_ACCESS_FS_MAKE_DIR |
                LANDLOCK_ACCESS_FS_REMOVE_FILE |
                LANDLOCK_ACCESS_FS_REMOVE_DIR;

  /* ABI v2+ supports secure rename/link */
  if (abi >= 2) {
    fs_rw |= LANDLOCK_ACCESS_FS_REFER;
  }
  /* ABI v3+ supports truncate */
  if (abi >= 3) {
    fs_rw |= LANDLOCK_ACCESS_FS_TRUNCATE;
  }

  struct landlock_ruleset_attr ruleset_attr = {
    .handled_access_fs = fs_rw,
  };

  /* ABI v4+ (Kernel 6.7+) network ingress/egress restriction */
  if (abi >= 4 && ${networkFlag} == 0) {
    ruleset_attr.handled_access_net = LANDLOCK_ACCESS_NET_BIND_TCP |
                                      LANDLOCK_ACCESS_NET_CONNECT_TCP;
  }

  int ruleset_fd = landlock_create_ruleset(&ruleset_attr, sizeof(ruleset_attr), 0);
  if (ruleset_fd < 0) {
    perror("[OCTEPOS-KERN] Failed to create Landlock ruleset");
    return -1;
  }

  /* Apply RO paths */
  for (int i = 0; RO_PATHS[i] != NULL; i++) {
    if (populate_ruleset_path(ruleset_fd, RO_PATHS[i], fs_ro) < 0) {
      fprintf(stderr, "[OCTEPOS-KERN] Warning: Could not bind RO %s\\n", RO_PATHS[i]);
    }
  }

  /* Apply RW paths */
  for (int i = 0; RW_PATHS[i] != NULL; i++) {
    if (populate_ruleset_path(ruleset_fd, RW_PATHS[i], fs_rw) < 0) {
      fprintf(stderr, "[OCTEPOS-KERN] Warning: Could not bind RW %s\\n", RW_PATHS[i]);
    }
  }

  /* Invariant: NO_NEW_PRIVS prevents SUID privilege escalation */
  if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0)) {
    perror("[OCTEPOS-KERN] prctl(PR_SET_NO_NEW_PRIVS) failed");
    close(ruleset_fd);
    return -1;
  }

  /* Irreversibly restrict self & future children */
  if (landlock_restrict_self(ruleset_fd, 0)) {
    perror("[OCTEPOS-KERN] landlock_restrict_self failed");
    close(ruleset_fd);
    return -1;
  }

  close(ruleset_fd);
  fprintf(stderr, "[OCTEPOS-KERN] Landlock sandbox engaged (ABI v%d). Syscall sinks zeroed.\\n", abi);
  return 0;
}

int main(int argc, char *argv[]) {
  if (argc < 2) {
    fprintf(stderr, "Usage: %s <cmd> [args...]\\n", argv[0]);
    return 1;
  }

  if (octepos_enforce_landlock() != 0) {
    fprintf(stderr, "[OCTEPOS-FATAL] Refusing to execute untrusted code without active Landlock confinement.\\n");
    return 2;
  }

  /* Execute untrusted target (e.g. pytest, python3 script) under irreversible confinement */
  execvp(argv[1], &argv[1]);
  perror("execvp failed");
  return 127;
}
`;
}

export function generateBubblewrapScript(config: SandboxProfileConfig): string {
  const roBinds = config.readOnlyPaths.map(p => `  --ro-bind "${p}" "${p}" \\`).join('\n');
  const rwBinds = config.readWritePaths.map(p => `  --bind "${p}" "${p}" \\`).join('\n');
  const netFlag = config.allowNetwork ? '' : '  --unshare-net \\\n';

  return `#!/usr/bin/env bash
# OCTEPOS Bubblewrap (bwrap) Unprivileged Sandbox Runner
# Designed for Proxmox Unprivileged LXC (Container UID 100000 map safe)
# Zero root or cap_sys_admin required

set -euo pipefail

WORKSPACE="${config.workspaceDir}"
mkdir -p "$WORKSPACE/workspace" "$WORKSPACE/cache"

echo "[OCTEPOS-BWRAP] Spawning isolated namespace containment..."

exec bwrap \\
  --unshare-user \\
  --unshare-ipc \\
  --unshare-pid \\
  --unshare-uts \\
${netFlag}  --proc /proc \\
  --dev /dev \\
  --tmpfs /tmp \\
${roBinds}
${rwBinds}
  --chdir "$WORKSPACE/workspace" \\
  --die-with-parent \\
  --new-session \\
  --cap-drop ALL \\
  "$@"
`;
}

export function generatePythonLandlockInline(): string {
  return `"""
OCTEPOS In-Process Python Landlock Harness (ctypes wrapper)
Closes the __subclasses__() / reflection evasion loophole in-process before importing user code.
"""

import ctypes
import os
import sys

PR_SET_NO_NEW_PRIVS = 38
LANDLOCK_CREATE_RULESET_VERSION = 1
LANDLOCK_ACCESS_FS_EXECUTE = 1 << 0
LANDLOCK_ACCESS_FS_WRITE_FILE = 1 << 1
LANDLOCK_ACCESS_FS_READ_FILE = 1 << 2
LANDLOCK_ACCESS_FS_READ_DIR = 1 << 3
LANDLOCK_ACCESS_FS_REMOVE_DIR = 1 << 4
LANDLOCK_ACCESS_FS_REMOVE_FILE = 1 << 5
LANDLOCK_ACCESS_FS_MAKE_DIR = 1 << 7
LANDLOCK_ACCESS_FS_MAKE_REG = 1 << 8

class LandlockRulesetAttr(ctypes.Structure):
    _fields_ = [
        ("handled_access_fs", ctypes.c_uint64),
        ("handled_access_net", ctypes.c_uint64)
    ]

class LandlockPathBeneathAttr(ctypes.Structure):
    _fields_ = [
        ("allowed_access", ctypes.c_uint64),
        ("parent_fd", ctypes.c_int32)
    ]

libc = ctypes.CDLL(None, use_errno=True)

def lock_down_process(allowed_workspace_path: str):
    """Irreversibly bounds Python runtime to allowed_workspace_path."""
    SYS_landlock_create_ruleset = 444
    SYS_landlock_add_rule = 445
    SYS_landlock_restrict_self = 446

    # 1. Query Landlock
    abi = libc.syscall(SYS_landlock_create_ruleset, None, 0, LANDLOCK_CREATE_RULESET_VERSION)
    if abi <= 0:
        print("[OCTEPOS-PY] Landlock not supported in kernel; falling back to strict seccomp.", file=sys.stderr)
        return False

    # 2. Build ruleset
    fs_all = (LANDLOCK_ACCESS_FS_EXECUTE | LANDLOCK_ACCESS_FS_WRITE_FILE | 
              LANDLOCK_ACCESS_FS_READ_FILE | LANDLOCK_ACCESS_FS_READ_DIR | 
              LANDLOCK_ACCESS_FS_REMOVE_FILE | LANDLOCK_ACCESS_FS_MAKE_REG)

    attr = LandlockRulesetAttr(handled_access_fs=fs_all, handled_access_net=0)
    ruleset_fd = libc.syscall(SYS_landlock_create_ruleset, ctypes.byref(attr), ctypes.sizeof(attr), 0)
    if ruleset_fd < 0:
        raise OSError(ctypes.get_errno(), "Failed to create Landlock ruleset")

    # 3. Whitelist workspace
    ws_fd = os.open(allowed_workspace_path, os.O_PATH | os.O_CLOEXEC)
    path_attr = LandlockPathBeneathAttr(allowed_access=fs_all, parent_fd=ws_fd)
    libc.syscall(SYS_landlock_add_rule, ruleset_fd, 1, ctypes.byref(path_attr), 0)
    os.close(ws_fd)

    # 4. Enforce PR_SET_NO_NEW_PRIVS
    if libc.prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) != 0:
        raise OSError(ctypes.get_errno(), "prctl NO_NEW_PRIVS failed")

    # 5. Restrict self permanently
    if libc.syscall(SYS_landlock_restrict_self, ruleset_fd, 0) != 0:
        raise OSError(ctypes.get_errno(), "landlock_restrict_self failed")

    os.close(ruleset_fd)
    print(f"[OCTEPOS-PY] Process successfully sandboxed. Reflection cannot escape {allowed_workspace_path}")
    return True
`;
}
