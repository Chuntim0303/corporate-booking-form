"""
PDF generation for the event booking form backend.
"""
import io
import re
import logging
import base64
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from pdfrw import PdfReader, PdfWriter, PageMerge

from services.config import PLACEHOLDER_POSITIONS, SIGNATURE_POSITION, SIGNATURE_SIZE
from services.utils import get_malaysia_time

logger = logging.getLogger()


def format_field_value(key, value):
    """Format field values for display in PDF"""
    if not value:
        return ""

    if key == 'isCompanyEvent':
        return "Yes" if value else "No"
    elif key == 'hall':
        return str(value).replace('_', ' ').title()
    else:
        return str(value)


def create_overlay(booking_data):
    """Create PDF overlay with text fields"""
    logger.info("Creating PDF overlay with booking data")
    packet = io.BytesIO()
    can = canvas.Canvas(packet)
    can.setFont("Helvetica", 10)

    # Add signed date (current Malaysia time)
    malaysia_now = get_malaysia_time()
    signed_date_str = malaysia_now.strftime("%d/%m/%Y")
    booking_data['signed_date'] = signed_date_str

    for key, value in booking_data.items():
        if key in PLACEHOLDER_POSITIONS and value:
            x, y = PLACEHOLDER_POSITIONS[key]
            formatted_value = format_field_value(key, value)
            logger.info(f"Adding text for key '{key}' at position ({x}, {y}): {formatted_value}")

            if key == 'additionalRequests':
                lines = str(formatted_value).split('\n')
                line_height = 12
                for i, line in enumerate(lines):
                    if i < 5:
                        can.drawString(x, y - i * line_height, line[:80])
            else:
                text_to_draw = formatted_value[:60]
                can.drawString(x, y, text_to_draw)

    can.save()
    packet.seek(0)
    overlay_pdf = PdfReader(packet)
    logger.info(f"Overlay PDF pages count: {len(overlay_pdf.pages)}")
    return overlay_pdf


def generate_pdf_filename(booking_id, customer_name):
    """Generate PDF filename with booking ID and customer name"""
    try:
        clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', customer_name)
        clean_name = clean_name.replace(' ', '_')[:20]
        malaysia_now = get_malaysia_time()
        timestamp = malaysia_now.strftime("%Y%m%d_%H%M%S")
        filename = f"EventBooking_{booking_id}_{clean_name}_{timestamp}.pdf"
        return filename
    except Exception as e:
        logger.error(f"Error generating PDF filename: {str(e)}")
        malaysia_now = get_malaysia_time()
        timestamp = malaysia_now.strftime("%Y%m%d_%H%M%S")
        return f"EventBooking_{booking_id}_{timestamp}.pdf"


def generate_pdf(template_bytes, booking_data):
    """
    Generate filled PDF from template and booking data.
    Returns PDF bytes.
    """
    try:
        logger.info("Generating PDF from template")
        template_pdf = PdfReader(io.BytesIO(template_bytes))
        if not template_pdf.pages:
            raise ValueError("Template PDF contains no pages")

        page0 = template_pdf.pages[0]
        media_box = getattr(page0, 'MediaBox', None)
        if media_box and len(media_box) >= 4:
            overlay_width = float(media_box[2])
            overlay_height = float(media_box[3])
        else:
            overlay_width = float(page0.inheritable.MediaBox[2])
            overlay_height = float(page0.inheritable.MediaBox[3])

        logger.info(f"Using template MediaBox for overlay pagesize: ({overlay_width}, {overlay_height})")

        overlay_pdf = create_overlay(booking_data)
        for overlay_page in overlay_pdf.pages:
            overlay_page.MediaBox = [0, 0, overlay_width, overlay_height]

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
