import type { CaidoBackendSDK, CapturedRequest } from "../types";
import { findJWTs, isJWT, decodeBase64Url, getTimeLeft } from "../utils/jwtUtils";
import { RequestStore } from "../stores/requestStore";

/**
 * Handler for HTTP requests to capture any requests with potential JWT tokens
 */
export function handleRequestInterceptor(sdk: CaidoBackendSDK, request: any): void {
  try {
    // Create a unique ID for the request
    const id = request.getId() || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Extract headers as a plain object
    const headers: Record<string, string> = {};
    if (request.headers) {
      // Convert headers to a simple key-value object
      try {
        for (const [key, value] of Object.entries(request.headers)) {
          headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
        }
      } catch (e) {
        sdk.console.error(`Error extracting headers: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
    
    // Find potential JWT locations and all tokens
    const jwtLocations: string[] = [];
    let hasJwt = false;
    const allTokens: string[] = [];
    
    // Check headers for tokens
    if (request.headers) {
      for (const [key, value] of Object.entries(headers)) {
        const tokens = findJWTs(String(value));
        if (tokens.length > 0) {
          jwtLocations.push(`header:${key}`);
          hasJwt = true;
          
          // Add tokens to our collection
          for (const token of tokens) {
            if (!allTokens.includes(token)) {
              allTokens.push(token);
            }
          }
        }
      }
    }
    
    // Check URL for tokens
    if (request.url) {
      const tokens = findJWTs(request.url);
      if (tokens.length > 0) {
        jwtLocations.push('url');
        hasJwt = true;
        
        // Add tokens to our collection
        for (const token of tokens) {
          if (!allTokens.includes(token)) {
            allTokens.push(token);
          }
        }
      }
    }
    
    // Check body for tokens if present
    let body: string | undefined;
    if (request.body) {
      try {
        body = request.body.toString();
        const tokens = findJWTs(body);
        if (tokens.length > 0) {
          jwtLocations.push('body');
          hasJwt = true;
          
          // Add tokens to our collection
          for (const token of tokens) {
            if (!allTokens.includes(token)) {
              allTokens.push(token);
            }
          }
        }
      } catch (e) {
        sdk.console.error(`Error extracting body: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
    
    // Create captured request object (simplified, no raw HTTP)
    const capturedRequest: CapturedRequest = {
      id,
      timestamp: Date.now(),
      method: request.method || 'UNKNOWN',
      url: request.url || 'UNKNOWN',
      headers,
      hasJwt,
      jwtLocations: jwtLocations.length > 0 ? jwtLocations : undefined,
    };
    
    // Store the request
    const requestStore = RequestStore.getInstance(sdk);
    requestStore.addRequest(capturedRequest);
    
    // Emit event for frontend
    sdk.api.send('request:captured', capturedRequest);
    
    sdk.console.log(`Captured request: ${capturedRequest.method} ${capturedRequest.url}`);
    
    // Process JWT tokens if found
    try {
      if (hasJwt && allTokens.length > 0) {
        // Show notification that we're analyzing the request
        try {
          if (sdk.notifications) {
            sdk.notifications.info(`Analyzing request for JWT tokens`);
          }
        } catch (e) {
          sdk.console.error("Error showing notification:", e);
        }
        
        sdk.console.log(`Found ${allTokens.length} JWT token(s) in request, analyzing...`);
        
        // Process each token individually
        for (const token of allTokens) {
          try {
            sdk.console.log(`Analyzing request token: ${token.substring(0, 15)}...`);
            
            // Call the analyze API
            sdk.api.call("analyzeJWT", {
              token,
              requestId: id,
              source: 'request'
            });
          } catch (error) {
            sdk.console.error(`Error calling analyzeJWT for request token: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Show success notification with redirection info
        try {
          if (sdk.notifications) {
            sdk.notifications.success(`Found JWT token(s) in request, go to dashboard to view details`);
          }
        } catch (e) {
          sdk.console.error("Error showing success notification:", e);
        }
      } else {
        // If no JWT tokens found, just log it, don't send anything to dashboard
        sdk.console.log(`No JWT tokens found in the request`);
      }
    } catch (tokenProcessingError) {
      sdk.console.error(`Error processing JWT tokens: ${tokenProcessingError instanceof Error ? tokenProcessingError.message : 'Unknown error'}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      sdk.console.error(`Error in request interceptor: ${error.message}`);
    } else {
      sdk.console.error("Error in request interceptor");
    }
  }
}

/**
 * Handler for HTTP responses to capture any responses with potential JWT tokens
 */
export function handleResponseInterceptor(sdk: CaidoBackendSDK, request: any, response: any): void {
  try {
    // Get the request ID
    const requestId = request.getId() || `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Extract headers as a plain object
    const headers: Record<string, string> = {};
    if (response.headers) {
      // Convert headers to a simple key-value object
      try {
        for (const [key, value] of Object.entries(response.headers)) {
          headers[key] = Array.isArray(value) ? value.join(', ') : String(value);
        }
      } catch (e) {
        sdk.console.error(`Error extracting response headers: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
    
    // Find potential JWT locations and all tokens
    const jwtLocations: string[] = [];
    let hasJwt = false;
    const allTokens: string[] = [];
    
    // Check headers for tokens
    if (response.headers) {
      for (const [key, value] of Object.entries(headers)) {
        const tokens = findJWTs(String(value));
        if (tokens.length > 0) {
          jwtLocations.push(`header:${key}`);
          hasJwt = true;
          
          // Add tokens to our collection
          for (const token of tokens) {
            if (!allTokens.includes(token)) {
              allTokens.push(token);
            }
          }
        }
      }
    }
    
    // Check body for tokens if present
    let body: string | undefined;
    if (response.body) {
      try {
        body = response.body.toString();
        const tokens = findJWTs(body);
        if (tokens.length > 0) {
          jwtLocations.push('body');
          hasJwt = true;
          
          // Add tokens to our collection
          for (const token of tokens) {
            if (!allTokens.includes(token)) {
              allTokens.push(token);
            }
          }
        }
      } catch (e) {
        sdk.console.error(`Error extracting response body: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
    
    // Create a response object (simplified)
    const responseObj = {
      statusCode: response.statusCode || 0,
      headers,
      hasJwt,
      jwtLocations: jwtLocations.length > 0 ? jwtLocations : undefined
    };
    
    // Get the request store
    const requestStore = RequestStore.getInstance(sdk);
    
    // Add the response to the request store
    try {
      requestStore.addResponse(requestId, responseObj);
      sdk.console.log(`Added response for request ID: ${requestId}`);
    } catch (e) {
      sdk.console.error(`Error adding response to store: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
    
    // Process JWT tokens if found
    try {
      if (hasJwt && allTokens.length > 0) {
        // Show notification that we're analyzing the response
        try {
          if (sdk.notifications) {
            sdk.notifications.info(`Analyzing response for JWT tokens`);
          }
        } catch (e) {
          sdk.console.error("Error showing notification:", e);
        }
        
        sdk.console.log(`Found ${allTokens.length} JWT token(s) in response, analyzing...`);
        
        // Process each token individually
        for (const token of allTokens) {
          try {
            sdk.console.log(`Analyzing response token: ${token.substring(0, 15)}...`);
            
            // Call the analyze API
            sdk.api.call("analyzeJWT", {
              token,
              requestId,
              source: 'response'
            });
          } catch (error) {
            sdk.console.error(`Error calling analyzeJWT for response token: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Show success notification with redirection info
        try {
          if (sdk.notifications) {
            sdk.notifications.success(`Found JWT token(s) in response, go to dashboard to view details`);
          }
        } catch (e) {
          sdk.console.error("Error showing success notification:", e);
        }
      } else {
        // If no JWT tokens found, just log it, don't send anything to dashboard
        sdk.console.log(`No JWT tokens found in the response`);
      }
    } catch (tokenProcessingError) {
      sdk.console.error(`Error processing JWT tokens: ${tokenProcessingError instanceof Error ? tokenProcessingError.message : 'Unknown error'}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      sdk.console.error(`Error in response interceptor: ${error.message}`);
    } else {
      sdk.console.error("Error in response interceptor");
    }
  }
}

/**
 * Handle context menu selection for JWT analysis
 */
export async function handleContextMenu(sdk: CaidoBackendSDK, context: any): Promise<void> {
  try {
    sdk.console.log("JWT Analyzer context menu handler called");
    
    // Extract the request from the context
    const request = context?.request;
    if (!request) {
      sdk.console.error("No request found in context menu context");
      return;
    }
    
    // Find JWT tokens in the request
    const headers = request.headers || {};
    const body = request.body;
    const url = request.url || '';
    
    const allTokens: string[] = [];
    
    // Check headers
    for (const [key, value] of Object.entries(headers)) {
      const tokens = findJWTs(String(value));
      for (const token of tokens) {
        if (!allTokens.includes(token)) {
          allTokens.push(token);
        }
      }
    }
    
    // Check URL
    const urlTokens = findJWTs(url);
    for (const token of urlTokens) {
      if (!allTokens.includes(token)) {
        allTokens.push(token);
      }
    }
    
    // Check body if present
    if (body) {
      try {
        const bodyStr = typeof body === 'string' ? body : body.toString();
        const bodyTokens = findJWTs(bodyStr);
        for (const token of bodyTokens) {
          if (!allTokens.includes(token)) {
            allTokens.push(token);
          }
        }
      } catch (e) {
        sdk.console.error("Error parsing request body:", e);
      }
    }
    
    // Process tokens
    if (allTokens.length > 0) {
      sdk.console.log(`Found ${allTokens.length} JWT token(s) in context menu selection`);
      
      // Show notification
      try {
        if (sdk.notifications) {
          sdk.notifications.info(`Analyzing ${allTokens.length} JWT token(s)`);
        }
      } catch (e) {
        sdk.console.error("Error showing notification:", e);
      }
      
      // Process each token
      for (const token of allTokens) {
        try {
          await sdk.api.call("analyzeJWT", {
            token,
            requestId: request.id || `manual-${Date.now()}`,
            source: 'request'
          });
        } catch (e) {
          sdk.console.error("Error analyzing token:", e);
        }
      }
      
      // Show success notification
      try {
        if (sdk.notifications) {
          sdk.notifications.success(`JWT token(s) analyzed. Check the JWT Analyzer dashboard for details.`);
        }
      } catch (e) {
        sdk.console.error("Error showing success notification:", e);
      }
    } else {
      sdk.console.log("No JWT tokens found in context menu selection");
      
      // Show notification
      try {
        if (sdk.notifications) {
          sdk.notifications.warning("No JWT tokens found in the selected request");
        }
      } catch (e) {
        sdk.console.error("Error showing notification:", e);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      sdk.console.error(`Error in context menu handler: ${error.message}`);
    } else {
      sdk.console.error("Error in context menu handler");
    }
  }
} 