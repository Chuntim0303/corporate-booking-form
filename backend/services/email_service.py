"""
Email Service
Handles sending emails via AWS SES for corporate partnership applications
"""
import os
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any, Optional
from datetime import datetime
import logging

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
    cc_addresses: Optional[list] = None
) -> bool:
    """
    Send partnership application confirmation email to applicant

    Args:
        recipient_email: Applicant's email address
        full_name: Applicant's full name
        application_id: Partner application ID
        contact_id: Contact ID
        payment_amount: Payment amount extracted from receipt
        partnership_tier: Partnership tier selected
        company_name: Company name
        cc_addresses: Optional list of CC email addresses from env var

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    operation = "send_partnership_confirmation_email"
    logger.info(f"=== {operation.upper()} START ===", extra={
        'recipient_email': recipient_email,
        'application_id': application_id
    })

    try:
        # Get sender email from environment
        from_email = os.environ.get('SES_FROM_EMAIL', 'noreply@confetti.com.my')

        # Email subject
        subject = "Corporate Partnership Application Received - Confetti"

        # Format payment amount
        amount_display = f"RM {float(payment_amount):,.2f}" if payment_amount > 0 else "To be confirmed"

        # HTML email body
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
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Corporate Partnership Program</p>
                </div>

                <div class="content">
                    <p>Dear <strong>{full_name}</strong>,</p>

                    <p>Thank you for applying to become a corporate partner with Confetti. We have successfully received your application and payment.</p>

                    <div class="text-center">
                        <span class="status-badge">✓ Application Received</span>
                    </div>

                    <div class="application-details">
                        <div class="detail-row">
                            <span class="detail-label">Application ID:</span>
                            <span class="detail-value">#{application_id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Contact ID:</span>
                            <span class="detail-value">#{contact_id}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Company Name:</span>
                            <span class="detail-value">{company_name}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Partnership Tier:</span>
                            <span class="detail-value">{partnership_tier.replace('_', ' ').title()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Payment Amount:</span>
                            <span class="detail-value"><strong>{amount_display}</strong></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Submitted:</span>
                            <span class="detail-value">{datetime.now().strftime('%d %B %Y, %I:%M %p')}</span>
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
                        <strong>Confetti Corporate Partnership Program</strong>
                    </p>
                    <p style="margin: 5px 0;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                    <p style="margin: 5px 0;">
                        © {datetime.now().year} Confetti. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text version
        text_body = f"""
Corporate Partnership Application Received

Dear {full_name},

Thank you for applying to become a corporate partner with Confetti. We have successfully received your application and payment.

APPLICATION DETAILS:
Application ID: #{application_id}
Contact ID: #{contact_id}
Company Name: {company_name}
Partnership Tier: {partnership_tier.replace('_', ' ').title()}
Payment Amount: {amount_display}
Submitted: {datetime.now().strftime('%d %B %Y, %I:%M %p')}

WHAT HAPPENS NEXT?
1. Our team will review your application and payment receipt
2. We will verify your payment details
3. You will receive a confirmation email within 2-3 business days
4. Once approved, you'll receive your partnership benefits and access details

If you have any questions or need assistance, please don't hesitate to contact our partnership team.

Best regards,
The Confetti Partnership Team

---
Confetti Corporate Partnership Program
This is an automated message. Please do not reply to this email.
© {datetime.now().year} Confetti. All rights reserved.
        """

        # Prepare destination
        destination = {'ToAddresses': [recipient_email]}

        # Add CC addresses if provided
        if cc_addresses and isinstance(cc_addresses, list):
            # Filter out empty strings and validate emails
            valid_cc_addresses = [cc.strip() for cc in cc_addresses if cc and cc.strip()]
            if valid_cc_addresses:
                destination['CcAddresses'] = valid_cc_addresses
                logger.info("Adding CC addresses", extra={
                    'cc_count': len(valid_cc_addresses),
                    'cc_addresses': valid_cc_addresses
                })

        # Send email via SES
        logger.info("Sending email via SES", extra={
            'from_email': from_email,
            'to_email': recipient_email,
            'has_cc': 'CcAddresses' in destination
        })

        response = ses_client.send_email(
            Source=from_email,
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
        logger.info(f"✓ Email sent successfully", extra={
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

        # Common SES errors
        if error_code == 'MessageRejected':
            logger.error("Email rejected - check recipient email address")
        elif error_code == 'MailFromDomainNotVerified':
            logger.error("SES sender email not verified")
        elif error_code == 'ConfigurationSetDoesNotExist':
            logger.error("SES configuration set does not exist")

        return False

    except Exception as e:
        logger.error(f"Unexpected error sending confirmation email: {str(e)}", extra={
            'recipient_email': recipient_email,
            'application_id': application_id
        }, exc_info=True)
        return False

    finally:
        logger.info(f"=== {operation.upper()} END ===")
