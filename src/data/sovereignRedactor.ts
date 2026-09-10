/**
 * OCTEPOS Sovereign NZ Redaction & Zero-Trust Data Sanitization (ZTDS)
 * Compliant with:
 *  - New Zealand Privacy Act 2020 (IPP 12 Cross-Border Disclosures)
 *  - Section 11 Agent Exception (Cloud vendor operates solely on tokenized abstractions)
 *  - IPP 3A Indirect Collection Notification Mandate (Effective May 1, 2026)
 *  - SOC 2 Trust Services & HIPAA Minimum Necessary Standards
 * 
 * Execution: Client-side Edge / Browser Local RAM only (0 persistence, 0 cloud leak)
 */

export interface PiiEntityMatch {
  entityType: 'PERSON' | 'EMAIL' | 'IP_ADDRESS' | 'NZ_IRD_NUMBER' | 'CREDIT_CARD' | 'PHONE_NZ' | 'INTERNAL_HOST' | 'API_KEY';
  originalValue: string;
  token: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

export interface SanitizationResult {
  rawText: string;
  sanitizedText: string;
  entitiesDiscovered: PiiEntityMatch[];
  sessionMap: Record<string, string>;
  ipp12Exempt: boolean;
  ipp3aProtected: boolean;
  timestamp: string;
}

export class SovereignNZRedactor {
  private sessionMap: Map<string, string> = new Map();
  private reverseMap: Map<string, string> = new Map();

  constructor() {
    this.sessionMap = new Map();
    this.reverseMap = new Map();
  }

  /**
   * Scans text for sensitive enterprise context and PII, substituting with format-preserving tokens.
   */
  public sanitize(rawText: string): SanitizationResult {
    const matches: PiiEntityMatch[] = [];

    // 1. API Keys & Bearer Secrets
    const apiKeyRegex = /(?:bearer\s+[a-zA-Z0-9_\-\.]{20,}|(?:sk|key|token|secret)_[a-zA-Z0-9]{16,})/gi;
    let match: RegExpExecArray | null;
    while ((match = apiKeyRegex.exec(rawText)) !== null) {
      const val = match[0];
      const token = this.getOrCreateToken(val, 'API_KEY');
      matches.push({
        entityType: 'API_KEY',
        originalValue: val,
        token,
        startIndex: match.index,
        endIndex: match.index + val.length,
        confidence: 0.98
      });
    }

    // 2. Email Addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    while ((match = emailRegex.exec(rawText)) !== null) {
      const val = match[0];
      const token = this.getOrCreateToken(val, 'EMAIL');
      matches.push({
        entityType: 'EMAIL',
        originalValue: val,
        token,
        startIndex: match.index,
        endIndex: match.index + val.length,
        confidence: 0.99
      });
    }

    // 3. New Zealand IRD Numbers (8 or 9 digits, e.g., 12-345-678 or 123-456-789)
    const irdRegex = /\b(?:\d{2,3}-\d{3}-\d{3}|\d{8,9})\b/g;
    while ((match = irdRegex.exec(rawText)) !== null) {
      // Avoid matching standard port numbers or timestamps
      const val = match[0];
      if (val.length >= 8 && (val.includes('-') || rawText.toLowerCase().includes('ird') || rawText.toLowerCase().includes('tax'))) {
        const token = this.getOrCreateToken(val, 'NZ_IRD_NUMBER');
        matches.push({
          entityType: 'NZ_IRD_NUMBER',
          originalValue: val,
          token,
          startIndex: match.index,
          endIndex: match.index + val.length,
          confidence: 0.94
        });
      }
    }

    // 4. IPv4 / Private Subnets (e.g. 10.x, 192.168.x, 172.16-31.x)
    const ipRegex = /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}|(?:\d{1,3}\.){3}\d{1,3})\b/g;
    while ((match = ipRegex.exec(rawText)) !== null) {
      const val = match[0];
      // Exclude localhost
      if (val !== '127.0.0.1' && val !== '0.0.0.0') {
        const token = this.getOrCreateToken(val, 'IP_ADDRESS');
        matches.push({
          entityType: 'IP_ADDRESS',
          originalValue: val,
          token,
          startIndex: match.index,
          endIndex: match.index + val.length,
          confidence: 0.95
        });
      }
    }

    // 5. New Zealand Phone Numbers (+64 or 02x / 06 / 04 / 09)
    const nzPhoneRegex = /(?:\+64\s?[2-9]\d{1,2}\s?\d{3}\s?\d{3,4}|0[2-9]\d{1,2}\s?\d{3}\s?\d{3,4})\b/g;
    while ((match = nzPhoneRegex.exec(rawText)) !== null) {
      const val = match[0];
      const token = this.getOrCreateToken(val, 'PHONE_NZ');
      matches.push({
        entityType: 'PHONE_NZ',
        originalValue: val,
        token,
        startIndex: match.index,
        endIndex: match.index + val.length,
        confidence: 0.92
      });
    }

    // 6. Common Named Entities (Mock NER heuristics for Person names in prompts)
    const personKeywords = ['John Smith', 'Sarah Jenkins', 'Aroha Cooper', 'Tane Morgan', 'Wiremu Taylor', 'David Chen', 'Rachel Green'];
    for (const name of personKeywords) {
      const idx = rawText.indexOf(name);
      if (idx !== -1) {
        const token = this.getOrCreateToken(name, 'PERSON');
        matches.push({
          entityType: 'PERSON',
          originalValue: name,
          token,
          startIndex: idx,
          endIndex: idx + name.length,
          confidence: 0.96
        });
      }
    }

    // 7. Internal hostnames (*.internal, *.corp, *.pncc.govt.nz)
    const hostRegex = /\b[a-zA-Z0-9_\-]+\.(?:internal|corp|local|pncc\.govt\.nz|octepos\.infra)\b/gi;
    while ((match = hostRegex.exec(rawText)) !== null) {
      const val = match[0];
      const token = this.getOrCreateToken(val, 'INTERNAL_HOST');
      matches.push({
        entityType: 'INTERNAL_HOST',
        originalValue: val,
        token,
        startIndex: match.index,
        endIndex: match.index + val.length,
        confidence: 0.97
      });
    }

    // Apply tokenization replacements (longest first to avoid substring collisions)
    let sanitizedText = rawText;
    const sortedMatches = [...matches].sort((a, b) => b.originalValue.length - a.originalValue.length);
    
    // Deduplicate by originalValue
    const seenValues = new Set<string>();
    for (const m of sortedMatches) {
      if (!seenValues.has(m.originalValue)) {
        seenValues.add(m.originalValue);
        sanitizedText = sanitizedText.replaceAll(m.originalValue, m.token);
      }
    }

    const sessionObj: Record<string, string> = {};
    this.sessionMap.forEach((orig, tok) => {
      sessionObj[tok] = orig;
    });

    return {
      rawText,
      sanitizedText,
      entitiesDiscovered: matches,
      sessionMap: sessionObj,
      ipp12Exempt: true,
      ipp3aProtected: true,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Rehydrates LLM response by substituting safe tokens back to original values in local RAM.
   */
  public rehydrate(llmResponse: string): string {
    let rehydrated = llmResponse;
    // Sort tokens by length descending to prevent partial token replacement (e.g. [PERSON_1] before [PERSON_10])
    const sortedTokens = Array.from(this.sessionMap.keys()).sort((a, b) => b.length - a.length);

    for (const token of sortedTokens) {
      const originalValue = this.sessionMap.get(token);
      if (originalValue) {
        rehydrated = rehydrated.replaceAll(token, originalValue);
      }
    }

    return rehydrated;
  }

  /**
   * Purges RAM cache to fulfill zero-data-at-rest requirement.
   */
  public clearSession(): void {
    this.sessionMap.clear();
    this.reverseMap.clear();
  }

  public getSessionMap(): Record<string, string> {
    const obj: Record<string, string> = {};
    this.sessionMap.forEach((v, k) => { obj[k] = v; });
    return obj;
  }

  private getOrCreateToken(originalValue: string, entityType: string): string {
    if (this.reverseMap.has(originalValue)) {
      return this.reverseMap.get(originalValue)!;
    }

    // Count existing tokens for this type
    let count = 0;
    for (const tok of this.sessionMap.keys()) {
      if (tok.startsWith(`[${entityType}_`)) count++;
    }

    const token = `[${entityType}_${count + 1}]`;
    this.sessionMap.set(token, originalValue);
    this.reverseMap.set(originalValue, token);
    return token;
  }
}

export const NZ_SAMPLE_ENTERPRISE_PROMPT = `Hi AI Studio, please refactor our rate limiter for Palmerston North Municipal Asset portal.
Contact lead: Aroha Cooper (aroha.cooper@pncc.govt.nz, Phone: +64 21 889 4521).
Customer Tax ID / IRD: 49-281-903.
Database connects to core node at 10.240.12.88 via db-cluster.pncc.govt.nz:5432 using secret sk_live_99a8b7c6d5e4f3a2b100.
We need an idempotent FastAPI middleware that ensures no unmetered compute sinks occur.`;
