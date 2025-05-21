<template>
  <div class="search-filter-bar p-4 bg-white dark:bg-surface-800 rounded-lg shadow-sm mb-4">
    <!-- All elements in a single row -->
    <div class="flex flex-wrap items-center gap-4">
      <!-- Text search input -->
      <div class="relative flex-1 min-w-[200px]">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
          <i class="pi pi-search"></i>
        </span>
        <input 
          type="text" 
          class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                 bg-white dark:bg-surface-700 text-gray-900 dark:text-gray-100
                 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          placeholder="Search tokens, titles, or payloads..." 
          v-model="searchQuery"
          @input="emitFilters"
        />
      </div>

      <!-- Severity filter -->
      <div class="w-[180px]">
        <div class="relative">
          <MultiSelect
            v-model="selectedSeverities"
            :options="severityOptions"
            optionLabel="name"
            placeholder="Severity"
            class="w-full search-filter-dropdown"
            :maxSelectedLabels="3"
            @change="emitFilters"
          >
            <template #value="slotProps">
              <div class="inline-flex align-items-center" v-if="slotProps.value && slotProps.value.length > 0">
                <div v-for="(option, index) in slotProps.value" :key="index" 
                     class="mr-1 px-2 py-1 rounded-full text-xs font-medium" 
                     :class="getSeverityClass(option.value)">
                  {{ option.name }}
                </div>
                <div v-if="slotProps.value.length > 3" class="ml-1">
                  +{{ slotProps.value.length - 3 }} more
                </div>
              </div>
              <span v-else class="placeholder-text text-gray-500">Severity</span>
            </template>
            <template #option="slotProps">
              <div class="flex align-items-center">
                <div class="w-3 h-3 rounded-full mr-2" :class="getSeverityClass(slotProps.option.value)"></div>
                <div>{{ slotProps.option.name }}</div>
              </div>
            </template>
          </MultiSelect>
        </div>
      </div>

      <!-- Source filter -->
      <div class="w-[180px]">
        <div class="relative">
          <MultiSelect
            v-model="selectedSources"
            :options="sourceOptions"
            optionLabel="name"
            placeholder="Source"
            class="w-full search-filter-dropdown"
            @change="emitFilters"
          >
            <template #value="slotProps">
              <div class="inline-flex align-items-center" v-if="slotProps.value && slotProps.value.length > 0">
                <div v-for="(option, index) in slotProps.value" :key="index" 
                     class="mr-1 px-2 py-1 rounded-full text-xs font-medium"
                     :class="getSourceClass(option.value)">
                  {{ option.name }}
                </div>
              </div>
              <span v-else class="placeholder-text text-gray-500">Source</span>
            </template>
            <template #option="slotProps">
              <div class="flex align-items-center">
                <div class="w-3 h-3 rounded-full mr-2" :class="getSourceClass(slotProps.option.value)"></div>
                <div>{{ slotProps.option.name }}</div>
              </div>
            </template>
          </MultiSelect>
        </div>
      </div>

      <!-- Algorithm filter -->
      <div class="w-[180px]">
        <div class="relative">
          <MultiSelect
            v-model="selectedAlgorithms"
            :options="algorithmOptions"
            optionLabel="name"
            placeholder="Algorithm"
            class="w-full search-filter-dropdown"
            :maxSelectedLabels="2"
            filter
            @change="emitFilters"
          >
            <template #value="slotProps">
              <div class="inline-flex align-items-center" v-if="slotProps.value && slotProps.value.length > 0">
                <div v-for="(option, index) in slotProps.value" :key="index" 
                     class="mr-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white dark:bg-blue-600 dark:text-white">
                  {{ option.name }}
                </div>
                <div v-if="slotProps.value.length > 2" class="ml-1">
                  +{{ slotProps.value.length - 2 }} more
                </div>
              </div>
              <span v-else class="placeholder-text text-gray-500">Algorithm</span>
            </template>
            <template #option="slotProps">
              <div class="flex align-items-center">
                <div class="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                <div>{{ slotProps.option.name }}</div>
              </div>
            </template>
          </MultiSelect>
        </div>
      </div>

      <!-- Clear filters button -->
      <div class="flex items-center" v-if="hasActiveFilters">
        <Button 
          icon="pi pi-filter-slash" 
          label="Clear" 
          class="p-button-sm p-button-outlined"
          @click="clearFilters"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';

// Props & Emits
const emit = defineEmits(['filter-change']);

// State
const searchQuery = ref('');
const selectedSeverities = ref([]);
const selectedSources = ref([]);
const selectedAlgorithms = ref([]);

// Severity options
const severityOptions = [
  { name: 'Critical', value: 'critical' },
  { name: 'High', value: 'high' },
  { name: 'Medium', value: 'medium' },
  { name: 'Low', value: 'low' },
  { name: 'Info', value: 'info' }
];

// Source options
const sourceOptions = [
  { name: 'Request', value: 'request' },
  { name: 'Response', value: 'response' },
  { name: 'Manual', value: 'manual' }
];

// Algorithm options - common JWT algorithms
const algorithmOptions = [
  { name: 'HS256', value: 'HS256' },
  { name: 'RS256', value: 'RS256' },
  { name: 'ES256', value: 'ES256' },
  { name: 'HS384', value: 'HS384' },
  { name: 'RS384', value: 'RS384' },
  { name: 'ES384', value: 'ES384' },
  { name: 'HS512', value: 'HS512' },
  { name: 'RS512', value: 'RS512' },
  { name: 'ES512', value: 'ES512' },
  { name: 'PS256', value: 'PS256' },
  { name: 'PS384', value: 'PS384' },
  { name: 'PS512', value: 'PS512' },
  { name: 'none', value: 'none' }
];

// Helper classes for styling
function getSeverityClass(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500 text-white dark:bg-red-600 dark:text-white';
    case 'high':
      return 'bg-orange-500 text-white dark:bg-orange-600 dark:text-white';
    case 'medium':
      return 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white';
    case 'low':
      return 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white';
    case 'info':
      return 'bg-indigo-500 text-white dark:bg-indigo-600 dark:text-white';
    default:
      return 'bg-gray-500 text-white dark:bg-gray-600 dark:text-white';
  }
}

function getSourceClass(source: string): string {
  switch (source) {
    case 'request':
      return 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white';
    case 'response':
      return 'bg-green-500 text-white dark:bg-green-600 dark:text-white';
    case 'manual':
      return 'bg-amber-500 text-white dark:bg-amber-600 dark:text-white';
    default:
      return 'bg-gray-500 text-white dark:bg-gray-600 dark:text-white';
  }
}

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || 
         selectedSeverities.value.length > 0 || 
         selectedSources.value.length > 0 || 
         selectedAlgorithms.value.length > 0;
});

// Emit filter changes to parent
function emitFilters() {
  emit('filter-change', {
    search: searchQuery.value,
    severities: selectedSeverities.value.map(severity => severity.value),
    sources: selectedSources.value.map(source => source.value),
    algorithms: selectedAlgorithms.value.map(alg => alg.value)
  });
}

// Clear all filters
function clearFilters() {
  searchQuery.value = '';
  selectedSeverities.value = [];
  selectedSources.value = [];
  selectedAlgorithms.value = [];
  emitFilters();
}
</script>

<style scoped>
:deep(.p-multiselect-token) {
  margin-right: 0.25rem;
  padding: 0.1rem 0.4rem;
}

:deep(.p-multiselect) {
  width: 100%;
}

:deep(.p-multiselect-panel .p-multiselect-items) {
  padding: 0.5rem 0;
}

:deep(.p-multiselect-panel .p-multiselect-item) {
  padding: 0.5rem 1rem;
  margin: 0;
}

:deep(.p-multiselect-header) {
  padding: 0.5rem;
}

:deep(.p-multiselect-header .p-checkbox) {
  margin-right: 0.5rem;
}

/* New styles for matching height with search input */
:deep(.search-filter-dropdown .p-multiselect) {
  height: 42px;
}

:deep(.search-filter-dropdown) {
  height: 100%;
}

:deep(.p-multiselect .p-multiselect-label) {
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
}

:deep(.p-multiselect-trigger) {
  width: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Make placeholder text visible */
.placeholder-text {
  opacity: 0.7;
  font-weight: normal;
}
</style> 