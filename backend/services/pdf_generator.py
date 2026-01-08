"""
PDF generation for corporate partnership applications.
Uses template overlay approach - adapted from reference backend.
"""
import io
import re
import logging
import boto3
from datetime import datetime
from zoneinfo import ZoneInfo

logger = logging.getLogger()

# Lazy imports to avoid PIL dependency issues at module load time
# reportlab and pdfrw will be imported when needed
_reportlab_canvas = None
_pdfrw_modules = None


def _get_reportlab_canvas():
    """Lazy import of reportlab.pdfgen.canvas"""
    global _reportlab_canvas
    if _reportlab_canvas is None:
        from reportlab.pdfgen import canvas
        _reportlab_canvas = canvas
    return _reportlab_canvas


def _get_pdfrw_modules():
    """Lazy import of pdfrw modules"""
    global _pdfrw_modules
    if _pdfrw_modules is None:
        from pdfrw import PdfReader, PdfWriter, PageMerge
        _pdfrw_modules = {'PdfReader': PdfReader, 'PdfWriter': PdfWriter, 'PageMerge': PageMerge}
    return _pdfrw_modules


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
    elif key in ['partnershipTier', 'partnership_tier', 'industry', 'state', 'gender']:
        return str(value).replace('_', ' ').title()
    elif key in ['totalPayable', 'total_payable']:
        try:
            return f"RM {float(value):.2f}"
        except (ValueError, TypeError):
            return str(value)
    else:
        return str(value)


def create_overlay(application_data, placeholder_positions):
    """Create PDF overlay with text fields at specified positions"""
    logger.info("Creating PDF overlay with application data")

    # Lazy import
    canvas = _get_reportlab_canvas()
    pdfrw = _get_pdfrw_modules()

    packet = io.BytesIO()
    can = canvas.Canvas(packet)
    can.setFont("Helvetica", 10)

    # Prepare data - combine first and last name if needed
    data = application_data.copy()
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

    # Add submitted date (current Malaysia time)
    malaysia_now = get_malaysia_time()
    data['submitted_date'] = malaysia_now.strftime("%d/%m/%Y")

    # Draw text at specified positions
    for key, value in data.items():
        if key in placeholder_positions and value:
            x, y = placeholder_positions[key]
            formatted_value = format_field_value(key, value)
            logger.debug(f"Adding text for key '{key}' at position ({x}, {y}): {formatted_value}")

            # Handle multi-line fields if any
            if key in ['special_requests', 'notes', 'additionalRequests']:
                lines = str(formatted_value).split('\n')
                line_height = 12
                for i, line in enumerate(lines):
                    if i < 5:  # Limit to 5 lines
                        can.drawString(x, y - i * line_height, line[:80])
            else:
                text_to_draw = formatted_value[:60]  # Limit to 60 characters
                can.drawString(x, y, text_to_draw)

    can.save()
    packet.seek(0)
    overlay_pdf = pdfrw['PdfReader'](packet)
    logger.info(f"Overlay PDF pages count: {len(overlay_pdf.pages)}")
    return overlay_pdf


def generate_pdf(template_bytes, application_data, placeholder_positions):
    """
    Generate filled PDF from template and application data.
    Returns PDF bytes.

    Args:
        template_bytes: PDF template file as bytes
        application_data: Dictionary containing application field values
        placeholder_positions: Dictionary mapping field names to (x, y) coordinates

    Returns:
        bytes: Generated PDF file content
    """
    try:
        # Lazy import
        pdfrw = _get_pdfrw_modules()
        PdfReader = pdfrw['PdfReader']
        PdfWriter = pdfrw['PdfWriter']
        PageMerge = pdfrw['PageMerge']

        logger.info("=" * 60)
        logger.info("Generating PDF from template")
        logger.info("=" * 60)
        logger.info(f"Template size: {len(template_bytes)} bytes")
        logger.info(f"Application data fields: {list(application_data.keys())}")

        template_pdf = PdfReader(io.BytesIO(template_bytes))
        if not template_pdf.pages:
            raise ValueError("Template PDF contains no pages")

        logger.info(f"Template PDF loaded - {len(template_pdf.pages)} page(s)")

        # Get page dimensions from template
        page0 = template_pdf.pages[0]
        media_box = getattr(page0, 'MediaBox', None)
        if media_box and len(media_box) >= 4:
            overlay_width = float(media_box[2])
            overlay_height = float(media_box[3])
        else:
            overlay_width = float(page0.inheritable.MediaBox[2])
            overlay_height = float(page0.inheritable.MediaBox[3])

        logger.info(f"Using template MediaBox for overlay pagesize: ({overlay_width}, {overlay_height})")

        # Create overlay with application data
        overlay_pdf = create_overlay(application_data, placeholder_positions)

        # Set overlay page size to match template
        for overlay_page in overlay_pdf.pages:
            overlay_page.MediaBox = [0, 0, overlay_width, overlay_height]

        # Merge overlay with template
        for page, overlay_page in zip(template_pdf.pages, overlay_pdf.pages):
            merger = PageMerge(page)
            merger.add(overlay_page).render()
        logger.info("Overlay merged with template PDF")

        # Write output
        output_stream = io.BytesIO()
        PdfWriter().write(output_stream, template_pdf)
        output_stream.seek(0)
        pdf_bytes = output_stream.read()

        logger.info(f"✓ PDF generation completed successfully - {len(pdf_bytes)} bytes ({len(pdf_bytes) / 1024:.2f} KB)")
        logger.info("=" * 60)
        return pdf_bytes

    except Exception as e:
        logger.error("=" * 60)
        logger.error(f"✗ ERROR generating PDF")
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
