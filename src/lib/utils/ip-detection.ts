import { NextRequest } from 'next/server'

/**
 * Extracts the client's real IP address from the request headers
 * Handles various proxy scenarios and header configurations
 */
export function getClientIP(request: NextRequest): string | null {
  // List of headers to check for the real IP address (in order of preference)
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-forwarded',
    'forwarded-for',
    'forwarded',
    'true-client-ip', // Akamai and Cloudflare
    'x-cluster-client-ip',
    'x-forwarded-proto',
    'fastly-client-ip', // Fastly CDN
    'x-vercel-forwarded-for' // Vercel
  ]

  // Check each header for IP address
  for (const header of ipHeaders) {
    const value = request.headers.get(header)
    if (value) {
      // Handle comma-separated IPs (x-forwarded-for can contain multiple IPs)
      const ips = value.split(',').map(ip => ip.trim())
      
      // Return the first valid IP that's not a private/local address
      for (const ip of ips) {
        if (isValidPublicIP(ip)) {
          return ip
        }
      }
    }
  }

  // Fallback to connection remote address if available
  const remoteAddress = request.ip
  if (remoteAddress && isValidPublicIP(remoteAddress)) {
    return remoteAddress
  }

  // If no valid IP found, return null
  return null
}

/**
 * Validates if an IP address is a valid public IP
 * Excludes private, local, and invalid IP addresses
 */
function isValidPublicIP(ip: string): boolean {
  // Basic IP format validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
  
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return false
  }

  // Check for private/local IPv4 addresses
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.').map(Number)
    
    // Invalid ranges
    if (parts.some(part => part < 0 || part > 255)) {
      return false
    }
    
    // Private ranges (RFC 1918)
    if (
      (parts[0] === 10) || // 10.0.0.0/8
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || // 172.16.0.0/12
      (parts[0] === 192 && parts[1] === 168) // 192.168.0.0/16
    ) {
      return false
    }
    
    // Loopback (127.0.0.0/8)
    if (parts[0] === 127) {
      return false
    }
    
    // Link-local (169.254.0.0/16)
    if (parts[0] === 169 && parts[1] === 254) {
      return false
    }
    
    // Multicast (224.0.0.0/4)
    if (parts[0] >= 224 && parts[0] <= 239) {
      return false
    }
  }

  // Check for private/local IPv6 addresses
  if (ipv6Regex.test(ip)) {
    const lowerIP = ip.toLowerCase()
    
    // Loopback
    if (lowerIP === '::1') {
      return false
    }
    
    // Link-local (fe80::/10)
    if (lowerIP.startsWith('fe80:')) {
      return false
    }
    
    // Unique local (fc00::/7)
    if (lowerIP.startsWith('fc') || lowerIP.startsWith('fd')) {
      return false
    }
  }

  return true
}

/**
 * Gets client IP with fallback handling
 * Returns a default IP if no valid IP can be determined
 */
export function getClientIPWithFallback(request: NextRequest): string {
  const ip = getClientIP(request)
  
  // If no IP detected, return a placeholder that won't trigger VPN detection
  // This handles cases where IP detection fails (e.g., local development)
  return ip || '127.0.0.1'
}
