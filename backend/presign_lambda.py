import json
import os
import boto3
import logging
from datetime import datetime
from uuid import uuid4

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize S3 client
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    """
    AWS Lambda function to generate presigned URLs for S3 receipt uploads.
    """

    # Set CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

    logger.info("Presign Lambda function started")

    try:
        # Handle preflight OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            logger.info("Handling CORS preflight request")
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }

        # Parse the request body
        if 'body' not in event:
            logger.warning("No request body provided")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No request body provided'})
            }

        # Handle both direct invocation and API Gateway
        if isinstance(event['body'], str):
            body = json.loads(event['body'])
        else:
            body = event['body']

        logger.info("Request body parsed successfully")

        # Validate required fields
        if not body.get('fileName'):
            logger.warning("Missing fileName in request")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'fileName is required'})
            }

        file_name = body['fileName']
        file_type = body.get('fileType', 'application/octet-stream')

        # Get S3 bucket name from environment
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        if not bucket_name:
            logger.error("S3_BUCKET_NAME environment variable not set")
            return {
                'statusCode': 500,
                'headers': headers,
                'body': json.dumps({'error': 'S3 bucket not configured'})
            }

        # Generate unique key for the file
        timestamp = datetime.utcnow().strftime('%Y%m%d-%H%M%S')
        unique_id = str(uuid4())[:8]
        file_extension = file_name.split('.')[-1] if '.' in file_name else 'bin'
        storage_key = f"receipts/{timestamp}-{unique_id}.{file_extension}"

        logger.info(f"Generating presigned URL for key: {storage_key}")

        # Generate presigned URL for PUT operation
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket_name,
                'Key': storage_key,
                'ContentType': file_type
            },
            ExpiresIn=300  # URL expires in 5 minutes
        )

        logger.info(f"Presigned URL generated successfully for {storage_key}")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'uploadUrl': presigned_url,
                'key': storage_key,
                'bucket': bucket_name
            })
        }

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }

    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error'})
        }
