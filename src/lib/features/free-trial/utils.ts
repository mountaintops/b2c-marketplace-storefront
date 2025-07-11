/**
 * Free Trial Utility Functions
 * 
 * This module provides utility functions for detecting and handling
 * free trial products based on their tags.
 */

import { HttpTypes } from '@medusajs/types'
import { getFreeTrialConfig } from './config'

/**
 * Check if a product has a specific tag value
 * @param tags - Array of product tags
 * @param tagValue - The tag value to search for
 * @returns boolean indicating if the tag exists
 */
export const hasFreeTrialTag = (
  tags: HttpTypes.StoreProductTag[] | undefined,
  tagValue: string
): boolean => {
  if (!tags || tags.length === 0) {
    return false
  }

  return tags.some(tag => 
    tag.value && tag.value.toLowerCase() === tagValue.toLowerCase()
  )
}

/**
 * Check if a product is eligible for free trial download
 * This function uses the configured tag value and checks if the feature is enabled
 * @param product - The product to check
 * @returns boolean indicating if the product is eligible for free trial
 */
export const isProductEligibleForFreeTrial = (
  product: HttpTypes.StoreProduct | undefined
): boolean => {
  const config = getFreeTrialConfig()
  
  // Feature must be enabled
  if (!config.enabled) {
    return false
  }

  // Product must exist and have tags
  if (!product || !product.tags) {
    return false
  }

  // Check if product has the free trial tag
  return hasFreeTrialTag(product.tags, config.tagValue)
}

/**
 * Get the free trial button configuration for a specific product
 * @param product - The product to get configuration for
 * @returns Configuration object or null if not eligible
 */
export const getFreeTrialButtonConfig = (
  product: HttpTypes.StoreProduct | undefined
) => {
  if (!isProductEligibleForFreeTrial(product)) {
    return null
  }

  const config = getFreeTrialConfig()
  
  return {
    buttonText: config.buttonText,
    buttonClassName: config.buttonClassName,
    position: config.position,
    enabled: true
  }
}
