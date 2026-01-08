# Wedding Form Backend - Refactored Structure

This backend has been refactored into modular components for better maintainability and organization.

## Module Structure

### `lambda_function.py`
**Main orchestrator** - Entry point for AWS Lambda. Coordinates all operations and handles HTTP requests/responses.

### `config.py`
**Configuration and constants** - Centralized configuration management including:
- Environment variables
- S3 bucket configurations
- Database settings
- Field mappings (frontend to backend)
- PDF positioning constants

### `utils.py`
**Utility functions** - Common helper functions:
- `get_malaysia_time()` - Get current time in Malaysia timezone (UTC+8)
- `map_frontend_to_backend_fields()` - Convert camelCase to snake_case and split fullName
- `process_phone_number()` - Format phone numbers
- `format_proper_case()` - Format names to proper case

### `database.py`
**Database operations** - All database interactions:
- `get_db_connection()` - Establish MySQL connection
- `check_duplicate_submission()` - Prevent duplicate form submissions
- `insert_lead_and_wedding_data()` - Insert data into leads and wedding_forms tables

### `file_handler.py`
**File upload and validation** - S3 file operations:
- `validate_file_data()` - Validate file size and type
- `upload_file_to_s3()` - Upload files to S3 with metadata
- `process_deposit_receipt()` - Handle deposit receipt uploads
- `update_s3_file_path()` - Update S3 paths after ID assignment

### `pdf_generator.py`
**PDF generation** - Create filled PDF forms:
- `format_field_value()` - Format values for PDF display
- `create_overlay()` - Create PDF overlay with form data
- `generate_pdf()` - Generate complete filled PDF
- `generate_pdf_filename()` - Create unique PDF filenames

### `email_service.py`
**Email notifications** - SES email operations:
- `send_email_with_attachment()` - Send confirmation emails with PDF (includes sender name)
- `send_alert_email()` - Send error alerts to administrators

## Key Improvements

### 1. **Modular Design**
- Separation of concerns - each module has a single responsibility
- Easier to test individual components
- Simpler to maintain and update

### 2. **Sender Name in Emails**
- Emails now include a friendly sender name: `SES_SENDER_NAME <email@address.com>`
- Configurable via environment variable `SES_SENDER_NAME`
- Defaults to "Confetti KL Wedding Team"

### 3. **Better Error Handling**
- Centralized error handling in each module
- Comprehensive logging throughout
- Alert emails sent for critical failures

### 4. **Improved Code Reusability**
- Common functions extracted to utils module
- Configuration centralized in config module
- Easy to reuse components in other projects

## Environment Variables

Required environment variables (set in AWS Lambda):

```
# S3 Configuration
TEMPLATE_BUCKET=your-template-bucket
TEMPLATE_KEY=path/to/template.pdf
OUTPUT_BUCKET=your-output-bucket
DEPOSITS_BUCKET=your-deposits-bucket

# Email Configuration
SES_SENDER=noreply@yourdomain.com
SES_SENDER_NAME=Your Company Name
ALERT_EMAIL=admin@yourdomain.com

# Database Configuration
DB_NAME=your_database
DB_HOST=your-db-host.rds.amazonaws.com
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_PORT=3306

# Optional
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf
```

## Deployment

When deploying to AWS Lambda, ensure all modules are packaged together:

```bash
cd backend
zip -r lambda_deployment.zip *.py
# Upload to AWS Lambda
```

## Migration Notes

- The old monolithic `lambda_function.py` has been backed up as `lambda_function_old_backup.py`
- All functionality remains the same - only the structure has changed
- No changes required to API calls or frontend integration

## Testing

Each module can be tested independently:

```python
# Example: Test database module
from database import get_db_connection, check_duplicate_submission

# Example: Test email service
from email_service import send_alert_email
```

## Dependencies

Required Python packages (add to Lambda layer or deployment package):
- boto3
- pymysql
- pdfrw
- reportlab
