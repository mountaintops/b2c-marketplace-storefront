"use client"

import { useState, useCallback } from 'react'
import { HttpTypes } from '@medusajs/types'
import { isProductEligibleForFreeTrial } from '@/lib/features/free-trial'

interface UseFreeTrialDownloadOptions {
  /** Custom download handler */
  onDownload?: (product: HttpTypes.StoreProduct) => Promise<void>
  /** Custom success handler */
  onSuccess?: (product: HttpTypes.StoreProduct) => void
  /** Custom error handler */
  onError?: (error: Error, product: HttpTypes.StoreProduct) => void
}

interface UseFreeTrialDownloadReturn {
  /** Whether a download is currently in progress */
  isDownloading: boolean
  /** Whether the product is eligible for free trial */
  isEligible: boolean
  /** Function to trigger the download */
  downloadFreeTrial: () => Promise<void>
  /** Any error that occurred during download */
  error: Error | null
}

/**
 * Hook for managing free trial download functionality
 * 
 * This hook provides state management and handlers for free trial downloads,
 * including loading states, error handling, and customizable download logic.
 */
export const useFreeTrialDownload = (
  product: HttpTypes.StoreProduct | undefined,
  options: UseFreeTrialDownloadOptions = {}
): UseFreeTrialDownloadReturn => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const { onDownload, onSuccess, onError } = options

  // Check if product is eligible for free trial
  const isEligible = isProductEligibleForFreeTrial(product)

  const downloadFreeTrial = useCallback(async () => {
    if (!product || !isEligible) {
      const error = new Error('Product is not eligible for free trial')
      setError(error)
      return
    }

    setIsDownloading(true)
    setError(null)

    try {
      if (onDownload) {
        // Use custom download handler
        await onDownload(product)
      } else {
        // Default download logic
        await defaultDownloadHandler(product)
      }

      // Call success handler if provided
      if (onSuccess) {
        onSuccess(product)
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Download failed')
      setError(error)
      
      // Call error handler if provided
      if (onError) {
        onError(error, product)
      } else {
        // Default error handling
        console.error('Free trial download failed:', error)
      }
    } finally {
      setIsDownloading(false)
    }
  }, [product, isEligible, onDownload, onSuccess, onError])

  return {
    isDownloading,
    isEligible,
    downloadFreeTrial,
    error
  }
}

/**
 * Default download handler
 * This can be extended to implement actual download logic
 */
const defaultDownloadHandler = async (product: HttpTypes.StoreProduct): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // In a real implementation, this would:
  // 1. Make an API call to generate/retrieve the free trial download
  // 2. Handle the download URL or file
  // 3. Trigger the browser download
  
  console.log(`Free trial download initiated for product: ${product.title}`)
  
  // For now, we'll just log the action
  // In production, you might want to:
  // - Call an API endpoint to generate a download link
  // - Track the download event for analytics
  // - Show a success notification
}
