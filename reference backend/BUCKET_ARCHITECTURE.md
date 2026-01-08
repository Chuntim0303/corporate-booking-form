# S3 Bucket Architecture

## Overview

The application uses S3 buckets for storing files. After the latest update, **all user-uploaded and generated files are stored in a single OUTPUT_BUCKET** for simplicity and better organization.

## Bucket Configuration

### OUTPUT_BUCKET (`event-venue-bookings`)
**Primary bucket for all file storage**

**Used for:**
1. **Payment proof uploads** - User-submitted payment receipt images/PDFs
2. **Generated PDFs** - System-generated booking confirmation PDFs

**Managed by:** CloudFormation (BookingsBucket resource in template.yaml)

**CORS Configuration:** ✅ Enabled (required for browser uploads)

**Folder Structure:**
```
event-venue-bookings/
├── payment-proofs/
│   └── {timestamp}_{uuid}.{ext}          # User uploaded payment proofs
└── event-bookings/
    └── pdfs/
        └── {bookingId}_{name}_{date}.pdf # Generated booking PDFs
```

**Access Patterns:**
- **Browser → S3** (via presigned URLs for payment proof uploads)
- **Lambda → S3** (direct writes for generated PDFs)

**Environment Variables:**
- `OUTPUT_BUCKET` - Set by CloudFormation to `event-venue-bookings`
- `S3_BUCKET_NAME` - Also set to `event-venue-bookings` (legacy support)

---

### TEMPLATE_BUCKET (optional)
**Stores PDF templates for generating filled booking forms**

**Used for:**
- PDF template files (blank forms to be filled with booking data)

**Managed by:** Manual setup (environment variable only)

**CORS Configuration:** ❌ Not needed (Lambda-only access)

**Example:**
```
your-template-bucket/
└── templates/
    └── event-booking-template.pdf
```

**Access Pattern:**
- **Lambda → S3** (read-only)

**Environment Variables:**
- `TEMPLATE_BUCKET` - Set manually
- `TEMPLATE_KEY` - Path to template (e.g., `templates/event-booking-template.pdf`)

---

## Changes Made

### Before
```
S3_BUCKET_NAME (event-venue-bookings) → Payment proof uploads
OUTPUT_BUCKET (separate bucket)       → Generated PDFs
TEMPLATE_BUCKET (separate bucket)     → PDF templates
```

### After (Current)
```
OUTPUT_BUCKET (event-venue-bookings)  → Payment proofs + Generated PDFs
TEMPLATE_BUCKET (separate bucket)     → PDF templates
S3_BUCKET_NAME (legacy)               → Points to same as OUTPUT_BUCKET
```

## Why This Change?

**Benefits:**
1. **Simpler architecture** - One bucket for all booking-related files
2. **Single CORS configuration** - Only need CORS on one bucket
3. **Better organization** - All booking files in one place
4. **Cost effective** - Fewer buckets to manage
5. **Consistent permissions** - Lambda needs access to only one main bucket

## Code Implementation

### Upload Service (services/uploads.py)
```python
# Uses OUTPUT_BUCKET for payment proof uploads
BUCKET_NAME = os.environ.get('OUTPUT_BUCKET',
                             os.environ.get('S3_BUCKET_NAME', 'event-venue-bookings'))
```

### Lambda Function (lambda_function.py)
```python
# Generated PDFs also use OUTPUT_BUCKET
s3.put_object(
    Bucket=OUTPUT_BUCKET,
    Key=pdf_s3_key,
    Body=pdf_bytes,
    ContentType='application/pdf'
)
```

## CloudFormation Configuration

The CloudFormation template creates the OUTPUT_BUCKET with:
- CORS enabled (for browser uploads)
- Public access blocked (secure)
- Server-side encryption
- Proper IAM permissions for Lambda

```yaml
Environment:
  Variables:
    OUTPUT_BUCKET: !Ref BookingsBucket  # event-venue-bookings
    S3_BUCKET_NAME: !Ref BookingsBucket # Legacy support
```

## Deployment

When deploying the stack:

```bash
cd backend
sam build
sam deploy
```

The CloudFormation stack will:
1. Create `event-venue-bookings` bucket
2. Configure CORS automatically
3. Set OUTPUT_BUCKET and S3_BUCKET_NAME environment variables
4. Grant Lambda permissions to read/write

## Security

### Public Access
**Blocked** - No public access to bucket objects

### Access Methods
1. **Presigned URLs** - Temporary, secure URLs for uploads (expires in 1 hour)
2. **Lambda IAM Role** - Direct access for Lambda functions only

### CORS Policy
- Allows uploads from any origin (change in production)
- Restricts to specific HTTP methods (GET, PUT, POST, DELETE, HEAD)
- Short cache time (3000 seconds)

## Production Recommendations

1. **Update CORS origins** to specific domains:
   ```json
   "AllowedOrigins": ["https://yourdomain.com"]
   ```

2. **Add lifecycle policies** to archive old files:
   ```yaml
   LifecycleConfiguration:
     Rules:
       - Id: ArchiveOldPaymentProofs
         Status: Enabled
         Transitions:
           - TransitionInDays: 90
             StorageClass: GLACIER
   ```

3. **Enable versioning** for audit trail:
   ```yaml
   VersioningConfiguration:
     Status: Enabled
   ```

4. **Set up CloudWatch alarms** for bucket metrics

## Troubleshooting

### Payment proof uploads fail with CORS error
- Verify CORS is configured on `event-venue-bookings`
- Check OUTPUT_BUCKET environment variable is set
- See CORS_FIX_COMPLETE.md for detailed fix

### Generated PDFs not saving
- Verify OUTPUT_BUCKET environment variable is set
- Check Lambda has S3 write permissions
- Review CloudWatch logs for errors

### File not found errors
- Check file is in correct folder (payment-proofs/ or event-bookings/pdfs/)
- Verify bucket name matches OUTPUT_BUCKET value
- Confirm file key format is correct
