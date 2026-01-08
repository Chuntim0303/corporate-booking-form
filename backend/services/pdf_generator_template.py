"""
PDF generation service using template overlay approach.
Overlays text at configurable positions on a PDF template.
"""
import io
import re
import logging
import base64
import boto3
from datetime import datetime
from zoneinfo import ZoneInfo
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from pdfrw import PdfReader, PdfWriter, PageMerge

logger = logging.getLogger()


def get_malaysia_time():
    """Get current time in Malaysia timezone (UTC+8)"""
    malaysia_tz = ZoneInfo("Asia/Kuala_Lumpur")
    return datetime.now(malaysia_tz)


def format_field_value(key, value):
    """Format field values for display in PDF"""
    if not value:
        return ""
    
    if key == 'termsAccepted':
        return "Accepted" if value else "Not Accepted"
    elif key in ['partnershipTier', 'industry', 'state', 'gender']:
        return str(value).replace('_', ' ').title()
    elif key == 'totalPayable':
        try:
            return f"RM {float(value):.2f}"
        except (ValueError, TypeError):
            return str(value)
    elif key == 'phone_number':
        return str(value)
    else:
        return str(value)


def create_overlay(texts, placeholder_positions, signature_position=None, signature_size=None):
    """
    Create PDF overlay with text fields at specified positions
    
    Args:
        texts: Dictionary of field values
        placeholder_positions: Dictionary mapping field names to (x, y) coordinates
        signature_position: Optional (x, y) tuple for signature placement
        signature_size: Optional (width, height) tuple for signature size
    """
    logger.info("Creating PDF overlay with text fields")
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    can.setFont("Helvetica", 10)
    
    # Prepare data - combine first and last name if needed
    data = texts.copy()
    if 'firstName' in data and 'lastName' in data:
        data['full_name'] = f"{data.get('firstName', '')} {data.get('lastName', '')}".strip()
    
    # Map frontend field names to backend field names for consistency
    field_mapping = {
        'firstName': 'first_name',
        'lastName': 'last_name',
        'email': 'email_address',
        'phone': 'phone_number',
        'addressLine1': 'address_line_1',
        'addressLine2': 'address_line_2',
        'postalCode': 'postal_code',
        'companyName': 'company_name',
        'partnershipTier': 'partnership_tier',
        'totalPayable': 'total_payable',
    }
    
    for frontend_key, backend_key in field_mapping.items():
        if frontend_key in data and backend_key not in data:
            data[backend_key] = data[frontend_key]
    
    # Add submitted date
    malaysia_now = get_malaysia_time()
    data['submitted_date'] = malaysia_now.strftime("%d/%m/%Y")
    
    # Draw text at specified positions
    for key, value in data.items():
        if key in placeholder_positions and value:
            x, y = placeholder_positions[key]
            formatted_value = format_field_value(key, value)
            
            logger.debug(f"Adding text for key '{key}' at position ({x}, {y}): {formatted_value}")
            
            # Handle multi-line fields
            if key in ['special_requests', 'notes']:
                lines = str(formatted_value).split('\n')
                line_height = 12
                for i, line in enumerate(lines):
                    if i < 5:  # Limit to 5 lines
                        can.drawString(x, y - i * line_height, line[:80])
            else:
                text_to_draw = formatted_value[:60]  # Limit to 60 characters
                can.drawString(x, y, text_to_draw)
    
    # Handle signature if provided
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
            logger.info("Signature image drawn on canvas")
        except Exception as e:
            logger.error(f"Error processing signature image: {str(e)}", exc_info=True)
    
    can.save()
    packet.seek(0)
    overlay_pdf = PdfReader(packet)
    logger.info(f"Overlay PDF created with {len(overlay_pdf.pages)} page(s)")
    return overlay_pdf


def generate_pdf_from_template(template_bytes, form_data, placeholder_positions,
                                signature_position=None, signature_size=None):
    """
    Generate filled PDF by overlaying text on a template PDF

    Args:
        template_bytes: PDF template file as bytes
        form_data: Dictionary containing form field values
        placeholder_positions: Dictionary mapping field names to (x, y) coordinates
        signature_position: Optional (x, y) tuple for signature placement
        signature_size: Optional (width, height) tuple for signature size

    Returns:
        bytes: Generated PDF file content
    """
    try:
        logger.info("=" * 60)
        logger.info("Generating PDF from Template with Overlay")
        logger.info("=" * 60)
        logger.info(f"Template size: {len(template_bytes)} bytes")
        logger.info(f"Form data fields: {list(form_data.keys())}")
        logger.info(f"Placeholder positions count: {len(placeholder_positions)}")
        logger.info(f"Signature position: {signature_position}")
        logger.info(f"Signature size: {signature_size}")

        logger.info("Reading template PDF...")
        template_pdf = PdfReader(io.BytesIO(template_bytes))
        logger.info(f"✓ Template PDF read successfully - {len(template_pdf.pages)} page(s)")

        logger.info("Creating overlay with form data...")
        overlay_pdf = create_overlay(form_data, placeholder_positions,
                                     signature_position, signature_size)
        logger.info(f"✓ Overlay created - {len(overlay_pdf.pages)} page(s)")

        # Merge overlay with template
        logger.info("Merging overlay with template...")
        page_count = 0
        for page, overlay_page in zip(template_pdf.pages, overlay_pdf.pages):
            merger = PageMerge(page)
            merger.add(overlay_page).render()
            page_count += 1

        logger.info(f"✓ Overlay merged with template PDF ({page_count} page(s))")

        # Write to output
        logger.info("Writing final PDF to output stream...")
        output_stream = io.BytesIO()
        PdfWriter().write(output_stream, template_pdf)
        output_stream.seek(0)
        pdf_bytes = output_stream.read()

        logger.info(f"✓ Template-based PDF generation completed successfully")
        logger.info(f"  - Final PDF size: {len(pdf_bytes)} bytes ({len(pdf_bytes) / 1024:.2f} KB)")
        logger.info("=" * 60)

        return pdf_bytes

    except Exception as e:
        logger.error("=" * 60)
        logger.error(f"✗ ERROR generating PDF from template")
        logger.error(f"  - Error Type: {type(e).__name__}")
        logger.error(f"  - Error Message: {str(e)}")
        logger.error("=" * 60)
        logger.error(f"Full error:", exc_info=True)
        raise


def load_template_from_s3(bucket_name, template_key):
    """
    Load PDF template from S3 bucket

    Args:
        bucket_name: S3 bucket name
        template_key: S3 object key for the template

    Returns:
        bytes: PDF template file content
    """
    try:
        logger.info("=" * 60)
        logger.info("Loading PDF Template from S3")
        logger.info("=" * 60)
        logger.info(f"S3 URI: s3://{bucket_name}/{template_key}")
        logger.info(f"Bucket: {bucket_name}")
        logger.info(f"Key: {template_key}")

        s3_client = boto3.client('s3')
        logger.info("S3 client created successfully")

        logger.info("Fetching object from S3...")
        response = s3_client.get_object(Bucket=bucket_name, Key=template_key)

        template_bytes = response['Body'].read()
        logger.info(f"✓ Template loaded successfully")
        logger.info(f"  - Size: {len(template_bytes)} bytes ({len(template_bytes) / 1024:.2f} KB)")
        logger.info(f"  - Content-Type: {response.get('ContentType', 'unknown')}")
        logger.info("=" * 60)

        return template_bytes
    except Exception as e:
        logger.error("=" * 60)
        logger.error(f"✗ ERROR loading template from S3")
        logger.error(f"  - Bucket: {bucket_name}")
        logger.error(f"  - Key: {template_key}")
        logger.error(f"  - Error Type: {type(e).__name__}")
        logger.error(f"  - Error Message: {str(e)}")
        logger.error("=" * 60)
        logger.error(f"Full error:", exc_info=True)
        raise


def generate_pdf_filename(customer_name, phone_number):
    """Generate PDF filename with customer name and last 4 digits of phone number and timestamp"""
    try:
        clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', customer_name)
        clean_name = clean_name.replace(' ', '_')[:20]
        phone_digits = re.sub(r'[^\d]', '', str(phone_number))
        last_4_digits = phone_digits[-4:] if len(phone_digits) >= 4 else phone_digits
        malaysia_now = get_malaysia_time()
        timestamp = malaysia_now.strftime("%Y%m%d_%H%M%S")
        filename = f"IBPP_Application_{clean_name}_{last_4_digits}_{timestamp}.pdf"
        return filename
    except Exception as e:
        logger.error(f"Error generating PDF filename: {str(e)}")
        malaysia_now = get_malaysia_time()
        timestamp = malaysia_now.strftime("%Y%m%d_%H%M%S")
        return f"IBPP_Application_{timestamp}.pdf"
