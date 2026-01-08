import boto3
import io
import os
import json
import logging
import base64
import re
import pymysql
from datetime import datetime, timedelta
from pdfrw import PdfReader, PdfWriter, PageMerge
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def get_malaysia_time():
    """Get current time in Malaysia timezone (UTC+8)"""
    utc_time = datetime.utcnow()
    malaysia_time = utc_time + timedelta(hours=8)
    return malaysia_time

# Frontend to Backend field mapping
FRONTEND_TO_BACKEND_MAPPING = {
    'fullName': 'full_name',  # Will be split into first_name and last_name
    'email': 'email_address',
    'address1': 'address_line_1',
    'address2': 'address_line_2',
    'postcode': 'postcode',
    'city': 'city',
    'state': 'state',
    'gender': 'gender',
    'telNo': 'phone_number',
    'groomName': 'groom_name',
    'groomNRIC': 'groom_nric',
    'brideName': 'bride_name',
    'brideNRIC': 'bride_nric',
    'guests': 'guest_count',
    'consultantName': 'consultant_name',
    'venueSelection': 'venue_selection',
    'eventDate': 'event_date',
    'requests': 'special_requests',
    'hasBookingDeposit': 'has_booking_deposit',
    'depositReceipt': 'deposit_receipt_url',
    'signatureData': 'signature_data',
    'agreedToTerms': 'agreed_to_terms',
    'eventReference': 'event_reference'
}

# Placeholder positions for PDF (full_name position will use first_name + last_name)
PLACEHOLDER_POSITIONS = {
    'full_name': (164, 599.5),  # Will combine first_name and last_name for PDF
    'email_address': (164, 574),
    'gender': (446, 599.5),
    'phone_number': (446, 574),
    'address_line_1': (164, 543.8),
    'address_line_2': (164, 516.7),
    'postcode': (250.56, 489.6),
    'city': (446, 489.6),
    'state': (250.56, 462.2),
    'groom_name': (188, 417),
    'groom_nric': (164, 380),
    'bride_name': (391.65, 417),
    'bride_nric': (446, 380),
    'guest_count': (164, 358),
    'consultant_name': (452, 57),
    'venue_selection': (446, 358),
    'event_date': (164, 333),
    'special_requests': (164, 308),
}

# Database field mapping for leads table (no full_name)
LEADS_FIELD_MAPPING = {
    'first_name': 'first_name',
    'last_name': 'last_name',
    'email_address': 'email_address',
    'gender': 'gender',
    'phone_number': 'phone_number',
    'address_line_1': 'address_line_1',
    'address_line_2': 'address_line_2',
    'city': 'city',
    'state': 'state',
    'postcode': 'postcode'
}

# Database field mapping for wedding_forms table
WEDDING_FORMS_FIELD_MAPPING = {
    'groom_name': 'groom_name',
    'groom_nric': 'groom_nric',
    'bride_name': 'bride_name',
    'bride_nric': 'bride_nric',
    'guest_count': 'guest_count',
    'consultant_name': 'consultant_name',
    'venue_selection': 'venue_selection',
    'event_date': 'event_date',
    'special_requests': 'special_requests',
    'has_booking_deposit': 'has_booking_deposit',
    'deposit_receipt_url': 'deposit_receipt_url',
    'signature_data': 'signature_data',
    'event_reference': 'event_reference'
}

# Reposition signature for visibility
SIGNATURE_POSITION = (50, 70)
SIGNATURE_SIZE = (200, 100)

# Environment variables
TEMPLATE_BUCKET = os.environ.get('TEMPLATE_BUCKET')
TEMPLATE_KEY = os.environ.get('TEMPLATE_KEY')
OUTPUT_BUCKET = os.environ.get('OUTPUT_BUCKET')
OUTPUT_KEY = os.environ.get('OUTPUT_KEY', 'output/filled.pdf')
DEPOSITS_BUCKET = os.environ.get('DEPOSITS_BUCKET', 'wedding-form-confetti-bucket')
SES_SENDER = os.environ.get("SES_SENDER", "noreply@example.com")
ALERT_EMAIL = os.environ.get("ALERT_EMAIL", "admin@example.com")  # Admin email for failure alerts

# File upload constraints
MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', '10485760'))  # 10MB default
ALLOWED_FILE_TYPES = os.environ.get('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/jpg,application/pdf').split(',')

# Database environment variables
DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_PORT = os.environ.get('DB_PORT', '3306')
LEADS_TABLE = os.environ.get('LEADS_TABLE', 'leads')
WEDDING_FORMS_TABLE = os.environ.get('WEDDING_FORMS_TABLE', 'wedding_forms')

def map_frontend_to_backend_fields(frontend_data):
    """
    Convert frontend camelCase field names to backend snake_case field names.
    Also handles splitting fullName into first_name and last_name.
    """
    backend_data = {}

    for frontend_key, value in frontend_data.items():
        # Check if we have a mapping for this field
        if frontend_key in FRONTEND_TO_BACKEND_MAPPING:
            backend_key = FRONTEND_TO_BACKEND_MAPPING[frontend_key]

            # Special handling for fullName - split into first_name and last_name
            if frontend_key == 'fullName' and value:
                name_parts = str(value).strip().split(None, 1)  # Split on first whitespace
                backend_data['first_name'] = name_parts[0] if len(name_parts) > 0 else ''
                backend_data['last_name'] = name_parts[1] if len(name_parts) > 1 else ''
                logger.info(f"Split fullName '{value}' into first_name='{backend_data['first_name']}' and last_name='{backend_data['last_name']}'")
            else:
                backend_data[backend_key] = value
        else:
            # If no mapping exists, keep the original key
            backend_data[frontend_key] = value

    return backend_data

def get_db_connection():
    """Establish database connection"""
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=int(DB_PORT),
            charset='utf8mb4',
            autocommit=False
        )
        logger.info("Database connection established successfully")
        return connection
    except Exception as e:
        logger.error(f"Error connecting to database: {str(e)}")
        raise

def process_phone_number(phone_number):
    """Process phone number to maintain E.164 format (+60122232334)"""
    if not phone_number:
        return phone_number

    phone_str = str(phone_number).strip()

    if phone_str.startswith('+'):
        return phone_str

    return phone_str

def format_proper_case(name):
    """Format name to proper case (Title Case)"""
    if not name:
        return name

    name_str = str(name).strip()
    if not name_str:
        return name_str

    parts = name_str.split()
    formatted_parts = []

    for part in parts:
        if not part:
            continue

        lower_words = ['bin', 'binti', 'al', 'de', 'van', 'von', 'da', 'del', 'della', 'di']
        suffix_words = ['jr', 'sr', 'ii', 'iii', 'iv']

        if len(formatted_parts) > 0 and part.lower() in lower_words:
            formatted_parts.append(part.lower())
        elif part.lower() in suffix_words:
            formatted_parts.append(part.upper())
        elif '-' in part:
            hyphen_parts = part.split('-')
            formatted_hyphen = '-'.join([hp.capitalize() for hp in hyphen_parts if hp])
            formatted_parts.append(formatted_hyphen)
        elif "'" in part:
            apostrophe_parts = part.split("'")
            if len(apostrophe_parts) == 2:
                first_part, second_part = apostrophe_parts
                if len(first_part) <= 2:
                    formatted_apostrophe = first_part.capitalize() + "'" + second_part.capitalize()
                else:
                    formatted_apostrophe = first_part.capitalize() + "'" + second_part.lower()
                formatted_parts.append(formatted_apostrophe)
            else:
                formatted_parts.append(part.capitalize())
        else:
            formatted_parts.append(part.capitalize())

    return ' '.join(formatted_parts)

def validate_file_data(file_data_url, max_size=MAX_FILE_SIZE):
    """Validate file size and type from data URL"""
    try:
        if not file_data_url or not file_data_url.startswith('data:'):
            raise ValueError("Invalid file data format")

        mime_type = file_data_url.split(';')[0].split(':')[1]
        if mime_type not in ALLOWED_FILE_TYPES:
            raise ValueError(f"File type {mime_type} not allowed. Allowed types: {', '.join(ALLOWED_FILE_TYPES)}")

        base64_data = file_data_url.split(',')[1] if ',' in file_data_url else file_data_url
        file_size = len(base64.b64decode(base64_data))

        if file_size > max_size:
            raise ValueError(f"File size {file_size} bytes exceeds maximum {max_size} bytes")

        return mime_type, base64_data, file_size

    except Exception as e:
        logger.error(f"File validation error: {str(e)}")
        raise

def upload_file_to_s3(file_data_url, wedding_id, file_type="deposit_receipt", customer_data=None):
    """Upload file to S3 and return the clickable HTTPS URL"""
    try:
        if not file_data_url:
            return None

        mime_type, base64_data, file_size = validate_file_data(file_data_url)
        file_bytes = base64.b64decode(base64_data)

        malaysia_now = get_malaysia_time()
        timestamp = malaysia_now.strftime("%Y%m%d_%H%M%S")
        file_extension = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg',
            'image/png': 'png',
            'application/pdf': 'pdf'
        }.get(mime_type, 'bin')

        filename = f"{file_type}/{wedding_id}/{timestamp}_{file_type}.{file_extension}"

        s3 = boto3.client('s3')
        s3.put_object(
            Bucket=DEPOSITS_BUCKET,
            Key=filename,
            Body=file_bytes,
            ContentType=mime_type,
            Metadata={
                'wedding_id': str(wedding_id),
                'file_type': file_type,
                'original_size': str(file_size),
                'upload_timestamp': timestamp,
                'upload_time_malaysia': malaysia_now.strftime("%Y-%m-%d %H:%M:%S MYT")
            }
        )

        https_url = f"https://{DEPOSITS_BUCKET}.s3.amazonaws.com/{filename}"
        logger.info(f"File uploaded successfully, accessible at: {https_url}")
        return https_url

    except Exception as e:
        logger.error(f"Error uploading file to S3: {str(e)}")
        # Send alert email for file upload failure
        send_alert_email(
            error_type="File Upload to S3 Failed",
            error_message=f"Failed to upload {file_type} to S3: {str(e)}",
            customer_data=customer_data,
            traceback_info=str(e)
        )
        raise

def process_deposit_receipt(deposit_receipt_data, wedding_id, customer_data=None):
    """Process and store deposit receipt file in S3"""
    if not deposit_receipt_data:
        return None

    try:
        https_url = upload_file_to_s3(deposit_receipt_data, wedding_id, "deposit_receipt", customer_data)
        return https_url
    except Exception as e:
        logger.error(f"Error processing deposit receipt: {str(e)}")
        raise

def check_duplicate_submission(form_data, time_window_minutes=5):
    """
    Check if a similar submission exists within the time window.
    Returns (is_duplicate, duplicate_info) tuple.
    """
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        malaysia_now = get_malaysia_time()
        time_threshold = malaysia_now - timedelta(minutes=time_window_minutes)

        # Check for duplicates based on email, NRIC, or phone number
        email = form_data.get('email_address')
        phone = form_data.get('phone_number')
        groom_nric = form_data.get('groom_nric')
        bride_nric = form_data.get('bride_nric')

        # Build query to check for recent submissions with same identifiers
        check_query = f"""
        SELECT w.id, w.created_at, l.email_address, l.phone_number, w.groom_nric, w.bride_nric
        FROM {WEDDING_FORMS_TABLE} w
        JOIN {LEADS_TABLE} l ON w.lead_id = l.id
        WHERE w.created_at >= %s
        AND (
            l.email_address = %s
            OR l.phone_number = %s
            OR w.groom_nric = %s
            OR w.bride_nric = %s
        )
        ORDER BY w.created_at DESC
        LIMIT 1
        """

        cursor.execute(check_query, (time_threshold, email, phone, groom_nric, bride_nric))
        result = cursor.fetchone()

        cursor.close()
        connection.close()

        if result:
            wedding_id, created_at, dup_email, dup_phone, dup_groom_nric, dup_bride_nric = result
            duplicate_info = {
                'wedding_id': wedding_id,
                'created_at': created_at,
                'email': dup_email,
                'phone': dup_phone,
                'groom_nric': dup_groom_nric,
                'bride_nric': dup_bride_nric
            }
            return True, duplicate_info

        return False, None

    except Exception as e:
        logger.error(f"Error checking for duplicate submission: {str(e)}")
        if connection:
            connection.close()
        # Don't block submission if duplicate check fails
        return False, None

def insert_lead_and_wedding_data(form_data, wedding_id_for_upload=None):
    """Insert data into leads and wedding_forms tables (no full_name in leads)"""
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        malaysia_now = get_malaysia_time()

        deposit_receipt_url = None
        if form_data.get('has_booking_deposit') and form_data.get('deposit_receipt_url'):
            try:
                temp_id = wedding_id_for_upload or f"temp_{int(malaysia_now.timestamp())}"
                deposit_receipt_url = process_deposit_receipt(form_data['deposit_receipt_url'], temp_id, form_data)
                logger.info(f"Deposit receipt uploaded to: {deposit_receipt_url}")
            except Exception as file_error:
                logger.error(f"Failed to upload deposit receipt: {str(file_error)}")
                raise Exception(f"Failed to upload deposit receipt: {str(file_error)}")

        # Step 1: Insert into leads table (no full_name)
        leads_data = {}
        for form_field, db_column in LEADS_FIELD_MAPPING.items():
            if form_field in form_data:
                value = form_data[form_field]
                if form_field == 'phone_number':
                    value = process_phone_number(value)
                leads_data[db_column] = str(value) if value is not None else None

        leads_data['lead_source'] = 'wedding form'
        leads_data['created_at'] = malaysia_now
        leads_data['updated_at'] = malaysia_now

        leads_columns = list(leads_data.keys())
        leads_placeholders = ['%s'] * len(leads_columns)
        leads_values = list(leads_data.values())

        insert_leads_query = f"""
        INSERT INTO {LEADS_TABLE} ({', '.join(leads_columns)})
        VALUES ({', '.join(leads_placeholders)})
        """

        cursor.execute(insert_leads_query, leads_values)
        lead_id = cursor.lastrowid
        logger.info(f"Lead inserted successfully with ID: {lead_id}")

        # Step 2: Insert into wedding_forms table
        wedding_forms_data = {'lead_id': lead_id}

        for form_field, db_column in WEDDING_FORMS_FIELD_MAPPING.items():
            if form_field in form_data:
                value = form_data[form_field]
                if form_field == 'event_date' and value:
                    wedding_forms_data[db_column] = value
                elif form_field == 'guest_count' and value:
                    try:
                        wedding_forms_data[db_column] = int(str(value))
                    except ValueError:
                        wedding_forms_data[db_column] = str(value)
                elif form_field == 'has_booking_deposit':
                    wedding_forms_data[db_column] = bool(value)
                elif form_field == 'signature_data' and value:
                    wedding_forms_data[db_column] = value
                elif form_field in ['groom_name', 'bride_name'] and value:
                    wedding_forms_data[db_column] = format_proper_case(value)
                    logger.info(f"Formatted {form_field} from '{value}' to '{wedding_forms_data[db_column]}'")
                else:
                    wedding_forms_data[db_column] = str(value) if value is not None else None

        if deposit_receipt_url:
            wedding_forms_data['deposit_receipt_url'] = deposit_receipt_url

        wedding_forms_data['created_at'] = malaysia_now
        wedding_forms_data['updated_at'] = malaysia_now

        wedding_columns = list(wedding_forms_data.keys())
        wedding_placeholders = ['%s'] * len(wedding_columns)
        wedding_values = list(wedding_forms_data.values())

        insert_wedding_query = f"""
        INSERT INTO {WEDDING_FORMS_TABLE} ({', '.join(wedding_columns)})
        VALUES ({', '.join(wedding_placeholders)})
        """

        cursor.execute(insert_wedding_query, wedding_values)
        wedding_form_id = cursor.lastrowid

        connection.commit()
        cursor.close()
        connection.close()

        if deposit_receipt_url and wedding_id_for_upload and wedding_id_for_upload != wedding_form_id:
            try:
                deposit_receipt_url = update_s3_file_path(deposit_receipt_url, wedding_id_for_upload, wedding_form_id)
            except Exception as update_error:
                logger.warning(f"Could not update S3 file path: {str(update_error)}")

        logger.info(f"Wedding form data inserted successfully with ID: {wedding_form_id}")
        return wedding_form_id, lead_id

    except Exception as e:
        logger.error(f"Error inserting data into database: {str(e)}", exc_info=True)
        if connection:
            connection.rollback()
            connection.close()
        raise

def update_s3_file_path(old_https_url, temp_id, actual_wedding_id):
    """Update S3 file path from temporary ID to actual wedding ID"""
    try:
        s3 = boto3.client('s3')
        old_key = old_https_url.replace(f"https://{DEPOSITS_BUCKET}.s3.amazonaws.com/", "")
        new_key = old_key.replace(str(temp_id), str(actual_wedding_id))
        copy_source = {'Bucket': DEPOSITS_BUCKET, 'Key': old_key}
        s3.copy_object(CopySource=copy_source, Bucket=DEPOSITS_BUCKET, Key=new_key)
        s3.delete_object(Bucket=DEPOSITS_BUCKET, Key=old_key)
        logger.info(f"Updated S3 file path from {old_key} to {new_key}")
        return f"https://{DEPOSITS_BUCKET}.s3.amazonaws.com/{new_key}"
    except Exception as e:
        logger.error(f"Error updating S3 file path: {str(e)}")
        raise

def format_field_value(key, value):
    """Format field values for display in PDF"""
    if not value:
        return ""

    if key == 'has_booking_deposit':
        return "Yes" if value else "No"
    elif key == 'agreed_to_terms':
        return "Agreed" if value else "Not Agreed"
    elif key == 'consultant_name':
        return str(value).replace('_', ' ').title()
    elif key == 'venue_selection':
        return str(value).replace('_', ' ').title()
    elif key == 'state':
        return str(value).replace('_', ' ').title()
    elif key == 'gender':
        return str(value).title()
    elif key == 'phone_number':
        return str(value)
    else:
        return str(value)

def create_overlay(texts):
    """Create PDF overlay with text fields and signature"""
    logger.info("Creating PDF overlay with text fields and signature")
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    can.setFont("Helvetica", 10)

    # Combine first_name and last_name for full_name position in PDF
    full_name = f"{texts.get('first_name', '')} {texts.get('last_name', '')}".strip()
    texts = texts.copy()  # Avoid modifying original dict
    texts['full_name'] = full_name

    for key, value in texts.items():
        if key in PLACEHOLDER_POSITIONS and key != 'signature_data' and value:
            x, y = PLACEHOLDER_POSITIONS[key]
            formatted_value = format_field_value(key, value)
            logger.info(f"Adding text for key '{key}' at position ({x}, {y}): {formatted_value}")

            if key == 'special_requests':
                lines = str(formatted_value).split('\n')
                line_height = 12
                for i, line in enumerate(lines):
                    if i < 5:
                        can.drawString(x, y - i * line_height, line[:80])
            else:
                text_to_draw = formatted_value[:60]
                can.drawString(x, y, text_to_draw)

    signature_data_url = texts.get('signature_data')
    if signature_data_url:
        try:
            logger.info("Processing signature data")
            base64_data = re.sub('^data:image/.+;base64,', '', signature_data_url)
            image_data = base64.b64decode(base64_data)
            image_stream = io.BytesIO(image_data)
            img = ImageReader(image_stream)
            x, y = SIGNATURE_POSITION
            width, height = SIGNATURE_SIZE
            can.drawImage(img, x, y, width=width, height=height)
            logger.info("Signature image drawn on canvas")
        except Exception as e:
            logger.error(f"Error processing signature image: {str(e)}", exc_info=True)

    can.save()
    packet.seek(0)
    overlay_pdf = PdfReader(packet)
    logger.info(f"Overlay PDF pages count: {len(overlay_pdf.pages)}")
    return overlay_pdf

def generate_pdf_filename(customer_name, phone_number):
    """Generate PDF filename with customer name and last 4 digits of phone number and timestamp"""
    try:
        clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', customer_name)
        clean_name = clean_name.replace(' ', '_')[:20]
        phone_digits = re.sub(r'[^\d]', '', phone_number)
        last_4_digits = phone_digits[-4:] if len(phone_digits) >= 4 else phone_digits
        malaysia_now = get_malaysia_time()
        timestamp = malaysia_now.strftime("%Y%m%d_%H%M%S")
        filename = f"WeddingForm_{clean_name}_{last_4_digits}_{timestamp}.pdf"
        return filename
    except Exception as e:
        logger.error(f"Error generating PDF filename: {str(e)}")
        malaysia_now = get_malaysia_time()
        timestamp = malaysia_now.strftime("%Y%m%d_%H%M%S")
        return f"WeddingForm_{timestamp}.pdf"

def send_email_with_attachment(pdf_bytes, recipient, customer_name=None, phone_number=None):
    """Send email with PDF attachment"""
    ses = boto3.client('ses')
    msg = MIMEMultipart()

    subject = "Your Wedding Form Submission"
    msg['Subject'] = subject
    msg['From'] = SES_SENDER
    msg['To'] = recipient

    body_text = f"""Hello,

Your wedding form has been successfully submitted.

Thank you for choosing our venue for your special day. We have received all your details and will be in touch within 48 hours to confirm your booking and discuss the next steps.

Please find the attached PDF copy for your records.

If you have any questions, please don't hesitate to contact us.

Best regards,
Wedding Venue Team"""

    msg.attach(MIMEText(body_text, 'plain'))
    part = MIMEApplication(pdf_bytes)
    filename = generate_pdf_filename(customer_name or "Customer", phone_number or "0000")
    part.add_header('Content-Disposition', 'attachment', filename=filename)
    msg.attach(part)

    ses.send_raw_email(
        Source=SES_SENDER,
        Destinations=[recipient],
        RawMessage={'Data': msg.as_string()}
    )
    logger.info(f"Email with PDF sent to {recipient}")

def send_alert_email(error_type, error_message, customer_data=None, traceback_info=None):
    """Send alert email to admin when critical failures occur"""
    try:
        if not ALERT_EMAIL or ALERT_EMAIL == "admin@example.com":
            logger.warning("Alert email not configured, skipping alert notification")
            return False

        ses = boto3.client('ses')
        msg = MIMEMultipart()

        malaysia_time = get_malaysia_time()
        timestamp = malaysia_time.strftime("%Y-%m-%d %H:%M:%S MYT")

        subject = f"🚨 Wedding Form Error Alert: {error_type}"
        msg['Subject'] = subject
        msg['From'] = SES_SENDER
        msg['To'] = ALERT_EMAIL

        # Build customer info section
        customer_info = "N/A"
        if customer_data:
            customer_info = f"""
- Name: {customer_data.get('first_name', 'N/A')} {customer_data.get('last_name', 'N/A')}
- Email: {customer_data.get('email_address', 'N/A')}
- Phone: {customer_data.get('phone_number', 'N/A')}
- Event Date: {customer_data.get('event_date', 'N/A')}
- Venue: {customer_data.get('venue_selection', 'N/A')}
"""

        # Build traceback section
        traceback_section = ""
        if traceback_info:
            traceback_section = f"""
Technical Details:
{traceback_info}
"""

        body_text = f"""WEDDING FORM SUBMISSION FAILURE ALERT

Time: {timestamp}
Error Type: {error_type}

Error Message:
{error_message}

Customer Information:
{customer_info}
{traceback_section}

This is an automated alert from the Wedding Form Lambda function.
Please investigate and take appropriate action.

---
Environment: {os.environ.get('AWS_LAMBDA_FUNCTION_NAME', 'Unknown')}
Region: {os.environ.get('AWS_REGION', 'Unknown')}
"""

        msg.attach(MIMEText(body_text, 'plain'))

        ses.send_raw_email(
            Source=SES_SENDER,
            Destinations=[ALERT_EMAIL],
            RawMessage={'Data': msg.as_string()}
        )
        logger.info(f"Alert email sent to {ALERT_EMAIL} for error type: {error_type}")
        return True

    except Exception as alert_error:
        logger.error(f"Failed to send alert email: {str(alert_error)}")
        return False

def lambda_handler(event, context):
    """Handle Lambda function invocation"""
    logger.info(f"Received event: {json.dumps(event)}")
    wedding_form_id = None
    lead_id = None

    try:
        if 'body' in event:
            raw_data = json.loads(event['body'])
        else:
            raw_data = event

        logger.info(f"Parsed form data keys: {list(raw_data.keys())}")

        # Convert frontend field names to backend field names
        texts = map_frontend_to_backend_fields(raw_data)
        logger.info(f"Mapped backend field names: {list(texts.keys())}")

        # Validate environment variables
        if not all([TEMPLATE_BUCKET, TEMPLATE_KEY, OUTPUT_BUCKET]):
            logger.error("S3 environment variables are not set")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': "S3 bucket/key environment variables are not properly configured"})
            }

        if not all([DB_NAME, DB_HOST, DB_USER, DB_PASSWORD]):
            logger.error("Database environment variables are not set")
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': "Database environment variables are not properly configured"})
            }

        if texts.get('has_booking_deposit') and texts.get('deposit_receipt_url'):
            if not DEPOSITS_BUCKET:
                logger.error("DEPOSITS_BUCKET environment variable is not set")
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    'body': json.dumps({'error': "Deposits bucket not configured for file uploads"})
                }

        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email_address', 'groom_name', 'bride_name']
        missing_fields = [field for field in required_fields if not texts.get(field)]
        if missing_fields:
            logger.error(f"Missing required fields: {missing_fields}")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': f"Missing required fields: {', '.join(missing_fields)}"})
            }

        if texts.get('has_booking_deposit') and not texts.get('deposit_receipt_url'):
            logger.error("Deposit receipt is required when booking deposit is marked as paid")
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': "Deposit receipt is required when booking deposit is marked as paid"})
            }

        # Check for duplicate submission
        is_duplicate, duplicate_info = check_duplicate_submission(texts)
        if is_duplicate:
            logger.warning(f"Duplicate submission detected for wedding form ID: {duplicate_info.get('wedding_id')}")
            # Send alert email for duplicate submission attempt
            send_alert_email(
                error_type="Duplicate Submission Attempt",
                error_message=f"A duplicate submission was detected and blocked. Previous submission ID: {duplicate_info.get('wedding_id')} at {duplicate_info.get('created_at')}",
                customer_data=texts,
                traceback_info=f"Duplicate info: {json.dumps(duplicate_info, default=str)}"
            )
            return {
                'statusCode': 409,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({
                    'error': "A recent submission with the same information already exists. Please contact us if this is a different booking.",
                    'previous_submission_time': str(duplicate_info.get('created_at'))
                })
            }

        # Insert data into tables
        try:
            wedding_form_id, lead_id = insert_lead_and_wedding_data(texts)
            logger.info(f"Database insert successful, wedding form ID: {wedding_form_id}, lead ID: {lead_id}")
        except Exception as db_error:
            logger.error(f"Database operation failed: {str(db_error)}")
            # Send alert email for database failure
            send_alert_email(
                error_type="Database Operation Failed",
                error_message=str(db_error),
                customer_data=texts,
                traceback_info=str(db_error)
            )
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': f"Database operation failed: {str(db_error)}"})
            }

        # Process PDF
        try:
            s3 = boto3.client('s3')
            logger.info(f"Downloading template from s3://{TEMPLATE_BUCKET}/{TEMPLATE_KEY}")
            template_obj = s3.get_object(Bucket=TEMPLATE_BUCKET, Key=TEMPLATE_KEY)
            template_bytes = template_obj['Body'].read()
            logger.info("Template PDF downloaded successfully")

            template_pdf = PdfReader(io.BytesIO(template_bytes))
            overlay_pdf = create_overlay(texts)

            for page, overlay_page in zip(template_pdf.pages, overlay_pdf.pages):
                merger = PageMerge(page)
                merger.add(overlay_page).render()
            logger.info("Overlay merged with template PDF")

            output_stream = io.BytesIO()
            PdfWriter().write(output_stream, template_pdf)
            output_stream.seek(0)
            pdf_bytes = output_stream.read()

            customer_full_name = f"{texts.get('first_name', '')} {texts.get('last_name', '')}".strip()
            pdf_filename = generate_pdf_filename(customer_full_name, texts.get('phone_number', '0000'))
            output_key = f"output/{pdf_filename}"
            logger.info(f"Uploading filled PDF to s3://{OUTPUT_BUCKET}/{output_key}")
            s3.put_object(
                Bucket=OUTPUT_BUCKET,
                Key=output_key,
                Body=pdf_bytes,
                ContentType='application/pdf'
            )
            logger.info("PDF uploaded successfully")
        except Exception as pdf_error:
            logger.error(f"PDF processing/upload failed: {str(pdf_error)}")
            # Send alert email for PDF processing failure
            send_alert_email(
                error_type="PDF Processing/Upload Failed",
                error_message=f"Failed to generate or upload PDF: {str(pdf_error)}",
                customer_data=texts,
                traceback_info=str(pdf_error)
            )
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': f"PDF processing failed: {str(pdf_error)}"})
            }

        # Send email
        recipient_email = texts.get("email_address")
        if recipient_email:
            try:
                send_email_with_attachment(
                    pdf_bytes,
                    recipient_email,
                    customer_full_name,
                    texts.get('phone_number')
                )
            except Exception as email_error:
                logger.error(f"Email sending failed: {str(email_error)}")
                # Send alert email for customer email failure
                send_alert_email(
                    error_type="Customer Email Sending Failed",
                    error_message=f"Failed to send confirmation email to customer: {str(email_error)}",
                    customer_data=texts,
                    traceback_info=str(email_error)
                )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
            'body': json.dumps({
                'message': 'Wedding form submitted successfully',
                'wedding_form_id': wedding_form_id,
                'lead_id': lead_id,
                'pdf_location': f's3://{OUTPUT_BUCKET}/{output_key}'
            }),
        }

    except Exception as e:
        logger.error(f"Error processing wedding form: {str(e)}", exc_info=True)
        # Send alert email for unexpected errors
        send_alert_email(
            error_type="Unexpected Error in Wedding Form Processing",
            error_message=str(e),
            customer_data=locals().get('texts'),
            traceback_info=str(e)
        )
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': f"Error processing wedding form: {str(e)}"})
        }
