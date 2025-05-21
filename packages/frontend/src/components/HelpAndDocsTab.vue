<template>
  <div class="help-container h-full overflow-y-auto">
    <!-- Help & Documentation Card -->
    <Card class="mb-4 bg-gray-50 dark:bg-surface-700">
      <template #title>
        <div class="flex items-center">
          <span class="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
            </svg>
          </span>
          <span>Help & Documentation</span>
        </div>
      </template>
      <template #content>
        <div class="space-y-6">
          <!-- Introduction Section -->
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
            <h3 class="text-xl font-semibold mb-2">Welcome to JWT Analyzer</h3>
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              This knowledge base will help you understand how to use all features of the JWT Analyzer plugin effectively.
              Learn how to analyze, decode, edit and secure JWT tokens in your penetration testing workflow.
            </p>
          </div>

          <!-- Main Documentation Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Dashboard Section -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center mb-3">
                <span class="tab-icon text-xl mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M32 32c17.7 0 32 14.3 32 32V400c0 8.8 7.2 16 16 16H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H80c-44.2 0-80-35.8-80-80V64C0 46.3 14.3 32 32 32zM160 224c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32s-32-14.3-32-32V256c0-17.7 14.3-32 32-32zm128-64V320c0 17.7-14.3 32-32 32s-32-14.3-32-32V160c0-17.7 14.3-32 32-32s32 14.3 32 32zm64 32c17.7 0 32 14.3 32 32v96c0 17.7-14.3 32-32 32s-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/>
                  </svg>
                </span>
                <h3 class="text-lg font-bold">Dashboard</h3>
              </div>
              <p class="text-sm mb-3">
                The Dashboard provides a central view of all JWT tokens detected in your web traffic.
              </p>
              <div class="space-y-2">
                <h4 class="font-medium text-blue-600 dark:text-blue-400">Key Features:</h4>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                  <li>View all detected JWT tokens in one place</li>
                  <li>Filter tokens by severity, status, and algorithm</li>
                  <li>Sort and search tokens easily</li>
                  <li>Quick access to token details</li>
                  <li>Export token data for reporting</li>
                </ul>
                <h4 class="font-medium text-blue-600 dark:text-blue-400 mt-3">How to Use:</h4>
                <ol class="list-decimal pl-5 space-y-1 text-sm">
                  <li>Browse to websites using JWT tokens while Caido is capturing traffic</li>
                  <li>JWT tokens will automatically appear in your dashboard</li>
                  <li>Click on any token to see detailed security analysis</li>
                  <li>Use filters to focus on high-risk tokens</li>
                </ol>
              </div>
            </div>

            <!-- JWT Decoder Section -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center mb-3">
                <span class="tab-icon text-xl mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                    <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"/>
                  </svg>
                </span>
                <h3 class="text-lg font-bold">JWT Decoder</h3>
              </div>
              <p class="text-sm mb-3">
                The JWT Decoder allows you to manually analyze any JWT token by pasting it directly.
              </p>
              <div class="space-y-2">
                <h4 class="font-medium text-blue-600 dark:text-blue-400">Key Features:</h4>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                  <li>Decode and visualize any JWT token structure</li>
                  <li>View header, payload, and signature details</li>
                  <li>Check token expiration status</li>
                  <li>Perform security analysis on manually input tokens</li>
                  <li>Send tokens to the JWT Editor for manipulation</li>
                </ul>
                <h4 class="font-medium text-blue-600 dark:text-blue-400 mt-3">How to Use:</h4>
                <ol class="list-decimal pl-5 space-y-1 text-sm">
                  <li>Copy a JWT token from any source</li>
                  <li>Paste it into the text input field</li>
                  <li>Click "Decode" to analyze the token</li>
                  <li>View the decoded information and security assessment</li>
                  <li>Click "Send to Editor" to modify the token</li>
                </ol>
              </div>
            </div>
            
            <!-- Token Details Section -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center mb-3">
                <span class="tab-icon text-xl mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                    <path d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/>
                  </svg>
                </span>
                <h3 class="text-lg font-bold">Token Details</h3>
              </div>
              <p class="text-sm mb-3">
                The Token Details tab provides comprehensive security analysis and technical information about JWT tokens.
              </p>
              <div class="space-y-2">
                <h4 class="font-medium text-blue-600 dark:text-blue-400">Key Features:</h4>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                  <li>Full token breakdown (header, payload, signature)</li>
                  <li>Security vulnerability assessment</li>
                  <li>Expiration status and timing information</li>
                  <li>Potential attack vectors and exploitability</li>
                  <li>Security recommendations with CVE references</li>
                  <li>Export functionality for reporting (Markdown/JSON)</li>
                </ul>
                <h4 class="font-medium text-blue-600 dark:text-blue-400 mt-3">Understanding the Analysis:</h4>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                  <li>Review the overall security assessment</li>
                  <li>Pay attention to "Identified Risks" for specific vulnerabilities</li>
                  <li>Check "Potential Attack Vectors" for exploitation methods</li>
                  <li>Follow security recommendations to remediate issues</li>
                  <li>Use the export feature to document findings</li>
                </ul>
              </div>
            </div>

            <!-- JWT Editor Section -->
            <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div class="flex items-center mb-3">
                <span class="tab-icon text-xl mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512">
                    <path d="M392.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm80.6 120.1c-12.5 12.5-12.5 32.8 0 45.3L562.7 256l-89.4 89.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l112-112c12.5-12.5 12.5-32.8 0-45.3l-112-112c-12.5-12.5-32.8-12.5-45.3 0zm-306.7 0c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3l112 112c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256l89.4-89.4c12.5-12.5 12.5-32.8 0-45.3z"/>
                  </svg>
                </span>
                <h3 class="text-lg font-bold">JWT Editor</h3>
              </div>
              <p class="text-sm mb-3">
                The JWT Editor enables you to modify tokens and test different attack scenarios.
              </p>
              <div class="space-y-2">
                <h4 class="font-medium text-blue-600 dark:text-blue-400">Key Features:</h4>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                  <li>Edit token header and payload contents</li>
                  <li>Generate new cryptographic keys (symmetric/asymmetric)</li>
                  <li>Sign tokens with different algorithms and keys</li>
                  <li>Apply common JWT attacks with a single click</li>
                  <li>Test token modifications immediately</li>
                </ul>
                <h4 class="font-medium text-blue-600 dark:text-blue-400 mt-3">Common JWT Attacks:</h4>
                <ul class="list-disc pl-5 space-y-1 text-sm">
                  <li><strong>'none' Algorithm Attack:</strong> Removes signature verification (CVE-2015-9235)</li>
                  <li><strong>HMAC Confusion Attack:</strong> Exploits algorithm switching (CVE-2016-5431)</li>
                  <li><strong>Key ID (kid) Injection:</strong> Manipulates the key selection process</li>
                  <li><strong>Signature Stripping:</strong> Removes the signature entirely</li>
                  <li><strong>Expiration Bypass:</strong> Modifies token timing claims</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Security Testing Workflows card with two columns -->
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-6">
            <h3 class="text-xl font-bold mb-4">Security Testing Workflows</h3>
            
            <!-- Two-column layout for the workflows -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Finding JWT Vulnerabilities Column -->
              <div>
                <div class="flex items-center mb-3">
                  <span class="tab-icon text-xl mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512">
                      <path d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64h96v80c0 6.1 3.4 11.6 8.8 14.3s11.9 2.1 16.8-1.5L309.3 416H512c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64z"/>
                    </svg>
                  </span>
                  <h4 class="font-semibold text-lg text-blue-600 dark:text-blue-400">Finding JWT Vulnerabilities</h4>
                </div>
                <ol class="list-decimal pl-6 space-y-2 mt-2 text-sm">
                  <li>
                    <strong>Capture Authentication Flow:</strong> 
                    <p class="text-sm mt-1">Browse through the login and authenticated pages while Caido captures traffic. JWT tokens are typically found in Authorization headers, cookies, or localStorage.</p>
                  </li>
                  <li>
                    <strong>Review Token Structure:</strong> 
                    <p class="text-sm mt-1">Analyze token claims and headers in the Token Details tab. Look for sensitive information, weak algorithms, and missing security claims (exp, nbf, aud).</p>
                  </li>
                  <li>
                    <strong>Test for Algorithm Vulnerabilities:</strong> 
                    <p class="text-sm mt-1">Use the JWT Editor to switch algorithm types (RS256 to HS256) or test the 'none' algorithm attack. If the server accepts these modified tokens, it's vulnerable to signature bypass.</p>
                  </li>
                  <li>
                    <strong>Manipulate Token Claims:</strong> 
                    <p class="text-sm mt-1">Edit payload claims like user roles, permissions, or IDs to test for authorization bypasses. A secure implementation should validate these claims server-side.</p>
                  </li>
                  <li>
                    <strong>Check for Key Disclosure:</strong> 
                    <p class="text-sm mt-1">Search for leaked keys in the application's JavaScript files, error messages, or documentation. Use discovered keys to sign forged tokens.</p>
                  </li>
                </ol>
              </div>

              <!-- JWT Security Best Practices Column -->
              <div>
                <div class="flex items-center mb-3">
                  <span class="tab-icon text-xl mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
                      <path d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z"/>
                    </svg>
                  </span>
                  <h4 class="font-semibold text-lg text-blue-600 dark:text-blue-400">JWT Security Best Practices</h4>
                </div>
                <ul class="list-disc pl-6 space-y-2 mt-2 text-sm">
                  <li>
                    <strong>Use Strong Algorithms:</strong> 
                    <p class="text-sm mt-1">RS256, RS384, RS512, ES256, ES384, or ES512 are recommended over HS256.</p>
                  </li>
                  <li>
                    <strong>Set Appropriate Expiration:</strong> 
                    <p class="text-sm mt-1">All tokens should have an expiration (exp) claim set to a reasonable value based on your security requirements.</p>
                  </li>
                  <li>
                    <strong>Validate All Claims:</strong> 
                    <p class="text-sm mt-1">Always validate issuer (iss), audience (aud), subject (sub), and timing claims (exp, nbf, iat) server-side.</p>
                  </li>
                  <li>
                    <strong>Implement Proper Key Management:</strong> 
                    <p class="text-sm mt-1">Use adequate key sizes, rotate keys regularly, and secure your signing keys properly.</p>
                  </li>
                  <li>
                    <strong>Don't Store Sensitive Data:</strong> 
                    <p class="text-sm mt-1">JWT payloads are base64-encoded, not encrypted. Never store sensitive information in tokens.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="text-center pt-4 text-gray-500 dark:text-gray-400 text-sm">
            <p>For questions, feature requests, or bug reports, please visit our GitHub repository.</p>
          </div>
        </div>
      </template>
    </Card>

    <!-- About Card -->
    <Card class="flex-grow bg-gray-50 dark:bg-surface-700">
      <template #title>
        <div class="flex items-center">
          <span class="tab-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/>
            </svg>
          </span>
          <span>About</span>
        </div>
      </template>
      <template #content>
        <div class="about-section">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100">JWT Analyzer</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">Version 1.0.0</p>
            </div>
            <a
              href="https://github.com/amrelsagaei/JWT-Analyzer"
              target="_blank"
              rel="noopener noreferrer"
              class="github-btn inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
              Star on GitHub
            </a>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6 border-l-4 border-blue-500">
            <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
              JWT Analyzer is a powerful Caido plugin designed to help security professionals analyze and assess JWT tokens in real-time. 
              It provides comprehensive token analysis, risk assessment, and detailed token information directly within your Caido workflow.
            </p>
          </div>

          <div class="py-4 border-t border-gray-200 dark:border-gray-700">
            <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Connect</h4>
            <div class="flex justify-between items-center">
              <div class="flex space-x-4">
                <a 
                  href="#"
                  @click.prevent="copyToClipboard('https://www.linkedin.com/in/amrelsagaei')" 
                  class="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
                <a 
                  href="#"
                  @click.prevent="copyToClipboard('info@amrelsagaei.com')"
                  class="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Email
                </a>
              </div>
              <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                Made with ❤️ by <a href="#" @click.prevent="copyToClipboard('https://amrelsagaei.com')"><strong class="text-gray-700 dark:text-gray-300 ml-1">Amr Elsagaei</strong></a>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useSDK } from '../plugins/sdk';

const sdk = useSDK();

// Methods
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => {
      if ((window as any).caidoSDK?.window?.showToast) {
        (window as any).caidoSDK.window.showToast('Link copied to clipboard', {
          variant: 'success',
          duration: 3000
        });
      }
    })
    .catch(err => {
      console.error('Failed to copy text:', err);
      
      // Fallback method
      try {
        const tempInput = document.createElement('input');
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        
        if ((window as any).caidoSDK?.window?.showToast) {
          (window as any).caidoSDK.window.showToast('Link copied to clipboard', {
            variant: 'success',
            duration: 3000
          });
        }
      } catch (e) {
        console.error('Fallback copy method failed:', e);
        if ((window as any).caidoSDK?.window?.showToast) {
          (window as any).caidoSDK.window.showToast('Failed to copy to clipboard', {
            variant: 'error',
            duration: 3000
          });
        }
      }
    });
}
</script>

<style scoped>
.help-container {
  padding-bottom: 1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

:deep(.p-card) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.p-card-content) {
  flex: 1;
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

.github-btn {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.github-btn:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style> 