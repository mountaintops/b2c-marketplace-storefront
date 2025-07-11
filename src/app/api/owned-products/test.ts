/**
 * Test utilities for the owned-products API endpoint
 * This file contains test functions to verify the API functionality
 */

import { getClientIP, isValidPublicIP } from '@/lib/utils/ip-detection'
import { IPHubService } from '@/lib/services/iphub'
import { getEnvConfig, validateEnvConfig } from '@/lib/config/env'

/**
 * Test IP detection functionality
 */
export function testIPDetection() {
  console.log('Testing IP Detection...')
  
  // Test cases for IP validation
  const testIPs = [
    { ip: '8.8.8.8', expected: true, description: 'Google DNS (public)' },
    { ip: '192.168.1.1', expected: false, description: 'Private IP' },
    { ip: '127.0.0.1', expected: false, description: 'Localhost' },
    { ip: '10.0.0.1', expected: false, description: 'Private Class A' },
    { ip: '172.16.0.1', expected: false, description: 'Private Class B' },
    { ip: '1.1.1.1', expected: true, description: 'Cloudflare DNS (public)' },
    { ip: 'invalid-ip', expected: false, description: 'Invalid IP format' }
  ]
  
  testIPs.forEach(({ ip, expected, description }) => {
    const result = isValidPublicIP(ip)
    const status = result === expected ? '✅' : '❌'
    console.log(`${status} ${description}: ${ip} -> ${result}`)
  })
}

/**
 * Test environment configuration
 */
export function testEnvironmentConfig() {
  console.log('\nTesting Environment Configuration...')
  
  const config = getEnvConfig()
  const validation = validateEnvConfig()
  
  console.log('Configuration:')
  console.log(`- Medusa Backend URL: ${config.medusaBackendUrl}`)
  console.log(`- Publishable Key: ${config.publishableKey ? '✅ Set' : '❌ Missing'}`)
  console.log(`- IPHub API Key: ${config.iphubApiKey ? '✅ Set' : '⚠️ Not configured'}`)
  
  console.log('\nValidation:')
  console.log(`- Valid: ${validation.isValid ? '✅' : '❌'}`)
  if (validation.errors.length > 0) {
    validation.errors.forEach(error => console.log(`  - ${error}`))
  }
}

/**
 * Test ProxyDetect.live service (requires API key)
 */
export async function testIPHubService() {
  console.log('\nTesting ProxyDetect.live Service...')

  const proxyDetect = new IPHubService() // Using backward compatibility alias

  if (!proxyDetect.isConfigured()) {
    console.log('⚠️ ProxyDetect.live not configured - skipping tests')
    return
  }

  // Test with known good IP (Google DNS)
  try {
    console.log('Testing with Google DNS (8.8.8.8)...')
    const isVpn = await proxyDetect.isVpnOrTor('8.8.8.8')
    console.log(`✅ Google DNS VPN/Proxy check: ${isVpn ? 'VPN/Proxy detected' : 'Clean IP'}`)

    // Get detailed information
    const ipInfo = await proxyDetect.getIPInfo('8.8.8.8')
    console.log(`📊 IP Info: ${ipInfo.isp} (${ipInfo.countryCode})`)
    if (ipInfo.proxy) {
      console.log(`🔍 Proxy Score: ${ipInfo.proxy.score}/100 - ${ipInfo.proxy.informal}`)
    }
    if (ipInfo.vpn) {
      console.log(`🔍 VPN Score: ${ipInfo.vpn.score}/100 - ${ipInfo.vpn.informal}`)
    }
  } catch (error) {
    console.log(`❌ ProxyDetect.live test failed: ${error.message}`)
  }

  // Test with localhost (should be skipped)
  try {
    console.log('Testing with localhost (127.0.0.1)...')
    const isVpn = await proxyDetect.isVpnOrTor('127.0.0.1')
    console.log(`✅ Localhost VPN/Proxy check: ${isVpn ? 'VPN/Proxy detected' : 'Clean IP (expected)'}`)
  } catch (error) {
    console.log(`❌ Localhost test failed: ${error.message}`)
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🧪 Running Owned Products API Tests\n')
  
  testIPDetection()
  testEnvironmentConfig()
  await testIPHubService()
  
  console.log('\n✅ Tests completed!')
}

/**
 * Test the API endpoint manually (for development)
 */
export function createTestRequest() {
  const testData = {
    url: '/api/owned-products',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Note: In real usage, session cookies would be included automatically
    },
    description: 'Test request for owned products API'
  }
  
  console.log('Test Request Configuration:')
  console.log(JSON.stringify(testData, null, 2))
  
  return testData
}

// Export test runner for easy access
if (typeof window !== 'undefined') {
  // Browser environment - attach to window for console access
  (window as any).testOwnedProductsAPI = {
    runAllTests,
    testIPDetection,
    testEnvironmentConfig,
    testIPHubService,
    createTestRequest
  }
}

// Node.js environment - run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests().catch(console.error)
}
