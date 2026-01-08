# Fix Deployment Issues

## Current Problems

### ✅ CORS Issue - FIXED
The file upload CORS issue is now resolved. Files are uploading successfully.

### ❌ Issue 1: Wrong Bucket
**Problem:** Payment proofs are uploading to `payment-system-files` instead of `event-venue-bookings`

**Cause:** The deployed Lambda has `OUTPUT_BUCKET` environment variable set to `payment-system-files`

### ❌ Issue 2: DynamoDB Permission Denied
**Problem:** Lambda cannot write to DynamoDB table `event-bookings`

**Error:**
```
User: arn:aws:sts::130799455054:assumed-role/event-venue-booking-form-role-9zgdkcfz/event-venue-booking-form
is not authorized to perform: dynamodb:PutItem
```

**Cause:** Lambda IAM role `event-venue-booking-form-role-9zgdkcfz` lacks DynamoDB permissions

---

## Solution Options

### Option 1: Deploy with CloudFormation (Recommended)

This will automatically fix both issues by creating the proper infrastructure.

#### Step 1: Deploy the Stack
```bash
cd backend
sam build
sam deploy --guided
```

#### Step 2: During deployment, provide:
- **Stack Name:** `event-venue-booking-form` (or your preferred name)
- **AWS Region:** `ap-southeast-1`
- **Confirm changes:** Yes
- **Allow IAM role creation:** Yes
- **Disable rollback:** No

This will:
- ✅ Create/update S3 bucket `event-venue-bookings` with CORS
- ✅ Set `OUTPUT_BUCKET` environment variable correctly
- ✅ Create Lambda with proper DynamoDB permissions
- ✅ Set up API Gateway endpoints

---

### Option 2: Manual Fix (If you can't use CloudFormation)

If you need to keep the current deployment, fix manually:

#### Fix 1: Update Lambda Environment Variables

**AWS Console:**
1. Go to [Lambda Console](https://console.aws.amazon.com/lambda)
2. Click function `event-venue-booking-form`
3. Go to **Configuration** → **Environment variables**
4. Edit and set:
   ```
   OUTPUT_BUCKET = event-venue-bookings
   S3_BUCKET_NAME = event-venue-bookings
   ```
5. Click **Save**

**AWS CLI:**
```bash
aws lambda update-function-configuration \
  --function-name event-venue-booking-form \
  --environment "Variables={
    OUTPUT_BUCKET=event-venue-bookings,
    S3_BUCKET_NAME=event-venue-bookings,
    BOOKINGS_TABLE=event-bookings
  }"
```

#### Fix 2: Add DynamoDB Permissions to Lambda Role

**AWS Console:**
1. Go to [IAM Console](https://console.aws.amazon.com/iam)
2. Click **Roles**
3. Search for `event-venue-booking-form-role-9zgdkcfz`
4. Click **Add permissions** → **Attach policies**
5. Click **Create policy**
6. Use JSON editor and paste:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": "arn:aws:dynamodb:ap-southeast-1:130799455054:table/event-bookings"
        }
    ]
}
```

7. Name it: `DynamoDBEventBookingsAccess`
8. Create policy
9. Go back to the role and attach this new policy

**AWS CLI:**
```bash
# Create the policy
aws iam create-policy \
  --policy-name DynamoDBEventBookingsAccess \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": "arn:aws:dynamodb:ap-southeast-1:130799455054:table/event-bookings"
        }
    ]
}'

# Attach the policy to the role
aws iam attach-role-policy \
  --role-name event-venue-booking-form-role-9zgdkcfz \
  --policy-arn arn:aws:iam::130799455054:policy/DynamoDBEventBookingsAccess
```

#### Fix 3: Add S3 Permissions (if needed)

The role also needs permissions for S3:

**Add this policy to the same role:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::event-venue-bookings",
                "arn:aws:s3:::event-venue-bookings/*"
            ]
        }
    ]
}
```

---

## Verification

After applying either fix, test the booking submission:

### Test 1: Check Environment Variables
```bash
aws lambda get-function-configuration \
  --function-name event-venue-booking-form \
  --query 'Environment.Variables'
```

Should show:
```json
{
    "OUTPUT_BUCKET": "event-venue-bookings",
    "S3_BUCKET_NAME": "event-venue-bookings",
    "BOOKINGS_TABLE": "event-bookings"
}
```

### Test 2: Submit a Booking
1. Go to your booking form
2. Fill in the details
3. Upload a payment proof
4. Submit

**Expected Result:**
- ✅ File uploads to `event-venue-bookings` bucket
- ✅ Booking saved to DynamoDB
- ✅ Success message displayed
- ✅ Confirmation email sent

### Test 3: Check DynamoDB
```bash
aws dynamodb scan \
  --table-name event-bookings \
  --limit 1
```

Should show your booking data.

---

## Which Bucket to Use?

### Current Situation
You have multiple buckets mentioned in the logs:
- `payment-system-files` - Currently being used (wrong)
- `event-venue-bookings` - Should be used (correct)

### Decision Points

**Option A: Use `event-venue-bookings` (Recommended)**
- Already configured in CloudFormation template
- Has CORS configured
- Simpler architecture

**Option B: Use `payment-system-files`**
- If you prefer this bucket, you need to:
  1. Add CORS configuration to `payment-system-files`
  2. Update Lambda S3 permissions to access `payment-system-files`
  3. Update CloudFormation template to use `payment-system-files`

**Recommendation:** Stick with `event-venue-bookings` as configured in the template.

---

## Apply CORS to event-venue-bookings

If you're switching to `event-venue-bookings`, make sure it has CORS:

```bash
aws s3api put-bucket-cors \
  --bucket event-venue-bookings \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'
```

Or use the Python script:
```bash
cd backend
python3 fix_s3_cors.py event-venue-bookings
```

---

## Next Steps

1. **Choose your fix method** (CloudFormation vs Manual)
2. **Apply the fixes** following the steps above
3. **Verify** using the test steps
4. **Update frontend API endpoint** if it changed during CloudFormation deployment
5. **Test end-to-end** booking submission

## Support

If issues persist:
- Check CloudWatch Logs for the Lambda function
- Verify IAM permissions in IAM Console
- Confirm bucket CORS configuration
- Check bucket name in Lambda environment variables
