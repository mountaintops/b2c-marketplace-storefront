/**
 * IPHub API integration for VPN/Tor detection
 * Documentation: https://iphub.info/api
 */

export interface IPHubResponse {
  ip: string
  countryCode: string
  countryName: string
  asn: number
  isp: string
  block: number // 0 = residential/business, 1 = non-residential, 2 = non-residential & residential
  hostname: string
}

export interface IPHubError {
  error: string
  message?: string
}

export class IPHubService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://v2.api.iphub.info/ip'
  private readonly timeout = 5000 // 5 seconds timeout

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.IPHUB_API_KEY || ''
    
    if (!this.apiKey) {
      console.warn('IPHub API key not configured. VPN/Tor detection will be disabled.')
    }
  }

  /**
   * Checks if an IP address is from a VPN or Tor network
   * @param ip - The IP address to check
   * @returns Promise<boolean> - true if VPN/Tor detected, false otherwise
   */
  async isVpnOrTor(ip: string): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('IPHub API key not configured, skipping VPN/Tor check')
      return false
    }

    // Skip check for local/private IPs
    if (this.isLocalIP(ip)) {
      return false
    }

    try {
      const response = await this.queryIPHub(ip)
      
      // Block values:
      // 0 = Residential or business IP (good)
      // 1 = Non-residential IP (VPN/proxy/hosting)
      // 2 = Non-residential & residential (mixed)
      return response.block === 1 || response.block === 2
    } catch (error) {
      console.error('IPHub API error:', error)
      // On error, allow the request to proceed (fail open)
      return false
    }
  }

  /**
   * Gets detailed information about an IP address from IPHub
   * @param ip - The IP address to query
   * @returns Promise<IPHubResponse> - Detailed IP information
   */
  async getIPInfo(ip: string): Promise<IPHubResponse> {
    if (!this.apiKey) {
      throw new Error('IPHub API key not configured')
    }

    return this.queryIPHub(ip)
  }

  /**
   * Makes the actual API call to IPHub
   * @param ip - The IP address to query
   * @returns Promise<IPHubResponse> - API response
   */
  private async queryIPHub(ip: string): Promise<IPHubResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}/${ip}`, {
        method: 'GET',
        headers: {
          'X-Key': this.apiKey,
          'Content-Type': 'application/json',
          'User-Agent': 'B2C-Marketplace-Storefront/1.0'
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('IPHub API rate limit exceeded')
        }
        if (response.status === 401) {
          throw new Error('IPHub API key invalid or expired')
        }
        if (response.status === 404) {
          throw new Error('IP address not found in IPHub database')
        }
        throw new Error(`IPHub API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      // Check if the response contains an error
      if ('error' in data) {
        throw new Error(`IPHub API error: ${data.error}`)
      }

      return data as IPHubResponse
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error.name === 'AbortError') {
        throw new Error('IPHub API request timeout')
      }
      
      throw error
    }
  }

  /**
   * Checks if an IP address is local/private
   * @param ip - The IP address to check
   * @returns boolean - true if local/private IP
   */
  private isLocalIP(ip: string): boolean {
    // IPv4 private ranges
    const privateRanges = [
      /^127\./, // Loopback
      /^10\./, // Private Class A
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B
      /^192\.168\./, // Private Class C
      /^169\.254\./, // Link-local
      /^::1$/, // IPv6 loopback
      /^fe80:/, // IPv6 link-local
      /^fc00:/, // IPv6 unique local
      /^fd00:/ // IPv6 unique local
    ]

    return privateRanges.some(range => range.test(ip))
  }

  /**
   * Validates IPHub API configuration
   * @returns boolean - true if properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

// Export a singleton instance
export const ipHubService = new IPHubService()

/**
 * Convenience function to check if an IP is from VPN/Tor
 * @param ip - The IP address to check
 * @returns Promise<boolean> - true if VPN/Tor detected
 */
export async function isVpnOrTorIP(ip: string): Promise<boolean> {
  return ipHubService.isVpnOrTor(ip)
}

/**
 * Convenience function to get IP information
 * @param ip - The IP address to query
 * @returns Promise<IPHubResponse | null> - IP information or null on error
 */
export async function getIPInformation(ip: string): Promise<IPHubResponse | null> {
  try {
    return await ipHubService.getIPInfo(ip)
  } catch (error) {
    console.error('Failed to get IP information:', error)
    return null
  }
}
