# How to Fix Lambda Layer to Enable PDF Signatures

## Problem Summary

**Current Status:**
- ✅ PDF generation works
- ✅ Address fields work
- ❌ **Signatures do NOT work**

**Root Cause:**
The Lambda layer has PIL/Pillow installed but it's **broken** - missing C extensions.

**Error:**
```
ImportError: cannot import name '_imaging' from 'PIL' (/opt/python/PIL/__init__.py)
```

---

## Why Signatures Don't Work

1. **Signature processing requires PIL/Pillow** to read PNG images
2. **PIL in Lambda layer is broken** - missing `_imaging` C extension
3. **PIL mock protects reportlab** but prevents signature processing
4. **Code generates PDFs WITHOUT signatures** to avoid crashes

---

## The Solution: Rebuild Lambda Layer

You need to rebuild the Lambda layer with Pillow properly compiled for Amazon Linux.

### Option 1: Using Docker (Recommended)

```bash
# Use Amazon Linux Docker container to match Lambda environment
docker run -v "$PWD":/var/task -it public.ecr.aws/lambda/python:3.11 bash

# Inside the container:
cd /var/task
mkdir -p layer/python
pip install Pillow==10.1.0 reportlab==4.0.7 pdfrw==0.4 -t layer/python/
cd layer
zip -r ../lambda-layer-with-pillow.zip python/
exit

# Back on your machine:
aws lambda publish-layer-version \
    --layer-name python-pdf-dependencies-fixed \
    --description "PDF dependencies with working Pillow for Amazon Linux" \
    --zip-file fileb://lambda-layer-with-pillow.zip \
    --compatible-runtimes python3.11 python3.10 python3.9 \
    --region YOUR_REGION
```

### Option 2: Using EC2 with Amazon Linux

```bash
# Launch EC2 instance with Amazon Linux 2023
# SSH into the instance

# Install Python and pip
sudo yum install python3-pip python3-devel -y

# Create layer directory
mkdir -p lambda-layer/python
cd lambda-layer

# Install dependencies
pip3 install Pillow==10.1.0 reportlab==4.0.7 pdfrw==0.4 -t python/

# Verify Pillow has C extensions
python3 -c "from PIL import Image, _imaging; print('✓ Pillow working with C extensions')"

# Create zip file
zip -r lambda-layer-with-pillow.zip python/

# Download to your machine and upload to AWS Lambda
```

### Option 3: Using Pre-built Lambda Layers

Some AWS accounts have access to pre-built Lambda layers with Pillow:

```bash
# Search for public Pillow layers
aws lambda list-layers --compatible-runtime python3.11 --region YOUR_REGION

# Or use AWS SAR (Serverless Application Repository)
# Search for "pillow lambda layer"
```

---

## After Rebuilding the Layer

### Step 1: Update Lambda Configuration

```bash
# Get the new layer ARN from the previous command
# It looks like: arn:aws:lambda:REGION:ACCOUNT:layer:python-pdf-dependencies-fixed:1

# Update your Lambda function
aws lambda update-function-configuration \
    --function-name YOUR_FUNCTION_NAME \
    --layers arn:aws:lambda:REGION:ACCOUNT:layer:python-pdf-dependencies-fixed:1 \
    --region YOUR_REGION
```

### Step 2: Remove PIL Mock from Code

Once the Lambda layer has working Pillow, you can remove the PIL mock:

**File:** `backend/services/pdf_generator.py`

**Change from:**
```python
# Lines 20-46: Remove PIL mock and lazy imports
def _get_reportlab_canvas():
    # Mock PIL...
    from reportlab.pdfgen import canvas
    return canvas
```

**Change to:**
```python
# Direct imports (like reference backend)
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from pdfrw import PdfReader, PdfWriter, PageMerge
```

**And enable signature processing:**
```python
# Lines 162-170: Change from disabled to enabled
signature_data_url = data.get('signatureData') or data.get('signature_data')
if signature_data_url and signature_position and signature_size:
    try:
        logger.info("Processing signature data")
        base64_data = re.sub('^data:image/.+;base64,', '', signature_data_url)
        image_data = base64.b64decode(base64_data)
        image_stream = io.BytesIO(image_data)
        img = ImageReader(image_stream)
        x, y = signature_position
        width, height = signature_size
        can.drawImage(img, x, y, width=width, height=height)
        logger.info(f"Signature drawn at ({x}, {y}) size ({width}, {height})")
    except Exception as e:
        logger.error(f"Error processing signature: {str(e)}", exc_info=True)
```

### Step 3: Test

1. Deploy the updated code
2. Submit a form with signature
3. Check CloudWatch logs for:
   ```
   [INFO] Processing signature data
   [INFO] Signature drawn at (40, 80) size (180, 90)
   ```
4. Verify PDF contains signature

---

## Verification Commands

### Check if PIL has C extensions:

```bash
# On Lambda (via test function)
python3 -c "from PIL import _imaging; print('✓ Pillow C extensions working')"

# Should print: ✓ Pillow C extensions working
# If error, Pillow is still broken
```

### Test Image Processing:

```bash
python3 << 'EOF'
from PIL import Image
import io
import base64

# Test base64 PNG processing (same as signature)
test_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
image_data = base64.b64decode(test_png)
img = Image.open(io.BytesIO(image_data))
print(f"✓ Image loaded: {img.size} {img.mode}")
EOF
```

---

## Common Issues

### Issue 1: "No module named '_imaging'"

**Cause:** Pillow installed on wrong platform
**Fix:** Must compile on Amazon Linux (use Docker option)

### Issue 2: "ImportError: cannot import name 'Image'"

**Cause:** Old Pillow version or missing dependencies
**Fix:** Use Pillow 10.1.0 and install on clean environment

### Issue 3: "Layer size too large"

**Cause:** Installing too many dependencies
**Fix:** Only install: Pillow, reportlab, pdfrw (no extras)

---

## References

- [AWS Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [Pillow Documentation](https://pillow.readthedocs.io/)
- [Building Python Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html)

---

## Quick Checklist

- [ ] Rebuild Lambda layer using Docker with Amazon Linux
- [ ] Verify Pillow has C extensions (`from PIL import _imaging`)
- [ ] Upload new layer to AWS Lambda
- [ ] Update Lambda function to use new layer
- [ ] Remove PIL mock from code
- [ ] Enable signature processing
- [ ] Deploy and test
- [ ] Verify signatures appear in PDF

---

## Current Workaround

Until the Lambda layer is fixed, the current code:
- ✅ Generates PDFs successfully
- ✅ Includes all text fields
- ✅ Includes address (properly formatted)
- ⚠️ Skips signature (logs warning)
- ⚠️ Warns: "Lambda layer PIL is broken"

This allows the application to function while you fix the infrastructure.
