import type { JWTHeader, JWTPayload, JWTRisk } from '../types';

/**
 * Polyfill for atob in case it's not available in the environment
 */
function safeAtob(str: string): string {
  try {
    // Use the built-in function if available
    return atob(str);
  } catch (e) {
    // Fallback implementation
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    
    str = String(str).replace(/=+$/, '');
    
    if (str.length % 4 === 1) {
      throw new Error('Invalid base64 string');
    }
    
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    
    return output;
  }
}

/**
 * Decode a JWT token string
 * @param token JWT token string
 * @returns Decoded JWT or null if invalid
 */
export function decodeJWT(token: string): {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
} | null {
  try {
    const parts = token.split('.');
    
    if (parts.length !== 3) {
      return null;
    }
    
    const header = JSON.parse(safeAtob(urlDecodeBase64(parts[0])));
    const payload = JSON.parse(safeAtob(urlDecodeBase64(parts[1])));
    const signature = parts[2];
    
    return { header, payload, signature };
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Decode base64url string
 * @param str Base64url encoded string
 * @returns Decoded base64 string
 */
function urlDecodeBase64(str: string): string {
  // Convert base64url to base64
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Add padding if needed
  const pad = str.length % 4;
  if (pad) {
    str += '='.repeat(4 - pad);
  }
  
  return str;
}

/**
 * Analyze JWT security
 * @param header JWT header
 * @param payload JWT payload
 * @returns Security analysis results
 */
export function analyzeJWTSecurity(header: JWTHeader, payload: JWTPayload): {
  risks: JWTRisk[];
  suggestions: string[];
  expStatus?: 'valid' | 'expired' | 'not_yet_valid';
  timeLeft?: string;
} {
  const risks: JWTRisk[] = [];
  const suggestions: string[] = [];
  let expStatus: 'valid' | 'expired' | 'not_yet_valid' = 'valid';
  let timeLeft = 'N/A';

  // Current timestamp
  const now = Math.floor(Date.now() / 1000);

  // Check algorithm security risks
  if (!header.alg) {
    risks.push({
      severity: 'critical',
      description: 'No algorithm specified in header',
      impact: 'Allows attackers to potentially bypass signature verification by manipulating the algorithm'
    });
    suggestions.push('Specify a secure JWT algorithm in the header');
  } else if (header.alg === 'none') {
    risks.push({
      severity: 'critical',
      description: 'Algorithm set to "none" - signature verification is bypassed',
      impact: 'Attacker can modify the token payload without invalidating the signature'
    });
    suggestions.push('Use a secure algorithm like RS256 or ES256');
    suggestions.push('Explicitly reject tokens with "none" algorithm');
  } else if (['HS256', 'HS384', 'HS512'].includes(header.alg)) {
    risks.push({
      severity: 'medium',
      description: 'Using symmetric algorithm - same key for signing and verification',
      impact: 'If verification key is exposed, attackers can forge new valid tokens'
    });
    suggestions.push('Consider using asymmetric algorithms like RS256 or ES256 for better security isolation');
    suggestions.push('Ensure symmetric keys are strong (at least 256 bits) and regularly rotated');
  }

  // Check for JWK or JKU parameters (potential injection vectors)
  if (header.jwk) {
    risks.push({
      severity: 'critical',
      description: 'Token contains "jwk" parameter in header',
      impact: 'Attacker can supply their own public key in the header, allowing them to forge valid signatures'
    });
    suggestions.push('Do not accept "jwk" parameters in JWT headers');
    suggestions.push('Implement a whitelist of trusted keys on the server side');
  }

  if (header.jku) {
    risks.push({
      severity: 'critical',
      description: 'Token contains "jku" parameter in header',
      impact: 'Attacker can point to malicious JWKS URLs, enabling server-side request forgery (SSRF) or key injection'
    });
    suggestions.push('Do not accept "jku" parameters from untrusted sources');
    suggestions.push('Implement a whitelist of trusted JWKS URLs on the server side');
  }

  // Check for suspicious kid parameters
  if (header.kid) {
    if (header.kid.includes('../') || header.kid.includes('..\\')) {
      risks.push({
        severity: 'critical',
        description: 'Token contains path traversal patterns in "kid" parameter',
        impact: 'Can lead to directory traversal attacks if improperly handled server-side'
      });
      suggestions.push('Validate and sanitize the "kid" parameter to prevent path traversal');
    }
    
    if (header.kid.includes("'") || header.kid.includes('"') || 
        header.kid.includes('=') || header.kid.includes(';')) {
      risks.push({
        severity: 'critical',
        description: 'Token contains potentially injectable characters in "kid" parameter',
        impact: 'May allow SQL injection or command injection if server uses "kid" in database queries or file operations'
      });
      suggestions.push('Implement strict input validation for the "kid" parameter');
      suggestions.push('Use parameterized queries when retrieving keys based on kid');
    }
  }

  // Algorithm confusion risk for RS256
  if (header.alg === 'RS256') {
    risks.push({
      severity: 'high',
      description: 'Potential vulnerability to algorithm confusion (RS256 to HS256)',
      impact: 'If JWT library accepts algorithm changes without validation, attacker can force token verification with public key as a HMAC secret'
    });
    suggestions.push('Explicitly verify the algorithm used in tokens and enforce the expected algorithm');
    suggestions.push('Separate key storage by algorithm type to prevent algorithm confusion attacks');
  }

  // Check type
  if (!header.typ) {
    risks.push({
      severity: 'low',
      description: 'Missing token type in header',
      impact: 'May cause interoperability issues with some JWT libraries'
    });
    suggestions.push('Include "typ": "JWT" in the header for better interoperability');
  } else if (header.typ !== 'JWT') {
    risks.push({
      severity: 'low',
      description: `Token type is "${header.typ}" instead of "JWT"`,
      impact: 'May cause interoperability issues with some JWT libraries'
    });
  }

  // Check expiration
  if (!payload.exp) {
    risks.push({
      severity: 'high',
      description: 'Token has no expiration time (exp claim)',
      impact: 'Token remains valid indefinitely if compromised, increasing the attack window'
    });
    suggestions.push('Add expiration claim (exp) to limit token lifetime');
    suggestions.push('Implement server-side token revocation capabilities to handle compromised tokens');
  } else {
    const exp = payload.exp;
    if (exp < now) {
      risks.push({
        severity: 'medium',
        description: `Token expired at ${new Date(exp * 1000).toLocaleString()}`,
        impact: 'Token should be rejected by properly implemented systems'
      });
      expStatus = 'expired';
      timeLeft = 'Expired';
    } else {
      const timeToExpire = exp - now;
      // Format time left
      if (timeToExpire < 60) {
        timeLeft = `${timeToExpire} seconds`;
      } else if (timeToExpire < 3600) {
        timeLeft = `${Math.floor(timeToExpire / 60)} minutes`;
      } else if (timeToExpire < 86400) {
        timeLeft = `${Math.floor(timeToExpire / 3600)} hours`;
      } else {
        timeLeft = `${Math.floor(timeToExpire / 86400)} days`;
      }

      // Check if expiration is too far in the future
      if (timeToExpire > 86400 * 30) { // More than 30 days
        risks.push({
          severity: 'medium',
          description: `Token has a long expiration time (${timeLeft})`,
          impact: 'Long-lived tokens provide a larger window of opportunity for attackers if the token is leaked'
        });
        suggestions.push('Consider using shorter token lifetimes (hours/days instead of months/years)');
        suggestions.push('Implement token refresh mechanisms for better security');
      }
    }
  }

  // Check "not before" time
  if (payload.nbf && payload.nbf > now) {
    risks.push({
      severity: 'medium',
      description: `Token not valid until ${new Date(payload.nbf * 1000).toLocaleString()}`,
      impact: 'Token should be rejected until the nbf time is reached'
    });
    expStatus = 'not_yet_valid';
    timeLeft = 'Not valid yet';
  }

  // Check for missing recommended claims
  if (!payload.iat) {
    risks.push({
      severity: 'low',
      description: 'Missing "issued at" (iat) claim',
      impact: 'Harder to track token age and implement proper token rotation policies'
    });
    suggestions.push('Add "issued at" (iat) claim for better token tracking');
  }

  if (!payload.jti) {
    risks.push({
      severity: 'medium',
      description: 'Missing JWT ID (jti) claim',
      impact: 'Without a unique identifier, tokens cannot be revoked individually and are vulnerable to replay attacks'
    });
    suggestions.push('Add JWT ID (jti) claim to enable token revocation and prevent replay attacks');
    suggestions.push('Implement server-side token tracking with a blocklist for revoked tokens');
  }

  if (!payload.iss) {
    risks.push({
      severity: 'medium',
      description: 'Missing issuer (iss) claim',
      impact: 'Prevents verification of token origin, enabling cross-service token replay attacks'
    });
    suggestions.push('Add issuer (iss) claim and validate it on the receiving end');
  }

  if (!payload.sub) {
    risks.push({
      severity: 'medium',
      description: 'Missing subject (sub) claim',
      impact: 'Harder to identify which user or entity the token represents, complicating access control'
    });
    suggestions.push('Add subject (sub) claim to identify the token subject');
  }

  if (!payload.aud && header.alg !== 'none') {
    risks.push({
      severity: 'medium',
      description: 'Missing audience (aud) claim',
      impact: 'Tokens can be replayed across different services that share the same signing key'
    });
    suggestions.push('Include audience (aud) claim to restrict where tokens can be used');
    suggestions.push('Validate audience claim in each service that accepts the token');
  }

  // Advanced security checks for X.509 certificate issues (CVE-2023-48238)
  if (header.x5c || header.x5u) {
    risks.push({
      severity: 'critical',
      description: 'Token uses X.509 certificate chain validation',
      impact: 'Vulnerable to certificate bypass attacks if validation is improperly implemented (CVE-2023-48238)'
    });
    suggestions.push('Ensure proper X.509 certificate validation including chain validation and revocation checking');
  }

  // Check for potentially sensitive information in payload
  const sensitiveKeys = [
    'password', 'secret', 'private', 'apikey', 'api_key', 'token', 'credentials', 
    'passwd', 'pass', 'key', 'auth', 'authz', 'oauth', 'access_token', 'refresh_token',
    'client_secret', 'hash', 'salt', 'credit', 'card', 'cvv', 'ssn', 'social'
  ];
  const foundSensitiveKeys = Object.keys(payload).filter(key => 
    sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
  );
  
  if (foundSensitiveKeys.length > 0) {
    risks.push({
      severity: 'high',
      description: `Token contains potentially sensitive data keys: ${foundSensitiveKeys.join(', ')}`,
      impact: 'Sensitive data in tokens could be exposed if the token is intercepted or stored in logs/browser history'
    });
    suggestions.push('Remove sensitive information from JWT payload');
    suggestions.push('Store only identifiers in JWTs, not actual sensitive data');
  }

  // Check for overprivileged tokens
  const adminIndicators = [
    'admin', 'root', 'superuser', 'administrator', 'sudo', 'true', '1', 'yes'
  ];
  
  // Look for admin roles or privileges
  const adminKeys = Object.entries(payload).filter(([key, value]) => {
    const keyLower = key.toLowerCase();
    if (
      keyLower.includes('admin') || 
      keyLower.includes('role') || 
      keyLower.includes('priv') ||
      keyLower.includes('perm') ||
      keyLower.includes('access') ||
      keyLower.includes('right')
    ) {
      const strValue = String(value).toLowerCase();
      return adminIndicators.some(indicator => strValue.includes(indicator));
    }
    return false;
  });
  
  if (adminKeys.length > 0) {
    risks.push({
      severity: 'high',
      description: 'Token contains administrative privileges',
      impact: 'If stolen, attacker gains administrative access to the system'
    });
    suggestions.push('Ensure administrative tokens have shortest possible lifetime');
    suggestions.push('Implement additional verification steps for admin-level operations');
    suggestions.push('Consider using separate, short-lived tokens for sensitive operations');
  }

  // Check for scope explosion vulnerabilities (if scopes are present)
  const scopeKeys = Object.entries(payload).filter(([key]) => 
    key.toLowerCase() === 'scope' || key.toLowerCase() === 'scopes'
  );
  
  if (scopeKeys.length > 0) {
    const scopes = scopeKeys[0][1];
    let scopeCount = 0;
    
    if (typeof scopes === 'string') {
      scopeCount = scopes.split(/[\s,]/).filter(Boolean).length;
    } else if (Array.isArray(scopes)) {
      scopeCount = scopes.length;
    }
    
    if (scopeCount > 10) {
      risks.push({
        severity: 'medium',
        description: `Token has a high number of scopes (${scopeCount})`,
        impact: 'Excessive permissions increase attack surface if token is compromised (least privilege principle violation)'
      });
      suggestions.push('Follow the principle of least privilege by minimizing scopes');
    }
  }

  // Check for known vulnerabilities by JWT library
  if (header.alg === "HS256" && typeof payload.exp === "string") {
    risks.push({
      severity: 'high',
      description: 'Potential vulnerability to CVE-2022-21449 (Psychic Signatures)',
      impact: 'Type confusion in HS256 with string expiration time may lead to signature validation bypass in vulnerable libraries'
    });
    suggestions.push('Ensure all date values are numbers, not strings');
    suggestions.push('Update JWT libraries to patched versions');
  }

  // Check for blank password vulnerability (CVE-2018-1000531)
  if (header.alg && header.alg.startsWith('HS')) {
    risks.push({
      severity: 'high',
      description: 'Potential vulnerability to empty key attacks (CVE-2018-1000531)',
      impact: 'Tokens signed with empty keys may be accepted by vulnerable JWT libraries'
    });
    suggestions.push('Test for acceptance of tokens signed with empty keys');
    suggestions.push('Ensure JWT libraries are updated to prevent empty key acceptance');
  }

  // Check for X5U header parameter (CVE-2017-18267)
  if (header.x5u) {
    risks.push({
      severity: 'critical',
      description: 'Token contains X5U parameter (CVE-2017-18267)',
      impact: 'Remote certificate URL can lead to SSRF attacks and key injection in vulnerable libraries'
    });
    suggestions.push('Disable X5U parameter processing in JWT libraries');
    suggestions.push('Implement a whitelist for trusted certificate locations');
  }

  // Check for crit header parameter (CVE-2023-32681)
  if (header.crit) {
    risks.push({
      severity: 'high',
      description: 'Token contains crit parameter (CVE-2023-32681)',
      impact: 'Critical header extensions may be improperly handled by JWT libraries, potentially bypassing signature verification'
    });
    suggestions.push('Verify your JWT library properly handles critical header parameters');
    suggestions.push('Consider rejecting tokens with crit headers if not necessary for your application');
  }
  
  // Check for common key disclosure vulnerabilities
  if (header.kid && (header.kid.includes('file://') || header.kid.includes('http://') || header.kid.includes('https://'))) {
    risks.push({
      severity: 'critical',
      description: 'Key ID contains URL patterns (potential SSRF vulnerability)',
      impact: 'May trick the server into fetching remote content or reading local files'
    });
    suggestions.push('Sanitize kid parameter to prevent SSRF and local file inclusion attacks');
  }

  // Check for weak key type
  if (header.kty === 'oct' && header.alg && header.alg.startsWith('RS')) {
    risks.push({
      severity: 'critical',
      description: 'Key type mismatch (symmetric kty with asymmetric algorithm)',
      impact: 'May cause JWT libraries to handle the token incorrectly, potentially bypassing signature verification'
    });
    suggestions.push('Validate that key type matches the algorithm used');
  }

  // Add specific security tests and attack recommendations for penetration testers
  if (header.alg === 'RS256' || header.alg === 'ES256') {
    suggestions.push('Test for algorithm confusion attack by switching to HS256 and signing with the public key');
  }
  
  if (header.kid) {
    suggestions.push('Test for directory traversal via kid parameter (e.g., "../../../dev/null")');
    suggestions.push('Test for SQL injection via kid parameter (e.g., "x\' OR 1=1;--")');
  }

  if (header.alg === 'HS256' || header.alg === 'HS384' || header.alg === 'HS512') {
    suggestions.push('Test for weak secret key with common JWT secret wordlists');
    suggestions.push('Use hashcat with mode 16500 to brute force the symmetric key');
  }

  if (!payload.exp) {
    suggestions.push('Test token acceptance even after user logout or password change');
  }

  suggestions.push('Try fuzzing JWT header parameters with unexpected values');
  suggestions.push('Test for signature verification bypass by manipulating header fields');

  return { risks, suggestions, expStatus, timeLeft };
}