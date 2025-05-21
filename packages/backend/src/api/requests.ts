import { CaidoBackendSDK, CapturedRequest } from "../types";
import { RequestStore } from "../stores/requestStore";

/**
 * Get all captured requests
 */
export async function getRequests(sdk: CaidoBackendSDK): Promise<{ kind: string; value?: CapturedRequest[]; error?: string }> {
  try {
    const requestStore = RequestStore.getInstance(sdk);
    
    const requests = await requestStore.getRequests();
    sdk.console.log(`Returning ${requests.length} requests from getRequests API`);
    
    return {
      kind: "Success",
      value: requests
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    sdk.console.error(`Error in getRequests: ${errorMessage}`);
    
    return {
      kind: "Error",
      error: `Error getting requests: ${errorMessage}`
    };
  }
}

/**
 * Get a specific request by ID
 */
export async function getRequest(
  sdk: CaidoBackendSDK,
  id: string
): Promise<{ kind: string; value?: CapturedRequest; error?: string }> {
  try {
    if (!id) {
      return {
        kind: "Error",
        error: "No request ID provided"
      };
    }
    
    const requestStore = RequestStore.getInstance(sdk);
    
    const request = await requestStore.getRequest(id);
    sdk.console.log(`getRequest API call for ID: ${id}, found: ${request ? 'yes' : 'no'}`);
    
    if (!request) {
      return {
        kind: "Error",
        error: `Request with ID ${id} not found`
      };
    }
    
    return {
      kind: "Success",
      value: request
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    sdk.console.error(`Error in getRequest: ${errorMessage}`);
    
    return {
      kind: "Error",
      error: `Error getting request: ${errorMessage}`
    };
  }
}

/**
 * Clear all requests
 */
export async function clearRequests(sdk: CaidoBackendSDK): Promise<{ kind: string; error?: string }> {
  try {
    const requestStore = RequestStore.getInstance(sdk);
    await requestStore.clearRequests();
    
    // Notify frontend
    sdk.api.send("requests:cleared");
    sdk.console.log("All requests cleared");
    
    return {
      kind: "Success"
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    sdk.console.error(`Error in clearRequests: ${errorMessage}`);
    
    return {
      kind: "Error",
      error: `Error clearing requests: ${errorMessage}`
    };
  }
} 