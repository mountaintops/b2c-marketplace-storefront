/**
 * Free Trial Feature Configuration
 * 
 * This module provides configuration for the free trial feature,
 * allowing easy enable/disable functionality and future extensibility.
 */

export interface FreeTrialConfig {
  /** Whether the free trial feature is enabled */
  enabled: boolean
  /** The tag value that identifies products with free trials */
  tagValue: string
  /** Button text for the free trial download */
  buttonText: string
  /** Additional CSS classes for the button */
  buttonClassName?: string
  /** Whether to show the button below or above the add to cart button */
  position: 'above' | 'below'
}

/**
 * Default configuration for the free trial feature
 */
export const DEFAULT_FREE_TRIAL_CONFIG: FreeTrialConfig = {
  enabled: true,
  tagValue: 'Free Trial',
  buttonText: 'Download Free Trial',
  buttonClassName: 'w-full uppercase mb-2 py-3 flex justify-center',
  position: 'below'
}

/**
 * Get the current free trial configuration
 * This can be extended to read from environment variables or external config
 */
export const getFreeTrialConfig = (): FreeTrialConfig => {
  // In the future, this could read from environment variables or a config service
  return {
    ...DEFAULT_FREE_TRIAL_CONFIG,
    // Override with environment variables if needed
    enabled: process.env.NEXT_PUBLIC_FREE_TRIAL_ENABLED !== 'false',
    tagValue: process.env.NEXT_PUBLIC_FREE_TRIAL_TAG_VALUE || DEFAULT_FREE_TRIAL_CONFIG.tagValue,
    buttonText: process.env.NEXT_PUBLIC_FREE_TRIAL_BUTTON_TEXT || DEFAULT_FREE_TRIAL_CONFIG.buttonText,
  }
}
