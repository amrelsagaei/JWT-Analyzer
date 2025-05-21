import { type InjectionKey, type Plugin, inject } from "vue";

import { FrontendSDK } from "@/types";

const KEY: InjectionKey<FrontendSDK> = Symbol("FrontendSDK");

// Define SDK interface based on Caido Plugin SDK
export interface CaidoSDK {
  findings: {
    onSelect: (findingType: string, callback: (finding: any) => void) => void;
    create: (finding: any) => Promise<void>;
    getAll: () => Promise<any[]>;
  };
  navigation: {
    addPage: (path: string, options: { body: HTMLElement }) => void;
  };
  sidebar: {
    registerItem: (label: string, path: string) => void;
  };
  contextMenu: {
    register: (config: any) => void;
    _handlers?: Array<{
      group: string;
      items: Array<{
        label: string;
        handler: (context: any) => void;
      }>;
    }>;
  };
  notifications: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
  window: {
    showToast: (message: string, options?: {
      variant?: "success" | "error" | "warning" | "info";
      duration?: number;
    }) => void;
  };
  console: {
    log: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
  };
}

// Create a mock SDK for development
const createMockSDK = (): CaidoSDK => {
  return {
    findings: {
      onSelect: (findingType: string, callback: (finding: any) => void) => {
        console.log(`Registered callback for finding type: ${findingType}`);
      },
      create: async (finding: any) => {
        console.log("Created finding:", finding);
      },
      getAll: async () => {
        console.log("Getting all findings");
        return [];
      }
    },
    navigation: {
      addPage: (path: string, options: { body: HTMLElement }) => {
        console.log(`Added page at path: ${path}`);
      }
    },
    sidebar: {
      registerItem: (label: string, path: string) => {
        console.log(`Registered sidebar item: ${label} -> ${path}`);
      }
    },
    contextMenu: {
      register: (config: any) => {
        console.log("Registered context menu:", config);
      },
      _handlers: []
    },
    notifications: {
      success: (message: string) => console.log(`Success: ${message}`),
      error: (message: string) => console.error(`Error: ${message}`),
      warning: (message: string) => console.warn(`Warning: ${message}`),
      info: (message: string) => console.info(`Info: ${message}`)
    },
    window: {
      showToast: (message: string, options) => {
        const variant = options?.variant || "info";
        console.log(`Toast (${variant}): ${message}`);
      }
    },
    console: {
      log: (message: string) => console.log(message),
      error: (message: string) => console.error(message),
      warn: (message: string) => console.warn(message)
    }
  };
};

// Global SDK instance
let sdkInstance: CaidoSDK | null = null;

// Initialize SDK
export const initSDK = () => {
  try {
    // Try to access Caido SDK if available
    if (window.caido && window.caido.sdk) {
      sdkInstance = window.caido.sdk;
    } else {
      // Use mock SDK for development
      sdkInstance = createMockSDK();
      console.log('Using mock SDK for development');
    }
  } catch (error) {
    console.error('Failed to initialize SDK:', error);
    // Fallback to mock SDK
    sdkInstance = createMockSDK();
  }
  
  return sdkInstance;
};

// Hook to use the SDK in components
export const useSDK = () => {
  // Initialize SDK if not already done
  if (!sdkInstance) {
    sdkInstance = initSDK();
  }
  
  return sdkInstance;
};

// Add type declaration for window
declare global {
  interface Window {
    caido?: {
      sdk: CaidoSDK;
    };
  }
}

/*
 * This is the plugin that will provide the FrontendSDK to VueJS
 * To access the frontend SDK from within a component, use the `useSDK` function.
 */
export const SDKPlugin: Plugin = (app: any, sdk: FrontendSDK) => {
  app.provide(KEY, sdk);
};
