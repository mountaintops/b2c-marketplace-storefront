/**
 * Free Trial Feature Module
 * 
 * This module provides all the functionality for the free trial feature
 * in a modular, plugin-style architecture that can be easily enabled/disabled.
 */

export { getFreeTrialConfig, DEFAULT_FREE_TRIAL_CONFIG } from './config'
export { hasFreeTrialTag, isProductEligibleForFreeTrial, getFreeTrialButtonConfig } from './utils'
export type { FreeTrialConfig } from './config'
