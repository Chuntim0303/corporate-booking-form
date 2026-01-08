"""
Email Service
Handles sending emails via AWS SES for Incentive Beneficiary Partner Program (IBPP) applications
"""
import os
import boto3
from botocore.exceptions import ClientError
from typing import Optional, List
from datetime import datetime
import logging
from zoneinfo import ZoneInfo  # Python 3.9+
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText

# Configure logging
logger = logging.getLogger()

# Initialize SES client
ses_client = boto3.client('ses')


def send_partnership_confirmation_email(
    recipient_email: str,
    full_name: str,
    application_id: int,
    contact_id: int,
    payment_amount: float,
    partnership_tier: str,
    company_name: str,
    cc_addresses: Optional[List[str]] = None,
    pdf_bytes: Optional[bytes] = None,
    pdf_filename: Optional[str] = None
) -> bool:
    """
    Send IBPP partnership application confirmation email to applicant

    Args:
        recipient_email: Applicant's email address
        full_name: Applicant's full name
        application_id: Partner application ID (kept for logging only)
        contact_id: Contact ID (kept for logging only)
        payment_amount: Payment amount extracted from receipt (kept for potential future use)
        partnership_tier: Partnership tier selected
        company_name: Company name (kept for potential future use)
        cc_addresses: Optional list of CC email addresses
        pdf_bytes: Optional PDF file content as bytes to attach
        pdf_filename: Optional PDF filename for attachment

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    operation = "send_partnership_confirmation_email"
    logger.info("=" * 60)
    logger.info(f"=== {operation.upper()} START ===")
    logger.info("=" * 60)
    logger.info(f"Recipient: {recipient_email}")
    logger.info(f"Application ID: {application_id}")
    logger.info(f"Contact ID: {contact_id}")
    logger.info(f"Full Name: {full_name}")
    logger.info(f"Partnership Tier: {partnership_tier}")
    logger.info(f"PDF Attachment Status:")
    logger.info(f"  - pdf_bytes provided: {pdf_bytes is not None}")
    logger.info(f"  - pdf_filename provided: {pdf_filename is not None}")
    if pdf_bytes:
        logger.info(f"  - PDF size: {len(pdf_bytes)} bytes ({len(pdf_bytes) / 1024:.2f} KB)")
        logger.info(f"  - PDF filename: {pdf_filename}")
    logger.info("=" * 60)

    try:
        # Get sender email and sender name from environment
        from_email = os.environ.get('SES_FROM_EMAIL', 'noreply@confetti.com.my')
        sender_name = os.environ.get('SES_SENDER_NAME', 'Confetti Partnership Team')

        # Use full "Sender Name <email>" format if sender name is provided
        source = f"{sender_name} <{from_email}>" if sender_name else from_email

        # Email subject - updated as requested
        subject = "Incentive Beneficiary Partner Program (IBPP) Application Received - Confetti"

        # Format submitted time in UTC+8 (Malaysia time)
        malaysia_tz = ZoneInfo("Asia/Kuala_Lumpur")
        submitted_time = datetime.now(malaysia_tz).strftime('%d %B %Y, %I:%M %p')

        # HTML email body - removed Application ID, Contact ID, Company Name, Payment Amount
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f8f9fa;
                }}
                .container {{
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }}
                .header {{
                    background-color: #2c3e50;
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }}
                .content {{
                    padding: 30px;
                }}
                .status-badge {{
                    display: inline-block;
                    background-color: #d4edda;
                    color: #155724;
                    padding: 10px 20px;
                    border-radius: 4px;
                    font-weight: bold;
                    margin: 20px 0;
                    border: 1px solid #c3e6cb;
                }}
                .application-details {{
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 20px 0;
                }}
                .detail-row {{
                    padding: 10px 0;
                    border-bottom: 1px solid #e9ecef;
                }}
                .detail-row:last-child {{
                    border-bottom: none;
                }}
                .detail-label {{
                    font-weight: bold;
                    color: #495057;
                    display: inline-block;
                    width: 180px;
                }}
                .detail-value {{
                    color: #212529;
                }}
                .next-steps {{
                    background-color: #e7f3ff;
                    border: 1px solid #b3d7ff;
                    border-left: 4px solid #0066cc;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #6c757d;
                    border-top: 1px solid #e9ecef;
                }}
                .text-center {{
                    text-align: center;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0; font-size: 24px;">Thank You for Your Application!</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Incentive Beneficiary Partner Program (IBPP)</p>
                </div>

                <div class="content">
                    <p>Dear <strong>{full_name}</strong>,</p>

                    <p>Thank you for applying to the <strong>Incentive Beneficiary Partner Program (IBPP)</strong> with Confetti. We have successfully received your application and payment.</p>

                    <div class="application-details">
                        <div class="detail-row">
                            <span class="detail-label">Partnership Tier:</span>
                            <span class="detail-value">{partnership_tier.replace('_', ' ').title()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Submitted:</span>
                            <span class="detail-value">{submitted_time}</span>
                        </div>
                    </div>

                    <div class="next-steps">
                        <strong>What happens next?</strong>
                        <ol style="margin: 10px 0; padding-left: 20px;">
                            <li>Our team will review your application and payment receipt</li>
                            <li>We will verify your payment details</li>
                            <li>You will receive a confirmation email within 2-3 business days</li>
                            <li>Once approved, you'll receive your partnership benefits and access details</li>
                        </ol>
                    </div>

                    <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                        If you have any questions or need assistance, please don't hesitate to contact our partnership team.
                    </p>

                    <p style="margin-top: 20px;">
                        Best regards,<br>
                        <strong>The Confetti Partnership Team</strong>
                    </p>
                </div>

                <div class="footer">
                    <p style="margin: 5px 0;">
                        <strong>Confetti Incentive Beneficiary Partner Program (IBPP)</strong>
                    </p>
                    <p style="margin: 5px 0;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                    <p style="margin: 5px 0;">
                        &copy; {datetime.now(malaysia_tz).year} Confetti. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text version - updated accordingly
        text_body = f"""
Incentive Beneficiary Partner Program (IBPP) Application Received

Dear {full_name},

Thank you for applying to the Incentive Beneficiary Partner Program (IBPP) with Confetti. We have successfully received your application and payment.

APPLICATION DETAILS:
Partnership Tier: {partnership_tier.replace('_', ' ').title()}
Submitted: {submitted_time}

WHAT HAPPENS NEXT?
1. Our team will review your application and payment receipt
2. Kindly allow 2-3 business days processing time
3. Once full payment is made, you'll receive your partnership benefits and access details

If you have any questions or need assistance, please don't hesitate to contact our partnership team.

Best regards,
Confetti KL Sdn Bhd

---
Confetti Incentive Beneficiary Partner Program (IBPP)
This is an automated message. Please do not reply to this email.
&copy; {datetime.now(malaysia_tz).year} Confetti. All rights reserved.
        """

        # If PDF attachment is provided, use raw email with MIME multipart
        logger.info("=" * 60)
        logger.info("Email Sending Decision Point")
        logger.info("=" * 60)
        logger.info(f"pdf_bytes is not None: {pdf_bytes is not None}")
        logger.info(f"pdf_filename is not None: {pdf_filename is not None}")

        if pdf_bytes and pdf_filename:
            logger.info("✓ PDF attachment available - Using send_raw_email with MIME multipart")
            logger.info("=" * 60)
            logger.info("Sending email with PDF attachment via SES", extra={
                'source': source,
                'to_email': recipient_email,
                'pdf_filename': pdf_filename,
                'pdf_size': len(pdf_bytes)
            })

            # Create multipart message
            msg = MIMEMultipart()
            msg['Subject'] = subject
            msg['From'] = source
            msg['To'] = recipient_email

            # Add CC addresses if provided
            cc_addresses_list = []
            if cc_addresses and isinstance(cc_addresses, list):
                valid_cc_addresses = [cc.strip() for cc in cc_addresses if cc and cc.strip()]
                if valid_cc_addresses:
                    msg['Cc'] = ', '.join(valid_cc_addresses)
                    cc_addresses_list = valid_cc_addresses
                    logger.info("Adding CC addresses", extra={
                        'cc_count': len(valid_cc_addresses),
                        'cc_addresses': valid_cc_addresses
                    })

            # Attach HTML body
            msg.attach(MIMEText(html_body, 'html', 'utf-8'))

            # Attach PDF
            pdf_attachment = MIMEApplication(pdf_bytes)
            pdf_attachment.add_header('Content-Disposition', 'attachment', filename=pdf_filename)
            msg.attach(pdf_attachment)

            # Prepare destinations list
            destinations = [recipient_email]
            if cc_addresses_list:
                destinations.extend(cc_addresses_list)

            # Send raw email
            response = ses_client.send_raw_email(
                Source=source,
                Destinations=destinations,
                RawMessage={'Data': msg.as_string()}
            )

            message_id = response.get('MessageId')
            logger.info(f"&check; Email with PDF attachment sent successfully", extra={
                'recipient_email': recipient_email,
                'message_id': message_id,
                'application_id': application_id,
                'pdf_filename': pdf_filename
            })
        else:
            logger.error("✗ PDF attachment NOT available - Using send_email WITHOUT attachment")
            logger.error("  WARNING: Email will be sent without the PDF attachment!")
            if not pdf_bytes:
                logger.error("  Reason: pdf_bytes is None")
            if not pdf_filename:
                logger.error("  Reason: pdf_filename is None")
            logger.info("=" * 60)

            # Send regular email without attachment
            # Prepare destination
            destination = {'ToAddresses': [recipient_email]}

            # Add CC addresses if provided
            if cc_addresses and isinstance(cc_addresses, list):
                valid_cc_addresses = [cc.strip() for cc in cc_addresses if cc and cc.strip()]
                if valid_cc_addresses:
                    destination['CcAddresses'] = valid_cc_addresses
                    logger.info("Adding CC addresses", extra={
                        'cc_count': len(valid_cc_addresses),
                        'cc_addresses': valid_cc_addresses
                    })

            # Send email via SES
            logger.info("Sending email via SES", extra={
                'source': source,
                'to_email': recipient_email,
                'has_cc': 'CcAddresses' in destination
            })

            response = ses_client.send_email(
                Source=source,
                Destination=destination,
                Message={
                    'Subject': {
                        'Data': subject,
                        'Charset': 'UTF-8'
                    },
                    'Body': {
                        'Text': {
                            'Data': text_body,
                            'Charset': 'UTF-8'
                        },
                        'Html': {
                            'Data': html_body,
                            'Charset': 'UTF-8'
                        }
                    }
                }
            )

            message_id = response.get('MessageId')
            logger.info(f"&check; Email sent successfully", extra={
                'recipient_email': recipient_email,
                'message_id': message_id,
                'application_id': application_id
            })

        return True

    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']

        logger.error(f"Failed to send confirmation email via SES: {error_code}", extra={
            'error_code': error_code,
            'error_message': error_message,
            'recipient_email': recipient_email,
            'application_id': application_id
        }, exc_info=True)

        return False

    except Exception as e:
        logger.error(f"Unexpected error sending confirmation email: {str(e)}", extra={
            'recipient_email': recipient_email,
            'application_id': application_id
        }, exc_info=True)
        return False

    finally:
        logger.info(f"=== {operation.upper()} END ===")