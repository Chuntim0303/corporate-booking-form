"""
PDF generation service for corporate partnership applications.
Generates PDF from application data for email attachments.
"""
import io
import re
import logging
from datetime import datetime
from zoneinfo import ZoneInfo
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

logger = logging.getLogger()


def get_malaysia_time():
    """Get current time in Malaysia timezone (UTC+8)"""
    malaysia_tz = ZoneInfo("Asia/Kuala_Lumpur")
    return datetime.now(malaysia_tz)


def generate_pdf_filename(customer_name, phone_number):
    """Generate PDF filename with customer name and last 4 digits of phone number and timestamp"""
    try:
        clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', customer_name)
        clean_name = clean_name.replace(' ', '_')[:20]
        phone_digits = re.sub(r'[^\d]', '', phone_number)
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


def generate_application_pdf(application_data):
    """
    Generate PDF from corporate partnership application data.

    Args:
        application_data: Dictionary containing application fields

    Returns:
        bytes: PDF file content as bytes
    """
    try:
        logger.info("=" * 60)
        logger.info("Generating ReportLab-based PDF (Fallback Method)")
        logger.info("=" * 60)
        logger.info(f"Application data fields: {list(application_data.keys())}")
        
        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, 
                              rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        
        # Container for PDF elements
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=12,
            spaceBefore=12,
            fontName='Helvetica-Bold'
        )
        
        normal_style = styles['Normal']
        
        # Title
        title = Paragraph("Incentive Beneficiary Partner Program (IBPP)<br/>Application Summary", title_style)
        elements.append(title)
        elements.append(Spacer(1, 0.2*inch))
        
        # Submission timestamp
        malaysia_now = get_malaysia_time()
        submitted_time = malaysia_now.strftime('%d %B %Y, %I:%M %p')
        timestamp_text = Paragraph(f"<b>Submitted:</b> {submitted_time}", normal_style)
        elements.append(timestamp_text)
        elements.append(Spacer(1, 0.3*inch))
        
        # Personal Information Section
        elements.append(Paragraph("Personal Information", heading_style))
        personal_data = [
            ['First Name:', application_data.get('firstName', 'N/A')],
            ['Last Name:', application_data.get('lastName', 'N/A')],
            ['Position:', application_data.get('position', 'N/A')],
            ['Email:', application_data.get('email', 'N/A')],
            ['Phone:', f"+{application_data.get('countryCode', '')} {application_data.get('phone', 'N/A')}"],
            ['NRIC:', application_data.get('nric', 'N/A')],
        ]
        
        personal_table = Table(personal_data, colWidths=[2*inch, 4*inch])
        personal_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#495057')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9ecef')),
        ]))
        elements.append(personal_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Address Information Section
        elements.append(Paragraph("Address Information", heading_style))
        address_data = [
            ['Address Line 1:', application_data.get('addressLine1', 'N/A')],
            ['Address Line 2:', application_data.get('addressLine2', '-')],
            ['City:', application_data.get('city', 'N/A')],
            ['State:', application_data.get('state', 'N/A')],
            ['Postal Code:', application_data.get('postalCode', 'N/A')],
            ['Gender:', application_data.get('gender', 'N/A').replace('_', ' ').title()],
        ]
        
        address_table = Table(address_data, colWidths=[2*inch, 4*inch])
        address_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#495057')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9ecef')),
        ]))
        elements.append(address_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Company Information Section
        elements.append(Paragraph("Company Information", heading_style))
        company_data = [
            ['Company Name:', application_data.get('companyName', 'N/A')],
            ['Industry:', application_data.get('industry', 'N/A')],
            ['Partnership Tier:', application_data.get('partnershipTier', 'N/A').replace('_', ' ').title()],
            ['Total Payable:', f"RM {application_data.get('totalPayable', 0):.2f}"],
        ]
        
        company_table = Table(company_data, colWidths=[2*inch, 4*inch])
        company_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#495057')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9ecef')),
        ]))
        elements.append(company_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Terms and Conditions
        elements.append(Paragraph("Terms and Conditions", heading_style))
        terms_status = "Accepted" if application_data.get('termsAccepted') else "Not Accepted"
        terms_text = Paragraph(f"<b>Status:</b> {terms_status}", normal_style)
        elements.append(terms_text)
        elements.append(Spacer(1, 0.3*inch))
        
        # UTM Tracking (if available)
        if application_data.get('utmSource') or application_data.get('utmMedium'):
            elements.append(Paragraph("Tracking Information", heading_style))
            utm_data = []
            if application_data.get('utmSource'):
                utm_data.append(['UTM Source:', application_data.get('utmSource')])
            if application_data.get('utmMedium'):
                utm_data.append(['UTM Medium:', application_data.get('utmMedium')])
            
            if utm_data:
                utm_table = Table(utm_data, colWidths=[2*inch, 4*inch])
                utm_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f8f9fa')),
                    ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#495057')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
                    ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 0), (-1, -1), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9ecef')),
                ]))
                elements.append(utm_table)
                elements.append(Spacer(1, 0.3*inch))
        
        # Footer
        elements.append(Spacer(1, 0.5*inch))
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#6c757d'),
            alignment=TA_CENTER
        )
        footer_text = Paragraph(
            f"© {malaysia_now.year} Confetti. All rights reserved.<br/>"
            "This is an automated document generated from your application submission.",
            footer_style
        )
        elements.append(footer_text)
        
        # Build PDF
        logger.info("Building PDF document...")
        doc.build(elements)

        # Get PDF bytes
        buffer.seek(0)
        pdf_bytes = buffer.read()

        logger.info("✓ ReportLab PDF generated successfully")
        logger.info(f"  - PDF size: {len(pdf_bytes)} bytes ({len(pdf_bytes) / 1024:.2f} KB)")
        logger.info("=" * 60)

        return pdf_bytes

    except Exception as e:
        logger.error("=" * 60)
        logger.error("✗ ERROR generating ReportLab PDF")
        logger.error(f"  - Error Type: {type(e).__name__}")
        logger.error(f"  - Error Message: {str(e)}")
        logger.error("=" * 60)
        logger.error(f"Full error:", exc_info=True)
        raise
