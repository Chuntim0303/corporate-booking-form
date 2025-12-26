# S3 Receipt Upload Setup Guide

This guide explains how to set up S3 for receipt uploads in the corporate booking application.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Access to AWS Lambda and API Gateway

## Step 1: Create S3 Bucket

1. Create an S3 bucket for storing receipts:
```bash
aws s3api create-bucket \
  --bucket confetti-receipts-production \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1
```

2. Enable versioning (optional but recommended):
```bash
aws s3api put-bucket-versioning \
  --bucket confetti-receipts-production \
  --versioning-configuration Status=Enabled
```

3. Configure CORS for the bucket:
```bash
aws s3api put-bucket-cors \
  --bucket confetti-receipts-production \
  --cors-configuration file://s3-cors-config.json
```

Create `s3-cors-config.json`:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["PUT", "POST", "GET"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

4. Set bucket lifecycle policy to delete old receipts (optional):
```bash
aws s3api put-bucket-lifecycle-configuration \
  --bucket confetti-receipts-production \
  --lifecycle-configuration file://s3-lifecycle-config.json
```

Create `s3-lifecycle-config.json`:
```json
{
  "Rules": [
    {
      "Id": "DeleteOldReceipts",
      "Status": "Enabled",
      "Prefix": "receipts/",
      "Expiration": {
        "Days": 730
      }
    }
  ]
}
```

## Step 2: Deploy Presign Lambda Function

1. Create a deployment package:
```bash
cd backend
pip install boto3 -t ./package
cd package
zip -r ../presign_lambda.zip .
cd ..
zip -g presign_lambda.zip presign_lambda.py
```

2. Create IAM role for Lambda:
```bash
aws iam create-role \
  --role-name ConfettiPresignLambdaRole \
  --assume-role-policy-document file://lambda-trust-policy.json
```

Create `lambda-trust-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

3. Attach S3 permissions to the role:
```bash
aws iam put-role-policy \
  --role-name ConfettiPresignLambdaRole \
  --policy-name S3PresignPolicy \
  --policy-document file://s3-presign-policy.json
```

Create `s3-presign-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::confetti-receipts-production/receipts/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

4. Deploy the Lambda function:
```bash
aws lambda create-function \
  --function-name ConfettiReceiptPresign \
  --runtime python3.11 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/ConfettiPresignLambdaRole \
  --handler presign_lambda.lambda_handler \
  --zip-file fileb://presign_lambda.zip \
  --environment Variables={S3_BUCKET_NAME=confetti-receipts-production} \
  --timeout 30 \
  --memory-size 256
```

## Step 3: Create API Gateway Endpoint

1. Create a REST API:
```bash
aws apigateway create-rest-api \
  --name ConfettiReceiptUploadAPI \
  --description "API for receipt upload presigned URLs"
```

2. Get the root resource ID:
```bash
aws apigateway get-resources \
  --rest-api-id YOUR_API_ID
```

3. Create a resource for presign endpoint:
```bash
aws apigateway create-resource \
  --rest-api-id YOUR_API_ID \
  --parent-id YOUR_ROOT_RESOURCE_ID \
  --path-part presign
```

4. Add POST method:
```bash
aws apigateway put-method \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_PRESIGN_RESOURCE_ID \
  --http-method POST \
  --authorization-type NONE
```

5. Integrate with Lambda:
```bash
aws apigateway put-integration \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_PRESIGN_RESOURCE_ID \
  --http-method POST \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:ap-southeast-1:lambda:path/2015-03-31/functions/arn:aws:lambda:ap-southeast-1:YOUR_ACCOUNT_ID:function:ConfettiReceiptPresign/invocations
```

6. Deploy the API:
```bash
aws apigateway create-deployment \
  --rest-api-id YOUR_API_ID \
  --stage-name prod
```

Your presign endpoint URL will be:
```
https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com/prod/presign
```

## Step 4: Update Database Schema

Run the migration script to add receipt storage columns:
```bash
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME < database_migration.sql
```

## Step 5: Update Frontend Environment Variables

Add the presign URL to your frontend `.env` file:
```bash
VITE_RECEIPT_PRESIGN_URL=https://YOUR_API_ID.execute-api.ap-southeast-1.amazonaws.com/prod/presign
```

## Step 6: Update Main Lambda Function

The main Lambda function (`lambda_function.py`) has been updated to accept and store receipt information. Redeploy it with the updated code.

## Testing

1. Test the presign Lambda:
```bash
aws lambda invoke \
  --function-name ConfettiReceiptPresign \
  --payload '{"body":"{\"fileName\":\"test.pdf\",\"fileType\":\"application/pdf\"}"}' \
  response.json
cat response.json
```

2. Test the full upload flow:
- Navigate to your application
- Select a partnership tier
- Upload a receipt
- Verify the file appears in S3 bucket under `receipts/` prefix
- Verify the database has the correct `receipt_storage_key` and `receipt_file_name`

## Security Considerations

1. **Bucket Access**: Ensure the S3 bucket is not publicly accessible
2. **Presigned URL Expiry**: URLs expire in 5 minutes (configurable in `presign_lambda.py`)
3. **File Type Validation**: Consider adding file type validation in the Lambda function
4. **File Size Limits**: Set appropriate file size limits in API Gateway and Lambda
5. **Encryption**: Enable S3 bucket encryption:
```bash
aws s3api put-bucket-encryption \
  --bucket confetti-receipts-production \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

## Monitoring

Set up CloudWatch alarms for:
- Lambda errors
- S3 bucket size
- API Gateway 4xx/5xx errors

## Troubleshooting

1. **CORS errors**: Verify S3 bucket CORS configuration
2. **403 Forbidden**: Check Lambda IAM role permissions
3. **Upload fails**: Verify presigned URL hasn't expired
4. **Database errors**: Ensure migration script was run successfully
