"""
File handling and validation for the wedding form backend.
"""
import boto3
import base64
import logging

from config import (
    MAX_FILE_SIZE, ALLOWED_FILE_TYPES, OUTPUT_BUCKET
)
from utils import get_malaysia_time

logger = logging.getLogger()


def validate_file_data(file_data_url, max_size=MAX_FILE_SIZE):
    """Validate file size and type from data URL"""
    try:
        if not file_data_url or not file_data_url.startswith('data:'):
            raise ValueError("Invalid file data format")

        mime_type = file_data_url.split(';')[0].split(':')[1]
        if mime_type not in ALLOWED_FILE_TYPES:
            raise ValueError(f"File type {mime_type} not allowed. Allowed types: {', '.join(ALLOWED_FILE_TYPES)}")

        base64_data = file_data_url.split(',')[1] if ',' in file_data_url else file_data_url
        file_size = len(base64.b64decode(base64_data))

        if file_size > max_size:
            raise ValueError(f"File size {file_size} bytes exceeds maximum {max_size} bytes")

        return mime_type, base64_data, file_size

    except Exception as e:
        logger.error(f"File validation error: {str(e)}")
        raise


def upload_file_to_s3(file_data_url, wedding_id, file_type="deposit_receipt"):
    """Upload file to S3 and return the S3 key (relative path)"""
    try:
        if not file_data_url:
            return None

        mime_type, base64_data, file_size = validate_file_data(file_data_url)
        file_bytes = base64.b64decode(base64_data)

        malaysia_now = get_malaysia_time()
        timestamp = malaysia_now.strftime("%Y%m%d_%H%M%S")
        file_extension = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'application/pdf': 'pdf'
        }.get(mime_type, 'bin')

        # Store all uploads in wedding-form-submission folder
        s3_key = f"wedding-form-submission/{file_type}/{wedding_id}/{timestamp}_{file_type}.{file_extension}"

        s3 = boto3.client('s3')
        s3.put_object(
            Bucket=OUTPUT_BUCKET,
            Key=s3_key,
            Body=file_bytes,
            ContentType=mime_type,
            Metadata={
                'wedding_id': str(wedding_id),
                'file_type': file_type,
                'original_size': str(file_size),
                'upload_timestamp': timestamp,
                'upload_time_malaysia': malaysia_now.strftime("%Y-%m-%d %H:%M:%S MYT")
            }
        )

        logger.info(f"File uploaded successfully to S3 key: {s3_key}")
        return s3_key  # Return S3 key instead of full URL

    except Exception as e:
        logger.error(f"Error uploading file to S3: {str(e)}")
        raise


def update_s3_file_path(old_s3_key, temp_id, actual_wedding_id):
    """Update S3 file path from temporary ID to actual wedding ID, return new S3 key"""
    try:
        s3 = boto3.client('s3')
        # old_s3_key is now just the key, not the full URL
        new_key = old_s3_key.replace(str(temp_id), str(actual_wedding_id))
        copy_source = {'Bucket': OUTPUT_BUCKET, 'Key': old_s3_key}
        s3.copy_object(CopySource=copy_source, Bucket=OUTPUT_BUCKET, Key=new_key)
        s3.delete_object(Bucket=OUTPUT_BUCKET, Key=old_s3_key)
        logger.info(f"Updated S3 file path from {old_s3_key} to {new_key}")
        return new_key  # Return S3 key instead of full URL
    except Exception as e:
        logger.error(f"Error updating S3 file path: {str(e)}")
        raise


def process_deposit_receipt(deposit_receipt_data, wedding_id):
    """Process and store deposit receipt file in S3, return S3 key"""
    if not deposit_receipt_data:
        return None

    try:
        s3_key = upload_file_to_s3(deposit_receipt_data, wedding_id, "deposit_receipt")
        return s3_key  # Returns S3 key like "wedding-form-submission/deposit_receipt/..."
    except Exception as e:
        logger.error(f"Error processing deposit receipt: {str(e)}")
        raise