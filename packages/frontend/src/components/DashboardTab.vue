<template>
  <div class="dashboard-container h-full flex flex-col">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <Card class="bg-gray-50 dark:bg-surface-700">
        <template #title>
          <div class="flex items-center justify-between">
            <span>JWT Summary</span>
            <Badge :value="jwtCount" severity="info" />
          </div>
        </template>
        <template #content>
          <div class="stats-grid grid grid-cols-2 gap-4">
            <div class="stat p-4 rounded-lg bg-white dark:bg-surface-800 shadow-sm border-l-4 border-red-500">
              <div class="text-gray-500 dark:text-gray-400 text-sm font-medium">Critical Issues</div>
              <div class="font-bold text-2xl text-danger-600 dark:text-danger-400">{{ criticalCount }}</div>
            </div>
            <div class="stat p-4 rounded-lg bg-white dark:bg-surface-800 shadow-sm border-l-4 border-orange-500">
              <div class="text-gray-500 dark:text-gray-400 text-sm font-medium">High Issues</div>
              <div class="font-bold text-2xl text-orange-500 dark:text-orange-400">{{ highCount }}</div>
            </div>
            <div class="stat p-4 rounded-lg bg-white dark:bg-surface-800 shadow-sm border-l-4 border-yellow-500">
              <div class="text-gray-500 dark:text-gray-400 text-sm font-medium">Medium Issues</div>
              <div class="font-bold text-2xl text-yellow-500 dark:text-yellow-400">{{ mediumCount }}</div>
            </div>
            <div class="stat p-4 rounded-lg bg-white dark:bg-surface-800 shadow-sm border-l-4 border-blue-500">
              <div class="text-gray-500 dark:text-gray-400 text-sm font-medium">Low Issues</div>
              <div class="font-bold text-2xl text-info-600 dark:text-info-400">{{ lowCount }}</div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="bg-gray-50 dark:bg-surface-700">
        <template #title>
          <div class="flex items-center justify-between">
            <span>Algorithm Distribution</span>
          </div>
        </template>
        <template #content>
          <div v-if="jwtCount === 0" class="h-36 flex items-center justify-center text-gray-500">
            No JWTs analyzed yet
          </div>
          <div v-else class="algorithm-distribution">
            <div class="grid grid-cols-2 gap-3">
              <div v-for="(item, index) in algorithmData" :key="index" 
                class="algorithm-card p-3 rounded-lg bg-white dark:bg-surface-800 shadow-sm"
                :style="{ borderLeft: '4px solid ' + getAlgorithmColor(item.name) }">
                <div class="flex items-center justify-between mb-1">
                  <div class="font-medium text-sm">{{ item.name }}</div>
                  <div class="text-xs font-bold px-2 py-1 rounded-full" 
                    :style="{ backgroundColor: getAlgorithmColor(item.name) + '33', color: getAlgorithmColor(item.name) }">
                    {{ item.value }} token{{ item.value !== 1 ? 's' : '' }}
                  </div>
                </div>
                <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div class="h-2 rounded-full" 
                    :style="{ 
                      width: getPercentage(item) + '%', 
                      backgroundColor: getAlgorithmColor(item.name)
                    }">
                  </div>
                </div>
                <div class="text-xs text-right mt-1 text-gray-500">
                  {{ getPercentage(item) }}%
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <Card class="flex-grow bg-gray-50 dark:bg-surface-700">
      <template #title>
        <div class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
              <path d="M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z"/>
            </svg>
          </span>
          <span>Recent Findings</span>
          </div>
          <div class="flex items-center">
            <span v-if="isAutoRefresh" class="text-xs mr-2 text-green-500">Auto-refresh: ON</span>
            <Button icon="pi pi-refresh" text rounded aria-label="Refresh" 
              :loading="isLoading" @click="refreshFindings" />
            <Button :icon="isAutoRefresh ? 'pi pi-pause' : 'pi pi-play'" text rounded 
              :class="isAutoRefresh ? 'text-green-500' : ''"
              aria-label="Toggle Auto-refresh" @click="toggleAutoRefresh" />
          </div>
        </div>
      </template>
      <template #content>
        <!-- Add the search and filter component -->
        <SearchFilterBar @filter-change="applyFilters" />

        <div v-if="findings.length === 0" class="flex items-center justify-center h-full min-h-[200px] text-gray-500">
          <div class="text-center">
            <span class="block text-4xl mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 512 512" fill="currentColor">
                <path d="M246.6 150.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l96-96c12.5-12.5 32.8-12.5 45.3 0l96 96c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L352 109.3V384c0 35.3 28.7 64 64 64h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H416c-70.7 0-128-57.3-128-128c0-35.3-28.7-64-64-64s-64 28.7-64 64c0 70.7-57.3 128-128 128H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h64c35.3 0 64-28.7 64-64V109.3l-41.4 41.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l96-96c12.5-12.5 32.8-12.5 45.3 0l96 96c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 109.3V256c0 17.7 14.3 32 32 32s32-14.3 32-32V109.3l-41.4 41.4z"/>
              </svg>
            </span>
            <p>No JWT findings yet</p>
          </div>
        </div>
        <div v-else-if="filteredFindings.length === 0" class="flex items-center justify-center h-full min-h-[200px] text-gray-500">
          <div class="text-center">
            <span class="block text-4xl mb-2">
              <i class="pi pi-filter-slash"></i>
            </span>
            <p>No findings match your filters</p>
          </div>
        </div>
        <div v-else>
          <DataTable :value="filteredFindings" :paginator="filteredFindings.length > 10" :rows="10" 
            stripedRows class="p-datatable-sm" responsiveLayout="scroll"
            v-model:expandedRows="expandedRows"
            @row-click="onRowClick"
            @row-toggle="onRowToggle"
            rowHover
            :rowClass="rowClass"
            tableStyle="border-radius: 8px; overflow: hidden;">
            <Column expander style="width: 3rem" />
            <template #empty>
              <div class="p-4 text-center text-gray-500">No JWT tokens found</div>
            </template>
            <Column field="title" header="Title" :sortable="true">
              <template #body="slotProps">
                <div class="flex items-center">
                  <span class="token-preview font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded border-l-2 border-blue-500">
                    {{ formatTokenPreview(slotProps.data.metadata?.token || '') }}
                  </span>
                  <button 
                    class="ml-2 text-gray-500 hover:text-blue-500 focus:outline-none hover:scale-110 transition-transform" 
                    @click.stop="copyTokenToClipboard(slotProps.data.metadata?.token || '')"
                    title="Copy JWT token"
                  >
                    <i class="pi pi-copy"></i>
                  </button>
                </div>
              </template>
            </Column>
            <Column field="metadata.source" header="Source" :sortable="true">
              <template #body="slotProps">
                <Tag :value="slotProps.data.metadata.source" 
                  :severity="slotProps.data.metadata.source === 'request' ? 'info' : 'success'" />
              </template>
            </Column>
            <Column field="severity" header="Severity" :sortable="true">
              <template #body="slotProps">
                  <span 
                    :class="[
                      getSeverityClass(slotProps.data.severity),
                      'px-3 py-1 text-xs font-medium rounded-md inline-block min-w-[70px] text-center'
                    ]"
                  >
                    {{ slotProps.data.severity.charAt(0).toUpperCase() + slotProps.data.severity.slice(1) }}
                  </span>
              </template>
            </Column>
            <Column field="metadata.header.alg" header="Algorithm" :sortable="true" />
            <Column field="metadata.timeLeft" header="Expiration" :sortable="true" />
            <Column header="Actions" style="width: 14rem">
              <template #body="slotProps">
                  <div class="flex gap-1">
                <Button icon="pi pi-eye" text rounded aria-label="View Details" 
                      @click.stop="toggleExpand(slotProps.data)" 
                      tooltip="View Request/Response" tooltipOptions="{ position: 'top' }"
                      class="hover:bg-blue-50 dark:hover:bg-blue-900/30" />
                  <Button icon="pi pi-key" text rounded aria-label="Decode Token" 
                    @click.stop="decodeToken(slotProps.data)" 
                    tooltip="Decode Token" tooltipOptions="{ position: 'top' }"
                    class="hover:bg-green-50 dark:hover:bg-green-900/30" />
                  <Button icon="pi pi-list" text rounded aria-label="Token Details" 
                    @click.stop="viewTokenDetails(slotProps.data)" 
                    tooltip="Token Details" tooltipOptions="{ position: 'top' }"
                    class="hover:bg-purple-50 dark:hover:bg-purple-900/30" />
                  <Button icon="pi pi-pencil" text rounded aria-label="Send to Editor" 
                    @click.stop="sendToEditor(slotProps.data)" 
                    tooltip="Send to JWT Editor" tooltipOptions="{ position: 'top' }"
                    class="hover:bg-amber-50 dark:hover:bg-amber-900/30" />
                  <Button icon="pi pi-trash" text rounded aria-label="Delete Token" 
                    @click.stop="deleteToken(slotProps.data)" 
                    tooltip="Delete Token" class="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30" tooltipOptions="{ position: 'top' }" />
              </div>
            </template>
          </Column>
          <template #expansion="slotProps">
            <div class="p-3 request-expansion bg-white dark:bg-surface-800 rounded-lg shadow-sm"
                 :class="{
                   'request-source': slotProps.data.metadata.source === 'request',
                   'response-source': slotProps.data.metadata.source === 'response',
                   'manual-source': slotProps.data.metadata.source === 'manual'
                 }">
              
              <!-- JWT Token Information -->
              <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <h4 class="font-bold mb-2 flex items-center">
                  <i class="pi pi-key text-blue-500 mr-2"></i>
                  JWT Token Information
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div class="mb-2">
                      <span class="font-medium">Algorithm:</span> {{ slotProps.data.metadata.header?.alg || 'Unknown' }}
                    </div>
                    <div class="mb-2">
                      <span class="font-medium">Issuer:</span> {{ slotProps.data.metadata.issuer || 'Not specified' }}
                    </div>
                  </div>
                  <div>
                    <div class="mb-2">
                      <span class="font-medium">Subject:</span> {{ slotProps.data.metadata.subject || 'Not specified' }}
                    </div>
                    <div class="mb-2">
                      <span class="font-medium">Expiration:</span> {{ slotProps.data.metadata.timeLeft }}
                    </div>
                    <div class="mb-2">
                      <span class="font-medium">Audience:</span> {{ slotProps.data.metadata.audience || 'Not specified' }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Token Source Information (for manual tokens only) -->
              <div v-if="slotProps.data.metadata.source === 'manual'" class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
                <h4 class="font-bold mb-2 flex items-center">
                  <i class="pi pi-info-circle text-amber-500 mr-2"></i>
                  Token Source
                </h4>
                <div class="grid grid-cols-1 gap-2">
                  <div class="mb-2">
                    <span class="font-medium">Origin:</span> JWT Editor
                  </div>
                  <div class="mb-2">
                    <span class="font-medium">Created via:</span>
                    <span v-if="slotProps.data.metadata.header?.alg === 'none'" class="text-danger-500">
                      Token manipulation - "none" algorithm attack
                    </span>
                    <span v-else-if="slotProps.data.title && slotProps.data.title.includes('Attack')" class="text-danger-500">
                      Token manipulation - Attack simulation
                    </span>
                    <span v-else-if="slotProps.data.metadata.header?.alg?.startsWith('HS') && 
                                     slotProps.data.metadata.header?.origAlg?.startsWith('RS')" class="text-danger-500">
                      Token manipulation - HMAC confusion attack
                    </span>
                    <span v-else>
                      Manual analysis or decode operation
                    </span>
                  </div>
                  <div v-if="slotProps.data.timestamp" class="mb-2">
                    <span class="font-medium">Timestamp:</span> {{ new Date(slotProps.data.timestamp).toLocaleString() }}
                  </div>
                </div>
              </div>
              
              <!-- Token Actions -->
              <div class="mt-4 flex justify-end gap-2">
                <Button icon="pi pi-key" label="Decode" class="p-button-sm" 
                  @click="decodeToken(slotProps.data)" />
                <Button icon="pi pi-list" label="Token Details" class="p-button-sm" 
                  @click="viewTokenDetails(slotProps.data)" />
                <Button icon="pi pi-pencil" label="Send to Editor" class="p-button-sm" 
                  @click="sendToEditor(slotProps.data)" />
              </div>
            </div>
          </template>
        </DataTable>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { onBeforeUnmount } from 'vue';
import { watch } from 'vue';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import SearchFilterBar from './SearchFilterBar.vue';
import type { Finding } from '../types';
import { useSDK } from '../plugins/sdk';

// Define a filter type for our search filters
interface JWTFilter {
  search: string;
  severities: string[];
  sources: string[];
  algorithms: string[];
}

// SDK
const sdk = useSDK();

// Props
const props = defineProps({
  findings: {
    type: Array as () => Finding[],
    required: true
  }
});

// Emits
const emit = defineEmits<{
  (e: 'viewDetails', finding: Finding): void,
  (e: 'refresh'): void,
  (e: 'filters-changed', filteredFindings: Finding[]): void
}>();

// State
const isLoading = ref(false);
const isAutoRefresh = ref(false);
const refreshInterval = ref<number | null>(null);
const isDebugMode = ref(true);
const expandedRows = ref<Finding[]>([]);

// Search and filter state
const searchQuery = ref('');
const selectedSeverities = ref<string[]>([]);
const selectedSources = ref<string[]>([]);
const selectedAlgorithms = ref<string[]>([]);

// Computed
const jwtCount = computed(() => props.findings.length);

const criticalCount = computed(() => 
  props.findings.filter((f: Finding) => f.severity === 'critical').length
);

const highCount = computed(() => 
  props.findings.filter((f: Finding) => f.severity === 'high').length
);

const mediumCount = computed(() => 
  props.findings.filter((f: Finding) => f.severity === 'medium').length
);

const lowCount = computed(() => 
  props.findings.filter((f: Finding) => f.severity === 'low').length
);

// Filtered findings based on search and filter criteria
const filteredFindings = computed(() => {
  let result = [...props.findings];
  
  // Apply text search if provided
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(finding => {
      // Search in token
      if (finding.metadata?.token && finding.metadata.token.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in title
      if (finding.title && finding.title.toLowerCase().includes(query)) {
        return true;
      }
      
      // Search in payload data
      if (finding.metadata?.payload) {
        const payloadStr = JSON.stringify(finding.metadata.payload).toLowerCase();
        if (payloadStr.includes(query)) {
          return true;
        }
      }
      
      // Search in header data
      if (finding.metadata?.header) {
        const headerStr = JSON.stringify(finding.metadata.header).toLowerCase();
        if (headerStr.includes(query)) {
          return true;
        }
      }
      
      return false;
    });
  }
  
  // Apply severity filter if selected
  if (selectedSeverities.value.length > 0) {
    result = result.filter(finding => 
      finding.severity && selectedSeverities.value.includes(finding.severity)
    );
  }
  
  // Apply source filter if selected
  if (selectedSources.value.length > 0) {
    result = result.filter(finding => 
      finding.metadata?.source && selectedSources.value.includes(finding.metadata.source)
    );
  }
  
  // Apply algorithm filter if selected
  if (selectedAlgorithms.value.length > 0) {
    result = result.filter(finding => 
      finding.metadata?.header?.alg && selectedAlgorithms.value.includes(finding.metadata.header.alg)
    );
  }
  
  return result;
});

// Algorithm distribution data for pie chart
const algorithmData = computed(() => {
  // Make sure findings exist and have metadata
  if (!props.findings || props.findings.length === 0) {
    return [];
  }

  // Extract algorithms, handling undefined/null values
  const algorithms = props.findings.map((f: Finding) => {
    // Use a default of 'none' if algorithm is missing
    return f.metadata?.header?.alg || 'none';
  });
  
  // Count occurrences of each algorithm
  const counts: Record<string, number> = {};
  algorithms.forEach((alg: string) => {
    counts[alg] = (counts[alg] || 0) + 1;
  });
  
  // Convert to array of objects for the chart component
  const result = Object.entries(counts).map(([name, value]) => ({ name, value }));
  
  // Log the algorithm data to verify it's working
  console.log("[JWT Analyzer] Algorithm distribution:", result);
  
  return result;
});

// Setup auto-refresh
onMounted(() => {
  // Load data immediately
  refreshFindings();
  
  // If auto-refresh is enabled, set up the interval
  if (isAutoRefresh.value) {
    startAutoRefresh();
  }
  
  // Listen for findings-added event
  window.addEventListener('jwt-finding-added', handleFindingAdded);
});

onBeforeUnmount(() => {
  stopAutoRefresh();
  window.removeEventListener('jwt-finding-added', handleFindingAdded);
});

// Handler for jwt-finding-added event
function handleFindingAdded(event: Event) {
  const customEvent = event as CustomEvent;
  if (customEvent.detail) {
    // Auto-expand the new finding
    if (!expandedRows.value.some((row: Finding) => row.id === customEvent.detail.id)) {
      expandedRows.value = [...expandedRows.value, customEvent.detail];
    }
    
    // Refresh the findings data
    emit('refresh');
  }
}

// Handle filter changes from search bar
function applyFilters(filters: JWTFilter): void {
  console.log("[JWT Analyzer] Applying filters:", filters);
  searchQuery.value = filters.search;
  selectedSeverities.value = filters.severities;
  selectedSources.value = filters.sources;
  selectedAlgorithms.value = filters.algorithms;
}

// Methods
function getSeverityClass(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-200 text-red-900 dark:bg-red-700 dark:text-red-100 font-medium';
    case 'high':
      return 'bg-orange-200 text-orange-900 dark:bg-orange-700 dark:text-orange-100 font-medium';
    case 'medium':
      return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100 font-medium';
    case 'low':
      return 'bg-blue-200 text-blue-900 dark:bg-blue-700 dark:text-blue-100 font-medium';
    case 'info':
      return 'bg-indigo-200 text-indigo-900 dark:bg-indigo-700 dark:text-indigo-100 font-medium';
    default:
      return 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 font-medium';
  }
}

function getStatusClass(status: number): string {
  if (status >= 500) return 'bg-red-500 text-white'; // Server errors
  if (status >= 400) return 'bg-orange-500 text-white'; // Client errors
  if (status >= 300) return 'bg-blue-500 text-white'; // Redirects
  if (status >= 200) return 'bg-green-500 text-white'; // Success
  return 'bg-gray-500 text-white'; // Default
}

function getUrlPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

function formatBody(body: string): string {
  try {
    const json = JSON.parse(body);
    return JSON.stringify(json, null, 2);
  } catch {
    return body;
  }
}

function formatAudience(aud: string | string[] | undefined): string {
  if (!aud) return 'Not specified';
  if (Array.isArray(aud)) return aud.join(', ');
  return aud;
}

// Toggle row expansion
function toggleExpand(finding: Finding) {
  const index = expandedRows.value.findIndex((row: Finding) => row.id === finding.id);
  if (index >= 0) {
    expandedRows.value = expandedRows.value.filter((row: Finding) => row.id !== finding.id);
  } else {
    expandedRows.value = [...expandedRows.value, finding];
  }
}

// Handle row click for expansion
function onRowClick(event: any) {
  if (!event.data) return;
  
  // Don't toggle expansion if clicking on action buttons
  if (event.originalEvent.target.closest('.p-button')) {
    return;
  }
  
  toggleExpand(event.data);
}

// Token Actions
function viewTokenDetails(finding: Finding) {
  console.log("[JWT Analyzer] DashboardTab sending viewDetails event to App with navigate=true");
  emit('viewDetails', {...finding, navigate: true});
  
  // Navigate to token details tab (index 2)
  window.dispatchEvent(new CustomEvent('navigate-tab', {
    detail: { tabIndex: 2 }
  }));
}

function decodeToken(finding: Finding) {
  if (finding.metadata.token) {
    // Navigate to decoder tab and pre-fill token
    window.dispatchEvent(new CustomEvent('navigate-to-decoder', {
      detail: { token: finding.metadata.token }
    }));
    
    // The navigate-to-decoder event will handle the tab navigation
    // (it's already set to index 1 in App.vue)
  }
}

function sendToEditor(finding: Finding) {
  if (finding.metadata.token) {
    // Dispatch event to notify JWT Editor
    window.dispatchEvent(new CustomEvent('add-token-to-editor', {
      detail: { token: finding.metadata.token }
    }));
    
    // Navigate to JWT Editor tab (index 3, not 4)
    window.dispatchEvent(new CustomEvent('navigate-tab', {
      detail: { tabIndex: 3 }
    }));
  }
}

async function refreshFindings() {
  isLoading.value = true;
  emit('refresh');
  
  // Short timeout to ensure loading indicator shows
  setTimeout(() => {
    isLoading.value = false;
  }, 500);
}

function toggleAutoRefresh() {
  isAutoRefresh.value = !isAutoRefresh.value;
  
  if (isAutoRefresh.value) {
    startAutoRefresh();
    if (sdk && sdk.notifications) {
      sdk.notifications.info('Auto-refresh enabled');
    }
  } else {
    stopAutoRefresh();
    if (sdk && sdk.notifications) {
      sdk.notifications.info('Auto-refresh disabled');
    }
  }
}

function startAutoRefresh() {
  // Refresh every 10 seconds
  stopAutoRefresh(); // Clear any existing interval
  refreshInterval.value = window.setInterval(() => {
    refreshFindings();
  }, 10000);
}

function stopAutoRefresh() {
  if (refreshInterval.value !== null) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
}

function formatTokenPreview(token: string): string {
  if (!token) return 'Unknown Token';
  
  // Show first part of token (header) plus a bit of the payload with ellipsis
  const parts = token.split('.');
  if (parts.length >= 2) {
    return `${parts[0].substring(0, 10)}...${parts[1].substring(0, 8)}...`;
  }
  
  // Fallback if token format is unexpected
  return token.length > 20 ? `${token.substring(0, 20)}...` : token;
}

async function copyTokenToClipboard(token: string): Promise<void> {
  if (!token) return;
  
  try {
    await navigator.clipboard.writeText(token);
    // Ensure toast notification appears
    if (sdk.notifications) {
      sdk.notifications.success('JWT token copied to clipboard');
    } else if (window.caidoSDK?.notifications) {
      window.caidoSDK.notifications.success('JWT token copied to clipboard');
    } else {
      console.log('JWT token copied to clipboard');
    }
  } catch (e) {
    console.error('Failed to copy token to clipboard:', e);
    
    // Fallback method
    const textArea = document.createElement('textarea');
    textArea.value = token;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const success = document.execCommand('copy');
      if (success) {
        if (sdk.notifications) {
          sdk.notifications.success('JWT token copied to clipboard');
        } else if (window.caidoSDK?.notifications) {
          window.caidoSDK.notifications.success('JWT token copied to clipboard');
        }
      } else {
        if (sdk.notifications) {
          sdk.notifications.error('Failed to copy token');
        } else if (window.caidoSDK?.notifications) {
          window.caidoSDK.notifications.error('Failed to copy token');
        }
      }
    } catch (err) {
      if (sdk.notifications) {
        sdk.notifications.error('Failed to copy token');
      } else if (window.caidoSDK?.notifications) {
        window.caidoSDK.notifications.error('Failed to copy token');
      }
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
  }
}

// Add a function to delete tokens
function deleteToken(finding: Finding): void {
  if (!finding || !finding.id) return;
  
  try {
    // Remove from current list
    const newFindings = props.findings.filter((f: Finding) => f.id !== finding.id);
    
    // Update local storage to persist the deletion
    try {
      localStorage.setItem('jwt_analyzer_findings', JSON.stringify(newFindings));
    } catch (e) {
      console.error('[JWT Analyzer] Error saving to localStorage:', e);
    }
    
    // Dispatch event to update findings in other components
    const event = new CustomEvent('jwt-findings-refreshed', { 
      detail: { findings: newFindings }
    });
    window.dispatchEvent(event);
    
    // Show success message
    if (sdk.notifications) {
      sdk.notifications.success('Token deleted successfully');
    } else if (window.caidoSDK?.notifications) {
      window.caidoSDK.notifications.success('Token deleted successfully');
    }
  } catch (error) {
    console.error('[JWT Analyzer] Error deleting token:', error);
    if (sdk.notifications) {
      sdk.notifications.error('Failed to delete token');
    } else if (window.caidoSDK?.notifications) {
      window.caidoSDK.notifications.error('Failed to delete token');
    }
  }
}

// Update the watch mechanism to refresh the chart when findings change
watch(() => props.findings, () => {
  // Algorithm chart data will automatically update because it's a computed prop
  // No extra code needed here - the reactive system will handle it
}, { deep: true });

// Add this function to handle row toggle events
function onRowToggle(event: any) {
  // The event will already handle the expanded rows state
  // We just need this function to ensure the expander arrow works correctly
  expandedRows.value = event.data;
}

// Add the new format functions needed for the HTTPEditor
function formatRawHttpForDisplay(rawHttp: string): string {
  if (!rawHttp) return 'No data available';
  
  // Replace special characters for HTML display
  const htmlEscaped = rawHttp
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Add syntax highlighting
  return htmlEscaped
    // Highlight HTTP method and URL
    .replace(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE)(\s+)([^\s]+)(\s+)(HTTP\/[0-9.]+)/gm, 
      '<span class="text-green-600 dark:text-green-400 font-bold">$1</span>$2<span class="text-blue-600 dark:text-blue-400">$3</span>$4<span class="text-purple-600 dark:text-purple-400">$5</span>')
    // Highlight status line
    .replace(/^(HTTP\/[0-9.]+)(\s+)([0-9]+)(\s+)(.+)$/gm,
      '<span class="text-purple-600 dark:text-purple-400">$1</span>$2<span class="text-blue-600 dark:text-blue-400 font-bold">$3</span>$4<span class="text-gray-600 dark:text-gray-400">$5</span>')
    // Highlight headers
    .replace(/^([A-Za-z0-9_-]+)(:)(.+)$/gm, 
      '<span class="text-amber-600 dark:text-amber-400 font-bold">$1</span><span class="text-gray-600 dark:text-gray-400">$2</span><span class="text-gray-800 dark:text-gray-300">$3</span>');
}

function formatRawHttpRequest(request: any): string {
  if (!request) return '';
  
  // Handle cases where we already have formatted raw HTTP
  if (request.rawHttp && typeof request.rawHttp === 'string') {
    // Use the pre-formatted HTTP string
    return request.rawHttp;
  }
  
  // Format the request line
  let raw = `${request.method || 'GET'} ${request.url || '/'} HTTP/1.1\r\n`;
  
  // Add headers
  if (request.headers) {
    Object.entries(request.headers).forEach(([name, value]) => {
      raw += `${name}: ${value}\r\n`;
    });
  }
  
  // Add separator between headers and body
  raw += '\r\n';
  
  // Add body if present
  if (request.body) {
    raw += request.body;
  }
  
  return raw;
}

function formatRawHttpResponse(response: any): string {
  if (!response) return '';
  
  // Handle cases where we already have formatted raw HTTP
  if (response.rawHttp && typeof response.rawHttp === 'string') {
    // Use the pre-formatted HTTP string
    return response.rawHttp;
  }
  
  // Format the status line
  let raw = `HTTP/1.1 ${response.status || response.statusCode || 200} OK\r\n`;
  
  // Add headers
  if (response.headers) {
    Object.entries(response.headers).forEach(([name, value]) => {
      raw += `${name}: ${value}\r\n`;
    });
  }
  
  // Add separator between headers and body
  raw += '\r\n';
  
  // Add body if present
  if (response.body) {
    raw += response.body;
  }
  
  return raw;
}

// Add function to get percentage for each algorithm
function getPercentage(item: { name: string, value: number }): number {
  const total = props.findings.length;
  if (total === 0) return 0;
  return Math.round((item.value / total) * 100);
}

// Add function to get color for each algorithm
function getAlgorithmColor(alg: string): string {
  const colorMap: Record<string, string> = {
    'HS256': '#4285F4', // Blue
    'RS256': '#EA4335', // Red
    'ES256': '#FBBC05', // Yellow
    'HS384': '#34A853', // Green
    'HS512': '#8E44AD', // Purple
    'none': '#555555',  // Dark Gray
    'RS384': '#00ACC1', // Teal
    'RS512': '#E91E63', // Pink
    'ES384': '#FF9800', // Orange
    'ES512': '#3949AB', // Indigo
    'PS256': '#9C27B0'  // Deep Purple
  };
  
  return colorMap[alg] || '#555555';
}

// Add this with other methods
function rowClass(data: Finding): Record<string, boolean> {
  // Add our new classes for border styling
  const severityClass = data.severity ? `severity-${data.severity}` : 'severity-info';
  return {
    'finding-row': true, // Base class for all rows
    'source-request': data.metadata?.source === 'request',
    'source-response': data.metadata?.source === 'response',
    'source-manual': data.metadata?.source === 'manual',
    [severityClass]: true // Add severity-based classes
  };
}

// Watch for changes in filtered findings and emit to parent
watch(filteredFindings, (newFilteredFindings: Finding[]) => {
  emit('filters-changed', newFilteredFindings);
});
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

.stats-grid {
  margin-bottom: 0;
}

:deep(.p-datatable) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.p-datatable-wrapper) {
  flex-grow: 1;
}

:deep(.p-datatable-table) {
  min-height: 200px;
}

:deep(.p-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
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

.request-expansion pre {
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.p-button.p-button-sm) {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
}

:deep(.p-row-toggler) {
  width: 2rem;
  height: 2rem;
}

/* Add styles for the expansion panel with colored border */
.request-expansion {
  border-left: 4px solid #4F46E5; /* Indigo color to match the JWT theme */
  padding-left: 1rem;
}

/* Different colors based on token source */
.request-expansion.request-source {
  border-left-color: #3B82F6; /* Blue for request source */
}

.request-expansion.response-source {
  border-left-color: #10B981; /* Green for response source */
}

.request-expansion.manual-source {
  border-left-color: #F59E0B; /* Amber for manual source */
}

/* NEW STYLES - Row colored borders */
:deep(.p-datatable .p-datatable-tbody > tr) {
  border-left: 4px solid transparent;
  position: relative;
  transition: all 0.2s ease;
}

/* Row border colors based on source */
:deep(.p-datatable .p-datatable-tbody > tr.source-request) {
  border-left-color: #3B82F6; /* Blue for request tokens */
}

:deep(.p-datatable .p-datatable-tbody > tr.source-response) {
  border-left-color: #10B981; /* Green for response tokens */
}

:deep(.p-datatable .p-datatable-tbody > tr.source-manual) {
  border-left-color: #F59E0B; /* Amber for manual tokens */
}

/* Add hover effect */
:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  border-left-width: 6px;
}

/* Different colors for multiple rows if needed */
:deep(.p-datatable .p-datatable-tbody > tr:nth-child(4n+1)) { border-left-opacity: 1; }
:deep(.p-datatable .p-datatable-tbody > tr:nth-child(4n+2)) { border-left-opacity: 0.85; }
:deep(.p-datatable .p-datatable-tbody > tr:nth-child(4n+3)) { border-left-opacity: 0.7; }
:deep(.p-datatable .p-datatable-tbody > tr:nth-child(4n+4)) { border-left-opacity: 0.55; }

/* For severity-based row coloring */
:deep(.p-datatable .p-datatable-tbody > tr.severity-critical) {
  border-left-color: #EF4444; /* Red */
}

:deep(.p-datatable .p-datatable-tbody > tr.severity-high) {
  border-left-color: #F97316; /* Orange */
}

:deep(.p-datatable .p-datatable-tbody > tr.severity-medium) {
  border-left-color: #F59E0B; /* Amber */
}

:deep(.p-datatable .p-datatable-tbody > tr.severity-low) {
  border-left-color: #3B82F6; /* Blue */
}

:deep(.p-datatable .p-datatable-tbody > tr.severity-info) {
  border-left-color: #8B5CF6; /* Purple */
}
</style> 