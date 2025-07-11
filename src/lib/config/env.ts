/**
 * Environment configuration validation and utilities
 */

export interface EnvConfig {
  medusaBackendUrl: string
  publishableKey: string
  baseUrl: string
  defaultRegion: string
  stripeKey: string
  revalidateSecret: string
  siteName: string
  siteDescription: string
  algoliaId: string
  algoliaSearchKey: string
  talkjsAppId?: string
  iphubApiKey?: string
}

/**
 * Validates and returns environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const config: EnvConfig = {
    medusaBackendUrl: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
    publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    defaultRegion: process.env.NEXT_PUBLIC_DEFAULT_REGION || 'us',
    stripeKey: process.env.NEXT_PUBLIC_STRIPE_KEY || '',
    revalidateSecret: process.env.REVALIDATE_SECRET || '',
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || 'B2C Marketplace',
    siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'B2C Marketplace Storefront',
    algoliaId: process.env.NEXT_PUBLIC_ALGOLIA_ID || '',
    algoliaSearchKey: process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '',
    talkjsAppId: process.env.NEXT_PUBLIC_TALKJS_APP_ID,
    iphubApiKey: process.env.IPHUB_API_KEY
  }

  return config
}

/**
 * Validates required environment variables
 */
export function validateEnvConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const config = getEnvConfig()

  // Required variables
  if (!config.medusaBackendUrl) {
    errors.push('MEDUSA_BACKEND_URL is required')
  }

  if (!config.publishableKey) {
    errors.push('NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is required')
  }

  if (!config.baseUrl) {
    errors.push('NEXT_PUBLIC_BASE_URL is required')
  }

  if (!config.revalidateSecret) {
    errors.push('REVALIDATE_SECRET is required')
  }

  // Optional but recommended variables
  if (!config.iphubApiKey) {
    console.warn('IPHUB_API_KEY not configured - VPN/Tor detection will be disabled')
  }

  if (!config.algoliaId || !config.algoliaSearchKey) {
    console.warn('Algolia configuration incomplete - search functionality may be limited')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Checks if IPHub is properly configured
 */
export function isIPHubConfigured(): boolean {
  const config = getEnvConfig()
  return !!config.iphubApiKey && config.iphubApiKey !== 'your_iphub_api_key_here'
}

/**
 * Gets IPHub API key with validation
 */
export function getIPHubApiKey(): string | null {
  const config = getEnvConfig()
  
  if (!config.iphubApiKey || config.iphubApiKey === 'your_iphub_api_key_here') {
    return null
  }
  
  return config.iphubApiKey
}

// Validate configuration on module load (development only)
if (process.env.NODE_ENV === 'development') {
  const validation = validateEnvConfig()
  if (!validation.isValid) {
    console.error('Environment configuration errors:')
    validation.errors.forEach(error => console.error(`- ${error}`))
  }
}
