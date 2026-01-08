# 🚨 QUICK FIX: PDF Not Attached to Email

## The Problem
```
[WARNING] PDF generator not available - sending email without attachment
```

## The Cause
Python dependencies (`reportlab`, `pdfrw`, `Pillow`) are NOT installed in your Lambda function environment.

## The Fix (3 Steps - 5 Minutes)

### Step 1: Build the Lambda Layer
```bash
cd backend
./build-lambda-layer.sh
```

This creates: `lambda-layer-output/python-pdf-dependencies.zip`

### Step 2: Upload to AWS Lambda
```bash
# Option A: AWS CLI (fastest)
aws lambda publish-layer-version \
    --layer-name python-pdf-dependencies \
    --zip-file fileb://lambda-layer-output/python-pdf-dependencies.zip \
    --compatible-runtimes python3.11

# Option B: AWS Console
# 1. Lambda Console → Layers → Create layer
# 2. Upload python-pdf-dependencies.zip
# 3. Set compatible runtime to Python 3.11
```

**Copy the LayerVersionArn** from the output!

### Step 3: Attach to Your Function
```bash
# Option A: AWS CLI
aws lambda update-function-configuration \
    --function-name YOUR_FUNCTION_NAME \
    --layers YOUR_LAYER_ARN_FROM_STEP_2

# Option B: AWS Console
# 1. Lambda Console → Functions → Your Function
# 2. Configuration → Layers → Add a layer
# 3. Select "Custom layers" → python-pdf-dependencies
# 4. Add
```

### Step 4: Verify
Test your application form. You should see in CloudWatch Logs:
```
✓ [INFO] Template-based PDF generated successfully
✓ [INFO] Email sent successfully
```

## Alternative: Quick Docker Build

If the script doesn't work, use Docker (most reliable):

```bash
cd backend

docker run --rm \
    -v $(pwd):/var/task \
    public.ecr.aws/lambda/python:3.11 \
    bash -c "pip install -r requirements.txt -t /tmp/python && cd /tmp && zip -r /var/task/python-pdf-dependencies.zip python"
```

Then proceed to Step 2 above.

## Still Not Working?

### Check 1: Environment Variables
Verify these are set in Lambda Configuration → Environment variables:
- `TEMPLATE_BUCKET` = your S3 bucket name
- `TEMPLATE_KEY` = path to PDF template (e.g., `templates/ibpp-application-template.pdf`)

### Check 2: S3 Permissions
Your Lambda execution role needs permission to read the template from S3:

```json
{
  "Effect": "Allow",
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::YOUR_BUCKET/*"
}
```

### Check 3: CloudWatch Logs
Look for specific error messages in CloudWatch Logs:
- Lambda Console → Monitor → View logs in CloudWatch
- Look for any `[ERROR]` messages related to PDF generation

## Need More Details?
See the comprehensive guide: [README_LAMBDA_DEPLOYMENT.md](README_LAMBDA_DEPLOYMENT.md)
