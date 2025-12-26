#!/bin/bash
# Test S3 CORS configuration

BUCKET_NAME="corporate-booking-form-bucket"

echo "Testing CORS for bucket: $BUCKET_NAME"
echo ""

# Test 1: OPTIONS request with localhost:5173
echo "1️⃣  Testing OPTIONS preflight from localhost:5173..."
curl -X OPTIONS "https://$BUCKET_NAME.s3.ap-southeast-1.amazonaws.com/" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type" \
  -v 2>&1 | grep -i "access-control"

echo ""
echo "2️⃣  Expected headers:"
echo "  - access-control-allow-origin: http://localhost:5173"
echo "  - access-control-allow-methods: PUT, POST, GET, DELETE, HEAD"
echo "  - access-control-allow-headers: *"
echo ""

# Test 2: Check actual CORS config
echo "3️⃣  Current CORS configuration:"
aws s3api get-bucket-cors --bucket $BUCKET_NAME 2>&1 | head -20

echo ""
echo "Done!"
