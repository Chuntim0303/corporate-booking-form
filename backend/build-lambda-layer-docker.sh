#!/bin/bash

# Build script for AWS Lambda Layer with Python dependencies
# Uses Docker to ensure compatibility with Lambda's Linux environment

set -e  # Exit on error

echo "======================================"
echo "Building Lambda Layer for PDF Generation"
echo "Using Docker for Lambda compatibility"
echo "======================================"

# Configuration
LAYER_NAME="python-pdf-dependencies"
PYTHON_VERSION="3.11"  # Adjust to match your Lambda runtime
BUILD_DIR="lambda-layer-build"
OUTPUT_DIR="lambda-layer-output"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed or not in PATH"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✓ Docker is available"
echo ""

# Clean up previous builds
echo "Cleaning up previous builds..."
rm -rf $BUILD_DIR $OUTPUT_DIR
mkdir -p $OUTPUT_DIR

echo "Building Lambda layer using AWS Lambda Docker image..."
echo "This ensures the dependencies are compiled for Lambda's Linux environment"
echo ""

# Use official AWS Lambda Python image to build dependencies
docker run --rm \
    -v "$(pwd)":/var/task \
    -w /var/task \
    public.ecr.aws/lambda/python:${PYTHON_VERSION} \
    bash -c "
        echo 'Installing dependencies in Lambda environment...'
        pip install \
            -r requirements.txt \
            -t /tmp/python \
            --no-cache-dir \
            --upgrade

        echo 'Creating zip file...'
        cd /tmp
        zip -r /var/task/$OUTPUT_DIR/${LAYER_NAME}.zip python -q

        echo 'Checking installed packages...'
        ls -lh /tmp/python/ | head -20

        echo ''
        echo 'Verifying critical dependencies:'
        python3 -c 'import sys; sys.path.insert(0, \"/tmp/python\"); import reportlab; print(f\"✓ reportlab {reportlab.Version}\")'
        python3 -c 'import sys; sys.path.insert(0, \"/tmp/python\"); import pdfrw; print(\"✓ pdfrw available\")'
        python3 -c 'import sys; sys.path.insert(0, \"/tmp/python\"); import PIL; print(f\"✓ Pillow {PIL.__version__}\")'
        python3 -c 'import sys; sys.path.insert(0, \"/tmp/python\"); from PIL import Image; print(\"✓ PIL._imaging (C extension) working\")'
    "

# Check if zip was created successfully
if [ ! -f "$OUTPUT_DIR/${LAYER_NAME}.zip" ]; then
    echo ""
    echo "ERROR: Failed to create Lambda layer zip file"
    exit 1
fi

# Get the size of the layer
LAYER_SIZE=$(du -h $OUTPUT_DIR/${LAYER_NAME}.zip | cut -f1)
echo ""
echo "======================================"
echo "✓ Lambda Layer built successfully!"
echo "======================================"
echo "  Location: $OUTPUT_DIR/${LAYER_NAME}.zip"
echo "  Size: $LAYER_SIZE"
echo ""
echo "The layer was built using AWS Lambda's official Python ${PYTHON_VERSION} Docker image"
echo "This ensures all dependencies (especially Pillow's C extensions) are compatible"
echo ""
echo "======================================"
echo "Next Steps:"
echo "======================================"
echo ""
echo "1. Upload the layer to AWS Lambda:"
echo ""
echo "   aws lambda publish-layer-version \\"
echo "     --layer-name $LAYER_NAME \\"
echo "     --description 'Python dependencies for PDF generation (reportlab, pdfrw, Pillow) - Built with Docker' \\"
echo "     --zip-file fileb://$OUTPUT_DIR/${LAYER_NAME}.zip \\"
echo "     --compatible-runtimes python${PYTHON_VERSION}"
echo ""
echo "2. Note the LayerVersionArn from the output (e.g., arn:aws:lambda:region:account:layer:name:version)"
echo ""
echo "3. Attach the layer to your Lambda function:"
echo ""
echo "   aws lambda update-function-configuration \\"
echo "     --function-name YOUR_FUNCTION_NAME \\"
echo "     --layers arn:aws:lambda:REGION:ACCOUNT_ID:layer:$LAYER_NAME:VERSION"
echo ""
echo "   OR use AWS Console:"
echo "   - Lambda → Functions → [Your Function]"
echo "   - Configuration → Layers → Add a layer"
echo "   - Custom layers → $LAYER_NAME → Add"
echo ""
echo "4. Test your application - PDF should now be attached to emails!"
echo ""
echo "======================================"
