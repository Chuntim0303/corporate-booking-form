import os
import boto3
import logging
from datetime import datetime
from uuid import uuid4

# Configure logging
logger = logging.getLogger()

# Initialize S3 client
s3_client = boto3.client('s3')

def handle_presign_request(body: dict, request_context: dict = None) -> dict:
    """
    Generate presigned URLs for S3 receipt uploads.
    Called from main Lambda function.

    Args:
        body: Request body containing fileName and fileType
        request_context: Optional request context with headers and origin info

    Returns:
        dict with statusCode and response data or error
    """
    logger.info("=== PRESIGN SERVICE START ===", extra={
        'request_body': body,
        'file_name': body.get('fileName'),
        'file_type': body.get('fileType'),
        'request_context': request_context
    })

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

        logger.info("Processing file upload request", extra={
            'original_file_name': file_name,
            'content_type': file_type
        })

        # Get S3 bucket name from environment
        bucket_name = os.environ.get('S3_BUCKET_NAME')

        logger.info("S3 Configuration", extra={
            'bucket_name': bucket_name,
            'bucket_env_var_set': 'S3_BUCKET_NAME' in os.environ,
            'all_env_vars': list(os.environ.keys())
        })

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

        logger.info(f"Generating presigned URL for key: {storage_key}", extra={
            'bucket': bucket_name,
            'key': storage_key,
            'content_type': file_type,
            'expires_in': 300
        })

        # Generate presigned URL for PUT operation
        try:
            logger.info("Generating presigned URL with parameters", extra={
                'operation': 'put_object',
                'bucket': bucket_name,
                'key': storage_key,
                'content_type': file_type,
                'expires_in': 300
            })

            presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': bucket_name,
                    'Key': storage_key,
                    'ContentType': file_type
                },
                ExpiresIn=300  # URL expires in 5 minutes
            )

            logger.info(f"✓ Presigned URL generated successfully for {storage_key}", extra={
                'url_length': len(presigned_url),
                'url_preview': presigned_url[:150],
                'full_url': presigned_url,
                'has_signature': 'Signature=' in presigned_url,
                'has_expires': 'Expires=' in presigned_url,
                'bucket_in_url': bucket_name in presigned_url,
                'url_domain': presigned_url.split('/')[2] if len(presigned_url.split('/')) > 2 else 'unknown'
            })

        except Exception as e:
            logger.error(f"Failed to generate presigned URL: {str(e)}", extra={
                'error_type': type(e).__name__,
                'bucket': bucket_name,
                'key': storage_key
            }, exc_info=True)
            raise

        # Test bucket CORS configuration
        try:
            cors_response = s3_client.get_bucket_cors(Bucket=bucket_name)
            cors_rules = cors_response.get('CORSRules', [])
            logger.info("✓ Bucket CORS configuration retrieved", extra={
                'cors_rules_count': len(cors_rules),
                'cors_rules': cors_rules,
                'allowed_origins': [rule.get('AllowedOrigins', []) for rule in cors_rules],
                'allowed_methods': [rule.get('AllowedMethods', []) for rule in cors_rules],
                'allowed_headers': [rule.get('AllowedHeaders', []) for rule in cors_rules]
            })
        except Exception as e:
            logger.warning(f"⚠ Could not retrieve CORS config: {str(e)}", extra={
                'error_type': type(e).__name__,
                'bucket': bucket_name
            })

        response = {
            'statusCode': 200,
            'uploadUrl': presigned_url,
            'key': storage_key,
            'bucket': bucket_name
        }

        logger.info("=== PRESIGN SERVICE SUCCESS ===", extra={
            'response': response,
            'storage_key': storage_key,
            'url_length': len(presigned_url)
        })

        return response

    except Exception as e:
        logger.error(f"Unexpected error in presign service: {str(e)}", extra={
            'error_type': type(e).__name__,
            'error_message': str(e),
            'file_name': body.get('fileName'),
            'file_type': body.get('fileType')
        }, exc_info=True)
        return {
            'statusCode': 500,
            'error': f'Internal server error: {str(e)}'
        }
