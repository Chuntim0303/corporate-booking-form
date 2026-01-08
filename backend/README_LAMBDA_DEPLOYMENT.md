# Lambda Deployment Guide - PDF Dependencies

## Problem

The PDF is not attached to emails because the required Python dependencies (`reportlab`, `pdfrw`, `Pillow`) are not available in the AWS Lambda runtime environment.

### Error Symptoms
```
[WARNING] PDF generator not available - sending email without attachment
```

This happens because:
1. The dependencies are listed in `requirements.txt`
2. BUT they're not deployed to the Lambda execution environment
3. The import statements fail silently (wrapped in try-except)
4. PDF generation is skipped

## Solution

You need to deploy the Python dependencies to Lambda using a **Lambda Layer**.

### Option 1: Automated Build Script (Recommended)

We've provided a script to build the Lambda Layer automatically:

```bash
cd backend
./build-lambda-layer.sh
```

This will:
- Install all dependencies from `requirements.txt` in Lambda-compatible format
- Create a zip file: `lambda-layer-output/python-pdf-dependencies.zip`
- Display instructions for uploading to AWS

### Option 2: Manual Layer Creation

If you prefer to create the layer manually:

```bash
cd backend

# Create directory structure
mkdir -p lambda-layer/python

# Install dependencies (using Lambda-compatible binaries)
pip install \
    -r requirements.txt \
    -t lambda-layer/python \
    --platform manylinux2014_x86_64 \
    --only-binary=:all: \
    --upgrade

# Create zip file
cd lambda-layer
zip -r ../python-pdf-dependencies.zip .
cd ..
```

### Option 3: Use Docker (Most Compatible)

For best compatibility with AWS Lambda's execution environment:

```bash
cd backend

# Use official AWS Lambda Python image
docker run --rm \
    -v $(pwd):/var/task \
    public.ecr.aws/lambda/python:3.11 \
    bash -c "pip install -r requirements.txt -t /tmp/python && cd /tmp && zip -r /var/task/python-pdf-dependencies.zip python"
```

## Deployment Steps

### Step 1: Build the Layer

Run one of the build methods above. You'll get a zip file: `python-pdf-dependencies.zip`

### Step 2: Upload to AWS Lambda

#### Using AWS CLI:

```bash
aws lambda publish-layer-version \
    --layer-name python-pdf-dependencies \
    --description "Python dependencies for PDF generation (reportlab, pdfrw, Pillow)" \
    --zip-file fileb://lambda-layer-output/python-pdf-dependencies.zip \
    --compatible-runtimes python3.11 python3.10 python3.9
```

**Note the LayerVersionArn** from the output (e.g., `arn:aws:lambda:us-east-1:123456789012:layer:python-pdf-dependencies:1`)

#### Using AWS Console:

1. Go to AWS Lambda Console
2. Click "Layers" in the left sidebar
3. Click "Create layer"
4. Name: `python-pdf-dependencies`
5. Upload the zip file
6. Compatible runtimes: Select Python 3.9, 3.10, 3.11
7. Click "Create"

### Step 3: Attach Layer to Lambda Function

#### Using AWS CLI:

```bash
aws lambda update-function-configuration \
    --function-name YOUR_FUNCTION_NAME \
    --layers arn:aws:lambda:REGION:ACCOUNT_ID:layer:python-pdf-dependencies:1
```

**Replace:**
- `YOUR_FUNCTION_NAME` with your actual Lambda function name
- `REGION` with your AWS region (e.g., us-east-1)
- `ACCOUNT_ID` with your AWS account ID
- `:1` with the layer version number

#### Using AWS Console:

1. Go to Lambda > Functions
2. Select your function
3. Scroll down to "Layers" section
4. Click "Add a layer"
5. Select "Custom layers"
6. Choose `python-pdf-dependencies`
7. Select the version
8. Click "Add"

### Step 4: Verify Deployment

After attaching the layer, test your function:

1. Submit a partnership application through your form
2. Check the Lambda logs in CloudWatch
3. You should see:
   ```
   [INFO] Generating template-based PDF attachment
   [INFO] Template-based PDF generated successfully
   ```
4. Check your email - the PDF should be attached

## Troubleshooting

### Issue: "Unable to import module" error

**Solution:** Ensure the Lambda runtime version matches the Python version you used to build the layer.

```bash
# Check your Lambda function runtime in AWS Console
# Then rebuild the layer with matching Python version
pip install -r requirements.txt -t lambda-layer/python --python-version 3.11
```

### Issue: Layer size too large

**Solution:** The layer must be under 50MB (zipped) or 250MB (unzipped). Our dependencies should be ~25-30MB.

If it's too large, try:
```bash
# Install without cached files
pip install -r requirements.txt -t lambda-layer/python --no-cache-dir
```

### Issue: Still not generating PDF

**Check the following:**

1. **Environment Variables:** Ensure these are set in Lambda:
   ```
   TEMPLATE_BUCKET=your-s3-bucket-name
   TEMPLATE_KEY=templates/ibpp-application-template.pdf
   ```

2. **S3 Permissions:** Lambda execution role must have permission to read from S3:
   ```json
   {
     "Effect": "Allow",
     "Action": ["s3:GetObject"],
     "Resource": "arn:aws:s3:::your-bucket-name/*"
   }
   ```

3. **Check CloudWatch Logs** for specific error messages

## Dependencies Included

The layer includes:

- **reportlab** (4.0.7): PDF generation library
- **pdfrw** (0.4): PDF reading/writing library
- **Pillow** (10.1.0): Image processing for signatures
- **pymysql** (1.1.0): MySQL database connector
- **boto3** (1.34.0): AWS SDK for Python
- **python-dotenv** (1.0.0): Environment variable management
- **requests** (2.31.0): HTTP library

## Alternative: Deploy with Function Code

If you prefer not to use a layer, you can package dependencies with your function code:

```bash
cd backend

# Install dependencies in the same directory
pip install -r requirements.txt -t .

# Create deployment package
zip -r function.zip . -x "*.pyc" -x "__pycache__/*" -x "*.sh" -x "*.md"

# Upload to Lambda
aws lambda update-function-code \
    --function-name YOUR_FUNCTION_NAME \
    --zip-file fileb://function.zip
```

**⚠️ Warning:** This increases your function deployment package size and may cause slower cold starts.

## Best Practices

1. **Use Layers for Dependencies:** Keeps function code small and deployment fast
2. **Version Your Layers:** Create new layer versions when updating dependencies
3. **Tag Layers:** Use meaningful descriptions and tags
4. **Monitor Layer Size:** Keep layers under 50MB for optimal performance
5. **Test Before Production:** Always test in a dev/staging environment first

## Need Help?

If you're still having issues:

1. Check CloudWatch Logs for the exact error message
2. Verify Lambda execution role permissions
3. Ensure environment variables are set correctly
4. Confirm the Lambda runtime matches your layer Python version

For template-based PDF configuration, see: [README_PDF_TEMPLATE.md](README_PDF_TEMPLATE.md)
