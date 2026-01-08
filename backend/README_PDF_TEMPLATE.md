# PDF Template-Based Generation Guide

## Overview

Your backend now supports two PDF generation methods:

1. **Template-Based PDF Generation** (Recommended) - Overlays text at configurable positions on a PDF template
2. **ReportLab-Based PDF Generation** (Fallback) - Generates PDF from scratch using ReportLab

The system automatically tries template-based generation first, then falls back to ReportLab if template is not configured.

## Configuration

### 1. Environment Variables

Add these to your `.env` file or Lambda environment variables:

```bash
# PDF Template Configuration (optional)
TEMPLATE_BUCKET=your-s3-bucket-name
TEMPLATE_KEY=templates/ibpp-application-template.pdf
```

### 2. Placeholder Positions

Edit `backend/config.py` to adjust text positions on your PDF template:

```python
PLACEHOLDER_POSITIONS = {
    'full_name': (164, 599.5),        # Combined first + last name
    'email_address': (164, 574),
    'phone_number': (446, 574),
    'position': (164, 543.8),
    'company_name': (164, 516.7),
    'industry': (164, 489.6),
    'nric': (164, 462.2),
    'address_line_1': (164, 435),
    'address_line_2': (164, 408),
    'city': (164, 381),
    'state': (164, 354),
    'postal_code': (164, 327),
    'partnership_tier': (164, 300),
    'total_payable': (164, 273),
    'submitted_date': (164, 246),
}

# Signature positioning (if your form has signature)
SIGNATURE_POSITION = (40, 80)
SIGNATURE_SIZE = (180, 90)
```

### 3. How to Find Coordinates

PDF coordinates start from **bottom-left corner**:
- **X-axis**: Left (0) to Right (612 for letter size)
- **Y-axis**: Bottom (0) to Top (792 for letter size)

**Method 1: Using Adobe Acrobat**
1. Open your PDF template in Adobe Acrobat
2. Use the "Add Text" tool
3. Position cursor where you want text
4. Note the coordinates shown in the bottom status bar

**Method 2: Trial and Error**
1. Set initial coordinates in `config.py`
2. Deploy and test
3. Adjust coordinates based on output
4. Repeat until positioned correctly

## Setup Steps

### Step 1: Create Your PDF Template

1. Design your form in any tool (Word, Illustrator, etc.)
2. Export as PDF
3. Upload to S3 bucket specified in `TEMPLATE_BUCKET`

### Step 2: Configure Placeholder Positions

1. Open `backend/config.py`
2. Update `PLACEHOLDER_POSITIONS` dictionary with your field coordinates
3. Test and adjust as needed

### Step 3: Deploy

```bash
# Install dependencies
pip install -r requirements.txt

# Deploy to Lambda (your deployment process)
```

## Field Mapping

The system automatically maps frontend field names to backend names:

| Frontend Field | Backend Field | Description |
|---------------|---------------|-------------|
| `firstName` | `first_name` | First name |
| `lastName` | `last_name` | Last name |
| `email` | `email_address` | Email address |
| `phone` | `phone_number` | Phone number |
| `addressLine1` | `address_line_1` | Address line 1 |
| `addressLine2` | `address_line_2` | Address line 2 |
| `postalCode` | `postal_code` | Postal code |
| `companyName` | `company_name` | Company name |
| `partnershipTier` | `partnership_tier` | Partnership tier |
| `totalPayable` | `total_payable` | Total amount |

The system also automatically adds:
- `full_name` - Combines firstName + lastName
- `submitted_date` - Current date in Malaysia timezone (dd/mm/yyyy)

## How It Works

1. **Application Submission**: User submits form data
2. **Database Insert**: Data saved to database
3. **PDF Generation**:
   - If `TEMPLATE_BUCKET` and `TEMPLATE_KEY` are configured:
     - Load template from S3
     - Create overlay with text at specified positions
     - Merge overlay with template
   - Otherwise: Generate PDF using ReportLab
4. **Email Attachment**: PDF attached to confirmation email

## Testing

### Test Template-Based Generation

```python
# In your Lambda test event
{
  "body": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "0123456789",
    "position": "CEO",
    "companyName": "Test Company",
    "industry": "Technology",
    "nric": "123456789012",
    "addressLine1": "123 Main St",
    "city": "Kuala Lumpur",
    "state": "Wilayah Persekutuan",
    "postalCode": "50000",
    "partnershipTier": "gold",
    "totalPayable": 5000,
    "termsAccepted": true
  }
}
```

## Troubleshooting

### PDF Not Generated
- Check Lambda logs for errors
- Verify `TEMPLATE_BUCKET` and `TEMPLATE_KEY` are set correctly
- Ensure S3 bucket permissions allow Lambda to read the template

### Text Not Positioned Correctly
- Adjust coordinates in `PLACEHOLDER_POSITIONS`
- Remember: PDF coordinates start from bottom-left
- Use smaller increments (5-10 points) for fine-tuning

### Missing Dependencies
```bash
pip install reportlab pdfrw Pillow
```

## Example Configuration

```python
# config.py - Example for a corporate partnership form
PLACEHOLDER_POSITIONS = {
    # Personal Information Section (top of page)
    'full_name': (100, 700),
    'email_address': (100, 675),
    'phone_number': (350, 675),
    
    # Company Information Section (middle)
    'company_name': (100, 600),
    'industry': (100, 575),
    'partnership_tier': (100, 550),
    
    # Address Section (lower middle)
    'address_line_1': (100, 475),
    'city': (100, 450),
    'state': (250, 450),
    'postal_code': (400, 450),
    
    # Financial Section (bottom)
    'total_payable': (100, 375),
    'submitted_date': (100, 350),
}
```

## Benefits of Template-Based Approach

✅ **Professional Appearance**: Use your existing branded PDF templates  
✅ **Easy Updates**: Change template design without code changes  
✅ **Flexible Positioning**: Precise control over text placement  
✅ **Signature Support**: Overlay signature images on template  
✅ **Fallback Support**: Automatically falls back to ReportLab if template unavailable
