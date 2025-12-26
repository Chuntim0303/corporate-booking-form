import os
import boto3
import logging
from datetime import datetime
from uuid import uuid4

# Configure logging
logger = logging.getLogger()

# Initialize S3 client
s3_client = boto3.client('s3')

def handle_presign_request(body: dict) -> dict:
    """
    Generate presigned URLs for S3 receipt uploads.
    Called from main Lambda function.

    Args:
        body: Request body containing fileName and fileType

    Returns:
        dict with statusCode and response data or error
    """
    logger.info("Presign service started")

    try:
        # Validate required fields
        if not body.get('fileName'):
            logger.warning("Missing fileName in request")
            return {
                'statusCode': 400,
                'error': 'fileName is required'
            }

        file_name = body['fileName']
        file_type = body.get('fileType', 'application/octet-stream')

        # Get S3 bucket name from environment
        bucket_name = os.environ.get('S3_BUCKET_NAME')
        if not bucket_name:
            logger.error("S3_BUCKET_NAME environment variable not set")
            return {
                'statusCode': 500,
                'error': 'S3 bucket not configured'
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
            'uploadUrl': presigned_url,
            'key': storage_key,
            'bucket': bucket_name
        }

    except Exception as e:
        logger.error(f"Unexpected error in presign service: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'error': f'Internal server error: {str(e)}'
        }
