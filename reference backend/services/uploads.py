import boto3
import os
from datetime import datetime
import uuid
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize S3 client
s3_client = boto3.client('s3')
# Use payment-system-files bucket for payment proof uploads
BUCKET_NAME = os.environ.get('PAYMENT_BUCKET', 'payment-system-files')

logger.info(f"S3 uploads service initialized with bucket: {BUCKET_NAME}")

def generate_presigned_url(file_name, file_type, expiration=3600):
    """
    Generate a presigned URL for uploading files to S3

    Args:
        file_name: Original name of the file
        file_type: MIME type of the file
        expiration: URL expiration time in seconds (default: 1 hour)

    Returns:
        dict: Contains presigned URL and file key
    """
    try:
        logger.info(f"=== GENERATE_PRESIGNED_URL ===")
        logger.info(f"Input - File name: {file_name}")
        logger.info(f"Input - File type: {file_type}")
        logger.info(f"Input - Expiration: {expiration} seconds")
        logger.info(f"Using bucket: {BUCKET_NAME}")
        
        # Generate unique file key
        file_extension = file_name.split('.')[-1]
        unique_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_key = f"payment-proofs/{timestamp}_{unique_id}.{file_extension}"
        
        logger.info(f"Generated file key: {file_key}")

        # Generate presigned URL for PUT operation
        logger.info("Calling s3_client.generate_presigned_url...")
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': file_key,
                'ContentType': file_type
            },
            ExpiresIn=expiration
        )
        
        logger.info(f"✓ Presigned URL generated (length: {len(presigned_url)} chars)")
        logger.info(f"Presigned URL (first 200 chars): {presigned_url[:200]}")

        # Generate the file URL (without presigned params)
        file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_key}"
        logger.info(f"File URL: {file_url}")
        
        result = {
            'uploadUrl': presigned_url,
            'fileUrl': file_url,
            'fileKey': file_key
        }
        
        logger.info(f"Returning upload data with {len(result)} fields")
        return result

    except Exception as e:
        logger.error(f"ERROR in generate_presigned_url: {str(e)}", exc_info=True)
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"File name: {file_name}, File type: {file_type}")
        raise


def handle_file_upload(file_data, file_name, file_type):
    """
    Direct upload file to S3 (alternative to presigned URL)

    Args:
        file_data: File content (bytes)
        file_name: Original name of the file
        file_type: MIME type of the file

    Returns:
        str: S3 URL of uploaded file
    """
    try:
        logger.info(f"=== HANDLE_FILE_UPLOAD ===")
        logger.info(f"File name: {file_name}")
        logger.info(f"File type: {file_type}")
        logger.info(f"File data size: {len(file_data)} bytes")
        
        # Generate unique file key
        file_extension = file_name.split('.')[-1]
        unique_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_key = f"payment-proofs/{timestamp}_{unique_id}.{file_extension}"
        
        logger.info(f"Generated file key: {file_key}")
        logger.info(f"Uploading to bucket: {BUCKET_NAME}")

        # Upload to S3
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=file_key,
            Body=file_data,
            ContentType=file_type,
            ServerSideEncryption='AES256'  # Enable server-side encryption
        )
        
        logger.info(f"✓ File uploaded successfully")

        # Return the S3 URL
        file_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{file_key}"
        logger.info(f"File URL: {file_url}")
        return file_url

    except Exception as e:
        logger.error(f"ERROR uploading file to S3: {str(e)}", exc_info=True)
        logger.error(f"Error type: {type(e).__name__}")
        raise


def delete_file(file_key):
    """
    Delete a file from S3

    Args:
        file_key: S3 object key

    Returns:
        bool: Success status
    """
    try:
        s3_client.delete_object(
            Bucket=BUCKET_NAME,
            Key=file_key
        )
        return True

    except Exception as e:
        logger.error(f"Error deleting file from S3: {str(e)}", exc_info=True)
        return False


def get_file_url(file_key, expiration=3600):
    """
    Generate a presigned URL for downloading a file from S3

    Args:
        file_key: S3 object key
        expiration: URL expiration time in seconds (default: 1 hour)

    Returns:
        str: Presigned URL for downloading
    """
    try:
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': BUCKET_NAME,
                'Key': file_key
            },
            ExpiresIn=expiration
        )
        return presigned_url

    except Exception as e:
        logger.error(f"Error generating download URL: {str(e)}", exc_info=True)
        raise
