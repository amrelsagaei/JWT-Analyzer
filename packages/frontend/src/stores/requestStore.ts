import { reactive } from 'vue';
import type { CapturedRequest } from '@/types';

interface RequestState {
  requests: CapturedRequest[];
  selectedRequestId: string | null;
  loading: boolean;
  error: string | null;
}

// Create a reactive state object
const state = reactive<RequestState>({
  requests: [],
  selectedRequestId: null,
  loading: false,
  error: null,
});

/**
 * Store for managing captured requests in the frontend
 */
export const requestStore = {
  // State accessors
  getRequests: () => state.requests,
  getSelectedRequest: () => state.selectedRequestId ? state.requests.find(r => r.id === state.selectedRequestId) : null,
  isLoading: () => state.loading,
  getError: () => state.error,
  
  // Actions
  setRequests(requests: CapturedRequest[]) {
    state.requests = requests;
  },
  
  addRequest(request: CapturedRequest) {
    // Check if request already exists to avoid duplicates
    const existingIndex = state.requests.findIndex(r => r.id === request.id);
    if (existingIndex >= 0) {
      // Replace existing request with updated one
      state.requests.splice(existingIndex, 1, request);
    } else {
      // Add new request to the beginning of the array
      state.requests.unshift(request);
    }
  },
  
  selectRequest(id: string) {
    state.selectedRequestId = id;
  },
  
  clearSelection() {
    state.selectedRequestId = null;
  },
  
  clearRequests() {
    state.requests = [];
    state.selectedRequestId = null;
  },
  
  setLoading(loading: boolean) {
    state.loading = loading;
  },
  
  setError(error: string | null) {
    state.error = error;
  }
}; 