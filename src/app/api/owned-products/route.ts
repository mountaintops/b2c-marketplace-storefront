import { NextRequest, NextResponse } from 'next/server'
import { sdk } from '@/lib/config'
import { getClientIPWithFallback } from '@/lib/utils/ip-detection'
import { isVpnOrTorIP } from '@/lib/services/iphub'
import { validateCustomerAuth, createAuthHeaders } from '@/lib/utils/auth'

/**
 * API endpoint to retrieve products owned by the authenticated customer
 * Returns an array of product handle strings
 *
 * Features:
 * - Automatic session detection from browser cookies
 * - IP-based VPN/Tor detection using IPHub API
 * - Returns simple array of product handle strings
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract and validate client IP
    const clientIP = getClientIPWithFallback(request)
    console.log(`Request from IP: ${clientIP}`)

    // 2. Check for VPN/Tor usage (if IPHub is configured)
    const isVpnTor = await isVpnOrTorIP(clientIP)
    if (isVpnTor) {
      console.warn(`VPN/Tor detected for IP: ${clientIP}`)
      return NextResponse.json(
        { error: 'Access denied: VPN/Tor usage detected' },
        { status: 403 }
      )
    }

    // 3. Validate customer authentication
    const customer = await validateCustomerAuth(request)
    if (!customer) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`Authenticated customer:`, customer)

    // 4. Fetch customer orders from Medusa backend
    const authHeaders = createAuthHeaders(request)

    // Get all orders for the customer (excluding canceled and draft orders)
    const ordersResponse = await sdk.client.fetch(
      `/store/orders`,
      {
        method: 'GET',
        headers: authHeaders,
        query: {
          fields: 'id,items.variant.product.handle',
          limit: 1000 // Get a large number to capture all orders
        }
      }
    )

    const ordersData = ordersResponse as any
    if (!ordersData.orders) {
      return NextResponse.json([])
    }

    // 5. Extract unique product handles from order items
    const productHandles = new Set<string>()

    ordersData.orders.forEach((order: any) => {
      // Skip canceled or draft orders
      if (order.status === 'canceled' || order.status === 'draft') {
        return
      }

      order.items?.forEach((item: any) => {
        const handle = item.variant?.product?.handle
        if (handle) {
          productHandles.add(handle)
        }
      })
    })

    // 6. Return array of unique product handles
    const result = Array.from(productHandles).sort()

    console.log(`Found ${result.length} owned products for customer`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in owned-products API:', error)

    // Return appropriate error based on the error type
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage?.includes('Authentication')) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    if (errorMessage?.includes('VPN') || errorMessage?.includes('Tor')) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
