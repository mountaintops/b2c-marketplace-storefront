# Free Trial Feature Module

This module provides a "Download Free Trial" button functionality for products that have a "Free Trial" tag.

## Features

- **Modular Architecture**: Self-contained module that can be easily enabled/disabled
- **Tag-Based Detection**: Automatically detects products with "Free Trial" tags
- **Configurable**: Easy to customize button text, styling, and behavior
- **Future-Proof**: Designed to minimize conflicts with upstream repository changes

## Configuration

The feature can be configured through environment variables or by modifying the configuration file:

### Environment Variables

- `NEXT_PUBLIC_FREE_TRIAL_ENABLED`: Enable/disable the feature (default: true)
- `NEXT_PUBLIC_FREE_TRIAL_TAG_VALUE`: Tag value to look for (default: "Free Trial")
- `NEXT_PUBLIC_FREE_TRIAL_BUTTON_TEXT`: Button text (default: "Download Free Trial")

### Configuration File

Edit `src/lib/features/free-trial/config.ts` to modify default settings:

```typescript
export const DEFAULT_FREE_TRIAL_CONFIG: FreeTrialConfig = {
  enabled: true,
  tagValue: 'Free Trial',
  buttonText: 'Download Free Trial',
  buttonClassName: 'w-full uppercase mb-2 py-3 flex justify-center',
  position: 'below'
}
```

## Usage

The feature automatically integrates with the product details page. When a product has a "Free Trial" tag, the download button will appear below the "Add to Cart" button.

## Customization

### Custom Download Handler

You can provide a custom download handler to the `FreeTrialButton` component:

```typescript
const handleCustomDownload = async (product: HttpTypes.StoreProduct) => {
  // Your custom download logic here
  console.log('Custom download for:', product.title)
}

<FreeTrialButton 
  product={product}
  onDownload={handleCustomDownload}
/>
```

### Using the Hook

For more advanced use cases, you can use the `useFreeTrialDownload` hook directly:

```typescript
import { useFreeTrialDownload } from '@/hooks/useFreeTrialDownload'

const { isDownloading, isEligible, downloadFreeTrial } = useFreeTrialDownload(product, {
  onSuccess: (product) => console.log('Download successful'),
  onError: (error) => console.error('Download failed:', error)
})
```

## Disabling the Feature

To disable the feature entirely:

1. Set `NEXT_PUBLIC_FREE_TRIAL_ENABLED=false` in your environment variables, or
2. Modify the `enabled` property in the configuration file to `false`

## File Structure

```
src/lib/features/free-trial/
├── config.ts          # Configuration and settings
├── utils.ts           # Utility functions for tag detection
├── index.ts           # Module exports
└── README.md          # This documentation

src/components/molecules/FreeTrialButton/
├── FreeTrialButton.tsx # Main button component
└── index.ts           # Component export

src/hooks/
└── useFreeTrialDownload.ts # React hook for download logic
```

## Integration Points

The feature integrates with the existing codebase at these points:

1. **ProductDetailsHeader**: Conditionally renders the free trial button
2. **Product Tags**: Uses existing tag system for detection
3. **Design System**: Integrates with existing Button component and styling

## Future Enhancements

This module is designed to be easily extensible. Potential enhancements include:

- Integration with actual download APIs
- Analytics tracking for download events
- User authentication checks
- Download limits and restrictions
- Custom styling per product category
