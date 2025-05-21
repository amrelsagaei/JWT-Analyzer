import type { CaidoBackendSDK, Finding, JWTHeader, JWTPayload } from "../types";
import { decodeBase64Url } from "../utils/jwtUtils";
import { RequestStore } from "../stores/requestStore";

// Define risk interface for internal use
interface JWTRiskInternal {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  impact: string;
}

/**
 * Analyzes a JWT token and creates a finding
 */
export async function analyzeJWT(
  sdk: CaidoBackendSDK, 
  params: { token: string; requestId: string; source: 'request' | 'response' | 'manual' }
): Promise<{ kind: string; value?: Finding; error?: string }> {
  try {
    const { token, source } = params;
    
    // Validate token format (simple check)
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      return { kind: 'error', error: 'Invalid token format' };
    }
    
    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { kind: 'error', error: 'Invalid JWT format (should have 3 parts)' };
    }
    
    // Decode header and payload
    let header: JWTHeader;
    let payload: JWTPayload;
    
    try {
      if (parts[0]) {
        // Import and use the utility function from jwtUtils
        const headerData = decodeBase64Url(parts[0]);
        if (headerData) {
          header = headerData;
        } else {
          return { kind: 'error', error: 'Failed to decode JWT header' };
        }
      } else {
        return { kind: 'error', error: 'Missing JWT header' };
      }
    } catch (e) {
      return { kind: 'error', error: 'Failed to decode JWT header' };
    }
    
    try {
      if (parts[1]) {
        // Import and use the utility function from jwtUtils
        const payloadData = decodeBase64Url(parts[1]);
        if (payloadData) {
          payload = payloadData;
        } else {
          return { kind: 'error', error: 'Failed to decode JWT payload' };
        }
      } else {
        return { kind: 'error', error: 'Missing JWT payload' };
      }
    } catch (e) {
      return { kind: 'error', error: 'Failed to decode JWT payload' };
    }
    
    // Create a unique ID for the finding
    const findingId = `jwt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Determine severity based on simple checks
    let severity: 'critical' | 'high' | 'medium' | 'low' | 'info' = 'info';
    const risks: JWTRiskInternal[] = [];
    const suggestions: string[] = [];
    
    // Check if using 'none' algorithm
    if (header.alg === 'none') {
      severity = 'critical';
      risks.push({
        type: 'algorithm',
        severity: 'critical',
        description: 'Token uses "none" algorithm which is insecure',
        impact: 'Attackers can bypass signature verification'
      });
      suggestions.push('Reject tokens with "none" algorithm');
    }
    
    // Check for expired tokens
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      if (severity !== 'critical') severity = 'medium';
      risks.push({
        type: 'expiration',
        severity: 'medium',
        description: 'Token has expired',
        impact: 'Using expired tokens may bypass intended security restrictions'
      });
      suggestions.push('Verify token expiration on server side');
    }
    
    // Check for weak algorithms (HS256 is common but not necessarily weak)
    if (header.alg === 'HS256') {
      if (severity === 'info') severity = 'low';
      risks.push({
        type: 'algorithm',
        severity: 'low',
        description: 'Token uses symmetric algorithm (HS256)',
        impact: 'If key is compromised, tokens can be forged'
      });
      suggestions.push('Consider using asymmetric algorithms like RS256 for better security');
    }
    
    // Create a finding with enhanced metadata
    const finding: Finding = {
      id: findingId,
      title: `JWT Token from ${source.charAt(0).toUpperCase() + source.slice(1)}`,
      severity,
      metadata: {
        token,
        header,
        payload,
        expStatus: payload.exp ? (payload.exp < now ? 'expired' : 'valid') : 'valid',
        risks,
        suggestions,
        issuedAt: payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'Not specified',
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'Not specified',
        timeLeft: payload.exp ? calculateTimeLeft(payload.exp) : 'No expiration',
        issuer: payload.iss || 'Not specified',
        subject: payload.sub || 'Not specified',
        audience: Array.isArray(payload.aud) ? payload.aud.join(', ') : (payload.aud || 'Not specified'),
        source,
        severity
      }
    };
    
    // Emit event for frontend
    sdk.api.send("jwt:analyzed", finding);
    sdk.console.log(`Emitted jwt:analyzed event for token from ${source}`);
    
    return { kind: 'success', value: finding };
  } catch (error) {
    // Handle any unexpected errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sdk.console.error(`Error analyzing JWT: ${errorMessage}`);
    return { kind: 'error', error: errorMessage };
  }
}

/**
 * Calculate a human-readable time left string from an expiration timestamp
 */
function calculateTimeLeft(exp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = exp - now;
  
  if (timeLeft <= 0) {
    return 'Expired';
  }
  
  const days = Math.floor(timeLeft / 86400);
  const hours = Math.floor((timeLeft % 86400) / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`;
  } else {
    return `${seconds}s remaining`;
  }
} 