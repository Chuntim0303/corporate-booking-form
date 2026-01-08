# Event Venue Booking Form - Backend Deployment Guide

This guide explains how to deploy the backend with email, PDF generation, and Pxier integration functionality.

## Features Implemented

1. **Email Confirmation**: Sends automated confirmation emails to customers upon booking submission
2. **PDF Generation**: Auto-fills a PDF template with booking details and attaches it to the email
3. **Pxier Integration**: Automatically creates customer records in Pxier CRM when email is not found in database

## Prerequisites

1. AWS Account with the following services configured:
   - Lambda
   - DynamoDB
   - S3
   - SES (Simple Email Service)
   - API Gateway

2. Pxier API credentials (if using Pxier integration)

3. PDF template file for booking forms

## Setup Instructions

### 1. Configure AWS SES

1. Verify your sender email address in AWS SES
2. If in sandbox mode, verify recipient email addresses
3. Request production access for SES if needed

### 2. Create S3 Buckets

Create two S3 buckets:
- **Template Bucket**: Store your PDF template
- **Output Bucket**: Store generated PDFs and uploaded files

Upload your PDF template to the template bucket.

### 3. Create DynamoDB Table

Create a DynamoDB table with:
- Table name: `event-bookings` (or your preferred name)
- Primary key: `bookingId` (String)

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Required for basic functionality
AWS_REGION=ap-southeast-1
BOOKINGS_TABLE=event-bookings

# Required for PDF generation
TEMPLATE_BUCKET=your-template-bucket-name
TEMPLATE_KEY=templates/event-booking-template.pdf
OUTPUT_BUCKET=your-output-bucket-name

# Required for email functionality
SES_SENDER=noreply@yourdomain.com
SES_SENDER_NAME=Confetti KL Events Team
ALERT_EMAIL=admin@yourdomain.com

# Optional: CC addresses for booking notifications
SES_CC_ADDRESSES=admin@yourdomain.com,manager@yourdomain.com

# Optional: Pxier integration
PXIER_ACCESS_TOKEN=your-pxier-access-token
PXIER_USERNAME=your-pxier-username
PXIER_PASSWORD=your-pxier-password
PXIER_PLATFORM_ADDRESS=https://api.pxier.com
```

### 5. Install Dependencies

```bash
cd backend
pip install -r requirements.txt -t .
```

### 6. Deploy Lambda Function

#### Option A: Using AWS SAM

```bash
sam build
sam deploy --guided
```

#### Option B: Manual Deployment

1. Package the Lambda function:
```bash
zip -r function.zip . -x "*.git*" -x "*.env*" -x "README.md"
```

2. Upload to AWS Lambda via Console or CLI

3. Configure Lambda:
   - Runtime: Python 3.9 or later
   - Handler: `lambda_function.lambda_handler`
   - Timeout: 30 seconds (minimum)
   - Memory: 512 MB (recommended)

### 7. Configure Lambda IAM Role

Attach the following policies to your Lambda execution role:

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
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:REGION:ACCOUNT:table/event-bookings"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::your-template-bucket/*",
        "arn:aws:s3:::your-output-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendRawEmail",
        "ses:SendEmail"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

### 8. Configure API Gateway

1. Create a REST API in API Gateway
2. Create resources and methods:
   - `POST /api/bookings` → Lambda function
   - `GET /api/bookings` → Lambda function
   - `GET /api/bookings/{bookingId}` → Lambda function
   - `POST /api/upload-url` → Lambda function

3. Enable CORS for all methods

4. Deploy the API to a stage (e.g., `prod`)

### 9. Update Frontend Configuration

Update the API endpoint in your frontend:

```javascript
// src/services/api.js
const API_BASE_URL = 'https://your-api-id.execute-api.region.amazonaws.com/prod/api'
```

## Testing

### Test Email Functionality

1. Submit a booking with a valid email address
2. Check that:
   - Confirmation email is received
   - PDF is attached to the email
   - Email contains booking details

### Test PDF Generation

1. Check S3 output bucket for generated PDFs
2. Verify PDF contains correct booking information
3. Verify PDF formatting is correct

### Test Pxier Integration

1. Submit a booking with a new email address
2. Check Pxier dashboard for new customer record
3. Verify customer details match booking information

## Troubleshooting

### Email Not Sending

- Verify SES sender email is verified
- Check Lambda logs for email errors
- Ensure SES is out of sandbox mode (for production)

### PDF Generation Fails

- Verify template exists in S3 bucket
- Check template bucket permissions
- Review Lambda logs for PDF generation errors
- Ensure reportlab and pdfrw packages are installed

### Pxier Integration Issues

- Verify Pxier credentials are correct
- Check Pxier API endpoint is accessible
- Review Lambda logs for Pxier API errors
- Ensure requests package is installed

### Lambda Timeout

- Increase Lambda timeout to 30+ seconds
- Increase Lambda memory to 512+ MB
- Check for slow S3 or API calls

## Monitoring

Monitor the following CloudWatch metrics:
- Lambda invocations
- Lambda errors
- Lambda duration
- DynamoDB read/write capacity
- S3 request metrics

Set up CloudWatch alarms for:
- Lambda errors > threshold
- Lambda duration > timeout
- DynamoDB throttling

## Cost Optimization

- Use S3 lifecycle policies to archive old PDFs
- Monitor DynamoDB capacity usage
- Consider Lambda reserved concurrency for predictable workloads
- Review SES sending limits and costs

## Security Best Practices

1. Use AWS Secrets Manager for sensitive credentials
2. Enable encryption at rest for DynamoDB and S3
3. Use VPC for Lambda if accessing private resources
4. Implement API Gateway throttling and rate limiting
5. Enable CloudTrail for audit logging
6. Use least privilege IAM policies

## Support

For issues or questions, contact the development team or refer to:
- AWS Lambda documentation
- AWS SES documentation
- Pxier API documentation
