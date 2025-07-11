"use client"

import { FreeTrialButton } from "@/components/molecules/FreeTrialButton"
import { isProductEligibleForFreeTrial } from "@/lib/features/free-trial"
import { HttpTypes } from "@medusajs/types"

/**
 * Demo component to test Free Trial functionality
 * This can be used for development and testing purposes
 */

// Mock product data for testing
const mockProductWithFreeTrial: HttpTypes.StoreProduct = {
  id: 'demo-product-1',
  title: 'Demo Product with Free Trial',
  handle: 'demo-product-free-trial',
  description: 'This is a demo product that has a free trial available.',
  tags: [
    { 
      id: 'tag-1', 
      value: 'Free Trial', 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z' 
    },
    { 
      id: 'tag-2', 
      value: 'Digital', 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z' 
    }
  ],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
} as HttpTypes.StoreProduct

const mockProductWithoutFreeTrial: HttpTypes.StoreProduct = {
  id: 'demo-product-2',
  title: 'Demo Product without Free Trial',
  handle: 'demo-product-no-trial',
  description: 'This is a demo product that does not have a free trial.',
  tags: [
    { 
      id: 'tag-3', 
      value: 'Premium', 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z' 
    },
    { 
      id: 'tag-4', 
      value: 'Physical', 
      created_at: '2023-01-01T00:00:00Z', 
      updated_at: '2023-01-01T00:00:00Z' 
    }
  ],
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
} as HttpTypes.StoreProduct

export const FreeTrialDemo = () => {
  const handleCustomDownload = async (product: HttpTypes.StoreProduct) => {
    console.log('Custom download handler called for:', product.title)
    alert(`Custom download initiated for: ${product.title}`)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">Free Trial Feature Demo</h1>
      
      {/* Product with Free Trial */}
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">{mockProductWithFreeTrial.title}</h2>
        <p className="text-gray-600">{mockProductWithFreeTrial.description}</p>
        
        <div className="space-y-2">
          <p><strong>Tags:</strong> {mockProductWithFreeTrial.tags?.map(tag => tag.value).join(', ')}</p>
          <p><strong>Eligible for Free Trial:</strong> {isProductEligibleForFreeTrial(mockProductWithFreeTrial) ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium">Free Trial Button (should appear):</p>
          <FreeTrialButton 
            product={mockProductWithFreeTrial}
            onDownload={handleCustomDownload}
          />
        </div>
      </div>

      {/* Product without Free Trial */}
      <div className="border rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">{mockProductWithoutFreeTrial.title}</h2>
        <p className="text-gray-600">{mockProductWithoutFreeTrial.description}</p>
        
        <div className="space-y-2">
          <p><strong>Tags:</strong> {mockProductWithoutFreeTrial.tags?.map(tag => tag.value).join(', ')}</p>
          <p><strong>Eligible for Free Trial:</strong> {isProductEligibleForFreeTrial(mockProductWithoutFreeTrial) ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="space-y-2">
          <p className="font-medium">Free Trial Button (should NOT appear):</p>
          <FreeTrialButton 
            product={mockProductWithoutFreeTrial}
            onDownload={handleCustomDownload}
          />
          <p className="text-sm text-gray-500">
            {!isProductEligibleForFreeTrial(mockProductWithoutFreeTrial) && 
              "Button is hidden because product is not eligible for free trial"}
          </p>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="border rounded-lg p-4 space-y-2 bg-gray-50">
        <h3 className="font-semibold">Configuration Info</h3>
        <p className="text-sm">
          <strong>Feature Status:</strong> Enabled<br/>
          <strong>Tag Value:</strong> &quot;Free Trial&quot;<br/>
          <strong>Button Text:</strong> &quot;Download Free Trial&quot;<br/>
          <strong>Position:</strong> Below Add to Cart button
        </p>
      </div>
    </div>
  )
}
