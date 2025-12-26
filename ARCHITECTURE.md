# Backend Architecture

## Overview

The backend uses a **single Lambda function** with internal routing to handle all API requests. This simplifies deployment and management compared to having separate Lambda functions for each service.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                             │
│                 (Single Endpoint Configuration)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MAIN LAMBDA HANDLER                        │
│                    (lambda_function.py)                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────┐           │
│  │          Path-Based Router                      │           │
│  ├─────────────────────────────────────────────────┤           │
│  │  POST /presign      → handle_presign_route()    │           │
│  │  POST /applications → handle_application_route()│           │
│  │  OPTIONS /*         → CORS preflight            │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│                              │                                  │
│           ┌──────────────────┴──────────────────┐              │
│           ▼                                     ▼              │
│  ┌────────────────────┐              ┌──────────────────────┐ │
│  │  Presign Service   │              │ Application Service  │ │
│  │  (services/)       │              │ (inline)             │ │
│  ├────────────────────┤              ├──────────────────────┤ │
│  │ • Generate S3 URL  │              │ • Validate data      │ │
│  │ • Create storage   │              │ • Insert to DB       │ │
│  │   key              │              │ • Return IDs         │ │
│  └────────────────────┘              └──────────────────────┘ │
│           │                                     │              │
└───────────┼─────────────────────────────────────┼──────────────┘
            ▼                                     ▼
    ┌──────────────┐                    ┌──────────────┐
    │   AWS S3     │                    │   MySQL DB   │
    │   Bucket     │                    │   Database   │
    └──────────────┘                    └──────────────┘
```

## Directory Structure

```
backend/
├── lambda_function.py          # Main Lambda handler with routing
├── config.py                   # Configuration management
├── database.py                 # Database utilities (optional)
├── requirements.txt            # Python dependencies
├── database_migration.sql      # DB schema updates
├── README_S3_SETUP.md         # S3 setup guide
└── services/                   # Service modules
    ├── __init__.py
    └── presign_service.py     # S3 presigned URL generation
```

## API Routes

### Base URL
```
https://s8uentbcpd.execute-api.ap-southeast-1.amazonaws.com/dev
```

### Endpoints

#### 1. Submit Partnership Application
```http
POST /applications
Content-Type: application/json

{
  "firstName": "string",
  "lastName": "string",
  "position": "string",
  "email": "string",
  "countryCode": "string",
  "phone": "string",
  "nric": "string",
  "companyName": "string",
  "industry": "string",
  "partnershipTier": "string",
  "totalPayable": number,
  "receiptStorageKey": "string",
  "receiptFileName": "string",
  "termsAccepted": boolean
}
```

**Response:**
```json
{
  "message": "Application submitted successfully",
  "leadId": 123,
  "applicationId": 456
}
```

#### 2. Generate S3 Presigned URL
```http
POST /presign
Content-Type: application/json

{
  "fileName": "receipt.pdf",
  "fileType": "application/pdf"
}
```

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "key": "receipts/20251226-abc123.pdf",
  "bucket": "confetti-receipts"
}
```

#### 3. CORS Preflight
```http
OPTIONS /*
```

**Response:**
```json
{
  "message": "CORS preflight successful"
}
```

## Routing Logic

The `lambda_handler()` function inspects the incoming `event` object and routes requests based on the `path` parameter:

```python
path = event.get('path', event.get('resource', ''))

if '/presign' in path:
    return handle_presign_route(event, headers)
elif '/applications' in path:
    return handle_application_route(event, headers)
else:
    return 404
```

## Service Pattern

Services are modular functions that:
1. Accept parsed request data
2. Perform business logic
3. Return structured response dict

Example service signature:
```python
def handle_presign_request(body: dict) -> dict:
    """
    Args:
        body: Parsed request body

    Returns:
        {
            'statusCode': 200,
            'uploadUrl': '...',
            'key': '...',
            'bucket': '...'
        }
        OR
        {
            'statusCode': 400,
            'error': 'Error message'
        }
    """
```

## Benefits of This Architecture

### ✅ Simplified Deployment
- Single Lambda function to deploy
- One API Gateway configuration
- Fewer moving parts to manage

### ✅ Easier Development
- All code in one repository
- Shared utilities and imports
- Centralized error handling

### ✅ Cost Effective
- Fewer Lambda functions = lower costs
- Single API Gateway = reduced API costs
- Shared cold start overhead

### ✅ Centralized Routing
- Single place to add CORS
- Consistent logging
- Unified authentication (future)

### ✅ Scalable
- Easy to add new services
- Services can be extracted later if needed
- Maintains modularity with services/ folder

## Environment Variables

### Lambda Environment

```bash
# Database Configuration
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name

# S3 Configuration (for presign service)
S3_BUCKET_NAME=confetti-receipts-production
```

### Frontend Environment

```bash
# Receipt upload endpoint
VITE_RECEIPT_PRESIGN_URL=https://s8uentbcpd.execute-api.ap-southeast-1.amazonaws.com/dev/presign
```

## Deployment

### Deploy Lambda

```bash
cd backend

# Install dependencies
pip install -r requirements.txt -t ./package

# Package Lambda
cd package
zip -r ../lambda.zip .
cd ..
zip -g lambda.zip lambda_function.py
zip -gr lambda.zip services/

# Update Lambda
aws lambda update-function-code \
  --function-name CorporatePartnershipAPI \
  --zip-file fileb://lambda.zip
```

### Configure API Gateway

The API Gateway should have a catch-all route that forwards all paths to the Lambda:

```
Resource: /{proxy+}
Method: ANY
Integration: Lambda Function
```

This allows the Lambda to handle routing internally.

## Error Handling

All routes follow a consistent error response format:

```json
{
  "error": "Error message description"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found (unknown path)
- `500` - Internal Server Error
- `503` - Service Unavailable (service not configured)

## Logging

Structured logging with context:

```python
logger.info("Message", extra={
    'key': 'value',
    'path': path,
    'request_id': request_id
})
```

All logs are sent to CloudWatch Logs:
```
/aws/lambda/CorporatePartnershipAPI
```

## Future Enhancements

### Potential Additions

1. **Authentication Service**
   ```python
   # services/auth_service.py
   def verify_api_key(headers: dict) -> bool:
       ...
   ```

2. **Notification Service**
   ```python
   # services/notification_service.py
   def send_confirmation_email(data: dict) -> dict:
       ...
   ```

3. **Analytics Service**
   ```python
   # services/analytics_service.py
   def track_application(data: dict) -> dict:
       ...
   ```

### Migration Path (If Needed)

If traffic grows significantly, services can be extracted:

1. Keep the routing in main Lambda
2. Extract service to separate Lambda
3. Main Lambda invokes service Lambda
4. Update routing logic

This architecture makes that transition smooth.

## Testing

### Test Routing

```bash
# Test presign endpoint
curl -X POST https://.../dev/presign \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"application/pdf"}'

# Test applications endpoint
curl -X POST https://.../dev/applications \
  -H "Content-Type: application/json" \
  -d '{...full application data...}'
```

### Test Locally

```python
# Test event for presign
event = {
    'httpMethod': 'POST',
    'path': '/dev/presign',
    'body': '{"fileName":"test.pdf","fileType":"application/pdf"}'
}

# Test event for application
event = {
    'httpMethod': 'POST',
    'path': '/dev/applications',
    'body': '{...application json...}'
}

# Invoke
lambda_handler(event, None)
```

## Monitoring

### CloudWatch Metrics

- **Invocations**: Total requests
- **Errors**: Failed requests
- **Duration**: Response time
- **Throttles**: Rate limiting hits

### Custom Metrics

Add custom metrics for:
- Requests per route
- S3 upload success rate
- Database insertion time
- Error rates by type

### Alarms

Set up alarms for:
- Error rate > 5%
- Duration > 3000ms
- Throttles > 0

## Security Considerations

### Current State
- ✅ CORS enabled for all origins
- ✅ Input validation
- ✅ Parameterized SQL queries
- ❌ No authentication (public API)
- ❌ No rate limiting

### Recommended Improvements
1. Add API key authentication
2. Implement rate limiting (API Gateway)
3. Restrict CORS to specific origins
4. Add request signing
5. Enable AWS WAF

## Comparison: Single vs Multiple Lambdas

| Aspect | Single Lambda (Current) | Multiple Lambdas |
|--------|------------------------|------------------|
| Deployment | 1 function to deploy | N functions to deploy |
| API Gateway | 1 endpoint config | N endpoint configs |
| Cold Starts | Shared overhead | Separate overheads |
| Code Reuse | Easy (imports) | Harder (layers/packages) |
| Monitoring | Single log group | Multiple log groups |
| Cost | Lower | Higher |
| Scalability | Good for small/medium | Better for large scale |
| Isolation | Lower | Higher |

## Conclusion

This architecture strikes a balance between:
- **Simplicity** - Easy to deploy and manage
- **Modularity** - Services are separated logically
- **Scalability** - Can handle growth and be refactored if needed
- **Cost** - Minimizes AWS costs while maintaining flexibility

Perfect for a corporate partnership application that needs to be production-ready quickly while remaining maintainable and cost-effective.
