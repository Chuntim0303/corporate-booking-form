# Next Steps - Fix S3 Upload CORS Issue

## Current Status ✅

**What's Working:**
- ✅ Button scroll-to-top functionality implemented
- ✅ Compact button styling applied
- ✅ Backend restructured to services architecture
- ✅ Presign service generating valid S3 upload URLs
- ✅ Frontend environment configured with API endpoint
- ✅ Lambda routing working correctly (`/presign` and `/applications`)
- ✅ All code committed and pushed to branch `claude/button-fixes-s3-storage-KqruK`

**What Needs Fixing:**
- ❌ S3 bucket CORS configuration blocking browser uploads

## The Problem

When your frontend tries to upload a receipt to S3, the browser blocks it with a CORS error:

```
No 'Access-Control-Allow-Origin' header is present on the requested resource
```

**Why This Happens:**
- Your Lambda is successfully generating presigned URLs ✅
- But the S3 bucket doesn't have CORS rules configured ❌
- So when the browser tries to PUT the file to S3, it gets rejected

## The Solution (Takes 2 Minutes)

### Option 1: Run the Fix Script (Easiest)

I've created an automated script that applies the correct CORS configuration:

```bash
cd backend
./fix-s3-cors.sh
```

**What This Script Does:**
1. Checks current CORS configuration
2. Applies comprehensive CORS rules allowing:
   - Origins: `http://localhost:5173`, `http://localhost:3000`, `http://localhost:5174`, `https://*`
   - Methods: `GET`, `PUT`, `POST`, `DELETE`, `HEAD`
   - Headers: All (`*`)
3. Verifies the configuration was applied
4. Checks bucket region matches Lambda region

**Expected Output:**
```
✅ CORS configuration applied successfully!
✅ CORS verification successful!
✅ Bucket region is correct
```

### Option 2: AWS Console (If You Prefer GUI)

1. Go to https://console.aws.amazon.com/s3/
2. Click on bucket: `corporate-booking-form-bucket`
3. Go to **Permissions** tab
4. Scroll to **Cross-origin resource sharing (CORS)**
5. Click **Edit**
6. Paste the contents of `backend/s3-cors-config.json`
7. Click **Save changes**

## Verification

After applying CORS, verify it's working:

```bash
cd backend
./test-cors.sh
```

**Expected Output:**
```
access-control-allow-origin: http://localhost:5173
access-control-allow-methods: PUT, POST, GET, DELETE, HEAD
access-control-allow-headers: *
```

## Testing the Upload

1. **Clear browser cache**: Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. **Open your app**: http://localhost:5173
3. **Fill out the form** and upload a receipt
4. **Check the browser console**: Should see successful upload
5. **Verify in S3**: Check if file appears in bucket under `receipts/` folder

## Expected Behavior After Fix

### Step 1: User Uploads Receipt
- Frontend calls `/presign` endpoint
- Lambda generates presigned URL
- Frontend receives URL and storage key

### Step 2: Frontend Uploads to S3
- Browser sends PUT request to presigned URL
- **NEW:** S3 responds with CORS headers allowing the upload ✅
- File successfully uploaded to S3

### Step 3: User Submits Form
- Frontend calls `/applications` endpoint with receipt metadata
- Lambda stores application with `receiptStorageKey`, `receiptFileName`, `totalPayable`
- Database record created with S3 reference

## Troubleshooting

### Still Getting CORS Error?

1. **Verify CORS was applied:**
   ```bash
   aws s3api get-bucket-cors --bucket corporate-booking-form-bucket
   ```

2. **Hard refresh browser:**
   - Close all browser tabs
   - Clear cache completely
   - Try in incognito/private window

3. **Check bucket region:**
   ```bash
   aws s3api get-bucket-location --bucket corporate-booking-form-bucket
   ```
   Should return: `ap-southeast-1`

4. **Verify presigned URL format:**
   - Open browser console (F12)
   - Look for presign response
   - URL should contain `?AWSAccessKeyId=...&Signature=...&Expires=...`

### Check Lambda Logs

```bash
# Stream logs in real-time
aws logs tail /aws/lambda/corporate-form-function --follow

# Or get recent logs
aws logs tail /aws/lambda/corporate-form-function --since 5m
```

**What to Look For:**
- `[INFO] Presigned URL generated successfully` - Good! ✅
- `[WARNING] Could not retrieve CORS config` - Expected (Lambda doesn't have GetBucketCORS permission)
- `[ERROR]` - Report if you see any errors

## Files You Can Reference

- **CORS Configuration**: `backend/s3-cors-config.json`
- **Fix Script**: `backend/fix-s3-cors.sh`
- **Test Script**: `backend/test-cors.sh`
- **Detailed Debug Guide**: `DEBUG_S3_UPLOAD.md`
- **CORS Explanation**: `S3_CORS_FIX.md`
- **Architecture Docs**: `ARCHITECTURE.md`

## Quick Command Reference

```bash
# Apply CORS configuration
cd backend && ./fix-s3-cors.sh

# Test CORS is working
./test-cors.sh

# Verify CORS config
aws s3api get-bucket-cors --bucket corporate-booking-form-bucket

# Watch Lambda logs
aws logs tail /aws/lambda/corporate-form-function --follow

# List files in S3 bucket
aws s3 ls s3://corporate-booking-form-bucket/receipts/
```

## Summary

**You're 99% done!** The only remaining step is applying the CORS configuration to your S3 bucket.

**Run this now:**
```bash
cd backend
./fix-s3-cors.sh
```

Then test uploading a receipt in your app. It should work! 🎉

---

**Need Help?**
- Check `DEBUG_S3_UPLOAD.md` for detailed debugging steps
- Review `S3_CORS_FIX.md` for CORS explanation
- Check CloudWatch logs for detailed error messages
