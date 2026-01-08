"""
AWS Lambda handler for wedding form submissions.
This is the main orchestrator that uses the refactored modules.
"""
import io
import json
import logging
import boto3

from config import (
    TEMPLATE_BUCKET, TEMPLATE_KEY, OUTPUT_BUCKET,
    DB_NAME, DB_HOST, DB_USER, DB_PASSWORD, DEPOSITS_BUCKET
)
from utils import map_frontend_to_backend_fields, get_malaysia_time
from database import (
    insert_contact_and_wedding_data,
    update_pdf_url,
    insert_payment_record,
    get_existing_contact_by_email
)
from file_handler import process_deposit_receipt, update_s3_file_path
from pdf_generator import generate_pdf, generate_pdf_filename
from email_service import send_wedding_confirmation_email, send_alert_email
from pxier_service import PxierService

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    """Handle Lambda function invocation"""
    logger.info(f"Received event: {json.dumps(event)}")
    wedding_form_id = None
    contact_id = None
    payment_id = None

    try:
        # Parse request body
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

        # Process deposit receipt upload if needed
        deposit_receipt_url = None
        if texts.get('has_booking_deposit') and texts.get('deposit_receipt_url'):
            try:
                malaysia_now = get_malaysia_time()
                temp_id = f"temp_{int(malaysia_now.timestamp())}"
                deposit_receipt_url = process_deposit_receipt(texts['deposit_receipt_url'], temp_id)
                logger.info(f"Deposit receipt uploaded to: {deposit_receipt_url}")
            except Exception as file_error:
                logger.error(f"Failed to upload deposit receipt: {str(file_error)}")
                send_alert_email(
                    error_type="File Upload to S3 Failed",
                    error_message=f"Failed to upload deposit receipt: {str(file_error)}",
                    customer_data=texts,
                    traceback_info=str(file_error)
                )
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    'body': json.dumps({'error': f"Failed to upload deposit receipt: {str(file_error)}"})
                }

        # Create customer in Pxier if deposit receipt is attached AND email not already in contacts
        pxier_data = None
        if texts.get('has_booking_deposit') and deposit_receipt_url:
            # Check if email already exists in contacts table
            existing_contact = get_existing_contact_by_email(texts.get('email_address'))

            if existing_contact and existing_contact.get('pxier_customer_id'):
                # Use existing Pxier IDs
                logger.info(f"Email {texts.get('email_address')} already exists in contacts with Pxier Customer ID {existing_contact.get('pxier_customer_id')}")
                pxier_data = {
                    'customerId': existing_contact.get('pxier_customer_id'),
                    'contactId': existing_contact.get('pxier_contact_id')
                }
            else:
                # Create new Pxier customer only if email doesn't exist or has no Pxier IDs
                try:
                    logger.info(f"Creating new Pxier customer for email: {texts.get('email_address')}")
                    pxier_data = PxierService.create_customer(texts)
                    if pxier_data:
                        logger.info(f"Pxier customer created: Customer ID {pxier_data.get('customerId')}, Contact ID {pxier_data.get('contactId')}")
                except Exception as pxier_error:
                    logger.error(f"Pxier customer creation failed: {str(pxier_error)}")
                    # Don't fail the entire submission if Pxier fails
                    send_alert_email(
                        error_type="Pxier Customer Creation Failed",
                        error_message=f"Failed to create Pxier customer: {str(pxier_error)}",
                        customer_data=texts,
                        traceback_info=str(pxier_error)
                    )

        # Insert data into database
        try:
            wedding_form_id, contact_id = insert_contact_and_wedding_data(texts, deposit_receipt_url, pxier_data=pxier_data)
            logger.info(f"Database insert successful, wedding form ID: {wedding_form_id}, contact ID: {contact_id}")

            # Update S3 file path if we used a temporary ID
            if deposit_receipt_url and 'temp_' in deposit_receipt_url:
                try:
                    # Extract temp ID from S3 key (e.g., "wedding-form-submission/deposit_receipt/temp_123/...")
                    temp_id = deposit_receipt_url.split('/')[2]  # Get temp_XXX from the key
                    deposit_receipt_url = update_s3_file_path(deposit_receipt_url, temp_id, wedding_form_id)
                except Exception as update_error:
                    logger.warning(f"Could not update S3 file path: {str(update_error)}")

            # Insert payment record if deposit receipt is attached
            if texts.get('has_booking_deposit') and deposit_receipt_url:
                try:
                    payment_id = insert_payment_record(texts, contact_id, wedding_form_id, deposit_receipt_url)
                    if payment_id:
                        logger.info(f"Payment record created with ID: {payment_id}")
                except Exception as payment_error:
                    logger.error(f"Payment record creation failed: {str(payment_error)}")
                    send_alert_email(
                        error_type="Payment Record Creation Failed",
                        error_message=f"Failed to create payment record: {str(payment_error)}",
                        customer_data=texts,
                        traceback_info=str(payment_error)
                    )

        except Exception as db_error:
            logger.error(f"Database operation failed: {str(db_error)}")
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

        # Generate PDF
        try:
            s3 = boto3.client('s3')
            logger.info(f"Downloading template from s3://{TEMPLATE_BUCKET}/{TEMPLATE_KEY}")
            template_obj = s3.get_object(Bucket=TEMPLATE_BUCKET, Key=TEMPLATE_KEY)
            template_bytes = template_obj['Body'].read()
            logger.info("Template PDF downloaded successfully")

            # Generate PDF
            pdf_bytes = generate_pdf(template_bytes, texts)

            # Upload to S3 in wedding-form-submission folder
            customer_full_name = f"{texts.get('first_name', '')} {texts.get('last_name', '')}".strip()
            pdf_filename = generate_pdf_filename(customer_full_name, texts.get('phone_number', '0000'))
            output_key = f"wedding-form-submission/output/{pdf_filename}"
            logger.info(f"Uploading filled PDF to s3://{OUTPUT_BUCKET}/{output_key}")
            s3.put_object(
                Bucket=OUTPUT_BUCKET,
                Key=output_key,
                Body=pdf_bytes,
                ContentType='application/pdf'
            )
            logger.info("PDF uploaded successfully")

            # Store S3 key (relative path) instead of full URL
            pdf_s3_key = output_key
            logger.info(f"PDF S3 key: {pdf_s3_key}")

            try:
                update_pdf_url(wedding_form_id, pdf_s3_key)
                logger.info(f"PDF S3 key stored in database for wedding form ID: {wedding_form_id}")
            except Exception as db_update_error:
                logger.error(f"Failed to update PDF S3 key in database: {str(db_update_error)}")
                # Don't fail the entire request if just the key update fails
                send_alert_email(
                    error_type="PDF S3 Key Database Update Failed",
                    error_message=f"Failed to update PDF S3 key in database: {str(db_update_error)}",
                    customer_data=texts,
                    traceback_info=str(db_update_error)
                )

        except Exception as pdf_error:
            logger.error(f"PDF processing/upload failed: {str(pdf_error)}")
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

        # Send email to customer
        recipient_email = texts.get("email_address")
        if recipient_email:
            try:
                send_wedding_confirmation_email(
                    pdf_bytes,
                    recipient_email,
                    customer_full_name,
                    texts.get('phone_number'),
                    wedding_form_id,
                    contact_id
                )
            except Exception as email_error:
                logger.error(f"Email sending failed: {str(email_error)}")
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
                'contact_id': contact_id,
                'payment_id': payment_id,
                'pdf_s3_key': pdf_s3_key,
                'pdf_location': f's3://{OUTPUT_BUCKET}/{output_key}'
            }),
        }

    except Exception as e:
        logger.error(f"Error processing wedding form: {str(e)}", exc_info=True)
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