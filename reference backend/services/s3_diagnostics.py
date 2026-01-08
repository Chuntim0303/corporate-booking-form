import boto3
import os
import logging
import json

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def check_s3_bucket_config():
    """
    Check and log S3 bucket configuration including CORS settings
    """
    try:
        s3_client = boto3.client('s3')
        bucket_name = os.environ.get('PAYMENT_BUCKET', 'payment-system-files')
        
        logger.info(f"=== S3 BUCKET DIAGNOSTICS ===")
        logger.info(f"Bucket Name: {bucket_name}")
        
        # Check if bucket exists
        try:
            s3_client.head_bucket(Bucket=bucket_name)
            logger.info(f"✓ Bucket exists and is accessible")
        except Exception as e:
            logger.error(f"✗ Bucket access error: {str(e)}")
            return
        
        # Get bucket location
        try:
            location = s3_client.get_bucket_location(Bucket=bucket_name)
            logger.info(f"Bucket Location: {location.get('LocationConstraint', 'us-east-1')}")
        except Exception as e:
            logger.warning(f"Could not get bucket location: {str(e)}")
        
        # Check CORS configuration
        try:
            cors = s3_client.get_bucket_cors(Bucket=bucket_name)
            logger.info(f"✓ CORS Configuration exists")
            logger.info(f"CORS Rules: {json.dumps(cors.get('CORSRules', []), indent=2)}")
            
            # Validate CORS rules for presigned URL uploads
            cors_rules = cors.get('CORSRules', [])
            has_put_method = False
            has_wildcard_origin = False
            
            for rule in cors_rules:
                methods = rule.get('AllowedMethods', [])
                origins = rule.get('AllowedOrigins', [])
                headers = rule.get('AllowedHeaders', [])
                
                if 'PUT' in methods:
                    has_put_method = True
                if '*' in origins or any('localhost' in origin for origin in origins):
                    has_wildcard_origin = True
                    
                logger.info(f"  Rule - Methods: {methods}, Origins: {origins}, Headers: {headers}")
            
            if not has_put_method:
                logger.warning("⚠ CORS does not allow PUT method - uploads will fail!")
            if not has_wildcard_origin:
                logger.warning("⚠ CORS may not allow localhost origin - uploads from dev may fail!")
                
        except Exception as e:
            error_code = e.response.get('Error', {}).get('Code', '') if hasattr(e, 'response') else ''
            
            if error_code == 'NoSuchCORSConfiguration':
                logger.error("✗ NO CORS CONFIGURATION FOUND - This is the problem!")
                logger.error("S3 bucket needs CORS configuration to allow presigned URL uploads")
                logger.error("Required CORS configuration:")
                logger.error(json.dumps([{
                    "AllowedHeaders": ["*"],
                    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
                    "AllowedOrigins": ["*"],
                    "ExposeHeaders": ["ETag"]
                }], indent=2))
            elif error_code == 'AccessDenied':
                logger.warning(f"⚠ Cannot check CORS configuration - Access Denied")
                logger.warning(f"Lambda role needs 's3:GetBucketCORS' permission")
                logger.warning(f"CORS issue is likely the cause of upload failures")
            else:
                logger.error(f"Error checking CORS: {str(e)}")
        
        # Check bucket policy
        try:
            policy = s3_client.get_bucket_policy(Bucket=bucket_name)
            logger.info(f"✓ Bucket Policy exists")
            logger.info(f"Policy: {policy.get('Policy', 'N/A')[:500]}...")
        except Exception as e:
            error_code = e.response.get('Error', {}).get('Code', '') if hasattr(e, 'response') else ''
            if error_code == 'NoSuchBucketPolicy':
                logger.warning("No bucket policy configured")
            elif error_code == 'AccessDenied':
                logger.warning("Cannot check bucket policy - Access Denied")
            else:
                logger.warning(f"Could not get bucket policy: {str(e)}")
        
        # Check public access block
        try:
            public_access = s3_client.get_public_access_block(Bucket=bucket_name)
            config = public_access.get('PublicAccessBlockConfiguration', {})
            logger.info(f"Public Access Block Configuration:")
            logger.info(f"  BlockPublicAcls: {config.get('BlockPublicAcls', 'N/A')}")
            logger.info(f"  IgnorePublicAcls: {config.get('IgnorePublicAcls', 'N/A')}")
            logger.info(f"  BlockPublicPolicy: {config.get('BlockPublicPolicy', 'N/A')}")
            logger.info(f"  RestrictPublicBuckets: {config.get('RestrictPublicBuckets', 'N/A')}")
        except Exception as e:
            logger.warning(f"Could not get public access block: {str(e)}")
            
    except Exception as e:
        logger.error(f"Error in S3 diagnostics: {str(e)}", exc_info=True)
