# Debug Commands for S3 Upload Issues

## Check S3 CORS Configuration

```bash
# View current CORS configuration
aws s3api get-bucket-cors --bucket corporate-booking-form-bucket

# Expected output:
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["PUT", "POST", "GET"],
            "AllowedOrigins": [...],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
```

## Check S3 Bucket Permissions

```bash
# Check bucket public access settings
aws s3api get-public-access-block --bucket corporate-booking-form-bucket

# Check bucket policy
aws s3api get-bucket-policy --bucket corporate-booking-form-bucket
```

## Test Presigned URL Manually

```bash
# Get a presigned URL from your Lambda
curl -X POST https://s8uentbcpd.execute-api.ap-southeast-1.amazonaws.com/dev/presign \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.png","fileType":"image/png"}'

# Save the uploadUrl from response, then test upload:
curl -X PUT "<PRESIGNED_URL>" \
  -H "Content-Type: image/png" \
  -T /path/to/test-image.png \
  -v
```

## Check Lambda Logs

```bash
# Stream logs in real-time
aws logs tail /aws/lambda/YOUR_LAMBDA_NAME --follow

# Get recent logs
aws logs tail /aws/lambda/YOUR_LAMBDA_NAME --since 5m
```

## Test CORS from Browser Console

Open browser console (F12) and run:

```javascript
// Test OPTIONS request
fetch('https://corporate-booking-form-bucket.s3.amazonaws.com/test', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5173',
    'Access-Control-Request-Method': 'PUT',
    'Access-Control-Request-Headers': 'content-type'
  }
})
.then(r => {
  console.log('CORS Headers:', {
    'allow-origin': r.headers.get('access-control-allow-origin'),
    'allow-methods': r.headers.get('access-control-allow-methods'),
    'allow-headers': r.headers.get('access-control-allow-headers')
  });
})
.catch(e => console.error('CORS Error:', e));
```

## Common CORS Issues

### Issue 1: AllowedOrigins doesn't match

**Check:** Does your CORS config include `http://localhost:5173`?

```json
"AllowedOrigins": [
    "http://localhost:5173",  // ← Must match exactly
    "https://*"
]
```

### Issue 2: AllowedMethods missing PUT

**Check:** Does CORS include PUT method?

```json
"AllowedMethods": [
    "PUT",  // ← Required for uploads
    "POST",
    "GET"
]
```

### Issue 3: Missing AllowedHeaders

**Check:** Does CORS allow all headers?

```json
"AllowedHeaders": ["*"]  // ← Required for Content-Type
```

### Issue 4: Bucket region mismatch

**Check:** Is bucket in same region as Lambda?

```bash
aws s3api get-bucket-location --bucket corporate-booking-form-bucket
```

Should return: `ap-southeast-1`

## Lambda Environment Check

```bash
# Check Lambda environment variables
aws lambda get-function-configuration \
  --function-name YOUR_LAMBDA_NAME \
  --query 'Environment.Variables'

# Should include:
{
    "S3_BUCKET_NAME": "corporate-booking-form-bucket",
    "DB_HOST": "...",
    ...
}
```

## Verify Presigned URL Format

A valid presigned URL should have:
- ✅ `https://BUCKET.s3.REGION.amazonaws.com/KEY`
- ✅ `?AWSAccessKeyId=...`
- ✅ `&Signature=...`
- ✅ `&Expires=...`

Example:
```
https://corporate-booking-form-bucket.s3.ap-southeast-1.amazonaws.com/receipts/20251226-154047-ac1712a8.png?AWSAccessKeyId=ASIA...&Signature=...&Expires=1766763692
```

## Frontend Debug

Add to `CorporateFormSteps.jsx` before upload:

```javascript
console.log('=== UPLOAD DEBUG ===');
console.log('Upload URL:', uploadUrl);
console.log('File type:', formData.receiptFile.type);
console.log('File size:', formData.receiptFile.size);
console.log('Storage key:', storageKey);

// Check if URL is valid
try {
  const url = new URL(uploadUrl);
  console.log('URL parts:', {
    hostname: url.hostname,
    pathname: url.pathname,
    search: url.searchParams.toString()
  });
} catch (e) {
  console.error('Invalid URL:', e);
}
```

## Watch CloudWatch Logs Live

```bash
# Terminal 1: Watch Lambda logs
aws logs tail /aws/lambda/YOUR_LAMBDA_NAME --follow

# Terminal 2: Test upload in browser
# You'll see logs appear in real-time
```

## Expected Log Flow

When upload works correctly:

1. **Frontend calls /presign**
   ```
   [INFO] Lambda function started
   [INFO] Routing to presign service
   [INFO] Presign service started
   ```

2. **Presign generates URL**
   ```
   [INFO] Generating presigned URL for key: receipts/...
   [INFO] Presigned URL generated successfully
   [INFO] Bucket CORS configuration: {...}
   ```

3. **Frontend uploads to S3**
   ```
   (No Lambda logs - direct to S3)
   ```

4. **Frontend submits application**
   ```
   [INFO] Routing to applications service
   [INFO] Starting database insertion
   [INFO] Lead and partner application submitted
   ```

## If Still Failing

1. **Clear browser cache** completely
2. **Try incognito/private window**
3. **Check browser console** for exact error
4. **Test with curl** (bypasses browser CORS)
5. **Verify S3 bucket exists** in correct region
6. **Check IAM permissions** for Lambda role

## Get Full Error Details

```bash
# Get last error from CloudWatch
aws logs filter-log-events \
  --log-group-name /aws/lambda/YOUR_LAMBDA_NAME \
  --filter-pattern "ERROR" \
  --max-items 1
```
