<template>
  <div class="token-details-container h-full overflow-auto" @contextmenu.prevent="showContextMenu">
    <div v-if="finding" class="jwt-details h-full flex flex-col">
      <!-- Toolbar with actions -->
      <div class="flex items-center justify-end mb-3">
        <div class="flex items-center space-x-2">
          <Button label="Refresh" @click="refreshTokenDetails" size="small" class="p-button-outlined">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
              </svg>
            </template>
          </Button>
          <Button label="Rename" @click="showRenameModal = true" size="small" class="p-button-outlined">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </template>
          </Button>
          <Button label="Copy Token" @click="copyTokenToClipboard" size="small" class="p-button-outlined">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
              </svg>
            </template>
          </Button>
          <Button label="Send to JWT Editor" @click="sendToJWTEditor" size="small" class="p-button-outlined p-button-info">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
              </svg>
            </template>
          </Button>
          <Button label="Export" @click="exportMenu.toggle($event)" size="small" class="p-button-outlined p-button-success">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </template>
          </Button>
        </div>
      </div>

      <!-- Token Header -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-semibold">Token Summary</h2>
          <div class="flex items-center">
            <div class="mr-2">Severity:</div>
            <span 
              :class="[
                getSeverityClass(finding.metadata.severity || 'info'),
                'px-3 py-1 text-xs font-medium rounded-md inline-block min-w-[70px] text-center'
              ]"
            >
              {{ (finding.metadata.severity || 'info').charAt(0).toUpperCase() + (finding.metadata.severity || 'info').slice(1) }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card class="bg-gray-50 dark:bg-surface-700">
            <template #title>
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/>
                  </svg>
                </span>
                <span>Algorithm</span>
              </div>
            </template>
            <template #content>
              <div class="text-lg font-mono">{{ finding.metadata.header?.alg || 'None' }}</div>
              <div v-if="isWeakAlgorithm(finding.metadata.header?.alg)" class="text-xs text-orange-500 mt-1">
                <span class="inline-block align-middle mr-1">⚠️</span>
                <span>{{ getAlgorithmWarning(finding.metadata.header?.alg) }}</span>
              </div>
            </template>
          </Card>
          
          <Card class="bg-gray-50 dark:bg-surface-700">
            <template #title>
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                    <path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"/>
                  </svg>
                </span>
                <span>Issuer</span>
              </div>
            </template>
            <template #content>
              <div class="text-sm font-mono overflow-hidden text-ellipsis">
                {{ finding.metadata.payload?.iss || finding.metadata.issuer || 'Not specified' }}
              </div>
              <div v-if="!finding.metadata.payload?.iss && !finding.metadata.issuer" class="text-xs text-orange-500 mt-1">
                <span class="inline-block align-middle mr-1">⚠️</span>
                <span>Missing issuer claim</span>
              </div>
            </template>
          </Card>
          
          <Card class="bg-gray-50 dark:bg-surface-700">
            <template #title>
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/>
                  </svg>
                </span>
                <span>Expiration</span>
              </div>
            </template>
            <template #content>
              <div v-if="finding.metadata.payload?.exp" class="text-sm">
                {{ formatExpirationTime(finding.metadata.payload.exp) }}
              </div>
              <div v-else-if="finding.metadata.expiresAt && finding.metadata.expiresAt !== 'Not specified'" class="text-sm">
                {{ finding.metadata.expiresAt }}
              </div>
              <div v-else class="text-sm text-orange-500">No expiration set</div>
              
              <div class="text-xs mt-1" :class="getExpirationStatusClass(finding)">
                {{ finding.metadata.timeLeft || 'No expiration time' }}
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Security Analysis -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-lg font-semibold">Security Analysis</h2>
          <div class="flex items-center">
            <div class="mr-2">Severity:</div>
            <span 
              :class="[
                getSeverityClass(getOverallSeverity(finding)),
                'px-3 py-1 text-xs font-medium rounded-md inline-block min-w-[70px] text-center'
              ]"
            >
              {{ getOverallSeverity(finding).charAt(0).toUpperCase() + getOverallSeverity(finding).slice(1) }}
            </span>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Security Overview Card -->
          <Card class="bg-gray-50 dark:bg-surface-700">
            <template #title>
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8V444.8C394 378 431.1 230.1 432 141.4L256 66.8l0 0z"/>
                  </svg>
                </span>
                <span>Security Overview</span>
              </div>
            </template>
            <template #content>
              <div class="mb-3 p-3 rounded" :class="{
                'bg-red-200 dark:bg-red-700/40': getOverallSeverity(finding) === 'critical',
                'bg-orange-200 dark:bg-orange-700/40': getOverallSeverity(finding) === 'high',
                'bg-yellow-200 dark:bg-yellow-700/40': getOverallSeverity(finding) === 'medium',
                'bg-blue-200 dark:bg-blue-700/40': getOverallSeverity(finding) === 'low',
                'bg-indigo-200 dark:bg-indigo-700/40': getOverallSeverity(finding) === 'info'
              }">
                <div class="font-semibold mb-1">Overall Assessment</div>
                <div>{{ getSecuritySummary(finding) }}</div>
              </div>

              <!-- Token Validity -->
              <div class="border-b dark:border-gray-700 mb-3 pb-3">
                <div class="font-semibold mb-1">Token Validity</div>
                <div class="flex items-center justify-between">
                  <span>Expiration Status:</span>
                  <span :class="getExpirationStatusClass(finding)">
                    {{ finding.metadata.payload?.exp ? (finding.metadata.expStatus === 'valid' ? 'Valid' : 'Expired') : 'Not Set' }}
                  </span>
                </div>
                <div class="flex items-center justify-between mt-1">
                  <span>Time Remaining:</span>
                  <span>{{ finding.metadata.payload?.exp ? finding.metadata.timeLeft : 'No expiration time' }}</span>
                </div>
              </div>

              <!-- Risk Summary -->
              <div class="border-b dark:border-gray-700 mb-3 pb-3">
                <div class="font-semibold mb-1">Risk Summary</div>
                <div class="grid grid-cols-2 gap-2 mt-2">
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div>Critical: {{ countRisksBySeverity(finding, 'critical') }}</div>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                    <div>High: {{ countRisksBySeverity(finding, 'high') }}</div>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div>Medium: {{ countRisksBySeverity(finding, 'medium') }}</div>
                  </div>
                  <div class="flex items-center">
                    <div class="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                    <div>Low: {{ countRisksBySeverity(finding, 'low') }}</div>
                  </div>
                </div>
              </div>

              <!-- Critical Vulnerabilities -->
              <div class="border-b dark:border-gray-700 mb-3 pb-3">
                <div class="font-semibold mb-1">Critical Vulnerabilities</div>
                <div v-if="finding.metadata.risks && finding.metadata.risks.filter(r => r.severity === 'critical').length > 0">
                  <div v-for="(risk, idx) in finding.metadata.risks.filter(r => r.severity === 'critical')" :key="idx"
                    class="mt-1 text-red-600 dark:text-red-400">
                    {{ risk.description }}
                  </div>
                </div>
                <div v-else class="text-success-500 dark:text-success-400">
                  No critical vulnerabilities detected
                </div>
              </div>

              <!-- Security Considerations -->
              <div>
                <div class="font-semibold mb-1">Security Considerations</div>
                <div v-if="finding.metadata.header?.alg === 'none'" class="text-red-600 dark:text-red-400 mt-1">
                  <div class="flex items-start">
                    <span class="font-bold mr-1">•</span>
                    <span>Using 'none' algorithm is extremely dangerous and bypasses signature verification</span>
                  </div>
                </div>
                <div v-if="['HS256', 'HS384', 'HS512'].includes(finding.metadata.header?.alg || '')" class="text-orange-600 dark:text-orange-400 mt-1">
                  <div class="flex items-start">
                    <span class="font-bold mr-1">•</span>
                    <span>Symmetric algorithm requires careful key management</span>
                  </div>
                </div>
                <div v-if="finding.metadata.header?.jwk || finding.metadata.header?.jku" class="text-red-600 dark:text-red-400 mt-1">
                  <div class="flex items-start">
                    <span class="font-bold mr-1">•</span>
                    <span>JWK/JKU parameters present - possible signature bypass risk</span>
                  </div>
                </div>
                <div v-if="!finding.metadata.payload?.exp" class="text-orange-600 dark:text-orange-400 mt-1">
                  <div class="flex items-start">
                    <span class="font-bold mr-1">•</span>
                    <span>No expiration time - token remains valid indefinitely</span>
                  </div>
                </div>
                <div v-else-if="isLongExpiration(finding.metadata.payload?.exp)" class="text-yellow-600 dark:text-yellow-400 mt-1">
                  <div class="flex items-start">
                    <span class="font-bold mr-1">•</span>
                    <span>Long expiration time increases risk if compromised</span>
                  </div>
                </div>
                <div v-if="finding.metadata.header?.alg === 'RS256'" class="text-yellow-600 dark:text-yellow-400 mt-1">
                  <div class="flex items-start">
                    <span class="font-bold mr-1">•</span>
                    <span>Check for algorithm confusion vulnerabilities (RS256 to HS256)</span>
                  </div>
                </div>
                <div v-if="Object.keys(finding.metadata.payload || {}).some(k => 
                    k.toLowerCase().includes('admin') || 
                    k.toLowerCase().includes('role') || 
                    k.toLowerCase().includes('priv'))" class="text-orange-600 dark:text-orange-400 mt-1">
                  <div class="flex items-start">
                    <span class="font-bold mr-1">•</span>
                    <span>Token contains privileged access claims</span>
                  </div>
                </div>
              </div>
            </template>
          </Card>

          <!-- Algorithm & Expiration Card -->
          <Card class="bg-gray-50 dark:bg-surface-700">
            <template #title>
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512">
                    <path d="M308.5 135.3c7.1-6.3 9.9-16.2 6.2-25c-2.3-5.3-4.8-10.5-7.6-15.5L304 89.4c-3-5-6.3-9.9-9.8-14.6c-5.7-7.6-15.7-10.1-24.7-7.1l-28.2 9.3c-10.7-8.8-23-16-36.2-20.9L199 27.1c-1.9-9.3-9.1-16.7-18.5-17.8C173.7 8.4 166.9 8 160 8s-13.7 .4-20.4 1.2c-9.4 1.1-16.6 8.6-18.5 17.8L115 56.1c-13.3 5-25.5 12.1-36.2 20.9L50.5 67.8c-9-3-19-.5-24.7 7.1c-3.5 4.7-6.8 9.6-9.9 14.6l-3 5.3c-2.8 5-5.3 10.2-7.6 15.6c-3.7 8.7-.9 18.6 6.2 25l22.2 19.8C32.6 161.9 32 168.9 32 176s.6 14.1 1.7 20.9L11.5 216.7c-7.1 6.3-9.9 16.2-6.2 25c2.3 5.3 4.8 10.5 7.6 15.6l3 5.2c3 5.1 6.3 9.9 9.9 14.6c5.7 7.6 15.7 10.1 24.7 7.1l28.2-9.3c10.7 8.8 23 16 36.2 20.9l6.1 29.1c1.9 9.3 9.1 16.7 18.5 17.8c6.7 .8 13.5 1.2 20.4 1.2s13.7-.4 20.4-1.2c9.4-1.1 16.6-8.6 18.5-17.8l6.1-29.1c13.3-5 25.5-12.1 36.2-20.9l28.2 9.3c9 3 19 .5 24.7-7.1c3.5-4.7 6.8-9.5 9.8-14.6l3.1-5.4c2.8-5 5.3-10.2 7.6-15.5c3.7-8.7 .9-18.6-6.2-25l-22.2-19.8c1.1-6.8 1.7-13.8 1.7-20.9s-.6-14.1-1.7-20.9l22.2-19.8zM208 176a48 48 0 1 1 -96 0 48 48 0 1 1 96 0z"/>
                  </svg>
                </span>
                <span>Technical Details</span>
              </div>
            </template>
            <template #content>
              <!-- Algorithm Security -->
              <div class="border-b dark:border-gray-700 mb-3 pb-3">
                <div class="font-semibold mb-1">Algorithm</div>
                <div class="flex items-center justify-between">
                  <span class="font-mono">{{ finding.metadata.header?.alg || 'None' }}</span>
                  <span 
                    :class="[
                      isWeakAlgorithm(finding.metadata.header?.alg) ? 
                        'bg-yellow-200 text-yellow-900 dark:bg-yellow-700 dark:text-yellow-100' : 
                        'bg-green-200 text-green-900 dark:bg-green-700 dark:text-green-100',
                      'px-3 py-1 text-xs font-medium rounded-md inline-block min-w-[70px] text-center'
                    ]"
                  >
                    {{ isWeakAlgorithm(finding.metadata.header?.alg) ? 'Weak' : 'Strong' }}
                  </span>
                </div>
                <div v-if="isWeakAlgorithm(finding.metadata.header?.alg)" class="mt-2 text-sm text-orange-600 dark:text-orange-400">
                  {{ getAlgorithmWarning(finding.metadata.header?.alg) }}
                </div>
              </div>

              <!-- Expiration Details -->
              <div class="border-b dark:border-gray-700 mb-3 pb-3">
                <div class="font-semibold mb-1">Expiration</div>
                <div class="flex items-center justify-between">
                  <span>Expires At:</span>
                  <span v-if="finding.metadata.payload?.exp" class="font-mono">
                    {{ formatExpirationTime(finding.metadata.payload.exp) }}
                  </span>
                  <span v-else class="text-orange-600 dark:text-orange-400">Not Set</span>
                </div>
                <div v-if="!finding.metadata.payload?.exp" class="mt-2 text-sm text-orange-600 dark:text-orange-400">
                  Missing expiration increases the window of opportunity for attackers.
                </div>
              </div>

              <!-- Issuance Details -->
              <div>
                <div class="font-semibold mb-1">Issuance</div>
                <div class="flex items-center justify-between">
                  <span>Issued At:</span>
                  <span v-if="finding.metadata.payload?.iat" class="font-mono">
                    {{ formatIssuedAt(finding.metadata.payload.iat) }}
                  </span>
                  <span v-else class="text-orange-600 dark:text-orange-400">Not Set</span>
                </div>
                <div v-if="finding.metadata.payload?.iat" class="flex items-center justify-between mt-1">
                  <span>Token Age:</span>
                  <span>{{ getTokenAge(finding.metadata.payload.iat) }}</span>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- Vulnerabilities Card -->
        <div class="text-lg font-semibold mb-2">Vulnerabilities & Recommendations</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Identified Risks Card -->
          <Card class="bg-gray-50 dark:bg-surface-700">
            <template #title>
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/>
                  </svg>
                </span>
                <span>Identified Risks</span>
              </div>
            </template>
            <template #content>
              <div v-if="finding.metadata.risks && finding.metadata.risks.length > 0" class="findings-panel">
                <div class="space-y-3">
                  <div v-for="(risk, index) in finding.metadata.risks" :key="index" 
                       class="border border-gray-200 dark:border-gray-700 rounded p-3">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center">
                        <span
                            :class="['inline-block w-2 h-2 rounded-full mr-2', risk.severity === 'critical' ? 'bg-red-500' : risk.severity === 'high' ? 'bg-orange-500' : risk.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500']">
                        </span>
                        <span class="font-semibold">{{ risk.description }}</span>
                      </div>
                      <div>
                        <span :class="['px-2 py-1 rounded-md text-xs', getSeverityClass(risk.severity)]">{{ risk.severity }}</span>
                      </div>
                    </div>
                    <div v-if="risk.impact" class="text-sm ml-4 text-gray-600 dark:text-gray-400">
                      <span class="font-semibold">Impact:</span> {{ risk.impact }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <div class="text-gray-500">No vulnerabilities found</div>
              </div>
            </template>
          </Card>
          
          <!-- Attack Vectors Card -->
          <Card class="bg-gray-50 dark:bg-surface-700">
            <template #title>
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512">
                    <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zM223.1 149.5C248.6 126.2 282.7 112 320 112c79.5 0 144 64.5 144 144c0 24.9-6.3 48.3-17.4 68.7L408 294.5c5.2-11.8 8-24.8 8-38.5c0-53-43-96-96-96c-2.8 0-5.6 .1-8.4 .4c5.3 9.3 8.4 20.1 8.4 31.6c0 10.2-2.4 19.8-6.6 28.3l-90.3-70.8zm223.1 298L83.1 161.5c-11 14.4-20.5 28.7-28.4 42.2l339 265.7c18.7-5.5 36.2-13 52.6-21.8zM34.5 268.3c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c3.1 0 6.1-.1 9.2-.2L33.1 247.8c-1.8 6.8-1.3 14 1.4 20.5z"/>
                  </svg>
                </span>
                <span>Potential Attack Vectors</span>
              </div>
            </template>
            <template #content>
              <div class="space-y-2 mb-4">
                <ul class="space-y-2 list-none">
                  <li v-if="finding.metadata.header?.alg === 'none'" class="border-l-2 border-red-500 pl-2">
                    <strong class="text-gray-700 dark:text-gray-300 font-semibold">Algorithm Bypass:</strong> 
                    <span>Modify the algorithm to "none" and remove the signature to bypass validation completely. Many JWT libraries have special handling for the 'none' algorithm.</span>
                  </li>
                  <li v-if="['HS256', 'HS384', 'HS512'].includes(finding.metadata.header?.alg || '')" class="border-l-2 border-orange-500 pl-2">
                    <strong class="text-gray-700 dark:text-gray-300 font-semibold">Key Brute-Force:</strong> 
                    <span>Symmetric keys may be susceptible to brute-force or dictionary attacks using tools like hashcat (mode 16500) with common JWT secret wordlists.</span>
                  </li>
                  <li v-if="finding.metadata.header?.alg === 'RS256'" class="border-l-2 border-orange-500 pl-2">
                    <strong class="text-gray-700 dark:text-gray-300 font-semibold">Algorithm Confusion (CVE-2016-5431):</strong> 
                    <span>Vulnerable libraries may accept algorithm changes from RS256 to HS256, allowing attackers to sign tokens using the public key as an HMAC secret.</span>
                  </li>
                  <li v-if="finding.metadata.header?.kid" class="border-l-2 border-orange-500 pl-2">
                    <strong class="text-gray-700 dark:text-gray-300 font-semibold">Key ID Injection:</strong> 
                    <span>The 'kid' parameter could be vulnerable to path traversal (e.g., '../../../dev/null') or SQL injection attacks if improperly validated.</span>
                  </li>
                  <li v-if="!finding.metadata.payload?.exp" class="border-l-2 border-orange-500 pl-2">
                    <strong class="text-gray-700 dark:text-gray-300 font-semibold">Immortal Token:</strong> 
                    <span>Tokens without expiration remain valid indefinitely after compromise, even after password changes or user account deletion.</span>
                  </li>
                </ul>
              </div>
                
              <h4 class="text-md font-semibold mt-6 mb-2">Security Recommendations</h4>
              <div v-if="finding.metadata.suggestions && finding.metadata.suggestions.length > 0" class="space-y-1 mb-4">
                <div v-for="(suggestion, index) in finding.metadata.suggestions.slice(0, 5)" :key="index" class="flex items-start">
                  <span class="text-green-600 dark:text-green-400 mr-2">•</span>
                  <span>{{ suggestion }}</span>
                </div>
              </div>
              <div v-else class="text-gray-500 dark:text-gray-400 italic mb-4">
                No suggestions available
              </div>

              <h4 class="text-md font-semibold mt-6 mb-2">CVE Mitigations</h4>
              <div class="space-y-2">
                <div v-if="finding.metadata.header?.alg === 'none'" class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-2 rounded-r text-sm">
                  <strong class="block text-gray-700 dark:text-gray-300">CVE-2015-9235 (None Algorithm)</strong>
                  <span>Update your JWT library to reject tokens with 'none' algorithm.</span>
                </div>
                <div v-if="finding.metadata.header?.alg === 'RS256'" class="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-2 rounded-r text-sm">
                  <strong class="block text-gray-700 dark:text-gray-300">CVE-2016-5431 (Algorithm Confusion)</strong>
                  <span>Always verify tokens with the expected algorithm.</span>
                </div>
                <div v-if="typeof finding.metadata.payload?.exp === 'string'" class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-2 rounded-r text-sm">
                  <strong class="block text-gray-700 dark:text-gray-300">CVE-2022-21449 (Type Confusion)</strong>
                  <span>Ensure all numeric claims use proper number types.</span>
                </div>
              </div>
            </template>
          </Card>
        </div>
      </div>

      <!-- Token Parts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card class="bg-gray-50 dark:bg-surface-700">
          <template #title>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512">
                    <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/>
                  </svg>
                </span>
                <span>Header</span>
              </div>
              <Button icon="pi pi-copy" text rounded aria-label="Copy Header" 
                @click="copyToClipboard(JSON.stringify(finding.metadata.header, null, 2))" />
            </div>
          </template>
          <template #content>
            <div class="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-auto max-h-64">
              <pre>{{ JSON.stringify(finding.metadata.header, null, 2) }}</pre>
            </div>
          </template>
        </Card>

        <Card class="bg-gray-50 dark:bg-surface-700">
          <template #title>
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center">
                <span class="tab-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512">
                    <path d="M0 80V229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7H48C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
                  </svg>
                </span>
                <span>Payload</span>
              </div>
              <Button icon="pi pi-copy" text rounded aria-label="Copy Payload" 
                @click="copyToClipboard(JSON.stringify(finding.metadata.payload, null, 2))" />
            </div>
          </template>
          <template #content>
            <div class="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-auto max-h-64">
              <pre>{{ JSON.stringify(finding.metadata.payload, null, 2) }}</pre>
            </div>
          </template>
        </Card>
      </div>

      <!-- Full Token -->
      <Card class="flex-grow bg-gray-50 dark:bg-surface-700">
        <template #title>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="tab-icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                  <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/>
                </svg>
              </span>
              <span>Raw Token</span>
            </div>
            <Button icon="pi pi-copy" text rounded aria-label="Copy Token" 
              @click="copyToClipboard(finding.metadata.token)" />
          </div>
        </template>
        <template #content>
          <div class="bg-gray-800 text-white p-3 rounded font-mono text-sm overflow-auto max-h-32 jwt-token-display">
            <div class="token-part token-header">{{ finding.metadata.token.split('.')[0] }}</div>
            <div class="token-part token-payload">{{ finding.metadata.token.split('.')[1] }}</div>
            <div class="token-part token-signature">{{ finding.metadata.token.split('.')[2] }}</div>
          </div>
        </template>
      </Card>
    </div>
    
    <!-- Empty state when no finding is present -->
    <div v-else class="flex items-center justify-center h-full flex-grow">
      <div class="text-center p-8 bg-gray-50 dark:bg-surface-700 rounded-lg shadow-sm max-w-lg mx-auto">
        <div class="flex justify-center items-center mb-6">
          <div class="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" class="w-14 h-14 text-gray-400">
              <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/>
            </svg>
          </div>
        </div>
        <h3 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Select a JWT Token</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6 text-lg">Use the Dashboard to view intercepted tokens or try the JWT Decoder to analyze a token manually</p>
        <div class="flex flex-col md:flex-row justify-center gap-4">
          <Button label="Go to Dashboard" class="p-button-outlined" @click="navigateToDashboard">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            </template>
          </Button>
          <Button label="Open JWT Decoder" class="p-button-outlined" @click="navigateToDecoder">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </template>
          </Button>
        </div>
      </div>
    </div>

    <!-- Context Menu for right-click -->
    <Menu id="context-menu" ref="menu" :model="contextMenuItems" :popup="true" />
    
    <!-- Export Menu -->
    <Menu id="export-menu" ref="exportMenu" :model="exportMenuItems" :popup="true" />
    
    <!-- Rename Dialog -->
    <Dialog v-model:visible="showRenameModal" header="Rename Token" :style="{ width: '30vw' }" :modal="true" class="jwt-dialog">
      <div class="p-fluid">
        <div class="field">
          <label for="tab-name" class="block font-medium mb-2">Token Name</label>
          <InputText id="tab-name" v-model="newTokenName" class="w-full" placeholder="Enter a name for this token" />
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" @click="showRenameModal = false" class="p-button-outlined">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </template>
          </Button>
          <Button label="Save" @click="renameToken" severity="success" class="p-button-raised">
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </template>
          </Button>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { computed } from 'vue';
import { onMounted } from 'vue';
import { watch } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import type { Finding } from '../types';
import { useSDK } from '../plugins/sdk';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Menu from 'primevue/menu';
import { analyzeJWTSecurity, decodeJWT } from '../utils/jwt';

const sdk = useSDK();

// Props
const props = defineProps<{
  finding: Finding | null
}>();

// Watch for changes to the finding prop to auto-refresh token details
watch(() => props.finding?.metadata?.token, (newToken: string | undefined, oldToken: string | undefined) => {
  if (newToken && newToken !== oldToken) {
    // Only refresh if this is a new token - don't show refresh notification when auto-refreshing
    refreshTokenDetails(false);
    
    // Show a token loaded notification
    showTokenLoadedNotification();
  }
}, { immediate: true });

// Emit events to parent
const emit = defineEmits<{
  (e: 'rename', newName: string): void;
}>();

// Context menu and rename dialog state
const menu = ref();
const showRenameModal = ref(false);
const newTokenName = ref('');

// Export menu state
const exportMenu = ref();
const exportMenuItems = ref([
  {
    label: 'Export as Markdown',
    icon: 'pi pi-file',
    command: () => exportAsMarkdown(),
    template: (item) => {
      return (
        `<div class="p-menuitem-content" @click="${item.command}">
          <div class="flex items-center px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
              <path d="M7 11.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z" />
            </svg>
            <span>Export as Markdown</span>
          </div>
        </div>`
      );
    }
  },
  {
    label: 'Export as JSON',
    icon: 'pi pi-code',
    command: () => exportAsJSON(),
    template: (item) => {
      return (
        `<div class="p-menuitem-content" @click="${item.command}">
          <div class="flex items-center px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <span>Export as JSON</span>
          </div>
        </div>`
      );
    }
  }
]);

// Context menu items
const contextMenuItems = ref([
  {
    label: 'Rename Tab',
    icon: 'pi pi-pencil',
    command: () => openRenameDialog(),
    template: (item) => {
      return (
        `<div class="p-menuitem-content" @click="${item.command}">
          <div class="flex items-center px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            <span>${item.label}</span>
          </div>
        </div>`
      );
    }
  },
  {
    label: 'Copy Token',
    icon: 'pi pi-copy',
    command: () => copyTokenToClipboard(),
    template: (item) => {
      return (
        `<div class="p-menuitem-content" @click="${item.command}">
          <div class="flex items-center px-3 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
            </svg>
            <span>${item.label}</span>
          </div>
        </div>`
      );
    }
  }
]);

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

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => {
      if ((window as any).caidoSDK?.window?.showToast) {
        (window as any).caidoSDK.window.showToast('Text copied to clipboard', { 
          variant: 'success',
          duration: 3000 
        });
      }
    })
    .catch(err => {
      console.error('Failed to copy text:', err);
      if ((window as any).caidoSDK?.window?.showToast) {
        (window as any).caidoSDK.window.showToast('Failed to copy text', { 
          variant: 'error',
          duration: 3000 
        });
      }
    });
}

function getExpirationStatusClass(finding: Finding): string {
  if (!finding.metadata.expStatus) return 'text-gray-500';
  return finding.metadata.expStatus === 'valid' ? 'text-success-500' : 'text-orange-500';
}

function formatExpirationTime(timestamp: number): string {
  try {
    return new Date(timestamp * 1000).toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
}

function formatIssuedAt(timestamp: number): string {
  try {
    return new Date(timestamp * 1000).toLocaleString();
  } catch (error) {
    return 'Invalid date';
  }
}

function getTokenAge(timestamp: number): string {
  try {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    
    if (diff < 60) return `Issued ${diff} seconds ago`;
    if (diff < 3600) return `Issued ${Math.floor(diff/60)} minutes ago`;
    if (diff < 86400) return `Issued ${Math.floor(diff/3600)} hours ago`;
    return `Issued ${Math.floor(diff/86400)} days ago`;
  } catch (error) {
    return '';
  }
}

function formatAudience(aud: string | string[] | undefined): string {
  if (!aud) return '';
  return Array.isArray(aud) ? aud.join(', ') : aud;
}

function isWeakAlgorithm(alg: string | undefined): boolean {
  if (!alg) return false;
  return alg === 'none' || alg === 'HS256' || alg === 'HS384' || alg === 'HS512';
}

function getAlgorithmWarning(alg: string | undefined): string {
  if (!alg) return '';
  
  if (alg === 'none') {
    return 'Critical: "none" algorithm bypasses signature verification';
  }
  
  if (['HS256', 'HS384', 'HS512'].includes(alg)) {
    return 'Warning: Symmetric algorithm requires careful key management';
  }
  
  return '';
}

function getOverallSeverity(finding: Finding): string {
  if (!finding.metadata.risks || finding.metadata.risks.length === 0) return 'info';
  return finding.metadata.risks[0].severity;
}

function getSecuritySummary(finding: Finding): string {
  if (!finding?.metadata?.risks) return 'No security analysis available';
  
  const criticalCount = countRisksBySeverity(finding, 'critical');
  const highCount = countRisksBySeverity(finding, 'high');
  
  if (criticalCount > 0) {
    return `Critical vulnerabilities detected. This token has ${criticalCount} critical and ${highCount} high severity issues that require immediate attention.`;
  } else if (highCount > 0) {
    return `High severity issues found. This token has ${highCount} security concerns that should be addressed.`;
  } else if (countRisksBySeverity(finding, 'medium') > 0) {
    return 'Medium severity issues detected. This token has security concerns that should be reviewed.';
  } else if (countRisksBySeverity(finding, 'low') > 0) {
    return 'Minor security issues found. This token has some low-severity concerns.';
  } else {
    return 'No significant security issues detected. The token appears to follow security best practices.';
  }
}

function isLongExpiration(exp?: number): boolean {
  if (!exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return exp > now && (exp - now) > 86400 * 30; // More than 30 days
}

// Show context menu on right-click
function showContextMenu(event: MouseEvent) {
  menu.value.show(event);
}

// Open rename dialog
function openRenameDialog() {
  newTokenName.value = props.finding?.customName || ''; // Use current custom name if exists
  showRenameModal.value = true;
}

// Save new tab name
function renameToken() {
  if (newTokenName.value.trim()) {
    emit('rename', newTokenName.value.trim());
    showRenameModal.value = false;
    
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast('Token renamed successfully', {
        variant: 'success',
        duration: 3000
      });
    }
  }
}

// Function to copy token to clipboard
function copyTokenToClipboard() {
  if (props.finding?.metadata?.token) {
    navigator.clipboard.writeText(props.finding.metadata.token)
      .then(() => {
        if ((window as any).caidoSDK?.window?.showToast) {
          (window as any).caidoSDK.window.showToast('Token copied to clipboard', {
            variant: 'success',
            duration: 3000
          });
        }
      })
      .catch(err => {
        console.error('Failed to copy token:', err);
        if ((window as any).caidoSDK?.window?.showToast) {
          (window as any).caidoSDK.window.showToast('Failed to copy token', {
            variant: 'error',
            duration: 3000
          });
        }
      });
  }
}

function navigateToDashboard() {
  // Navigate to dashboard (tab index 0)
  if ((window as any).caidoSDK?.navigation) {
    (window as any).caidoSDK.navigation.goTo("/dashboard");
  } else {
    // Fallback to changing parent tab index
    const event = new CustomEvent('navigate-tab', { detail: { tabIndex: 0 } });
    window.dispatchEvent(event);
  }
}

function navigateToDecoder() {
  // Navigate to JWT Decoder (tab index 1)
  if ((window as any).caidoSDK?.navigation) {
    (window as any).caidoSDK.navigation.goTo("/jwt-decoder");
  } else {
    // Fallback to changing parent tab index
    const event = new CustomEvent('navigate-tab', { detail: { tabIndex: 1 } });
    window.dispatchEvent(event);
  }
}

// Function to send token to JWT Editor
function sendToJWTEditor() {
  if (props.finding?.metadata?.token) {
    // Create a custom event to add the token to the JWT Editor
    const event = new CustomEvent('add-token-to-editor', { 
      detail: { token: props.finding.metadata.token } 
    });
    window.dispatchEvent(event);
    
    // Switch to JWT Editor tab using the parent tab navigation
    const tabEvent = new CustomEvent('navigate-to-editor', {});
    window.dispatchEvent(tabEvent);
    
    // Show toast notification
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast('Token sent to JWT Editor', {
        variant: 'success',
        duration: 3000
      });
    }
  }
}

// Function to refresh token details
function refreshTokenDetails(showNotification: boolean = true): void {
  if (props.finding?.metadata?.token) {
    try {
      // Re-decode the token to get fresh information
      const decoded = decodeJWT(props.finding.metadata.token);
      
      if (decoded) {
        // Update expiration status and other time-based fields
        const now = Math.floor(Date.now() / 1000);
        
        // Update expiration status
        if (decoded.payload.exp) {
          const timeLeft = decoded.payload.exp - now;
          
          if (timeLeft > 0) {
            if (props.finding.metadata) {
              props.finding.metadata.expStatus = 'valid';
              
              // Format the time left
              const days = Math.floor(timeLeft / 86400);
              const hours = Math.floor((timeLeft % 86400) / 3600);
              const minutes = Math.floor((timeLeft % 3600) / 60);
              
              if (days > 0) {
                props.finding.metadata.timeLeft = `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
              } else if (hours > 0) {
                props.finding.metadata.timeLeft = `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
              } else {
                props.finding.metadata.timeLeft = `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
              }
            }
          } else if (props.finding.metadata) {
            props.finding.metadata.expStatus = 'expired';
            props.finding.metadata.timeLeft = 'Expired';
          }
        }
        
        // Store all the original severity values we need to preserve
        const originalSeverity = props.finding.severity;
        const originalMetadataSeverity = props.finding.metadata?.severity;
        
        // Store the first risk's original severity if it exists (used for Security Analysis section)
        let originalFirstRiskSeverity = null;
        if (props.finding.metadata?.risks && props.finding.metadata.risks.length > 0) {
          originalFirstRiskSeverity = props.finding.metadata.risks[0].severity;
        }
        
        const analysis = analyzeJWTSecurity(decoded.header, decoded.payload);
        if (analysis && analysis.risks && props.finding.metadata) {
          // Keep the original first risk severity if it exists
          if (originalFirstRiskSeverity && analysis.risks.length > 0) {
            analysis.risks[0].severity = originalFirstRiskSeverity;
          }
          
          // Update the risks but preserve the severities
          props.finding.metadata.risks = analysis.risks;
          
          // Keep original severity values rather than using analysis.severity
          // This ensures refresh doesn't change the severity
          if (originalMetadataSeverity) {
            props.finding.metadata.severity = originalMetadataSeverity;
          }
          
          if (originalSeverity) {
            props.finding.severity = originalSeverity;
          }
        }
      }
      
      // Only show success notification if requested
      if (showNotification && (window as any).caidoSDK?.window?.showToast) {
        (window as any).caidoSDK.window.showToast('Token details refreshed', {
          variant: 'success',
          duration: 3000
        });
      }
    } catch (error) {
      console.error('Error refreshing token details:', error);
      if ((window as any).caidoSDK?.window?.showToast) {
        (window as any).caidoSDK.window.showToast('Error refreshing token details', {
          variant: 'error',
          duration: 3000
        });
      }
    }
  } else {
    if (showNotification && (window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast('No token to refresh', {
        variant: 'error',
        duration: 3000
      });
    }
  }
}

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

// Function to count risks by severity
function countRisksBySeverity(finding: Finding, severity: string): number {
  if (!finding?.metadata?.risks) return 0;
  return finding.metadata.risks.filter((risk: any) => risk.severity === severity).length;
}

// Function to show notification when token is loaded
function showTokenLoadedNotification() {
  if ((window as any).caidoSDK?.window?.showToast) {
    (window as any).caidoSDK.window.showToast('Token loaded and vulnerabilities analyzed', {
      variant: 'success',
      duration: 3000
    });
  }
}

// Export functions
function exportAsMarkdown() {
  if (!props.finding) {
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast('No token details to export', {
        variant: 'error',
        duration: 3000
      });
    }
    return;
  }

  try {
    const fileName = `jwt-analysis-${new Date().getTime()}.md`;
    const header = props.finding.metadata.header;
    const payload = props.finding.metadata.payload;
    const risks = props.finding.metadata.risks || [];

    let markdown = `# JWT Token Analysis\n\n`;
    markdown += `**Analysis Date:** ${new Date().toLocaleString()}\n\n`;
    
    // Token Summary
    markdown += `## Token Summary\n\n`;
    markdown += `- **Algorithm:** ${header?.alg || 'None'}\n`;
    markdown += `- **Issuer:** ${payload?.iss || 'Not specified'}\n`;
    
    if (payload?.exp) {
      markdown += `- **Expiration:** ${formatExpirationTime(payload.exp)}\n`;
      markdown += `- **Time Remaining:** ${props.finding.metadata.timeLeft || 'Unknown'}\n`;
    } else {
      markdown += `- **Expiration:** Not set\n`;
    }
    
    markdown += `- **Overall Security Severity:** ${getOverallSeverity(props.finding)}\n\n`;
    
    // Security Risks
    markdown += `## Security Risks\n\n`;
    
    if (risks.length > 0) {
      risks.forEach(risk => {
        markdown += `### ${risk.severity.toUpperCase()}: ${risk.description}\n`;
        if (risk.impact) {
          markdown += `**Impact:** ${risk.impact}\n\n`;
        }
      });
    } else {
      markdown += `No security risks detected.\n\n`;
    }
    
    // Token Parts
    markdown += `## Token Details\n\n`;
    markdown += `### Header\n\n\`\`\`json\n${JSON.stringify(header, null, 2)}\n\`\`\`\n\n`;
    markdown += `### Payload\n\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\`\n\n`;
    
    // Raw Token
    markdown += `### Raw Token\n\n\`\`\`\n${props.finding.metadata.token}\n\`\`\`\n`;
    
    // Security Recommendations
    if (props.finding.metadata.suggestions && props.finding.metadata.suggestions.length > 0) {
      markdown += `\n## Security Recommendations\n\n`;
      props.finding.metadata.suggestions.forEach(suggestion => {
        markdown += `- ${suggestion}\n`;
      });
    }
    
    // Download the markdown file
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast('Markdown export successful!', {
        variant: 'success',
        duration: 3000
      });
    }
  } catch (error) {
    console.error('Error exporting markdown:', error);
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast('Failed to export Markdown', {
        variant: 'error',
        duration: 3000
      });
    }
  }
}

function exportAsJSON() {
  if (!props.finding) {
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast('No token details to export', {
        variant: 'error',
        duration: 3000
      });
    }
    return;
  }

  try {
    const fileName = `jwt-analysis-${new Date().getTime()}.json`;
    
    // Create export data structure
    const exportData = {
      analysisDate: new Date().toISOString(),
      token: props.finding.metadata.token,
      tokenSummary: {
        algorithm: props.finding.metadata.header?.alg || 'None',
        issuer: props.finding.metadata.payload?.iss || 'Not specified',
        expiration: props.finding.metadata.payload?.exp 
          ? formatExpirationTime(props.finding.metadata.payload.exp) 
          : 'Not set',
        timeRemaining: props.finding.metadata.timeLeft || 'Unknown',
        overallSeverity: getOverallSeverity(props.finding)
      },
      header: props.finding.metadata.header,
      payload: props.finding.metadata.payload,
      securityRisks: props.finding.metadata.risks || [],
      securityRecommendations: props.finding.metadata.suggestions || []
    };
    
    // Download the JSON file
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast('JSON export successful!', {
        variant: 'success',
        duration: 3000
      });
    }
  } catch (error) {
    console.error('Error exporting JSON:', error);
    if ((window as any).caidoSDK?.window?.showToast) {
      (window as any).caidoSDK.window.showToast('Failed to export JSON', {
        variant: 'error',
        duration: 3000
      });
    }
  }
}
</script>

<style scoped>
.token-details-container {
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow-y: auto !important;
}

.jwt-details {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow-y: auto !important;
}

:deep(.p-card) {
  height: 100%;
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

.jwt-token-display {
  word-break: break-all;
  white-space: pre-wrap;
  overflow: auto !important;
}

.token-part {
  margin-bottom: 0.5rem;
}

.token-header {
  color: #61affe;
}

.token-payload {
  color: #fca130;
}

.token-signature {
  color: #49cc90;
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

:deep(.p-tag.p-tag-warning) {
  background-color: #fbbf24 !important;
  color: #78350f !important;
  border-radius: 0.25rem !important;
  padding: 0.25rem 0.5rem !important;
  font-weight: 500 !important;
  display: inline-flex !important;
  align-items: center !important;
  opacity: 1 !important;
}

:deep(.p-tag.p-tag-danger) {
  background-color: #ef4444;
  color: #7f1d1d;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-weight: 500;
}

:deep(.p-tag.p-tag-info) {
  background-color: #60a5fa;
  color: #1e3a8a;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-weight: 500;
}

:deep(.p-tag.p-tag-success) {
  background-color: #10b981;
  color: #064e3b;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  font-weight: 500;
}

.jwt-dialog {
  --p-dialog-content-padding: 1rem;
  --p-dialog-content-padding-top: 1rem;
  --p-dialog-content-padding-bottom: 1rem;
  --p-dialog-content-padding-left: 1rem;
  --p-dialog-content-padding-right: 1rem;
  --p-dialog-content-padding-vertical: 1rem;
  --p-dialog-content-padding-horizontal: 1rem;
}

:deep(.jwt-dialog) {
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

:deep(.jwt-dialog .p-dialog-header) {
  border-bottom: 1px solid #e5e7eb;
  padding: 1.25rem;
  font-weight: 600;
  font-size: 1.1rem;
  background-color: #f9fafb;
  border-radius: 8px 8px 0 0;
}

:deep(.jwt-dialog .p-dialog-content) {
  padding: 1.25rem;
}

:deep(.jwt-dialog .p-dialog-footer) {
  border-top: 1px solid #e5e7eb;
  padding: 1rem 1.25rem;
}

:deep(.dark) .jwt-dialog .p-dialog-header {
  background-color: var(--surface-800);
  border-bottom-color: var(--surface-700);
}

:deep(.dark) .jwt-dialog .p-dialog-footer {
  border-top-color: var(--surface-700);
}
</style> 