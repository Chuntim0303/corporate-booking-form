# API Routes Documentation

This document lists all API endpoints used in the Corporate Booking Form application.

---

## Current Production Routes

### 1. **Submit Partnership Application**

**Endpoint:** `POST https://s8uentbcpd.execute-api.ap-southeast-1.amazonaws.com/dev/applications`

**Purpose:** Submit a corporate partnership application with all form data

**Location:** `src/components/CorporateFormSteps.jsx:412`

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
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

**Response (Success - 200):**
```json
{
  "message": "Application submitted successfully",
  "leadId": number,
  "applicationId": number
}
```

**Response (Error - 400/500):**
```json
{
  "error": "Error message description"
}
```

**Backend Handler:** `backend/lambda_function.py::lambda_handler`

**Database Operations:**
- Inserts into `leads` table
- Inserts into `partner_applications` table

---

## Planned Routes (Requires Setup)

### 2. **Generate S3 Presigned URL**

**Endpoint:** `POST [VITE_RECEIPT_PRESIGN_URL]`
- **Status:** ⚠️ Not yet configured (placeholder only)
- **Setup Required:** Deploy `backend/presign_lambda.py`

**Purpose:** Generate a presigned URL for uploading receipt files to S3

**Location:** `src/components/CorporateFormSteps.jsx:236`

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "fileName": "string",
  "fileType": "string"
}
```

**Response (Success - 200):**
```json
{
  "uploadUrl": "string (presigned S3 URL)",
  "key": "string (S3 object key)",
  "bucket": "string (S3 bucket name)"
}
```

**Response (Error - 400/500):**
```json
{
  "error": "Error message description"
}
```

**Backend Handler:** `backend/presign_lambda.py::lambda_handler`

**Configuration:**
- Environment Variable: `S3_BUCKET_NAME`
- IAM Permissions: `s3:PutObject`, `s3:PutObjectAcl`

---

## S3 Direct Upload (After Presign)

### 3. **Upload Receipt to S3**

**Endpoint:** `PUT [Presigned S3 URL from endpoint #2]`

**Purpose:** Upload the receipt file directly to S3 using the presigned URL

**Location:** `src/components/CorporateFormSteps.jsx:256`

**Request Headers:**
```json
{
  "Content-Type": "application/pdf | image/jpeg | image/png | ..."
}
```

**Request Body:** Raw file binary data

**Response (Success - 200):** Empty body

**Response (Error - 403/404/500):** S3 error

---

## API Flow Diagram

```
User Submits Form
       |
       v
[Step 3: Receipt Upload]
       |
       |-- 1. Frontend calls Presign API (Endpoint #2)
       |         |
       |         v
       |   Lambda generates presigned URL
       |         |
       |         v
       |   Returns: { uploadUrl, key, bucket }
       |
       |-- 2. Frontend uploads file to S3 (Endpoint #3)
       |         |
       |         v
       |   File stored in S3 bucket
       |
       |-- 3. Frontend stores S3 key in formData
       |
       v
[Step 4: Submit Application]
       |
       v
Frontend calls Submit API (Endpoint #1)
       |
       v
Lambda stores application + receipt metadata in DB
       |
       v
Response: Success or Error
```

---

## Environment Variables

### Frontend (.env)
```bash
# Required for receipt upload functionality
VITE_RECEIPT_PRESIGN_URL=https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com/prod/presign
```

### Backend (Lambda Environment)

**Main Application Lambda:**
- `DB_HOST` - MySQL database host
- `DB_PORT` - MySQL database port (default: 3306)
- `DB_USER` - MySQL database username
- `DB_PASSWORD` - MySQL database password
- `DB_NAME` - MySQL database name

**Presign Lambda:**
- `S3_BUCKET_NAME` - S3 bucket for receipt storage

---

## Deployment Status

| Endpoint | Status | URL | Handler |
|----------|--------|-----|---------|
| Submit Application | ✅ Deployed | `https://s8uentbcpd.execute-api.ap-southeast-1.amazonaws.com/dev/applications` | `lambda_function.py` |
| Generate Presign URL | ⚠️ Not Deployed | TBD | `presign_lambda.py` |
| S3 Upload | ⚠️ Depends on Presign | TBD | AWS S3 |

---

## Setup Instructions

### To Deploy Presign Lambda (Endpoint #2)

Follow the complete guide in `backend/README_S3_SETUP.md`

**Quick Steps:**
1. Create S3 bucket
2. Deploy Lambda function from `backend/presign_lambda.py`
3. Create API Gateway endpoint
4. Update `.env` with the API Gateway URL
5. Test the upload flow

### To Test Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Note: Receipt upload will show error until presign Lambda is deployed
# All other features work without S3 setup
```

---

## Error Handling

### Common Errors

1. **"Receipt upload is not configured"**
   - **Cause:** `VITE_RECEIPT_PRESIGN_URL` not set
   - **Solution:** Set environment variable in `.env`

2. **"Failed to get upload URL"**
   - **Cause:** Presign Lambda not deployed or misconfigured
   - **Solution:** Check Lambda deployment and API Gateway

3. **"Failed to upload receipt"**
   - **Cause:** S3 bucket permissions or CORS issues
   - **Solution:** Check S3 bucket CORS configuration

4. **"Missing required fields"**
   - **Cause:** Frontend sending incomplete data
   - **Solution:** Verify all required fields are filled

---

## API Versioning

**Current Version:** v1 (dev stage)

**Migration Path:**
- `dev` → Current development environment
- `staging` → (Not yet created) For QA testing
- `prod` → (Not yet created) Production environment

---

## CORS Configuration

All API endpoints support:
- **Origins:** `*` (Currently open, should be restricted in production)
- **Methods:** `POST, OPTIONS`
- **Headers:** `Content-Type, Authorization`

**Production Recommendation:** Restrict origins to your domain only.

---

## Rate Limiting

**Current Status:** No rate limiting configured

**Recommendation:** Implement AWS API Gateway throttling:
- Rate: 10 requests/second
- Burst: 20 requests

---

## Monitoring & Logging

**CloudWatch Logs:**
- Main Lambda: `/aws/lambda/[function-name]`
- Presign Lambda: `/aws/lambda/ConfettiReceiptPresign`

**Metrics to Monitor:**
- API Gateway 4xx/5xx errors
- Lambda execution duration
- S3 upload success rate
- Database connection errors

---

## Security Considerations

1. **API Authentication:** None currently (should add API keys)
2. **File Upload Validation:** Limited (only client-side)
3. **SQL Injection:** Protected via parameterized queries
4. **CORS:** Wide open (should restrict origins)
5. **Rate Limiting:** Not implemented

**Next Steps for Production:**
- [ ] Add API Gateway API keys
- [ ] Implement request signing
- [ ] Add file size/type validation in Lambda
- [ ] Restrict CORS origins
- [ ] Enable AWS WAF
- [ ] Add CloudWatch alarms

---

## Support

For issues or questions:
1. Check `backend/README_S3_SETUP.md` for setup help
2. Review CloudWatch logs for errors
3. Verify environment variables are set correctly
4. Test API endpoints using Postman or curl

**Example curl test:**
```bash
# Test presign endpoint
curl -X POST https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com/prod/presign \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","fileType":"application/pdf"}'
```
