#!/bin/bash
# Script to verify and fix S3 CORS configuration

BUCKET_NAME="corporate-booking-form-bucket"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "S3 CORS Configuration Fix Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Check current CORS configuration
echo "1️⃣  Checking current CORS configuration..."
echo ""
aws s3api get-bucket-cors --bucket $BUCKET_NAME 2>&1

if [ $? -ne 0 ]; then
    echo ""
    echo "⚠️  No CORS configuration found or access denied"
    echo ""
else
    echo ""
    echo "✅ CORS configuration exists"
    echo ""
fi

# Step 2: Apply correct CORS configuration
echo "2️⃣  Applying correct CORS configuration..."
echo ""

# Use the CORS config from the project file
CORS_CONFIG_FILE="s3-cors-config.json"

if [ ! -f "$CORS_CONFIG_FILE" ]; then
    echo "❌ CORS config file not found: $CORS_CONFIG_FILE"
    echo "Creating default CORS configuration..."
    cat > /tmp/cors-config.json << 'EOF'
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "GET",
            "PUT",
            "POST",
            "DELETE",
            "HEAD"
        ],
        "AllowedOrigins": [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:8080",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:5175",
            "http://127.0.0.1:8080",
            "https://*"
        ],
        "ExposeHeaders": [
            "ETag",
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
        ],
        "MaxAgeSeconds": 3000
    }
]
EOF
else
    echo "Using CORS configuration from: $CORS_CONFIG_FILE"
    cp "$CORS_CONFIG_FILE" /tmp/cors-config.json
fi

echo ""
echo "Applying this CORS configuration:"
cat /tmp/cors-config.json
echo ""

aws s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration file:///tmp/cors-config.json

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CORS configuration applied successfully!"
    echo ""
else
    echo ""
    echo "❌ Failed to apply CORS configuration"
    echo "Please check your AWS credentials and bucket permissions"
    exit 1
fi

# Step 3: Verify CORS was applied
echo "3️⃣  Verifying CORS configuration..."
echo ""
aws s3api get-bucket-cors --bucket $BUCKET_NAME

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CORS verification successful!"
    echo ""
else
    echo ""
    echo "⚠️  Could not verify CORS (may be a permissions issue)"
    echo ""
fi

# Step 4: Check bucket region
echo "4️⃣  Checking bucket region..."
echo ""
REGION=$(aws s3api get-bucket-location --bucket $BUCKET_NAME --query 'LocationConstraint' --output text)
echo "Bucket region: $REGION"
echo ""

if [ "$REGION" = "ap-southeast-1" ] || [ "$REGION" = "None" ]; then
    echo "✅ Bucket region is correct"
else
    echo "⚠️  Warning: Bucket region ($REGION) may not match Lambda region (ap-southeast-1)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ CORS configuration has been updated"
echo "✅ Allowed origins: localhost:3000, 5173, 5174, 5175, 8080 and all HTTPS"
echo "✅ Allowed methods: GET, PUT, POST, DELETE, HEAD"
echo "✅ Allowed headers: All (*)"
echo ""
echo "NOTE: S3 does not support port wildcards, so each port must be listed explicitly."
echo ""
echo "Next steps:"
echo "1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Try uploading a file again"
echo "3. Check browser console for errors"
echo "4. Check CloudWatch logs for detailed debug information"
echo ""
echo "If still getting CORS errors, run this test:"
echo "curl -X OPTIONS https://$BUCKET_NAME.s3.ap-southeast-1.amazonaws.com/ \\"
echo "  -H 'Origin: http://localhost:5174' \\"
echo "  -H 'Access-Control-Request-Method: PUT' \\"
echo "  -v"
echo ""
