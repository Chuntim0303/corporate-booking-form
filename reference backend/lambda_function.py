import json
import boto3
import os
import logging
from datetime import datetime
from services.uploads import handle_file_upload, generate_presigned_url
from services.email_service import send_booking_confirmation_email, send_alert_email
from services.pdf_generator import generate_pdf, generate_pdf_filename
from services.pxier_service import PxierService
from services.config import TEMPLATE_BUCKET, TEMPLATE_KEY, OUTPUT_BUCKET
from services.s3_diagnostics import check_s3_bucket_config
from services.database import (
    create_or_update_contact,
    create_event_booking,
    get_booking as db_get_booking,
    get_all_bookings,
    update_booking_status,
    add_pdf_url_to_booking,
    update_contact_pxier_ids,
    test_connection
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Run S3 diagnostics on cold start
try:
    logger.info("Running S3 bucket diagnostics...")
    check_s3_bucket_config()
except Exception as diag_error:
    logger.error(f"S3 diagnostics failed: {str(diag_error)}")

def lambda_handler(event, context):
    """
    Main Lambda handler that routes API requests
    """
    try:
        # Parse the request
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')
        
        logger.info(f"=== INCOMING REQUEST ===")
        logger.info(f"HTTP Method: {http_method}")
        logger.info(f"Path: {path}")
        logger.info(f"Headers: {json.dumps(event.get('headers', {}), default=str)}")
        logger.info(f"Query Parameters: {json.dumps(event.get('queryStringParameters', {}), default=str)}")
        logger.info(f"Body (first 500 chars): {str(event.get('body', ''))[:500]}")

        # CORS headers
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        }

        # Handle OPTIONS request for CORS
        if http_method == 'OPTIONS':
            logger.info("Handling OPTIONS preflight request")
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }

        # Route to appropriate handler
        if path == '/api/bookings' and http_method == 'POST':
            logger.info("Routing to create_booking")
            return create_booking(event, headers)
        elif path == '/api/bookings' and http_method == 'GET':
            logger.info("Routing to get_bookings")
            return get_bookings(event, headers)
        elif path.startswith('/api/bookings/') and http_method == 'GET':
            logger.info("Routing to get_booking")
            return get_booking(event, headers)
        elif path == '/api/upload-url' and http_method == 'POST':
            logger.info("Routing to get_upload_url")
            return get_upload_url(event, headers)
        else:
            logger.warning(f"Route not found: {http_method} {path}")
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Route not found', 'path': path, 'method': http_method})
            }

    except Exception as e:
        logger.error(f"CRITICAL ERROR in lambda_handler: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers if 'headers' in locals() else {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error', 'message': str(e), 'type': type(e).__name__})
        }


def create_booking(event, headers):
    """
    Create a new booking with email confirmation, PDF generation, and Pxier integration
    POST /api/bookings
    """
    booking_id = None
    try:
        # Parse request body
        raw_body = event.get('body', '{}')
        logger.info(f"Raw request body length: {len(raw_body)} chars")
        
        body = json.loads(raw_body)
        logger.info(f"Parsed booking request with {len(body)} fields")
        logger.info(f"Booking data: {json.dumps(body, default=str)}")

        # Generate booking ID
        booking_id = f"BK{datetime.now().strftime('%Y%m%d%H%M%S')}"
        logger.info(f"Generated booking ID: {booking_id}")

        # Prepare booking data for database
        booking_data = {
            'firstName': body.get('firstName'),
            'lastName': body.get('lastName'),
            'email': body.get('email'),
            'phoneNumber': body.get('phoneNumber'),
            'nric': body.get('nric'),
            'addressLine1': body.get('addressLine1'),
            'addressLine2': body.get('addressLine2'),
            'city': body.get('city'),
            'state': body.get('state'),
            'postcode': body.get('postcode'),
            'isCompanyEvent': body.get('isCompanyEvent', False),
            'eventDate': body.get('eventDate'),
            'eventTime': body.get('eventTime'),
            'hall': body.get('hall'),
            'guestCount': body.get('guestCount'),
            'additionalRequests': body.get('additionalRequests'),
            'paymentProofUrls': body.get('paymentProofUrls', []),
        }

        # Add company information if it's a company event
        if body.get('isCompanyEvent'):
            booking_data.update({
                'position': body.get('position'),
                'companyName': body.get('companyName'),
                'industry': body.get('industry')
            })

        # Create or update contact in MySQL
        logger.info("Creating or updating contact in MySQL database")
        contact_id = create_or_update_contact(booking_data)
        logger.info(f"✓ Contact saved with ID: {contact_id}")

        # Create event booking in MySQL
        logger.info(f"Creating event booking in MySQL database")
        booking = create_event_booking(booking_id, contact_id, booking_data)
        logger.info(f"✓ Event booking saved: {booking_id}")

        # Generate PDF if template is configured
        pdf_bytes = None
        pdf_s3_key = None
        if TEMPLATE_BUCKET and TEMPLATE_KEY and OUTPUT_BUCKET:
            try:
                logger.info("Generating PDF for booking")
                s3 = boto3.client('s3')
                template_obj = s3.get_object(Bucket=TEMPLATE_BUCKET, Key=TEMPLATE_KEY)
                template_bytes = template_obj['Body'].read()
                
                # Generate PDF with booking data
                # Note: MySQL returns snake_case keys (e.g., first_name) while the PDF template
                # placeholders expect camelCase keys (e.g., firstName).
                booking_metadata = booking.get('metadata')
                if isinstance(booking_metadata, str):
                    try:
                        booking_metadata = json.loads(booking_metadata)
                    except Exception:
                        booking_metadata = {}
                elif not isinstance(booking_metadata, dict):
                    booking_metadata = {}

                pdf_booking_data = {
                    'firstName': f"{booking.get('last_name', '')} {booking.get('first_name', '')}".strip(),
                    'email': booking.get('email_address'),
                    'phoneNumber': booking.get('phone_number'),
                    'nric': booking.get('identification_card') or booking_metadata.get('nric'),
                    'addressLine1': booking.get('address_line_1'),
                    'addressLine2': booking.get('address_line_2'),
                    'postcode': booking.get('postcode'),
                    'city': booking.get('city'),
                    'state': booking.get('state'),
                    'companyName': booking.get('company_name'),
                    'guestCount': booking_metadata.get('guestCount'),
                    'additionalRequests': booking_metadata.get('additionalRequests'),
                    'eventDate': booking.get('event_date'),
                    'eventTime': booking.get('event_time'),
                    'hall': booking.get('hall'),
                    'isCompanyEvent': booking.get('is_company_event') if 'is_company_event' in booking else booking.get('isCompanyEvent'),
                }

                pdf_bytes = generate_pdf(template_bytes, pdf_booking_data)

                # Upload PDF to S3
                # MySQL returns first_name/last_name, not firstName/lastName
                customer_name = f"{booking.get('first_name', '')} {booking.get('last_name', '')}".strip()
                pdf_filename = generate_pdf_filename(booking_id, customer_name)
                pdf_s3_key = f"event-bookings/pdfs/{pdf_filename}"
                
                s3.put_object(
                    Bucket=OUTPUT_BUCKET,
                    Key=pdf_s3_key,
                    Body=pdf_bytes,
                    ContentType='application/pdf'
                )
                logger.info(f"PDF uploaded to S3: {pdf_s3_key}")

                # Update booking with PDF location in MySQL
                add_pdf_url_to_booking(booking_id, pdf_s3_key)
                logger.info(f"PDF URL added to booking in database")
                
            except Exception as pdf_error:
                logger.error(f"PDF generation failed: {str(pdf_error)}", exc_info=True)
                send_alert_email(
                    error_type="PDF Generation Failed",
                    error_message=str(pdf_error),
                    customer_data=booking,
                    traceback_info=str(pdf_error)
                )
        else:
            logger.warning("PDF template not configured, skipping PDF generation")

        # Send confirmation email (with or without PDF)
        email_sent = False
        customer_email = body.get('email')
        if customer_email:
            try:
                logger.info(f"Sending confirmation email to: {customer_email}")
                # MySQL returns first_name/last_name, not firstName/lastName
                customer_name = f"{booking.get('first_name', '')} {booking.get('last_name', '')}".strip()

                send_booking_confirmation_email(
                    pdf_bytes=pdf_bytes,  # Can be None if PDF generation failed
                    recipient_email=customer_email,
                    customer_name=customer_name,
                    phone_number=booking.get('phone_number'),  # MySQL field name
                    booking_id=booking_id,
                    booking_data=booking
                )
                email_sent = True
                logger.info("Confirmation email sent successfully")
            except Exception as email_error:
                logger.error(f"Email sending failed: {str(email_error)}", exc_info=True)
                send_alert_email(
                    error_type="Email Sending Failed",
                    error_message=str(email_error),
                    customer_data=booking,
                    traceback_info=str(email_error)
                )
        else:
            logger.warning("No email address provided, skipping email notification")

        # Create customer in Pxier
        pxier_customer_id = None
        pxier_contact_id = None
        if customer_email:
            try:
                logger.info("Attempting to create customer in Pxier")
                pxier_result = PxierService.create_customer(booking)
                if pxier_result:
                    pxier_customer_id = pxier_result.get('customerId')
                    pxier_contact_id = pxier_result.get('contactId')
                    logger.info(f"Pxier customer created: Customer ID {pxier_customer_id}, Contact ID {pxier_contact_id}")

                    # Update contact with Pxier IDs in MySQL
                    contact_id = booking.get('contact_id')
                    if contact_id:
                        update_contact_pxier_ids(contact_id, pxier_customer_id, pxier_contact_id)
                        logger.info(f"Updated contact {contact_id} with Pxier IDs")
            except Exception as pxier_error:
                logger.error(f"Pxier customer creation failed: {str(pxier_error)}", exc_info=True)
                send_alert_email(
                    error_type="Pxier Customer Creation Failed",
                    error_message=str(pxier_error),
                    customer_data=booking,
                    traceback_info=str(pxier_error)
                )

        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps({
                'message': 'Booking created successfully',
                'bookingId': booking_id,
                'booking': booking,
                'pdfGenerated': pdf_bytes is not None,
                'emailSent': email_sent,
                'pxierCustomerId': pxier_customer_id,
                'pxierContactId': pxier_contact_id
            }, default=str)
        }

    except Exception as e:
        logger.error(f"ERROR creating booking: {str(e)}", exc_info=True)
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"Booking ID (if generated): {booking_id}")
        
        try:
            send_alert_email(
                error_type="Booking Creation Failed",
                error_message=str(e),
                customer_data=body if 'body' in locals() else None,
                traceback_info=str(e)
            )
        except Exception as alert_error:
            logger.error(f"Failed to send alert email: {str(alert_error)}")
        
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Failed to create booking',
                'message': str(e),
                'errorType': type(e).__name__,
                'bookingId': booking_id
            })
        }


def get_bookings(event, headers):
    """
    Get all bookings from MySQL database
    GET /api/bookings
    """
    try:
        # Get pagination parameters from query string
        query_params = event.get('queryStringParameters', {}) or {}
        limit = int(query_params.get('limit', 100))
        offset = int(query_params.get('offset', 0))

        # Get bookings from MySQL
        bookings = get_all_bookings(limit=limit, offset=offset)

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'bookings': bookings,
                'count': len(bookings),
                'limit': limit,
                'offset': offset
            }, default=str)
        }

    except Exception as e:
        logger.error(f"Error getting bookings: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Failed to get bookings', 'message': str(e)})
        }


def get_booking(event, headers):
    """
    Get a specific booking by ID from MySQL database
    GET /api/bookings/{bookingId}
    """
    try:
        # Extract booking ID from path
        path = event.get('path', '')
        booking_id = path.split('/')[-1]

        # Get from MySQL
        booking = db_get_booking(booking_id)

        if not booking:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Booking not found'})
            }

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'booking': booking}, default=str)
        }

    except Exception as e:
        logger.error(f"Error getting booking: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Failed to get booking', 'message': str(e)})
        }


def get_upload_url(event, headers):
    """
    Generate presigned URL for S3 upload
    POST /api/upload-url
    """
    try:
        logger.info("=== GET_UPLOAD_URL REQUEST ===")
        raw_body = event.get('body', '{}')
        logger.info(f"Raw body: {raw_body}")
        
        body = json.loads(raw_body)
        file_name = body.get('fileName')
        file_type = body.get('fileType')
        
        logger.info(f"Requested file upload - Name: {file_name}, Type: {file_type}")

        if not file_name or not file_type:
            logger.warning("Missing fileName or fileType in request")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'fileName and fileType are required'})
            }

        # Generate presigned URL
        logger.info(f"Generating presigned URL for {file_name}")
        logger.info(f"S3 Bucket: {os.environ.get('S3_BUCKET_NAME', 'event-venue-bookings')}")
        
        upload_data = generate_presigned_url(file_name, file_type)
        
        logger.info(f"✓ Presigned URL generated successfully")
        logger.info(f"Upload URL: {upload_data.get('uploadUrl')[:100]}...")
        logger.info(f"File URL: {upload_data.get('fileUrl')}")
        logger.info(f"File Key: {upload_data.get('fileKey')}")
        
        # Validate the presigned URL format
        upload_url = upload_data.get('uploadUrl', '')
        if 'AWSAccessKeyId' in upload_url and 'Signature' in upload_url:
            logger.info("✓ Presigned URL contains required AWS signature parameters")
        else:
            logger.warning("⚠ Presigned URL may be malformed")

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(upload_data)
        }

    except Exception as e:
        logger.error(f"ERROR generating upload URL: {str(e)}", exc_info=True)
        logger.error(f"Error type: {type(e).__name__}")
        logger.error(f"File name: {file_name if 'file_name' in locals() else 'N/A'}")
        logger.error(f"File type: {file_type if 'file_type' in locals() else 'N/A'}")
        
        # Run diagnostics on error
        try:
            logger.info("Running S3 diagnostics due to error...")
            check_s3_bucket_config()
        except:
            pass
        
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({
                'error': 'Failed to generate upload URL',
                'message': str(e),
                'errorType': type(e).__name__,
                'hint': 'Check S3 bucket CORS configuration'
            })
        }
