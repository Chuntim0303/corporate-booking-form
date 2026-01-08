# Complete CORS Configuration Fix

## Problem
Payment proof uploads are failing with CORS error even after applying CORS configuration. This is because the CORS configuration is **incomplete** - it's missing:
1. **HEAD method** (required for preflight requests)
2. **ExposeHeaders** (needed for browser to read response headers)

## Which Bucket?
Both payment proofs and generated PDFs are stored in: **`event-venue-bookings`** (OUTPUT_BUCKET)

The TEMPLATE_BUCKET is only used for storing PDF templates (read-only).

## Complete CORS Configuration

You need to apply this **COMPLETE** CORS configuration to the `event-venue-bookings` bucket:

### Option 1: AWS Console (Recommended)

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3)
2. Click on bucket **`event-venue-bookings`**
3. Go to **Permissions** tab
4. Scroll to **Cross-origin resource sharing (CORS)**
5. Click **Edit**
6. **Delete any existing CORS configuration** and paste this COMPLETE configuration:

```json
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

7. Click **Save changes**

### Option 2: AWS CLI

```bash
aws s3api put-bucket-cors \
  --bucket event-venue-bookings \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": [
          "ETag",
          "x-amz-server-side-encryption",
          "x-amz-request-id",
          "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
      }
    ]
  }'
```

### Option 3: Redeploy CloudFormation Stack

The `template.yaml` has been updated with the complete CORS configuration. Redeploy the stack:

```bash
cd backend
sam build
sam deploy
```

## What Was Missing?

Your previous CORS configuration was likely missing:

1. **HEAD method**: Required for browser preflight requests
   ```json
   "AllowedMethods": [..., "HEAD"]  // ← This was missing
   ```

2. **ExposeHeaders**: Allows browser to read S3 response headers
   ```json
   "ExposeHeaders": [  // ← This section was missing
       "ETag",
       "x-amz-server-side-encryption",
       "x-amz-request-id",
       "x-amz-id-2"
   ]
   ```

## Verify the Fix

After applying the complete CORS configuration:

1. Clear your browser cache or use incognito mode
2. Try submitting the booking form with a payment proof file
3. Check browser console - the CORS error should be gone
4. The file should upload successfully
5. You should see: `✓ S3 upload successful`

## Troubleshooting

If it still doesn't work after applying the complete CORS:

### 1. Verify CORS was applied correctly
```bash
aws s3api get-bucket-cors --bucket event-venue-bookings
```

You should see the complete configuration with HEAD method and ExposeHeaders.

### 2. Check if you're using the correct bucket
Look at the browser console error - it should show:
```
https://event-venue-bookings.s3.amazonaws.com/payment-proofs/...
```

If it shows a different bucket name, that's the one that needs CORS.

### 3. Clear browser cache
Sometimes browsers cache CORS preflight responses. Clear cache or use incognito.

### 4. Check CloudWatch logs
The backend logs show the upload URL is being generated correctly. The issue is purely CORS on S3.

## Production Security

For production, replace `"*"` in AllowedOrigins with your specific domains:

```json
"AllowedOrigins": [
    "https://yourdomain.com",
    "http://localhost:3000"
]
```
