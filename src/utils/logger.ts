/**
 * ZeroCostLogger
 * 
 * Native, zero-overhead structured JSON logger designed for zero-cost operation.
 * Formats events as structured JSON objects to stdout/stderr.
 * 
 * In Cloud Run / Google Cloud Logging:
 * Cloud Run automatically parses stdout JSON and categorizes events by 'severity'
 * (INFO, WARNING, ERROR, CRITICAL) in Cloud Logging without requiring paid commercial
 * telemetry agents like Datadog.
 * 
 * In local development:
 * Prints readable, parseable JSON directly to the terminal with zero network overhead.
 */

export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'DEBUG';

export interface LogEntry {
  severity: LogSeverity;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

export function logEvent(
  severity: LogSeverity,
  message: string,
  metadata: Record<string, unknown> = {}
): void {
  const logEntry: LogEntry = {
    severity: severity.toUpperCase() as LogSeverity,
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  };

  const serialized = JSON.stringify(logEntry);

  if (severity === 'ERROR' || severity === 'CRITICAL') {
    console.error(serialized);
  } else if (severity === 'WARNING') {
    console.warn(serialized);
  } else {
    console.log(serialized);
  }
}
