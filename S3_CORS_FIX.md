# S3 CORS Configuration Fix

## Problem
CORS error when uploading files to S3:
```
Access-Control-Allow-Origin header is present on the requested resource
```

## Solution

### Option 1: AWS Console (Easiest)

1. **Go to S3 Console**: https://console.aws.amazon.com/s3/
2. **Click on your bucket**: `corporate-booking-form-bucket`
3. **Go to Permissions tab**
4. **Scroll to "Cross-origin resource sharing (CORS)"**
5. **Click Edit**
6. **Paste this configuration**:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT",
            "POST",
            "GET"
        ],
        "AllowedOrigins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "https://*"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

7. **Click Save changes**

### Option 2: AWS CLI (Fastest)

```bash
# Navigate to backend folder
cd backend

# Apply CORS configuration
aws s3api put-bucket-cors \
  --bucket corporate-booking-form-bucket \
  --cors-configuration file://s3-cors-config.json
```

### Option 3: Verify Current CORS

Check if CORS is already configured:

```bash
aws s3api get-bucket-cors --bucket corporate-booking-form-bucket
```

If you get "NoSuchCORSConfiguration" error, CORS is not set up yet.

## What This CORS Config Does

- **AllowedMethods**: Permits PUT (upload), POST, and GET requests
- **AllowedOrigins**:
  - `http://localhost:5173` - Your Vite dev server
  - `http://localhost:3000` - Alternative dev port
  - `https://*` - Any HTTPS domain (for production)
- **AllowedHeaders**: Allows all headers (needed for file uploads)
- **ExposeHeaders**: Allows browser to read ETag (useful for verification)
- **MaxAgeSeconds**: Browser caches preflight for 50 minutes

## Security Note

For production, replace `https://*` with your specific domain:

```json
"AllowedOrigins": [
    "https://yourdomain.com",
    "https://www.yourdomain.com"
]
```

## Testing After Fix

1. Apply the CORS configuration
2. **No need to restart anything** - CORS takes effect immediately
3. Try uploading a file again in your app
4. Upload should work! ✅

## Troubleshooting

### Still getting CORS error?

1. **Clear browser cache** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. **Check CORS is applied**:
   ```bash
   aws s3api get-bucket-cors --bucket corporate-booking-form-bucket
   ```
3. **Verify bucket name** in presign service matches actual bucket
4. **Check bucket region** matches Lambda region (ap-southeast-1)

### Wrong bucket name error?

If Lambda environment variable has different bucket name:

```bash
# Update Lambda environment variable
aws lambda update-function-configuration \
  --function-name YOUR_LAMBDA_NAME \
  --environment Variables="{S3_BUCKET_NAME=corporate-booking-form-bucket,DB_HOST=...,DB_USER=...,DB_PASSWORD=...,DB_NAME=...}"
```

### Different origin in production?

Update CORS to include your production URL:

```json
"AllowedOrigins": [
    "http://localhost:5173",
    "https://yourapp.com",
    "https://www.yourapp.com"
]
```

## Verification

After applying CORS, test with curl:

```bash
# Test preflight (OPTIONS request)
curl -X OPTIONS https://corporate-booking-form-bucket.s3.amazonaws.com \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: PUT" \
  -v
```

You should see:
```
< access-control-allow-origin: http://localhost:5173
< access-control-allow-methods: PUT, POST, GET
```

## Quick Summary

**What's working:**
- ✅ Presign Lambda generating URLs
- ✅ Frontend calling /presign endpoint
- ✅ Getting valid presigned URL back

**What's not working:**
- ❌ S3 bucket rejecting browser upload (CORS)

**Fix:**
- Add CORS config to S3 bucket (takes 30 seconds)

**Then:**
- ✅ Uploads will work!
