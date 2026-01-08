"""
Email service for event booking form backend.
Sends confirmation emails with PDF attachments.
"""
import os
import logging
import boto3
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.mime.text import MIMEText
from datetime import datetime
from services.config import SES_SENDER, SES_SENDER_NAME, ALERT_EMAIL, SES_CC_ADDRESSES
from services.utils import get_malaysia_time

logger = logging.getLogger()


def send_booking_confirmation_email(
    pdf_bytes,
    recipient_email,
    customer_name=None,
    phone_number=None,
    booking_id=None,
    booking_data=None
):
    """Send event booking confirmation email with PDF attachment"""
    operation = "send_booking_confirmation_email"
    logger.info(f"=== {operation.upper()} START ===")
    logger.info(f"Sending to: {recipient_email}, Booking ID: {booking_id}")
    
    try:
        ses = boto3.client('ses')
        malaysia_time = get_malaysia_time()
        submitted_time = malaysia_time.strftime('%d %B %Y, %I:%M %p')

        subject = "Event Booking Confirmation - Confetti KL"
        source = f"{SES_SENDER_NAME} <{SES_SENDER}>"

        # Extract booking details
        if booking_data:
            event_date = booking_data.get('event_date') or booking_data.get('eventDate') or 'N/A'
            event_time = booking_data.get('event_time') or booking_data.get('eventTime') or 'N/A'
            hall = booking_data.get('hall') or 'N/A'
        else:
            event_date = 'N/A'
            event_time = 'N/A'
            hall = 'N/A'

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
            background-color: #9333ea;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }}
        .content {{
            padding: 30px;
        }}
        .booking-details {{
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
            width: 150px;
        }}
        .detail-value {{
            color: #212529;
        }}
        .footer {{
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">Thank You for Your Booking!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Event Venue Booking Confirmed</p>
        </div>
        <div class="content">
            <p>Dear <strong>{customer_name or 'Valued Customer'}</strong>,</p>
            <p>Thank you for booking with <strong>Confetti KL</strong>. We have successfully received your event venue booking.</p>
            <div class="booking-details">
                <div class="detail-row">
                    <span class="detail-label">Event Date:</span>
                    <span class="detail-value">{event_date}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Event Time:</span>
                    <span class="detail-value">{event_time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Hall:</span>
                    <span class="detail-value">{hall}</span>
                </div>
            </div>
            <p>Please find the attached PDF copy of your booking for your records.</p>
            <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                If you have any questions or need assistance, please don't hesitate to contact us.
            </p>
            <p style="margin-top: 20px;">
                Best regards,<br>
                <strong>{SES_SENDER_NAME}</strong>
            </p>
        </div>
        <div class="footer">
            <p style="margin: 5px 0;">
                <strong>Confetti KL Event Services</strong>
            </p>
            <p style="margin: 5px 0;">
                This is an automated message. Please do not reply to this email.
            </p>
            <p style="margin: 5px 0;">
                © {malaysia_time.year} Confetti KL. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        """

        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = source
        msg['To'] = recipient_email

        # Add CC addresses if configured
        cc_addresses = []
        if SES_CC_ADDRESSES:
            cc_addresses = [email.strip() for email in SES_CC_ADDRESSES.split(',') if email.strip()]
            if cc_addresses:
                msg['Cc'] = ', '.join(cc_addresses)
                logger.info(f"Adding CC addresses: {cc_addresses}")

        msg.attach(MIMEText(html_body, 'html', 'utf-8'))

        # Attach PDF
        pdf_attachment = MIMEApplication(pdf_bytes)
        pdf_filename = f"EventBooking_{booking_id}.pdf"
        pdf_attachment.add_header('Content-Disposition', 'attachment', filename=pdf_filename)
        msg.attach(pdf_attachment)

        # Prepare destinations
        destinations = [recipient_email]
        if cc_addresses:
            destinations.extend(cc_addresses)

        # Send email
        ses.send_raw_email(
            Source=source,
            Destinations=destinations,
            RawMessage={'Data': msg.as_string()}
        )

        logger.info(f"✓ Booking confirmation email sent successfully to {recipient_email}")
        if cc_addresses:
            logger.info(f"✓ CC sent to: {', '.join(cc_addresses)}")

        return True

    except Exception as e:
        logger.error(f"Failed to send booking confirmation email: {str(e)}", exc_info=True)
        raise
    finally:
        logger.info(f"=== {operation.upper()} END ===")


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

        subject = f"🚨 Event Booking Error Alert: {error_type}"
        msg['Subject'] = subject
        msg['From'] = f"{SES_SENDER_NAME} <{SES_SENDER}>"
        msg['To'] = ALERT_EMAIL

        customer_info = "N/A"
        if customer_data:
            customer_info = f"""
- Name: {customer_data.get('firstName', 'N/A')} {customer_data.get('lastName', 'N/A')}
- Phone: {customer_data.get('phoneNumber', 'N/A')}
- Event Date: {customer_data.get('eventDate', 'N/A')}
- Hall: {customer_data.get('hall', 'N/A')}
"""

        traceback_section = ""
        if traceback_info:
            traceback_section = f"""
Technical Details:
{traceback_info}
"""

        body_text = f"""EVENT BOOKING SUBMISSION FAILURE ALERT

Time: {timestamp}
Error Type: {error_type}

Error Message:
{error_message}

Customer Information:
{customer_info}
{traceback_section}
This is an automated alert from the Event Booking Lambda function.
Please investigate and take appropriate action.

---
Environment: {os.environ.get('AWS_LAMBDA_FUNCTION_NAME', 'Unknown')}
Region: {os.environ.get('AWS_REGION', 'Unknown')}
"""

        msg.attach(MIMEText(body_text, 'plain'))

        ses.send_raw_email(
            Source=f"{SES_SENDER_NAME} <{SES_SENDER}>",
            Destinations=[ALERT_EMAIL],
            RawMessage={'Data': msg.as_string()}
        )

        logger.info(f"Alert email sent to {ALERT_EMAIL} for error type: {error_type}")
        return True

    except Exception as alert_error:
        logger.error(f"Failed to send alert email: {str(alert_error)}")
        return False
