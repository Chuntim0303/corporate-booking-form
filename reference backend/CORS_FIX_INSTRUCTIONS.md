# S3 CORS Configuration Fix

## Problem Summary

The submission is failing because the **S3 bucket `event-venue-bookings` is missing CORS configuration**.

### What the Logs Show

✅ **Working correctly:**
- Lambda function receives upload URL request
- Presigned URL is generated successfully
- URL contains valid AWS signature parameters

❌ **Failing:**
- Browser cannot upload file to S3 presigned URL
- CORS error: "No 'Access-Control-Allow-Origin' header is present"

### Root Cause

When the browser tries to PUT a file to the S3 presigned URL, S3 performs a CORS check. Without CORS configuration, S3 rejects the request with a CORS error.

## The Fix

### Option 1: Run Python Script (Recommended)

```bash
cd backend
python fix_s3_cors.py
```

This will automatically configure CORS on the S3 bucket.

### Option 2: AWS Console (Manual)

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/s3/buckets)
2. Click on bucket `event-venue-bookings`
3. Go to **Permissions** tab
4. Scroll to **Cross-origin resource sharing (CORS)**
5. Click **Edit**
6. Paste this configuration:

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

### Option 3: AWS CLI

```bash
aws s3api put-bucket-cors \
  --bucket event-venue-bookings \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'
```

## Why This Configuration Works

- **AllowedOrigins: ["*"]** - Allows uploads from any domain (including localhost:3000)
- **AllowedMethods: ["PUT"]** - Required for presigned URL uploads
- **AllowedHeaders: ["*"]** - Allows Content-Type and other headers
- **ExposeHeaders** - Allows browser to read response headers

## Production Security Note

For production, replace `"AllowedOrigins": ["*"]` with your specific domain:

```json
"AllowedOrigins": ["https://yourdomain.com"]
```

## Verify the Fix

After applying CORS configuration:

1. Try submitting the booking form with a payment proof file
2. Check browser console - CORS error should be gone
3. File should upload successfully to S3
4. Booking should complete successfully

## Additional Lambda Role Permissions (Optional)

To enable full S3 diagnostics in CloudWatch logs, add these permissions to the Lambda role:

```json
{
    "Effect": "Allow",
    "Action": [
        "s3:GetBucketCORS",
        "s3:GetBucketLocation",
        "s3:GetBucketPolicy"
    ],
    "Resource": "arn:aws:s3:::event-venue-bookings"
}
```

This is optional - the presigned URLs work without these permissions.
