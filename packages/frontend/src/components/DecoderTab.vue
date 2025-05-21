<template>
  <div class="decoder-container h-full overflow-y-auto">
    <div class="p-4">
      <Card class="bg-gray-50 dark:bg-surface-700">
      <template #title>
        <div class="flex items-center">
          <span class="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
              <path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/>
            </svg>
          </span>
          <span>Decode JWT Token</span>
        </div>
      </template>
      <template #content>
        <div class="mb-4">
          <label for="jwt-input" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Enter JWT Token
          </label>
          <div class="flex">
            <InputText id="jwt-input" v-model="manualToken" class="flex-1 mr-2" 
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
            <Button icon="pi pi-search" label="Decode" @click="decodeManualToken" :disabled="!isValidToken" />
          </div>
          <small v-if="manualToken && !isValidToken" class="text-red-500">
            Invalid JWT format. Please enter a valid token.
          </small>
          </div>
        </template>
      </Card>
        </div>

    <!-- Token Tabs section -->
    <div v-if="decodedTokens.length > 0" class="token-tabs bg-gray-100 dark:bg-surface-700 p-2 mx-4 rounded-t-lg mb-2 flex items-center overflow-x-auto">
      <TabView v-model:activeIndex="activeTokenTab" class="token-tabs-inner w-full">
        <TabPanel v-for="(token, index) in decodedTokens" :key="token.id">
          <template #header>
            <div class="token-tab-header flex items-center">
              <span class="truncate max-w-xs" :title="getTabTitle(token)">
                {{ token.customName || getTabTitle(token) }}
              </span>
              <button 
                @click.stop="closeTokenTab(index)" 
                class="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </template>
          
          <!-- Token Content -->
          <div class="token-content p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Card class="bg-white dark:bg-surface-800">
              <template #title>
                <div class="flex items-center">
                  <span class="tab-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512">
                      <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/>
                    </svg>
                  </span>
                  <span>Header</span>
                </div>
              </template>
              <template #content>
                <div class="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-auto max-h-64">
                    <pre>{{ JSON.stringify(token.header, null, 2) }}</pre>
                </div>
              </template>
            </Card>

            <Card class="bg-white dark:bg-surface-800">
              <template #title>
                <div class="flex items-center">
                  <span class="tab-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                      <path d="M0 80V229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7H48C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                    </svg>
                  </span>
                  <span>Payload</span>
                </div>
              </template>
              <template #content>
                <div class="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-auto max-h-64">
                    <pre>{{ JSON.stringify(token.payload, null, 2) }}</pre>
                </div>
              </template>
            </Card>
          </div>

          <Card class="bg-white dark:bg-surface-800">
            <template #title>
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/>
                  </svg>
                </span>
                <span>Security Analysis</span>
              </div>
            </template>
            <template #content>
                <div v-if="token.analysis">
                <h3 class="text-md font-semibold mb-2">Risks</h3>
                  <div v-if="!token.analysis.risks || token.analysis.risks.length === 0" 
                  class="py-2 text-center text-gray-500">
                  <span class="tab-icon inline-block align-middle text-success-500">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512" fill="currentColor">
                      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
                    </svg>
                  </span>
                  No risks detected
                </div>
                <ul v-else class="space-y-2 mb-4">
                    <li v-for="(risk, riskIndex) in token.analysis.risks" :key="riskIndex" 
                    class="border-l-4 p-2 rounded"
                    :class="{
                        'border-red-500 bg-red-200 dark:bg-red-700/40': risk.severity === 'critical',
                        'border-orange-500 bg-orange-200 dark:bg-orange-700/40': risk.severity === 'high',
                        'border-yellow-500 bg-yellow-200 dark:bg-yellow-700/40': risk.severity === 'medium',
                        'border-blue-500 bg-blue-200 dark:bg-blue-700/40': risk.severity === 'low'
                    }">
                    <div class="flex items-start">
                      <Tag :value="risk.severity" :severity="getSeverityType(risk.severity)" class="mr-2" />
                      <span>{{ risk.description }}</span>
                    </div>
                  </li>
                </ul>

                <h3 class="text-md font-semibold mb-2">Suggestions</h3>
                  <div v-if="!token.analysis.suggestions || token.analysis.suggestions.length === 0" 
                  class="py-2 text-center text-gray-500">
                  No suggestions available
                </div>
                <ul v-else class="list-disc ml-5 space-y-1">
                    <li v-for="(suggestion, sugIndex) in token.analysis.suggestions" :key="sugIndex">
                    {{ suggestion }}
                  </li>
                </ul>
              </div>
              
              <div class="flex justify-end mt-4 space-x-2">
                  <Button @click="renameTab(index)" icon="pi pi-pencil" text rounded tooltip="Rename Tab" />
                  <Button label="View in Token Details" @click="viewTokenDetails(token)" severity="success" class="p-button-raised">
                  <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                    </svg>
                  </template>
                </Button>
                  <Button label="Send to JWT Editor" @click="sendToJWTEditor(token)" severity="info" class="p-button-raised">
                  <template #icon>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                      <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
                    </svg>
                  </template>
                </Button>
              </div>
            </template>
          </Card>
          </div>
        </TabPanel>
      </TabView>
        </div>
        
    <div v-if="decodedTokens.length === 0 && manualToken === ''" class="flex flex-col items-center justify-center py-10 text-gray-500 h-full">
          <span class="block text-4xl mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512" fill="currentColor" style="width: 2em; height: 2em;">
              <path d="M144 144v48H304V144c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192V144C80 64.5 144.5 0 224 0s144 64.5 144 144v48h16c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V256c0-35.3 28.7-64 64-64H80z"/>
            </svg>
          </span>
          <h3 class="text-xl font-semibold">Enter a JWT Token</h3>
          <p class="mt-2 text-center">Paste a JWT token above to decode and analyze its contents</p>
        </div>
    
    <!-- Rename Modal -->
    <Dialog v-model:visible="showRenameModal" header="Rename Tab" :style="{ width: '30vw' }" :modal="true">
      <div class="p-fluid">
        <div class="field">
          <label for="tab-name">Tab Name</label>
          <InputText id="tab-name" v-model="newTabName" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" @click="cancelRename" class="p-button-text" />
        <Button label="Save" icon="pi pi-check" @click="saveRename" autofocus />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Dialog from 'primevue/dialog';
import { useSDK } from '../plugins/sdk';
import { analyzeJWTSecurity, decodeJWT } from '../utils/jwt';
import type { JWTHeader, JWTPayload, JWTRisk } from '../types';

// Define token tab interface
interface DecodedToken {
  id: string;
  token: string;
  header: JWTHeader;
  payload: JWTPayload;
  analysis: {
    risks: JWTRisk[];
    suggestions: string[];
  };
  customName?: string;
}

const sdk = useSDK();
const manualToken = ref('');
const decodedTokens = ref<DecodedToken[]>([]);
const activeTokenTab = ref(0);

// Rename dialog state
const showRenameModal = ref(false);
const newTabName = ref('');
const tabToRename = ref(-1);

// Maximum number of token tabs to keep open
const MAX_TOKEN_TABS = 10;

// Emit events to parent
const emit = defineEmits<{
  (e: 'viewDetails', token: string, header: JWTHeader, payload: JWTPayload, analysis: any): void;
  (e: 'sendToEditor', token: string): void;
}>();

// Validate JWT format
const isValidToken = computed(() => {
  if (!manualToken.value) return false;
  const parts = manualToken.value.split('.');
  return parts.length === 3;
});

// Methods
function getSeverityType(severity: string): string {
  switch (severity) {
    case 'critical': return 'danger';
    case 'high': return 'warning';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'info';
  }
}

// Get a readable title for the token tab
function getTabTitle(decodedToken: DecodedToken): string {
  // Use custom name if available
  if (decodedToken.customName) {
    return decodedToken.customName;
  }
  
  // Otherwise use algorithm and issuer
  const alg = decodedToken.header?.alg || 'unknown';
  const issuer = decodedToken.payload?.iss || 'unknown';
  
  // Create a short form of the token for display
  const shortToken = decodedToken.token.length > 15 
    ? decodedToken.token.substring(0, 12) + '...' 
    : decodedToken.token;
  
  return `${alg} • ${issuer} • ${shortToken}`;
}

function decodeManualToken() {
  if (!isValidToken.value) return;
  
  try {
    // Use the utility function to decode the JWT
    const decoded = decodeJWT(manualToken.value);
    
    if (!decoded || !decoded.header || !decoded.payload) {
      if (sdk?.notifications) {
        sdk.notifications.error('Failed to decode token');
      }
      return;
    }
    
    // Create a local analysis and display it
    const analysis = analyzeJWTSecurity(decoded.header, decoded.payload);
    
    // Add to decoded tokens
    const decodedToken: DecodedToken = {
      id: `manual-${Date.now()}`,
      token: manualToken.value,
      header: decoded.header,
      payload: decoded.payload,
      analysis
    };
    
    addTokenTab(decodedToken);
    
    // Clear the input field for the next token
    manualToken.value = '';
    
    // Submit to backend for full analysis and creation of a finding
    submitToBackend(decodedToken.token);
    
  } catch (error) {
    console.error('Error decoding token:', error);
    if (sdk?.notifications) {
      sdk.notifications.error('Error processing token');
    }
  }
}

// Add a token to the token tabs
function addTokenTab(token: DecodedToken): void {
  // Check if the token is already in tabs by its token value
  const existingTabIndex = decodedTokens.value.findIndex(tab => tab.token === token.token);
  
  if (existingTabIndex !== -1) {
    // If it exists, replace with updated version
    decodedTokens.value[existingTabIndex] = token;
    activeTokenTab.value = existingTabIndex;
  } else {
    // If not, add it to the tabs
    decodedTokens.value.push(token);
    
    // Enforce maximum number of tabs
    if (decodedTokens.value.length > MAX_TOKEN_TABS) {
      decodedTokens.value.shift(); // Remove oldest tab
    }
    
    // Set the newly added tab as active
    activeTokenTab.value = decodedTokens.value.length - 1;
  }
}

// Close a token tab
function closeTokenTab(index: number): void {
  // Remove the tab
  decodedTokens.value.splice(index, 1);
  
  // Adjust active tab if needed
  if (index <= activeTokenTab.value) {
    activeTokenTab.value = Math.max(0, activeTokenTab.value - 1);
  }
}

// Open rename dialog
function renameTab(index: number): void {
  tabToRename.value = index;
  newTabName.value = decodedTokens.value[index].customName || '';
  showRenameModal.value = true;
}

// Cancel rename
function cancelRename(): void {
  showRenameModal.value = false;
  tabToRename.value = -1;
  newTabName.value = '';
}

// Save rename
function saveRename(): void {
  if (tabToRename.value >= 0 && tabToRename.value < decodedTokens.value.length) {
    decodedTokens.value[tabToRename.value].customName = newTabName.value;
    if (sdk?.notifications) {
      sdk.notifications.success('Tab renamed successfully');
    }
  }
  showRenameModal.value = false;
  tabToRename.value = -1;
  newTabName.value = '';
}

function viewTokenDetails(token: DecodedToken) {
  if (!token) return;
  
  // Get the full token details
  const { header, payload, analysis } = token;
  
  // Emit event to parent component to switch to Token Details tab
  // Add navigate=true to ensure it navigates to the Token Details tab
  emit('viewDetails', token.token, header, payload, analysis, true);
  
  // Also create a finding if it doesn't exist yet
  submitToBackend(token.token);
  
  // Show success toast notification
  if (sdk?.notifications) {
    sdk.notifications.success('Token details view opened');
  }
}

function sendToJWTEditor(token: DecodedToken) {
  if (token) {
    // Emit event to App component to handle navigation to JWT Editor
    emit('sendToEditor', token.token);
    
    // Show toast notification
    if (sdk?.notifications) {
      sdk.notifications.success('Token sent to JWT Editor');
    }
  }
}

function submitToBackend(token: string) {
  // Analyze token directly with backend
  if (sdk && sdk.backend && sdk.backend.analyzeJWT) {
    sdk.notifications?.info('Sending token to backend for analysis...');
    
    sdk.backend.analyzeJWT({
      token,
      requestId: 'manual',
      source: 'manual'
    }).catch(error => {
      console.error('Error analyzing token:', error);
    });
  }
}

onMounted(() => {
  // Add listener for the set-decoder-token event
  window.addEventListener('set-decoder-token', handleSetDecoderToken);
});

onUnmounted(() => {
  // Remove listener when component is unmounted
  window.removeEventListener('set-decoder-token', handleSetDecoderToken);
});

// Handler for receiving tokens from other components
function handleSetDecoderToken(event: Event) {
  const customEvent = event as CustomEvent;
  if (customEvent.detail && customEvent.detail.token) {
    manualToken.value = customEvent.detail.token;
    // Trigger token analysis
    decodeManualToken();
  }
}
</script>

<style scoped>
.decoder-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow-y: auto !important;
}

:deep(.p-card) {
  display: flex;
  flex-direction: column;
  overflow: auto !important;
}

:deep(.p-card-content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto !important;
}

.token-content {
  animation: fadeIn 0.3s ease-in-out;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto !important;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-icon {
  display: inline-flex;
  margin-right: 0.5rem;
  width: 1rem;
  height: 1rem;
}

.tab-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

/* Token tabs styling */
.token-tabs {
  position: relative;
  height: auto;
  min-height: 40px;
  overflow-x: auto !important;
}

:deep(.token-tabs-inner .p-tabview-nav) {
  border-bottom: none;
  background: transparent;
  overflow-x: auto !important;
}

:deep(.token-tabs-inner .p-tabview-nav-link) {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  margin-right: 0.25rem;
  font-size: 0.875rem;
  border: 1px solid rgba(209, 213, 219, 0.5);
}

:deep(.token-tabs-inner .p-tabview-selected) {
  border-color: rgba(99, 102, 241, 0.5);
}

:deep(.token-tabs-inner .p-tabview-panels) {
  padding: 0;
  margin: 0;
  border: none;
  height: auto;
  overflow: auto !important;
}

.token-tab-header {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style> 