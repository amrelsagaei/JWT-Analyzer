import { FrontendSDK, Finding } from "../types";
import { create } from "zustand";
import type { StateCreator } from "zustand";

interface FindingsStore {
  findings: Finding[];
  selectedFindingId: string | null;
  addFinding: (finding: Finding) => void;
  setFindings: (findings: Finding[]) => void;
  selectFinding: (id: string) => void;
  clearSelection: () => void;
  clearFindings: () => void;
}

export const useFindingsStore = create<FindingsStore>((set, get) => ({
  findings: [],
  selectedFindingId: null,
  
  addFinding: (finding: Finding) => {
    console.log("[JWT Analyzer] Adding finding to store:", finding);
    set((state) => {
      // Check if finding already exists to prevent duplicates
      const exists = state.findings.some(f => f.id === finding.id);
      
      if (exists) {
        // Replace existing finding
        const updatedFindings = state.findings.map(f => 
          f.id === finding.id ? finding : f
        );
        
        // Persist findings to localStorage
        try {
          localStorage.setItem('jwt_analyzer_findings', JSON.stringify(updatedFindings));
        } catch (error) {
          console.error("[JWT Analyzer] Error saving findings to localStorage:", error);
        }
        
        return {
          findings: updatedFindings
        };
      } else {
        // Add new finding
        const updatedFindings = [finding, ...state.findings];
        
        // Persist findings to localStorage
        try {
          localStorage.setItem('jwt_analyzer_findings', JSON.stringify(updatedFindings));
        } catch (error) {
          console.error("[JWT Analyzer] Error saving findings to localStorage:", error);
        }
        
        return {
          findings: updatedFindings
        };
      }
    });
  },
  
  setFindings: (findings: Finding[]) => {
    console.log("[JWT Analyzer] Setting findings:", findings.length);
    
    // Persist findings to localStorage
    try {
      localStorage.setItem('jwt_analyzer_findings', JSON.stringify(findings));
    } catch (error) {
      console.error("[JWT Analyzer] Error saving findings to localStorage:", error);
    }
    
    set({ findings });
  },
  
  selectFinding: (id: string) => {
    set({ selectedFindingId: id });
  },
  
  clearSelection: () => {
    set({ selectedFindingId: null });
  },
  
  clearFindings: () => {
    console.log("[JWT Analyzer] Clearing all findings");
    
    // Clear findings from localStorage
    try {
      localStorage.removeItem('jwt_analyzer_findings');
    } catch (error) {
      console.error("[JWT Analyzer] Error removing findings from localStorage:", error);
    }
    
    set({ findings: [] });
  }
}));

// Initialize event listeners for the findings store
export const initializeFindingsEvents = (sdk: FrontendSDK) => {
  console.log("[JWT Analyzer] Initializing findings events");
  
  // Try to load findings from localStorage first
  try {
    const storedFindings = localStorage.getItem('jwt_analyzer_findings');
    if (storedFindings) {
      const parsedFindings = JSON.parse(storedFindings) as Finding[];
      console.log(`[JWT Analyzer] Loaded ${parsedFindings.length} findings from localStorage`);
      useFindingsStore.getState().setFindings(parsedFindings);
    }
  } catch (error) {
    console.error('[JWT Analyzer] Error loading findings from localStorage:', error);
  }
  
  // Initialize by loading findings from Caido and merging with localStorage data
  loadFindings(sdk, true);
  
  // Set up periodic refresh of findings to maintain them after Caido refresh
  setInterval(() => {
    loadFindings(sdk, false);
  }, 30000); // Check every 30 seconds

  sdk.backend.onEvent("jwt:analyzed", (finding: Finding) => {
    console.log("[JWT Analyzer] Received jwt:analyzed event with finding:", finding);
    
    // When a new JWT is analyzed, add it to the store
    useFindingsStore.getState().addFinding(finding);
    
    // Show a notification
    sdk.notifications?.success(`JWT token analyzed: ${finding.title}`);
    
    // Dispatch an event to notify other components about the new finding
    try {
      const event = new CustomEvent('jwt-finding-added', { detail: finding });
      console.log("[JWT Analyzer] Dispatching jwt-finding-added event");
      window.dispatchEvent(event);
    } catch (error) {
      console.error("[JWT Analyzer] Error dispatching jwt-finding-added event:", error);
    }
  });
};

// Load findings from Caido
async function loadFindings(sdk: FrontendSDK, forceUpdate: boolean = false) {
  if (sdk && sdk.findings && sdk.findings.getAll) {
    try {
      console.log("[JWT Analyzer] Loading findings from Caido...");
      const allFindings = await sdk.findings.getAll();
      
      // Filter to only include JWT findings
      const jwtFindings = allFindings.filter(f => 
        (f.title && f.title.includes('JWT')) || f.type === 'JWT Token'
      ) as Finding[];
      
      // Sort by newest first (if timestamp is available)
      jwtFindings.sort((a, b) => {
        if (a.timestamp && b.timestamp) {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return 0;
      });
      
      // Get existing findings from store
      const existingFindings = useFindingsStore.getState().findings;
      
      // Merge with existing findings from localStorage
      const mergedFindings = mergeFindings(existingFindings, jwtFindings);
      
      // Only update the store if there are actual changes or if forced
      if (forceUpdate || mergedFindings.length !== existingFindings.length || 
          JSON.stringify(mergedFindings.map(f => f.id).sort()) !== 
          JSON.stringify(existingFindings.map(f => f.id).sort())) {
        
        console.log(`[JWT Analyzer] Loaded ${mergedFindings.length} JWT findings after merging`);
        useFindingsStore.getState().setFindings(mergedFindings);
        
        // Dispatch event to update findings in other components
        try {
          const event = new CustomEvent('jwt-findings-refreshed', { 
            detail: { findings: mergedFindings }
          });
          window.dispatchEvent(event);
        } catch (error) {
          console.error("[JWT Analyzer] Error dispatching jwt-findings-refreshed event:", error);
        }
      } else {
        console.log(`[JWT Analyzer] No changes in findings detected (${mergedFindings.length} findings)`);
      }
    } catch (error) {
      console.error('[JWT Analyzer] Error fetching findings:', error);
    }
  }
}

// Helper function to merge findings from different sources,
// keeping the most recent version of each finding based on token value
function mergeFindings(existingFindings: Finding[], newFindings: Finding[]): Finding[] {
  // Create a map for quick lookup of existing findings by token
  const existingMap = new Map<string, Finding>();
  
  // Use token as unique identifier since finding IDs might differ between sources
  existingFindings.forEach(finding => {
    if (finding.metadata?.token) {
      existingMap.set(finding.metadata.token, finding);
    } else {
      existingMap.set(finding.id, finding);  // Fallback to ID if no token
    }
  });
  
  // Add new findings if they don't exist, or replace if newer
  newFindings.forEach(finding => {
    const key = finding.metadata?.token || finding.id;
    const existing = existingMap.get(key);
    
    if (!existing) {
      // If finding doesn't exist yet, add it
      existingMap.set(key, finding);
    } else if (finding.timestamp && existing.timestamp) {
      // If both have timestamps, keep the newer one
      const newTime = new Date(finding.timestamp).getTime();
      const existingTime = new Date(existing.timestamp).getTime();
      if (newTime > existingTime) {
        existingMap.set(key, finding);
      }
    } else {
      // If no timestamps to compare, prefer the new one
      existingMap.set(key, finding);
    }
  });
  
  // Convert map values back to array and sort by timestamp (newest first)
  return Array.from(existingMap.values()).sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    return 0;
  });
} 