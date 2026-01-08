# MySQL Migration Guide

## Overview

The backend has been migrated from DynamoDB to MySQL database. This document explains the changes and how to set up the system.

## Database Architecture

### Tables

#### 1. **contacts** (Existing table - updated)
Stores customer/contact information

**New Columns Added:**
- `industry` VARCHAR(100) - Customer's industry
- `position` VARCHAR(100) - Customer's position/job title

**Key Columns:**
- `contact_id` - Primary key
- `first_name`, `last_name` - Customer name
- `email_address` - Email (mapped from form `email` field)
- `phone_number` - Phone (mapped from form `phoneNumber` field)
- `company_name` - Company name
- `industry` - Industry (for company events)
- `position` - Position (for company events)
- `identification_card` - NRIC/IC number

#### 2. **event_bookings** (New table)
Stores event venue booking information

**Columns:**
- `booking_id` VARCHAR(50) PRIMARY KEY - Unique booking ID (e.g., BK20260107123456)
- `contact_id` INT - Foreign key to contacts table
- `event_date` DATE - Date of the event
- `event_time` VARCHAR(20) - Time of the event (e.g., "09:00 AM")
- `hall` VARCHAR(100) - Hall selection (grand-ballroom, crystal-hall, etc.)
- `is_company_event` BOOLEAN - Whether this is a company event
- `payment_proof_urls` JSON - Array of S3 URLs for payment proofs
- `status` ENUM('pending', 'confirmed', 'cancelled', 'completed')
- `metadata` JSON - Additional data (nric, pdfUrl, etc.)
- `created_at`, `updated_at`, `deleted_at` - Timestamps

## Form Field Mapping

### Contact Information
| Form Field | Database Column | Table |
|------------|-----------------|-------|
| `firstName` | `first_name` | contacts |
| `lastName` | `last_name` | contacts |
| `email` | `email_address` | contacts |
| `phoneNumber` | `phone_number` | contacts |
| `nric` | `identification_card` | contacts |
| `companyName` | `company_name` | contacts |
| `industry` | `industry` | contacts |
| `position` | `position` | contacts |

### Event Information
| Form Field | Database Column | Table |
|------------|-----------------|-------|
| `eventDate` | `event_date` | event_bookings |
| `eventTime` | `event_time` | event_bookings |
| `hall` | `hall` | event_bookings |
| `isCompanyEvent` | `is_company_event` | event_bookings |
| `paymentProofUrls` | `payment_proof_urls` | event_bookings |

## S3 Bucket Changes

### Payment Proof Uploads
- **Old:** `event-venue-bookings` (or `OUTPUT_BUCKET`)
- **New:** `payment-system-files` (configured via `PAYMENT_BUCKET`)

### Generated PDFs
- **Bucket:** Configured via `OUTPUT_BUCKET` environment variable
- **Path:** `event-bookings/pdfs/{filename}`

## Setup Instructions

### 1. Database Setup

#### Step 1: Run the schema migration
```bash
mysql -h your-host -u your-user -p your-database < database_schema.sql
```

This will:
- Add `industry` and `position` columns to existing `contacts` table
- Create new `event_bookings` table
- Set up indexes and foreign keys

#### Step 2: Verify the tables
```sql
-- Check contacts table structure
DESCRIBE contacts;

-- Check event_bookings table structure
DESCRIBE event_bookings;

-- Verify indexes
SHOW INDEXES FROM event_bookings;
```

### 2. S3 Bucket Configuration

#### Configure CORS on payment-system-files bucket
```bash
aws s3api put-bucket-cors \
  --bucket payment-system-files \
  --cors-configuration '{
    "CORSRules": [
      {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
        "MaxAgeSeconds": 3000
      }
    ]
  }'
```

Or use the Python script:
```bash
python3 fix_s3_cors.py payment-system-files
```

### 3. Lambda Environment Variables

Update your Lambda function environment variables:

```bash
# Required - MySQL Database
DB_HOST=your-mysql-host.rds.amazonaws.com
DB_NAME=your-database-name
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_PORT=3306

# Required - S3 Buckets
PAYMENT_BUCKET=payment-system-files
OUTPUT_BUCKET=your-output-bucket-for-pdfs

# Optional - PDF Generation
TEMPLATE_BUCKET=your-template-bucket
TEMPLATE_KEY=templates/event-booking-template.pdf

# Email Configuration
SES_SENDER=noreply@yourdomain.com
SES_SENDER_NAME=Confetti KL Events Team
ALERT_EMAIL=admin@yourdomain.com
```

### 4. Lambda IAM Permissions

The Lambda execution role needs:

#### S3 Permissions
```json
{
    "Effect": "Allow",
    "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
    ],
    "Resource": [
        "arn:aws:s3:::payment-system-files/*",
        "arn:aws:s3:::your-output-bucket/*",
        "arn:aws:s3:::your-template-bucket/*"
    ]
}
```

#### VPC Access (if RDS is in VPC)
```json
{
    "Effect": "Allow",
    "Action": [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface",
        "ec2:AssignPrivateIpAddresses",
        "ec2:UnassignPrivateIpAddresses"
    ],
    "Resource": "*"
}
```

### 5. Network Configuration

If your MySQL database is in a VPC:

1. **Add Lambda to VPC:**
   - Configure Lambda to run in the same VPC as your RDS instance
   - Select private subnets that have access to RDS
   - Attach security group that allows outbound to RDS security group

2. **RDS Security Group:**
   - Allow inbound on port 3306 from Lambda security group

3. **NAT Gateway (for internet access):**
   - Required if Lambda needs to access S3/SES/other AWS services
   - Or use VPC Endpoints for S3

## Testing

### Test Database Connection
```python
from services.database import test_connection
test_connection()
```

### Test Booking Creation
```bash
curl -X POST https://your-api-gateway-url/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phoneNumber": "60123456789",
    "nric": "123456-12-1234",
    "isCompanyEvent": false,
    "eventDate": "2026-02-01",
    "eventTime": "10:00 AM",
    "hall": "grand-ballroom",
    "paymentProofUrls": ["https://payment-system-files.s3.amazonaws.com/payment-proofs/file.png"]
  }'
```

### Query Bookings
```sql
-- Get all bookings with contact info
SELECT
    eb.booking_id,
    eb.event_date,
    eb.event_time,
    eb.hall,
    eb.status,
    c.first_name,
    c.last_name,
    c.email_address,
    c.phone_number,
    c.company_name
FROM event_bookings eb
JOIN contacts c ON eb.contact_id = c.contact_id
WHERE eb.deleted_at IS NULL
ORDER BY eb.created_at DESC;
```

## Migration from DynamoDB

If you have existing data in DynamoDB:

### 1. Export DynamoDB Data
```bash
aws dynamodb scan --table-name event-bookings > dynamodb-export.json
```

### 2. Transform and Import
Create a migration script to:
1. Read DynamoDB export
2. Create/update contacts in MySQL
3. Create event_bookings records
4. Link payment proof URLs

Example migration script structure:
```python
import json
from services.database import create_or_update_contact, create_event_booking

with open('dynamodb-export.json') as f:
    data = json.load(f)

for item in data['Items']:
    # Transform DynamoDB item format
    booking_data = {
        'firstName': item['firstName']['S'],
        'lastName': item['lastName']['S'],
        # ... map other fields
    }

    # Create contact
    contact_id = create_or_update_contact(booking_data)

    # Create booking
    create_event_booking(item['bookingId']['S'], contact_id, booking_data)
```

## Troubleshooting

### Connection Issues
```
Error: Can't connect to MySQL server
```
**Solutions:**
- Check DB_HOST, DB_PORT are correct
- Verify Lambda is in correct VPC/subnets
- Check security group rules
- Ensure RDS is publicly accessible (if not in VPC)

### Foreign Key Errors
```
Error: Cannot add or update a child row: a foreign key constraint fails
```
**Solution:**
- Ensure contact is created before creating event_booking
- The code handles this automatically via `create_or_update_contact`

### JSON Field Issues
```
Error: Invalid JSON value
```
**Solution:**
- Ensure paymentProofUrls is an array: `["url1", "url2"]`
- Check metadata is valid JSON

## Architecture Benefits

### Why MySQL?

1. **Relational Data** - Contacts and bookings have clear relationships
2. **Complex Queries** - Easy to join contacts with bookings
3. **Data Integrity** - Foreign keys ensure referential integrity
4. **Existing Infrastructure** - Leverage existing MySQL database
5. **Cost Effective** - No DynamoDB costs

### Data Flow

```
User Submits Form
    ↓
1. Create/Update Contact → contacts table
    ↓
2. Create Event Booking → event_bookings table (with contact_id FK)
    ↓
3. Upload Payment Proofs → payment-system-files S3 bucket
    ↓
4. Generate PDF (optional) → OUTPUT_BUCKET S3
    ↓
5. Send Email Confirmation
```

## Monitoring

### CloudWatch Logs
Monitor Lambda logs for:
- Database connection issues
- Query errors
- Foreign key violations

### Database Monitoring
```sql
-- Check recent bookings
SELECT COUNT(*) as total_bookings,
       DATE(created_at) as booking_date
FROM event_bookings
WHERE deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY booking_date DESC
LIMIT 7;

-- Check contact creation rate
SELECT COUNT(*) as new_contacts,
       DATE(created_at) as contact_date
FROM contacts
WHERE deleted_at IS NULL
GROUP BY DATE(created_at)
ORDER BY contact_date DESC
LIMIT 7;
```

## Support

For issues:
1. Check CloudWatch logs for errors
2. Verify database connectivity
3. Check S3 bucket permissions
4. Review Lambda VPC configuration
