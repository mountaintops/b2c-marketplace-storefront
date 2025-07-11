# Owned Products API Endpoint

This API endpoint retrieves products owned by the currently authenticated customer based on their purchase history.

## Endpoint

**GET** `/api/owned-products`

## Features

- **Automatic Session Detection**: Uses browser session cookies automatically without requiring manual cookie handling
- **IP-based Security**: Validates requests using IPHub API to detect and block VPN/Tor usage
- **Simple Response**: Returns a clean array of product handle strings
- **Error Handling**: Graceful error handling with appropriate HTTP status codes

## Authentication

The endpoint automatically detects the current user's session from browser cookies (`_medusa_jwt`). No manual authentication headers are required.

## Security

### IP Validation
- Extracts client IP from various proxy headers (x-forwarded-for, x-real-ip, etc.)
- Queries IPHub API to detect VPN/Tor usage
- Blocks requests from VPN/Tor networks with 403 Forbidden

### Session Validation
- Validates JWT token from session cookies
- Verifies customer authentication with Medusa backend
- Returns 401 Unauthorized for invalid/missing sessions

## Response Format

### Success Response (200)
```json
[
  "product-handle-1",
  "product-handle-2",
  "product-handle-3"
]
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

#### 403 Forbidden (VPN/Tor Detected)
```json
{
  "error": "Access denied: VPN/Tor usage detected"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Configuration

### Required Environment Variables

- `MEDUSA_BACKEND_URL`: URL of the Medusa backend
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`: Medusa publishable API key

### Optional Environment Variables

- `IPHUB_API_KEY`: IPHub API key for VPN/Tor detection
  - Get your API key from [IPHub.info](https://iphub.info/)
  - If not configured, VPN/Tor detection will be disabled

## Usage Examples

### JavaScript/TypeScript
```javascript
// Simple fetch request (session cookies are sent automatically)
const response = await fetch('/api/owned-products')
const productHandles = await response.json()

console.log('Owned products:', productHandles)
```

### React Hook
```typescript
import { useEffect, useState } from 'react'

function useOwnedProducts() {
  const [products, setProducts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/owned-products')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return response.json()
      })
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { products, loading, error }
}
```

### cURL
```bash
# Note: You need to include session cookies for authentication
curl -X GET "http://localhost:3000/api/owned-products" \
  -H "Cookie: _medusa_jwt=your_session_token"
```

## How It Works

1. **IP Detection**: Extracts client IP from request headers
2. **VPN/Tor Check**: Queries IPHub API to validate IP legitimacy
3. **Authentication**: Validates session cookie and retrieves customer data
4. **Order Retrieval**: Fetches customer orders from Medusa backend
5. **Product Extraction**: Extracts unique product handles from order items
6. **Response**: Returns sorted array of product handle strings

## Product Ownership Logic

A customer "owns" a product if they have purchased it in any completed order. The system:
- Excludes canceled and draft orders
- Includes all other order statuses (pending, confirmed, fulfilled, etc.)
- Deduplicates products (same product purchased multiple times appears once)
- Returns handles in alphabetical order

## Error Handling

The API handles errors gracefully:
- **Network errors**: Returns 500 with generic error message
- **Authentication errors**: Returns 401 with authentication message
- **VPN/Tor detection**: Returns 403 with access denied message
- **IPHub API errors**: Logs error but allows request to proceed (fail-open)

## Development Notes

- In development mode, environment validation runs on startup
- Local/private IPs bypass VPN/Tor detection
- Comprehensive logging for debugging
- Timeout protection for external API calls (5 seconds)

## Migration from Backend

This endpoint replaces the previous `/store/owned-products` endpoint in the shop backend with:
- Simplified response format (handles only vs full product objects)
- Enhanced security with IP validation
- Better session handling for browser requests
- Improved error handling and logging
