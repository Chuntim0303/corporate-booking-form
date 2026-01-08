#!/bin/bash

# Build script for AWS Lambda Layer with Python dependencies
# This creates a deployment package with all required dependencies for PDF generation

set -e  # Exit on error

echo "======================================"
echo "Building Lambda Layer for PDF Generation"
echo "======================================"

# Configuration
LAYER_NAME="python-pdf-dependencies"
PYTHON_VERSION="python3.11"  # Adjust to match your Lambda runtime
BUILD_DIR="lambda-layer-build"
OUTPUT_DIR="lambda-layer-output"

# Clean up previous builds
echo "Cleaning up previous builds..."
rm -rf $BUILD_DIR $OUTPUT_DIR
mkdir -p $BUILD_DIR/$PYTHON_VERSION/site-packages
mkdir -p $OUTPUT_DIR

# Install dependencies
echo "Installing Python dependencies..."
pip install \
    -r requirements.txt \
    -t $BUILD_DIR/$PYTHON_VERSION/site-packages \
    --platform manylinux2014_x86_64 \
    --only-binary=:all: \
    --upgrade

# Create zip file for Lambda Layer
echo "Creating Lambda Layer zip file..."
cd $BUILD_DIR
zip -r ../$OUTPUT_DIR/${LAYER_NAME}.zip .
cd ..

# Get the size of the layer
LAYER_SIZE=$(du -h $OUTPUT_DIR/${LAYER_NAME}.zip | cut -f1)
echo ""
echo "✓ Lambda Layer built successfully!"
echo "  Location: $OUTPUT_DIR/${LAYER_NAME}.zip"
echo "  Size: $LAYER_SIZE"
echo ""
echo "======================================"
echo "Next Steps:"
echo "======================================"
echo "1. Upload the layer to AWS Lambda:"
echo "   aws lambda publish-layer-version \\"
echo "     --layer-name $LAYER_NAME \\"
echo "     --description 'Python dependencies for PDF generation (reportlab, pdfrw, Pillow)' \\"
echo "     --zip-file fileb://$OUTPUT_DIR/${LAYER_NAME}.zip \\"
echo "     --compatible-runtimes $PYTHON_VERSION"
echo ""
echo "2. Note the LayerVersionArn from the output"
echo ""
echo "3. Attach the layer to your Lambda function:"
echo "   aws lambda update-function-configuration \\"
echo "     --function-name YOUR_FUNCTION_NAME \\"
echo "     --layers arn:aws:lambda:REGION:ACCOUNT_ID:layer:$LAYER_NAME:VERSION"
echo ""
echo "Or use the AWS Console:"
echo "- Go to Lambda > Functions > [Your Function] > Configuration > Layers"
echo "- Click 'Add a layer'"
echo "- Select 'Custom layers' and choose '$LAYER_NAME'"
echo "======================================"
