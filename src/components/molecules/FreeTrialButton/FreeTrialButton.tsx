"use client"

import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { getFreeTrialButtonConfig } from "@/lib/features/free-trial"

interface FreeTrialButtonProps {
  product: HttpTypes.StoreProduct
  className?: string
  onDownload?: (product: HttpTypes.StoreProduct) => void
}

/**
 * Free Trial Download Button Component
 * 
 * This component renders a download button for products that have free trial availability.
 * It integrates with the existing design system and provides a consistent user experience.
 */
export const FreeTrialButton = ({
  product,
  className,
  onDownload
}: FreeTrialButtonProps) => {
  const [isDownloading, setIsDownloading] = useState(false)
  
  // Get the button configuration for this product
  const buttonConfig = getFreeTrialButtonConfig(product)
  
  // Don't render if product is not eligible for free trial
  if (!buttonConfig) {
    return null
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    
    try {
      // Call the custom download handler if provided
      if (onDownload) {
        await onDownload(product)
      } else {
        // Default behavior - could be extended to handle actual download logic
        console.log('Free trial download requested for product:', product.id)
        
        // Simulate download process
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // In a real implementation, this would trigger the actual download
        // For now, we'll just show a success message
        alert(`Free trial for "${product.title}" is ready for download!`)
      }
    } catch (error) {
      console.error('Error downloading free trial:', error)
      alert('Sorry, there was an error downloading the free trial. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      loading={isDownloading}
      className={className || buttonConfig.buttonClassName}
      size="large"
      variant="tonal"
    >
      {isDownloading ? 'Preparing Download...' : buttonConfig.buttonText}
    </Button>
  )
}
