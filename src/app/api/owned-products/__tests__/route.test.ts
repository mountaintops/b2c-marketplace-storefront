/**
 * Integration tests for the owned-products API endpoint
 */

import { NextRequest } from 'next/server'
import { GET } from '../route'

// Mock the dependencies
jest.mock('@/lib/config', () => ({
  sdk: {
    client: {
      fetch: jest.fn()
    }
  }
}))

jest.mock('@/lib/utils/ip-detection', () => ({
  getClientIPWithFallback: jest.fn(() => '8.8.8.8')
}))

jest.mock('@/lib/services/iphub', () => ({
  isVpnOrTorIP: jest.fn(() => Promise.resolve(false))
}))

jest.mock('@/lib/utils/auth', () => ({
  validateCustomerAuth: jest.fn(),
  createAuthHeaders: jest.fn(() => ({ 'Content-Type': 'application/json' }))
}))

describe('/api/owned-products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 when not authenticated', async () => {
    const { validateCustomerAuth } = require('@/lib/utils/auth')
    validateCustomerAuth.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/owned-products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Authentication required')
  })

  it('should return 403 when VPN/Tor is detected', async () => {
    const { isVpnOrTorIP } = require('@/lib/services/iphub')
    const { validateCustomerAuth } = require('@/lib/utils/auth')
    
    isVpnOrTorIP.mockResolvedValue(true)
    validateCustomerAuth.mockResolvedValue({ id: 'customer-123' })

    const request = new NextRequest('http://localhost:3000/api/owned-products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toBe('Access denied: VPN/Tor usage detected')
  })

  it('should return empty array when customer has no orders', async () => {
    const { validateCustomerAuth } = require('@/lib/utils/auth')
    const { sdk } = require('@/lib/config')
    
    validateCustomerAuth.mockResolvedValue({ id: 'customer-123' })
    sdk.client.fetch.mockResolvedValue({ orders: [] })

    const request = new NextRequest('http://localhost:3000/api/owned-products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual([])
  })

  it('should return product handles when customer has orders', async () => {
    const { validateCustomerAuth } = require('@/lib/utils/auth')
    const { sdk } = require('@/lib/config')
    
    validateCustomerAuth.mockResolvedValue({ id: 'customer-123' })
    
    const mockOrders = [
      {
        status: 'completed',
        items: [
          {
            variant: {
              product: {
                handle: 'product-1'
              }
            }
          },
          {
            variant: {
              product: {
                handle: 'product-2'
              }
            }
          }
        ]
      },
      {
        status: 'fulfilled',
        items: [
          {
            variant: {
              product: {
                handle: 'product-1' // Duplicate - should be deduplicated
              }
            }
          },
          {
            variant: {
              product: {
                handle: 'product-3'
              }
            }
          }
        ]
      },
      {
        status: 'canceled', // Should be excluded
        items: [
          {
            variant: {
              product: {
                handle: 'canceled-product'
              }
            }
          }
        ]
      }
    ]
    
    sdk.client.fetch.mockResolvedValue({ orders: mockOrders })

    const request = new NextRequest('http://localhost:3000/api/owned-products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(['product-1', 'product-2', 'product-3'])
    expect(data).not.toContain('canceled-product')
  })

  it('should handle API errors gracefully', async () => {
    const { validateCustomerAuth } = require('@/lib/utils/auth')
    const { sdk } = require('@/lib/config')
    
    validateCustomerAuth.mockResolvedValue({ id: 'customer-123' })
    sdk.client.fetch.mockRejectedValue(new Error('API Error'))

    const request = new NextRequest('http://localhost:3000/api/owned-products')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
