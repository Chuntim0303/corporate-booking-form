#!/usr/bin/env python3
"""
Script to configure S3 bucket CORS for presigned URL uploads
Run this to fix the CORS error preventing file uploads
"""

import boto3
import json
import sys

def fix_s3_cors(bucket_name='event-venue-bookings'):
    """
    Configure CORS on S3 bucket to allow presigned URL uploads from browser
    """
    s3_client = boto3.client('s3')
    
    # CORS configuration that allows presigned URL uploads
    cors_configuration = {
        'CORSRules': [
            {
                'AllowedHeaders': ['*'],
                'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                'AllowedOrigins': ['*'],  # Change to specific domain in production
                'ExposeHeaders': [
                    'ETag',
                    'x-amz-server-side-encryption',
                    'x-amz-request-id',
                    'x-amz-id-2'
                ],
                'MaxAgeSeconds': 3000
            }
        ]
    }
    
    try:
        print(f"Configuring CORS for bucket: {bucket_name}")
        print(f"CORS Configuration:")
        print(json.dumps(cors_configuration, indent=2))
        print()
        
        # Apply CORS configuration
        s3_client.put_bucket_cors(
            Bucket=bucket_name,
            CORSConfiguration=cors_configuration
        )
        
        print(f"✓ CORS configuration applied successfully!")
        print()
        
        # Verify the configuration
        print("Verifying CORS configuration...")
        cors = s3_client.get_bucket_cors(Bucket=bucket_name)
        print(f"✓ CORS configuration verified:")
        print(json.dumps(cors.get('CORSRules', []), indent=2))
        print()
        print("✓ S3 bucket is now configured for presigned URL uploads!")
        print("You can now test file uploads from your application.")
        
        return True
        
    except Exception as e:
        print(f"✗ Error configuring CORS: {str(e)}")
        print()
        print("Make sure you have the following permissions:")
        print("  - s3:PutBucketCORS")
        print("  - s3:GetBucketCORS")
        print()
        print("You can also configure CORS manually via AWS Console:")
        print("1. Go to S3 Console")
        print(f"2. Select bucket: {bucket_name}")
        print("3. Go to Permissions tab")
        print("4. Scroll to 'Cross-origin resource sharing (CORS)'")
        print("5. Click Edit and paste the configuration above")
        return False

if __name__ == '__main__':
    bucket_name = sys.argv[1] if len(sys.argv) > 1 else 'event-venue-bookings'
    success = fix_s3_cors(bucket_name)
    sys.exit(0 if success else 1)
