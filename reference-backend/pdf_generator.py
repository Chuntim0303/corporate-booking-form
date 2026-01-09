"""
PDF generation for the wedding form backend.
"""
import io
import re
import logging
import base64
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from pdfrw import PdfReader, PdfWriter, PageMerge

from config import PLACEHOLDER_POSITIONS, SIGNATURE_POSITION, SIGNATURE_SIZE
from utils import get_malaysia_time

logger = logging.getLogger()


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
    texts['full_name_2'] = full_name  # Additional full_name position
    texts['groom_nric_2'] = texts.get('groom_nric', '')  # Additional groom NRIC position

    # Add signed date (current Malaysia time)
    malaysia_now = get_malaysia_time()
    signed_date_str = malaysia_now.strftime("%d/%m/%Y")
    texts['signed_date'] = signed_date_str

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


def generate_pdf(template_bytes, form_data):
    """
    Generate filled PDF from template and form data.
    Returns PDF bytes.
    """
    try:
        logger.info("Generating PDF from template")
        template_pdf = PdfReader(io.BytesIO(template_bytes))
        overlay_pdf = create_overlay(form_data)

        for page, overlay_page in zip(template_pdf.pages, overlay_pdf.pages):
            merger = PageMerge(page)
            merger.add(overlay_page).render()
        logger.info("Overlay merged with template PDF")

        output_stream = io.BytesIO()
        PdfWriter().write(output_stream, template_pdf)
        output_stream.seek(0)
        pdf_bytes = output_stream.read()

        logger.info("PDF generation completed successfully")
        return pdf_bytes

    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}", exc_info=True)
        raise
