import { NextRequest } from 'next/server'
import { sdk } from '../config'

/**
 * Extracts authentication headers from the Next.js request
 * Automatically detects and uses the current user's session from browser cookies
 */
export function getAuthHeadersFromRequest(request: NextRequest): { authorization?: string } {
  // Get the JWT token from cookies
  const jwtToken = request.cookies.get('_medusa_jwt')?.value
  
  if (!jwtToken) {
    return {}
  }

  return {
    authorization: `Bearer ${jwtToken}`
  }
}

/**
 * Retrieves the current authenticated customer from the request
 * Uses the session cookie to authenticate with the Medusa backend
 */
export async function getCurrentCustomer(request: NextRequest) {
  try {
    const authHeaders = getAuthHeadersFromRequest(request)
    
    if (!authHeaders.authorization) {
      return null
    }

    // Use the SDK to get the current customer
    const customer = await sdk.store.customer.retrieve({}, authHeaders)
    
    return customer
  } catch (error) {
    console.error('Failed to retrieve current customer:', error)
    return null
  }
}

/**
 * Checks if the request has a valid authentication session
 */
export function hasValidSession(request: NextRequest): boolean {
  const jwtToken = request.cookies.get('_medusa_jwt')?.value
  return !!jwtToken
}

/**
 * Extracts customer ID from the request session
 * Returns null if not authenticated
 */
export async function getCustomerIdFromRequest(request: NextRequest): Promise<string | null> {
  try {
    const customer = await getCurrentCustomer(request)
    return customer?.id || null
  } catch (error) {
    console.error('Failed to get customer ID from request:', error)
    return null
  }
}

/**
 * Validates that the request is from an authenticated customer
 * Returns customer data if valid, null otherwise
 */
export async function validateCustomerAuth(request: NextRequest) {
  if (!hasValidSession(request)) {
    return null
  }

  return getCurrentCustomer(request)
}

/**
 * Creates authentication headers for API calls to the Medusa backend
 * Automatically extracts session information from the request
 */
export function createAuthHeaders(request: NextRequest): Record<string, string> {
  const authHeaders = getAuthHeadersFromRequest(request)
  
  return {
    'Content-Type': 'application/json',
    ...authHeaders
  }
}
