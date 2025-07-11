/**
 * Tests for Free Trial Utility Functions
 */

import { hasFreeTrialTag, isProductEligibleForFreeTrial, getFreeTrialButtonConfig } from '../utils'
import { HttpTypes } from '@medusajs/types'

// Mock product data for testing
const mockProductWithFreeTrial: HttpTypes.StoreProduct = {
  id: 'test-product-1',
  title: 'Test Product with Free Trial',
  tags: [
    { id: 'tag-1', value: 'Free Trial', created_at: '2023-01-01', updated_at: '2023-01-01' },
    { id: 'tag-2', value: 'Digital', created_at: '2023-01-01', updated_at: '2023-01-01' }
  ]
} as HttpTypes.StoreProduct

const mockProductWithoutFreeTrial: HttpTypes.StoreProduct = {
  id: 'test-product-2',
  title: 'Test Product without Free Trial',
  tags: [
    { id: 'tag-3', value: 'Physical', created_at: '2023-01-01', updated_at: '2023-01-01' },
    { id: 'tag-4', value: 'Premium', created_at: '2023-01-01', updated_at: '2023-01-01' }
  ]
} as HttpTypes.StoreProduct

const mockProductWithoutTags: HttpTypes.StoreProduct = {
  id: 'test-product-3',
  title: 'Test Product without Tags',
  tags: []
} as HttpTypes.StoreProduct

describe('Free Trial Utils', () => {
  describe('hasFreeTrialTag', () => {
    it('should return true when product has Free Trial tag', () => {
      const result = hasFreeTrialTag(mockProductWithFreeTrial.tags, 'Free Trial')
      expect(result).toBe(true)
    })

    it('should return false when product does not have Free Trial tag', () => {
      const result = hasFreeTrialTag(mockProductWithoutFreeTrial.tags, 'Free Trial')
      expect(result).toBe(false)
    })

    it('should return false when product has no tags', () => {
      const result = hasFreeTrialTag(mockProductWithoutTags.tags, 'Free Trial')
      expect(result).toBe(false)
    })

    it('should return false when tags array is undefined', () => {
      const result = hasFreeTrialTag(undefined, 'Free Trial')
      expect(result).toBe(false)
    })

    it('should be case insensitive', () => {
      const result = hasFreeTrialTag(mockProductWithFreeTrial.tags, 'free trial')
      expect(result).toBe(true)
    })
  })

  describe('isProductEligibleForFreeTrial', () => {
    it('should return true for product with Free Trial tag', () => {
      const result = isProductEligibleForFreeTrial(mockProductWithFreeTrial)
      expect(result).toBe(true)
    })

    it('should return false for product without Free Trial tag', () => {
      const result = isProductEligibleForFreeTrial(mockProductWithoutFreeTrial)
      expect(result).toBe(false)
    })

    it('should return false for undefined product', () => {
      const result = isProductEligibleForFreeTrial(undefined)
      expect(result).toBe(false)
    })
  })

  describe('getFreeTrialButtonConfig', () => {
    it('should return config for eligible product', () => {
      const result = getFreeTrialButtonConfig(mockProductWithFreeTrial)
      expect(result).not.toBeNull()
      expect(result?.enabled).toBe(true)
      expect(result?.buttonText).toBe('Download Free Trial')
    })

    it('should return null for ineligible product', () => {
      const result = getFreeTrialButtonConfig(mockProductWithoutFreeTrial)
      expect(result).toBeNull()
    })

    it('should return null for undefined product', () => {
      const result = getFreeTrialButtonConfig(undefined)
      expect(result).toBeNull()
    })
  })
})
