import type { JWTPayload } from "../types";

// Improved JWT validation regex pattern
// This pattern is more accurate for detecting JWTs
export const JWT_REGEX = /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g;

/**
 * Common headers that may contain JWTs
 */
export const JWT_HEADERS = [
  'authorization',
  'x-auth-token',
  'jwt',
  'access-token',
  'id-token',
  'refresh-token',
  'x-jwt-token',
  'x-access-token',
  'id_token'
];

/**
 * Check if string is a valid JWT token
 */
export function isJWT(token: string): boolean {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3 && JWT_REGEX.test(token);
}

/**
 * Find JWT tokens in a string or object
 */
export function findJWTs(input: any): any {
  // For string input
  if (typeof input === 'string') {
    if (!input) return [];
    
    // Find JWT tokens in string using regex
    const jwtRegex = /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g;
    const matches = input.match(jwtRegex);
    
    if (matches) {
      // Deduplicate tokens and filter for valid JWTs
      return [...new Set(matches)].filter(token => isJWT(token));
    }
    
    return [];
  }
  
  // For object input (request/response)
  const jwtLocations: string[] = [];
  const jwtTokens: Array<{ token: string, location: string }> = [];
  
  try {
    // Validate input
    if (!input) {
      return { hasJwt: false, jwtLocations: [], jwtTokens: [] };
    }
    
    // Check request headers
    if (input.headers) {
      // If headers is an array (Caido format)
      if (Array.isArray(input.headers)) {
        // Check Authorization header first
        const authHeader = input.headers.find((h: any) => 
          h.name?.toLowerCase() === 'authorization'
        );
        
        if (authHeader?.value && typeof authHeader.value === 'string') {
          const authValue = authHeader.value;
          if (authValue.startsWith('Bearer ')) {
            const token = authValue.replace('Bearer ', '').trim();
            if (isJWT(token)) {
              jwtLocations.push('Authorization header');
              jwtTokens.push({ token, location: 'Authorization header' });
            }
          }
        }
        
        // Check other common JWT headers
        const jwtHeaderNames = [
          'x-auth-token',
          'jwt',
          'access-token',
          'id-token',
          'refresh-token',
          'x-jwt-token',
          'x-access-token',
          'id_token',
          'token'
        ];
        
        for (const header of input.headers) {
          if (jwtHeaderNames.includes(header.name?.toLowerCase()) && header.value) {
            const token = header.value.trim();
            if (isJWT(token)) {
              jwtLocations.push(`${header.name} header`);
              jwtTokens.push({ token, location: `${header.name} header` });
            }
          }
        }
      } 
      // If headers is an object
      else if (typeof input.headers === 'object') {
        // Check all headers
        for (const [key, value] of Object.entries(input.headers)) {
          if (typeof value === 'string') {
            // Check if it's an Authorization header with Bearer token
            if (key.toLowerCase() === 'authorization' && value.startsWith('Bearer ')) {
              const token = value.replace('Bearer ', '').trim();
              if (isJWT(token)) {
                jwtLocations.push('Authorization header');
                jwtTokens.push({ token, location: 'Authorization header' });
              }
            } 
            // Check if the header value itself is a JWT
            else if (isJWT(value)) {
              jwtLocations.push(`${key} header`);
              jwtTokens.push({ token: value, location: `${key} header` });
            }
          }
        }
      }
    }
    
    // Check request/response body
    let body = input.body;
    if (body) {
      // Convert body to string if necessary
      let bodyStr: string;
      if (typeof body === 'string') {
        bodyStr = body;
      } else if (typeof body === 'object') {
        try {
          bodyStr = JSON.stringify(body);
        } catch (e) {
          bodyStr = String(body);
        }
      } else {
        bodyStr = String(body);
      }
      
      // Find JWT tokens in body using regex
      const jwtRegex = /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g;
      const matches = bodyStr.match(jwtRegex);
      
      if (matches) {
        // Deduplicate tokens
        const uniqueTokens = [...new Set(matches)];
        for (const token of uniqueTokens) {
          if (isJWT(token)) {
            jwtLocations.push('Body');
            jwtTokens.push({ token, location: 'Body' });
          }
        }
      }
    }
    
    // Check URL if available
    if (input.url) {
      const urlStr = typeof input.url === 'string' ? input.url : String(input.url);
      const jwtRegex = /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g;
      const matches = urlStr.match(jwtRegex);
      
      if (matches) {
        const uniqueTokens = [...new Set(matches)];
        for (const token of uniqueTokens) {
          if (isJWT(token)) {
            jwtLocations.push('URL');
            jwtTokens.push({ token, location: 'URL' });
          }
        }
      }
    }
    
    // Return results
    return { 
      hasJwt: jwtTokens.length > 0, 
      jwtLocations, 
      jwtTokens 
    };
  } catch (error) {
    console.error("Error finding JWTs:", error);
    return { 
      hasJwt: false, 
      jwtLocations: [], 
      jwtTokens: [] 
    };
  }
}

/**
 * Decode base64url encoded string
 */
export function decodeBase64Url(str: string): any {
  try {
    // Add padding if needed
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = str.length % 4;
    if (pad) {
      str += '='.repeat(4 - pad);
    }
    
    // Use built-in browser functions for base64 decoding
    try {
      const binaryStr = globalThis.atob(str);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      const decoded = decoder.decode(bytes);
      return JSON.parse(decoded);
    } catch (e) {
      // Fallback method if browser functions aren't available
      return JSON.parse(decodeURIComponent(
        escape(globalThis.atob(str))
      ));
    }
  } catch (e) {
    return null;
  }
}

/**
 * Format Unix timestamp to human-readable string
 */
export function formatTimestamp(unix: number): string {
  if (!unix || isNaN(unix)) return 'Invalid timestamp';
  
  try {
    const date = new Date(unix * 1000);
    return date.toLocaleString();
  } catch {
    return 'Invalid timestamp';
  }
}

/**
 * Calculate and format time left until token expiration
 */
export function getTimeLeft(exp: number): string {
  if (!exp || isNaN(exp)) return 'No expiration';
  
  const now = Math.floor(Date.now() / 1000);
  const diff = exp - now;
  
  // Format in a more human-readable way
  if (diff < 0) {
    const absDiff = Math.abs(diff);
    if (absDiff < 60) return `Expired ${absDiff} seconds ago`;
    if (absDiff < 3600) return `Expired ${Math.floor(absDiff/60)} minutes ago`;
    if (absDiff < 86400) return `Expired ${Math.floor(absDiff/3600)} hours ago`;
    return `Expired ${Math.floor(absDiff/86400)} days ago`;
  } else {
    if (diff < 60) return `${diff} seconds remaining`;
    if (diff < 3600) return `${Math.floor(diff/60)} minutes remaining`;
    if (diff < 86400) return `${Math.floor(diff/3600)} hours remaining`;
    return `${Math.floor(diff/86400)} days remaining`;
  }
}

/**
 * Extract JWTs from headers
 */
export function extractJWTsFromHeaders(headers: Array<{name: string, value: string}>): string[] {
  const tokens: string[] = [];
  
  for (const header of headers) {
    const headerName = header.name.toLowerCase();
    
    if (JWT_HEADERS.includes(headerName)) {
      let value = header.value;
      
      // Handle Authorization Bearer tokens
      if (headerName === 'authorization' && value.startsWith('Bearer ')) {
        value = value.replace('Bearer ', '').trim();
      }
      
      if (isJWT(value)) {
        tokens.push(value);
      }
    }
  }
  
  return tokens;
} 