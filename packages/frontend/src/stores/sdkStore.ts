import { FrontendSDK } from "../types";
import { create } from "zustand";
import type { StateCreator } from "zustand";

interface SDKStore {
  sdk: FrontendSDK | null;
  setSDK: (sdk: FrontendSDK) => void;
  getSDK: () => FrontendSDK;
}

export const useSDKStore = create<SDKStore>((set, get) => ({
  sdk: null,
  setSDK: (sdk: FrontendSDK) => set({ sdk }),
  getSDK: () => {
    const sdk = get().sdk;
    if (!sdk) {
      throw new Error('SDK is not initialized.');
    }
    return sdk;
  },
}));

export const initializeSDK = (sdk: FrontendSDK) => {
  useSDKStore.getState().setSDK(sdk);
};