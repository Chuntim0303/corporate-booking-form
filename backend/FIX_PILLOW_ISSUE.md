# 🔧 Fix: Pillow (PIL) Import Error in Lambda

## Current Issue

Your CloudWatch logs show:

```
✓ reportlab library: Available (version 4.4.3) ✅
✓ pdfrw library: Available ✅
✗ Pillow (PIL) library: NOT AVAILABLE ❌
   Error: cannot import name '_imaging' from 'PIL'
```

## Root Cause

**Pillow is installed but BROKEN**. The Python files exist, but the compiled C extensions are missing or incompatible.

This happens because:
- The Lambda layer was built on the wrong architecture (macOS/Windows instead of Linux)
- Pillow's native C extensions (`_imaging`, `_imagingft`, etc.) were not compiled for Lambda's environment
- Lambda runs on **Amazon Linux 2 (x86_64)**, but the dependencies were built for a different OS

## Impact

Since Pillow import fails:
- ✗ `pdf_generator.py` cannot be imported (needs Pillow for images)
- ✗ `pdf_generator_template.py` cannot be imported (needs Pillow for signatures)
- ✗ `config.py` cannot be imported
- ✗ **NO PDF generation works** → Emails sent without attachments

## Solution: Rebuild Layer with Docker

### Option 1: Using Docker (Recommended - Most Reliable)

Docker uses AWS Lambda's official Python image, ensuring 100% compatibility:

```bash
cd backend
./build-lambda-layer-docker.sh
```

This script:
- Uses AWS's official Lambda Python image
- Compiles Pillow correctly for Amazon Linux 2
- Includes all necessary C extensions
- Verifies the build before creating the zip

**Requirements:**
- Docker installed and running
- Internet connection

### Option 2: Using AWS CloudShell

If you can't use Docker locally, use AWS CloudShell (already has the right environment):

```bash
# 1. Upload your requirements.txt to CloudShell
# 2. Run these commands in CloudShell:

mkdir -p lambda-layer/python
pip install \
    -r requirements.txt \
    -t lambda-layer/python \
    --upgrade

cd lambda-layer
zip -r ../python-pdf-dependencies.zip python
cd ..

# 3. Download the zip file
```

### Option 3: Using EC2 Amazon Linux 2

Launch an Amazon Linux 2 EC2 instance and build there:

```bash
sudo yum install -y python3.11 python3-pip zip
pip3.11 install -r requirements.txt -t python --upgrade
zip -r python-pdf-dependencies.zip python
```

## Deployment Steps

After building with Docker (or alternative method):

### 1. Upload to Lambda

```bash
cd backend

# Upload layer
aws lambda publish-layer-version \
    --layer-name python-pdf-dependencies \
    --description "PDF dependencies built with Docker for Lambda compatibility" \
    --zip-file fileb://lambda-layer-output/python-pdf-dependencies.zip \
    --compatible-runtimes python3.11

# Note the LayerVersionArn from output
```

### 2. Attach to Function

```bash
# Replace with your actual values
aws lambda update-function-configuration \
    --function-name YOUR_FUNCTION_NAME \
    --layers arn:aws:lambda:REGION:ACCOUNT_ID:layer:python-pdf-dependencies:1
```

Or use AWS Console:
1. Lambda Console → Functions → [Your Function]
2. Configuration → Layers
3. Remove old broken layer (if any)
4. Add a layer → Custom layers → python-pdf-dependencies → Add

### 3. Test

Submit a test application. Check CloudWatch logs for:

```
✓ reportlab library: Available (version 4.0.7)
✓ pdfrw library: Available
✓ Pillow (PIL) library: Available (version 10.1.0)
✓ pdf_generator (ReportLab): Available
✓ pdf_generator_template: Available
✓ Config: Available
...
✓ PDF GENERATED SUCCESSFULLY
  - Filename: IBPP_Application_...pdf
  - Size: 45678 bytes
✓ PDF attachment available - Using send_raw_email
```

## Why Docker Method is Best

| Method | Pros | Cons |
|--------|------|------|
| **Docker** | ✅ 100% Lambda compatible<br>✅ Uses official AWS image<br>✅ Works on any OS<br>✅ Verifies build | Requires Docker installed |
| pip --platform | ⚠️ Sometimes incomplete<br>⚠️ May miss C extensions | Easy to run |
| CloudShell | ✅ AWS environment<br>✅ No local setup | Manual file upload/download |
| EC2 | ✅ Native Linux build | Need to launch EC2 instance |

## Verification

After deploying the new layer, the first Lambda invocation should log:

```
============================================================
Lambda Function Initialization - Import Status
============================================================
✓ presign_service: Available
✓ textract_service: Available
✓ email_service: Available
✓ pdf_generator (ReportLab): Available          ← Was "NOT AVAILABLE"
✓ pdf_generator_template: Available              ← Was "NOT AVAILABLE"
✓ Config: Available                              ← Was "NOT AVAILABLE"
✓ reportlab library: Available (version 4.0.7)
✓ pdfrw library: Available
✓ Pillow (PIL) library: Available (version 10.1.0)  ← Was "NOT AVAILABLE"
Template Config - TEMPLATE_BUCKET: your-bucket-name
Template Config - TEMPLATE_KEY: templates/template.pdf
============================================================
```

## Common Mistakes to Avoid

❌ **Don't** use `pip install` on macOS/Windows and upload directly
❌ **Don't** use `pip install --platform` without `--only-binary=:all:`
❌ **Don't** forget to remove the old broken layer before adding the new one
✅ **Do** use Docker with official AWS Lambda image
✅ **Do** verify all imports work before zipping
✅ **Do** check CloudWatch logs after deployment

## Still Having Issues?

If Pillow still doesn't work after using Docker:

1. **Check Lambda Runtime:** Ensure your function uses Python 3.11 (or match the version in the script)

2. **Check Layer Attachment:** Verify the layer is actually attached:
   ```bash
   aws lambda get-function-configuration --function-name YOUR_FUNCTION_NAME
   ```
   Look for `Layers` section in output.

3. **Check Layer Size:** Unzipped layer must be < 250MB:
   ```bash
   unzip -l lambda-layer-output/python-pdf-dependencies.zip | tail -1
   ```

4. **Test Layer Locally with Docker:**
   ```bash
   docker run --rm \
       -v $(pwd)/lambda-layer-output:/opt \
       -e AWS_LAMBDA_FUNCTION_MEMORY_SIZE=512 \
       public.ecr.aws/lambda/python:3.11 \
       python3 -c "import sys; sys.path.insert(0, '/opt/python'); from PIL import Image; print('✓ Pillow works!')"
   ```

## Summary

The issue is **Pillow's C extensions are missing/incompatible**. The fix is to **rebuild the Lambda layer using Docker** with AWS's official Python image. This ensures Pillow (and all other dependencies) are compiled correctly for Lambda's Linux environment.

After deploying the correctly-built layer, PDF generation will work and PDFs will be attached to emails!
