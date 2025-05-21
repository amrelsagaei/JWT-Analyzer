import type { JWTHeader, JWTPayload, JWTAnalysisResult, JWTRisk } from "../types";

/**
 * Analyze JWT security and provide risk assessment
 */
export function analyzeJWTSecurity(header: JWTHeader, payload: JWTPayload): JWTAnalysisResult {
  const risks: JWTRisk[] = [];
  const suggestions: string[] = [];

  // Algorithm risks
  if (!header.alg) {
    risks.push({
      type: 'missing_algorithm',
      severity: 'critical',
      description: 'No algorithm specified in header',
      impact: 'Allows attackers to potentially bypass signature verification by manipulating the algorithm'
    });
  } else if (header.alg === 'none') {
    risks.push({
      type: 'none_algorithm',
      severity: 'critical',
      description: 'Algorithm set to "none" - signature verification is bypassed',
      impact: 'Attacker can modify the token payload without invalidating the signature'
    });
    suggestions.push('Use a secure algorithm like RS256 or ES256');
  } else if (['HS256', 'HS384', 'HS512'].includes(header.alg || '')) {
    risks.push({
      type: 'symmetric_algorithm',
      severity: 'medium',
      description: 'Using symmetric algorithm - same key for signing and verification',
      impact: 'If verification key is exposed, attackers can forge new valid tokens'
    });
    suggestions.push('Consider using asymmetric algorithms like RS256 or ES256 for better security');
  }

  // Type header checks
  if (!header.typ) {
    risks.push({
      type: 'missing_type',
      severity: 'low',
      description: 'No type specified in header',
      impact: 'May cause interoperability issues with some JWT libraries'
    });
    suggestions.push('Add "typ" claim to header for better compatibility');
  } else if (header.typ !== 'JWT') {
    risks.push({
      type: 'incorrect_type',
      severity: 'low',
      description: `Type specified as "${header.typ}" instead of "JWT"`,
      impact: 'May cause interoperability issues with some JWT libraries'
    });
  }

  // Key ID checks
  if (!header.kid && ['RS256', 'ES256', 'RS384', 'ES384', 'RS512', 'ES512'].includes(header.alg || '')) {
    risks.push({
      type: 'missing_kid',
      severity: 'low',
      description: 'No key ID (kid) specified for asymmetric algorithm',
      impact: 'May lead to incorrect key selection in multi-key environments, potentially allowing signature bypass'
    });
    suggestions.push('Add "kid" claim to header to identify the key used for verification');
  }

  // Expiration issues
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp) {
    risks.push({
      type: 'no_expiration',
      severity: 'high',
      description: 'Token has no expiration time',
      impact: 'Token remains valid indefinitely if compromised, increasing the attack window'
    });
    suggestions.push('Add expiration claim (exp) to limit token lifetime');
  } else if (payload.exp < now) {
    risks.push({
      type: 'expired',
      severity: 'medium',
      description: 'Token has expired',
      impact: 'Token should be rejected by properly implemented systems'
    });
  } else if (payload.exp > now + 31536000) { // More than 1 year
    risks.push({
      type: 'long_expiration',
      severity: 'medium',
      description: 'Token has very long expiration time (> 1 year)',
      impact: 'Extended validity period increases risk if token is compromised'
    });
    suggestions.push('Consider shorter token lifetimes for better security');
  }

  // Not Before issues
  if (payload.nbf && payload.nbf > now) {
    risks.push({
      type: 'not_valid_yet',
      severity: 'medium',
      description: 'Token is not valid yet (nbf is in the future)',
      impact: 'Token should be rejected until the nbf time is reached'
    });
  }

  // Check for missing recommended claims
  if (!payload.iat) {
    risks.push({
      type: 'no_issued_at',
      severity: 'low',
      description: 'Missing "issued at" (iat) claim',
      impact: 'Harder to track token age and implement proper token rotation policies'
    });
    suggestions.push('Add "issued at" (iat) claim for better token tracking');
  }

  if (!payload.jti) {
    suggestions.push('Consider adding a JWT ID (jti) for uniqueness and revocation support');
  }

  if (!payload.iss) {
    risks.push({
      type: 'no_issuer',
      severity: 'low',
      description: 'Missing issuer (iss) claim',
      impact: 'Harder to validate the token source and implement proper token validation'
    });
    suggestions.push('Add issuer (iss) claim to identify the token provider');
  }

  if (!payload.aud) {
    risks.push({
      type: 'no_audience',
      severity: 'low',
      description: 'Missing audience (aud) claim',
      impact: 'Token can be accepted by unintended services, potentially leading to confused deputy issues'
    });
    suggestions.push('Add audience (aud) claim to restrict token use');
  }

  // Check for sensitive data
  const sensitiveFields = ['password', 'secret', 'key', 'token', 'private', 'ssn', 'credit'];
  const sensitiveFound = Object.keys(payload).filter(key => 
    sensitiveFields.some(field => key.toLowerCase().includes(field))
  );
  
  if (sensitiveFound.length > 0) {
    risks.push({
      type: 'sensitive_data',
      severity: 'high',
      description: `Potential sensitive data in claims: ${sensitiveFound.join(', ')}`,
      impact: 'Sensitive data in tokens could be exposed if the token is intercepted or stored insecurely'
    });
    suggestions.push('Remove sensitive information from token payload');
  }

  // Check payload size
  const payloadSize = JSON.stringify(payload).length;
  if (payloadSize > 8192) {
    risks.push({
      type: 'large_payload',
      severity: 'medium',
      description: `Token payload is very large (${payloadSize} bytes)`,
      impact: 'Large tokens impact performance and can lead to issues with HTTP header size limits'
    });
    suggestions.push('Reduce token size to improve performance');
  }

  // Check for nested JWTs
  const nestedJwtKeys = Object.keys(payload).filter(key => {
    const value = payload[key];
    return typeof value === 'string' && value.toString().split('.').length === 3 && /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/.test(value.toString());
  });
  
  if (nestedJwtKeys.length > 0) {
    risks.push({
      type: 'nested_jwt',
      severity: 'medium',
      description: `Nested JWT found in claims: ${nestedJwtKeys.join(', ')}`,
      impact: 'Nested JWTs increase complexity and can lead to security bugs in token processing'
    });
    suggestions.push('Avoid nesting JWTs within tokens');
  }

  return { risks, suggestions };
} 