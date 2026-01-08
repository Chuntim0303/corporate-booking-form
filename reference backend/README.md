# Backend - Event Venue Booking Form

This backend is built using AWS Lambda, API Gateway, DynamoDB, S3, SES, and integrates with Pxier CRM.

## Features

✅ **Email Confirmation**: Automated email notifications with PDF attachments
✅ **PDF Generation**: Auto-fill booking details into PDF templates
✅ **Pxier Integration**: Automatic customer creation in Pxier CRM
✅ **File Upload**: Secure S3 file storage with presigned URLs
✅ **Alert System**: Admin notifications for errors and failures

## Architecture

- **Lambda Function**: Handles all API requests and business logic
- **API Gateway**: REST API endpoints
- **DynamoDB**: Stores booking information
- **S3**: Stores uploaded payment proofs and generated PDFs
- **SES**: Sends confirmation emails with PDF attachments
- **Pxier API**: Creates customer records in CRM

## API Endpoints

### 1. Create Booking
```
POST /api/bookings
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "91234567",
  "nric": "S1234567D",
  "isCompanyEvent": true,
  "position": "Event Manager",
  "companyName": "ABC Corp",
  "industry": "Technology",
  "eventDate": "2024-12-31",
  "eventTime": "06:00 PM",
  "hall": "grand-ballroom",
  "paymentProofUrls": ["https://..."]
}
```

### 2. Get All Bookings
```
GET /api/bookings
```

### 3. Get Booking by ID
```
GET /api/bookings/{bookingId}
```

### 4. Get Upload URL
```
POST /api/upload-url
Content-Type: application/json

{
  "fileName": "payment-proof.jpg",
  "fileType": "image/jpeg"
}
```

## Deployment

### Prerequisites
- AWS CLI configured
- AWS SAM CLI installed
- Python 3.11

### Deploy to AWS

1. Build the application:
```bash
sam build
```

2. Deploy:
```bash
sam deploy --guided
```

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start local API:
```bash
sam local start-api
```

## Environment Variables

### Required
- `BOOKINGS_TABLE`: DynamoDB table name (default: event-bookings)
- `OUTPUT_BUCKET`: S3 bucket for payment proofs and generated PDFs (set by CloudFormation)
- `S3_BUCKET_NAME`: Legacy env var, also points to OUTPUT_BUCKET (set by CloudFormation)

### Optional (for PDF generation)
- `TEMPLATE_BUCKET`: S3 bucket for PDF templates
- `TEMPLATE_KEY`: S3 key for PDF template file

### Email Configuration
- `SES_SENDER`: Verified sender email address
- `SES_SENDER_NAME`: Display name for sender
- `ALERT_EMAIL`: Admin email for error alerts

### Optional
- `SES_CC_ADDRESSES`: Comma-separated CC email addresses
- `PXIER_ACCESS_TOKEN`: Pxier API access token
- `PXIER_USERNAME`: Pxier API username
- `PXIER_PASSWORD`: Pxier API password
- `PXIER_PLATFORM_ADDRESS`: Pxier API endpoint (default: https://api.pxier.com)
- `MAX_FILE_SIZE`: Max upload size in bytes (default: 10485760)
- `ALLOWED_FILE_TYPES`: Comma-separated MIME types

See `.env.example` for complete configuration template.

## File Upload Flow

1. Frontend requests presigned URL from `/api/upload-url`
2. Backend generates presigned S3 URL and returns it
3. Frontend uploads file directly to S3 using presigned URL
4. Frontend submits booking with S3 file URLs

## Booking Flow

1. **User submits booking** → Frontend sends booking data to API
2. **Save to DynamoDB** → Booking record created with unique ID
3. **Generate PDF** → Template filled with booking details
4. **Upload PDF to S3** → Stored in output bucket
5. **Send email** → Confirmation email with PDF attachment sent to customer
6. **Create Pxier customer** → Customer record created in CRM (if configured)
7. **Return response** → Success confirmation sent to frontend

## Service Modules

- **`services/config.py`**: Configuration and environment variables
- **`services/email_service.py`**: Email sending with SES
- **`services/pdf_generator.py`**: PDF template filling
- **`services/pxier_service.py`**: Pxier CRM integration
- **`services/uploads.py`**: S3 file upload handling
- **`services/utils.py`**: Utility functions

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions including:
- AWS service configuration
- IAM permissions setup
- SES verification
- Testing procedures
- Troubleshooting tips

## Security

- CORS enabled for all origins (configure for production)
- S3 bucket has public access blocked
- Files are encrypted at rest (AES256)
- Presigned URLs expire after 1 hour
- SES sender verification required
- Pxier API credentials stored in environment variables
