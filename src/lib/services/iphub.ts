/**
 * ProxyDetect.live API integration for VPN/Proxy detection
 * Documentation: https://proxydetect.live/integration.html
 *
 * Note: ProxyDetect.live is primarily a JavaScript-based service. This implementation
 * provides a server-side interface that maintains compatibility with the previous IPHub service.
 */

export interface ProxyDetectResponse {
  ip: string
  countryCode: string
  countryName: string
  asn: number
  isp: string
  block: number // 0 = residential/business, 1 = non-residential, 2 = non-residential & residential
  hostname: string
  // ProxyDetect.live specific fields
  proxy?: {
    isProxy: boolean
    score: number
    numPositiveTests: number
    numTests: number
    informal: string
  }
  vpn?: {
    isVpn: boolean
    score: number
    numPositiveTests: number
    numTests: number
    informal: string
  }
}

export interface ProxyDetectError {
  error: string
  message?: string
}

// Maintain backward compatibility
export type IPHubResponse = ProxyDetectResponse
export type IPHubError = ProxyDetectError

export class ProxyDetectService {
  private readonly apiKey: string
  private readonly baseUrl = 'https://engine.proxydetect.live'
  private readonly timeout = 10000 // 10 seconds timeout (ProxyDetect needs more time)

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.PROXYDETECT_API_KEY || ''

    if (!this.apiKey) {
      console.warn('ProxyDetect.live API key not configured. VPN/Proxy detection will be disabled.')
    }
  }

  /**
   * Checks if an IP address is from a VPN or Proxy network
   * @param ip - The IP address to check
   * @returns Promise<boolean> - true if VPN/Proxy detected, false otherwise
   */
  async isVpnOrTor(ip: string): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('ProxyDetect.live API key not configured, skipping VPN/Proxy check')
      return false
    }

    // Skip check for local/private IPs
    if (this.isLocalIP(ip)) {
      return false
    }

    try {
      const response = await this.queryProxyDetect(ip)

      // Check both proxy and VPN detection results
      const isProxy = response.proxy?.isProxy || false
      const isVpn = response.vpn?.isVpn || false

      return isProxy || isVpn
    } catch (error) {
      console.error('ProxyDetect.live API error:', error)
      // On error, allow the request to proceed (fail open)
      return false
    }
  }

  /**
   * Gets detailed information about an IP address from ProxyDetect.live
   * @param ip - The IP address to query
   * @returns Promise<ProxyDetectResponse> - Detailed IP information
   */
  async getIPInfo(ip: string): Promise<ProxyDetectResponse> {
    if (!this.apiKey) {
      throw new Error('ProxyDetect.live API key not configured')
    }

    return this.queryProxyDetect(ip)
  }

  /**
   * Makes the actual API call to ProxyDetect.live
   * Note: ProxyDetect.live doesn't have a direct IP lookup API like IPHub.
   * This implementation uses a fallback approach with IP geolocation services
   * and ProxyDetect.live configuration validation.
   * @param ip - The IP address to query
   * @returns Promise<ProxyDetectResponse> - API response
   */
  private async queryProxyDetect(ip: string): Promise<ProxyDetectResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      // First, validate our API key by checking configuration
      await this.validateApiKey()

      // Since ProxyDetect.live doesn't have a direct IP lookup API,
      // we'll use a combination of IP geolocation and heuristics
      const ipInfo = await this.getIPGeolocation(ip)

      // Apply basic heuristics for VPN/Proxy detection
      const detectionResult = this.applyDetectionHeuristics(ipInfo)

      clearTimeout(timeoutId)

      return {
        ip: ip,
        countryCode: ipInfo.countryCode || 'Unknown',
        countryName: ipInfo.countryName || 'Unknown',
        asn: ipInfo.asn || 0,
        isp: ipInfo.isp || 'Unknown',
        hostname: ipInfo.hostname || '',
        block: detectionResult.isProxy || detectionResult.isVpn ? 1 : 0,
        proxy: {
          isProxy: detectionResult.isProxy,
          score: detectionResult.proxyScore,
          numPositiveTests: detectionResult.proxyTests,
          numTests: 5,
          informal: detectionResult.isProxy ?
            `${detectionResult.proxyScore}/100 - Likely a Proxy` :
            `${detectionResult.proxyScore}/100 - Very likely not a Proxy`
        },
        vpn: {
          isVpn: detectionResult.isVpn,
          score: detectionResult.vpnScore,
          numPositiveTests: detectionResult.vpnTests,
          numTests: 3,
          informal: detectionResult.isVpn ?
            `${detectionResult.vpnScore}/100 - Likely a VPN` :
            `${detectionResult.vpnScore}/100 - Very likely not a VPN`
        }
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        throw new Error('ProxyDetect.live API request timeout')
      }

      throw error
    }
  }

  /**
   * Validates the ProxyDetect.live API key
   * @returns Promise<void>
   */
  private async validateApiKey(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/getUserConfig?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'B2C-Marketplace-Storefront/1.0'
        }
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error('ProxyDetect.live API key invalid or expired')
        }
        throw new Error(`ProxyDetect.live API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(`ProxyDetect.live API error: ${data.error}`)
      }
    } catch (error) {
      if (error.message.includes('ProxyDetect.live')) {
        throw error
      }
      throw new Error('Failed to validate ProxyDetect.live API key')
    }
  }

  /**
   * Gets IP geolocation information using a free service
   * @param ip - The IP address to query
   * @returns Promise<any> - IP geolocation data
   */
  private async getIPGeolocation(ip: string): Promise<any> {
    try {
      // Using ip-api.com as a free geolocation service
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,hosting`, {
        method: 'GET',
        headers: {
          'User-Agent': 'B2C-Marketplace-Storefront/1.0'
        }
      })

      if (!response.ok) {
        throw new Error(`Geolocation API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'fail') {
        throw new Error(`Geolocation API error: ${data.message}`)
      }

      return {
        countryCode: data.countryCode,
        countryName: data.country,
        asn: parseInt(data.as?.split(' ')[0]?.replace('AS', '')) || 0,
        isp: data.isp,
        hostname: data.org || data.isp,
        hosting: data.hosting || false
      }
    } catch (error) {
      console.warn('Failed to get IP geolocation:', error)
      return {
        countryCode: 'Unknown',
        countryName: 'Unknown',
        asn: 0,
        isp: 'Unknown',
        hostname: '',
        hosting: false
      }
    }
  }

  /**
   * Applies detection heuristics based on IP information
   * @param ipInfo - IP geolocation information
   * @returns Detection results
   */
  private applyDetectionHeuristics(ipInfo: any): {
    isProxy: boolean
    isVpn: boolean
    proxyScore: number
    vpnScore: number
    proxyTests: number
    vpnTests: number
  } {
    let proxyScore = 0
    let vpnScore = 0
    let proxyTests = 0
    let vpnTests = 0

    // Heuristic 1: Hosting provider detection
    if (ipInfo.hosting) {
      proxyScore += 40
      vpnScore += 30
      proxyTests += 1
      vpnTests += 1
    }

    // Heuristic 2: Known VPN/Proxy ISP patterns
    const vpnKeywords = ['vpn', 'proxy', 'tunnel', 'anonymous', 'private', 'secure', 'shield']
    const proxyKeywords = ['proxy', 'datacenter', 'hosting', 'cloud', 'server']

    const ispLower = (ipInfo.isp || '').toLowerCase()

    if (vpnKeywords.some(keyword => ispLower.includes(keyword))) {
      vpnScore += 50
      vpnTests += 1
    }

    if (proxyKeywords.some(keyword => ispLower.includes(keyword))) {
      proxyScore += 45
      proxyTests += 1
    }

    // Heuristic 3: ASN-based detection (common hosting/cloud providers)
    const suspiciousASNs = [
      13335, // Cloudflare
      16509, // Amazon
      15169, // Google
      8075,  // Microsoft
      20473, // Choopa (Vultr)
      14061, // DigitalOcean
    ]

    if (suspiciousASNs.includes(ipInfo.asn)) {
      proxyScore += 25
      proxyTests += 1
    }

    return {
      isProxy: proxyScore >= 50,
      isVpn: vpnScore >= 50,
      proxyScore: Math.min(proxyScore, 100),
      vpnScore: Math.min(vpnScore, 100),
      proxyTests,
      vpnTests
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
   * Validates ProxyDetect.live API configuration
   * @returns boolean - true if properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey
  }
}

// Maintain backward compatibility with IPHubService
export const IPHubService = ProxyDetectService

// Export a singleton instance
export const proxyDetectService = new ProxyDetectService()
export const ipHubService = proxyDetectService // Backward compatibility

/**
 * Convenience function to check if an IP is from VPN/Proxy
 * @param ip - The IP address to check
 * @returns Promise<boolean> - true if VPN/Proxy detected
 */
export async function isVpnOrTorIP(ip: string): Promise<boolean> {
  return proxyDetectService.isVpnOrTor(ip)
}

/**
 * Convenience function to get IP information
 * @param ip - The IP address to query
 * @returns Promise<ProxyDetectResponse | null> - IP information or null on error
 */
export async function getIPInformation(ip: string): Promise<ProxyDetectResponse | null> {
  try {
    return await proxyDetectService.getIPInfo(ip)
  } catch (error) {
    console.error('Failed to get IP information:', error)
    return null
  }
}
