import json
import os
import sys
import pymysql
import logging
import re
import requests
from datetime import datetime
from typing import Dict, Any
import platform

# Add services directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
services_dir = os.path.join(current_dir, 'services')
if services_dir not in sys.path:
    sys.path.insert(0, services_dir)

# Import services - simplified approach like reference backend
from services.presign_service import handle_presign_request
from services.textract_service import extract_amount_from_receipt
from services.email_service import send_partnership_confirmation_email
from services.pdf_generator import generate_pdf, load_template_from_s3, generate_pdf_filename
import config

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Log import status for debugging
logger.info("=" * 60)
logger.info("Lambda Function Initialization - Import Status")
logger.info("=" * 60)
logger.info(f"Python Version: {sys.version}")
logger.info(f"Platform: {platform.platform()}")
logger.info(f"Machine: {platform.machine()}")
logger.info(f"Processor: {platform.processor()}")
logger.info("✓ presign_service: Available")
logger.info("✓ textract_service: Available")
logger.info("✓ email_service: Available")
logger.info("✓ pdf_generator: Available (lazy imports)")
logger.info("✓ config module: Available")
logger.info(f"Template Config - TEMPLATE_BUCKET: {config.TEMPLATE_BUCKET or 'NOT SET'}")
logger.info(f"Template Config - TEMPLATE_KEY: {config.TEMPLATE_KEY or 'NOT SET'}")
logger.info("=" * 60)
logger.info("Note: reportlab/pdfrw loaded lazily when PDF generation is called")


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda function to handle all corporate partnership API requests.
    Routes to appropriate service based on path.

    Routes:
    - POST /applications - Submit partnership application
    - POST /presign - Generate S3 presigned URL for receipt upload
    - OPTIONS /* - CORS preflight
    """

    # Get the path and method from event
    path = event.get('path', event.get('resource', ''))
    http_method = event.get('httpMethod', 'POST')
    request_headers = event.get('headers', {}) or {}
    origin = request_headers.get('origin') or request_headers.get('Origin') or 'UNKNOWN'

    # Set CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }

    logger.info("=== LAMBDA HANDLER START ===", extra={
        'event_type': type(event).__name__,
        'http_method': http_method,
        'path': path,
        'resource': event.get('resource'),
        'request_id': getattr(context, 'aws_request_id', 'N/A') if context else 'N/A',
        'origin': origin,
        'cors_headers_set': headers,
        'all_request_headers': request_headers
    })

    try:
        # Handle preflight OPTIONS request
        if http_method == 'OPTIONS':
            logger.info("Handling CORS preflight request")
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }

        # Route based on path
        if '/presign' in path:
            logger.info("Routing to presign service")
            return handle_presign_route(event, headers)
        elif '/applications' in path or not path or path == '/':
            logger.info("Routing to applications service")
            return handle_application_route(event, headers)
        else:
            logger.warning(f"Unknown path: {path}")
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': f'Path not found: {path}'})
            }

    except Exception as e:
        logger.error("Unexpected error in lambda handler", extra={
            'error_type': type(e).__name__,
            'error_message': str(e)
        }, exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error'})
        }


def handle_presign_route(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Handle presign URL generation requests"""
    logger.info("=== PRESIGN ROUTE DEBUG START ===")

    try:
        if not handle_presign_request:
            logger.error("Presign service not available")
            return {
                'statusCode': 503,
                'headers': headers,
                'body': json.dumps({'error': 'Presign service not configured'})
            }

        # Parse request body
        if 'body' not in event:
            logger.warning("No request body in presign route")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No request body provided'})
            }

        body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']

        # Extract request headers and origin information
        request_headers = event.get('headers', {}) or {}
        origin = request_headers.get('origin') or request_headers.get('Origin') or 'UNKNOWN'

        logger.info("Presign request parsed", extra={
            'body_keys': list(body.keys()),
            'file_name': body.get('fileName'),
            'file_type': body.get('fileType'),
            'origin': origin,
            'all_headers': request_headers,
            'referer': request_headers.get('referer') or request_headers.get('Referer'),
            'user_agent': request_headers.get('user-agent') or request_headers.get('User-Agent'),
            'request_id': event.get('requestContext', {}).get('requestId', 'N/A')
        })

        # Build request context
        request_context = {
            'origin': origin,
            'headers': request_headers,
            'request_id': event.get('requestContext', {}).get('requestId', 'N/A')
        }

        # Call presign service with context
        result = handle_presign_request(body, request_context)

        logger.info("Presign service returned", extra={
            'result_keys': list(result.keys()),
            'status_code': result.get('statusCode'),
            'has_upload_url': 'uploadUrl' in result,
            'has_key': 'key' in result,
            'has_error': 'error' in result
        })

        # Format response
        if result.get('statusCode') == 200:
            response_body = {
                'uploadUrl': result['uploadUrl'],
                'key': result['key'],
                'bucket': result.get('bucket')
            }

            logger.info("✓ Returning presign success response", extra={
                'upload_url_preview': result['uploadUrl'][:100] + '...',
                'upload_url_full': result['uploadUrl'],
                'storage_key': result['key'],
                'bucket': result.get('bucket'),
                'response_headers': headers,
                'cors_enabled': 'Access-Control-Allow-Origin' in headers
            })

            final_response = {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps(response_body)
            }

            logger.info("Final response prepared", extra={
                'status_code': 200,
                'response_headers': final_response['headers'],
                'body_keys': list(response_body.keys())
            })

            return final_response
        else:
            logger.warning("⚠ Presign service returned error", extra={
                'status_code': result.get('statusCode'),
                'error': result.get('error')
            })

            return {
                'statusCode': result.get('statusCode', 500),
                'headers': headers,
                'body': json.dumps({'error': result.get('error', 'Unknown error')})
            }

    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error in presign route: {str(e)}", extra={
            'body_preview': str(event.get('body', ''))[:200]
        })
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }
    except Exception as e:
        logger.error(f"Error in presign route: {str(e)}", extra={
            'error_type': type(e).__name__
        }, exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }
    finally:
        logger.info("=== PRESIGN ROUTE DEBUG END ===")


def handle_application_route(event: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
    """Handle partnership application submission"""
    try:
        # Parse the request body
        if 'body' not in event:
            logger.warning("No request body provided in event")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No request body provided'})
            }

        # Handle both direct invocation and API Gateway
        if isinstance(event['body'], str):
            try:
                body = json.loads(event['body'])
                logger.debug("Successfully parsed JSON from string body")
            except json.JSONDecodeError as e:
                logger.error("Failed to parse JSON from string body", extra={
                    'error': str(e),
                    'body_preview': str(event['body'])[:200]
                })
                raise
        else:
            body = event['body']
            logger.debug("Using direct body object (non-string)")

        logger.info("Request body parsed successfully", extra={
            'body_keys': list(body.keys()) if body else [],
            'email_provided': 'email' in body,
            'has_first_name': 'firstName' in body,
            'has_last_name': 'lastName' in body
        })

        # Validate required fields
        # Base required fields for all users
        required_fields = [
            'firstName', 'lastName', 'email', 'phone',
            'countryCode', 'nric', 'partnershipTier', 'termsAccepted'
        ]

        # Add business-specific fields only if user is a business owner
        is_not_business_owner = body.get('notBusinessOwner', False)
        if not is_not_business_owner:
            required_fields.extend(['position', 'companyName', 'industry'])

        missing_fields = [field for field in required_fields if not body.get(field)]
        if missing_fields:
            logger.warning("Missing required fields in request", extra={
                'missing_fields': missing_fields,
                'provided_fields': [f for f in required_fields if f not in missing_fields],
                'email': body.get('email', 'NOT_PROVIDED'),
                'is_not_business_owner': is_not_business_owner
            })
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'error': f'Missing required fields: {", ".join(missing_fields)}'
                })
            }

        logger.debug("All required fields present")

        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        email_value = body['email'].strip()
        if not re.match(email_pattern, email_value):
            logger.warning("Invalid email format provided", extra={
                'email_provided': email_value,
                'email_pattern': email_pattern
            })
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid email format'})
            }

        logger.debug("Email format validation passed", extra={'email': email_value})

        # Validate NRIC format
        nric_value = body['nric']
        nric_digits = re.sub(r'[^0-9]', '', nric_value)
        if len(nric_digits) != 12:
            logger.warning("Invalid NRIC format provided", extra={
                'nric_provided': nric_value,
                'nric_digits_extracted': nric_digits,
                'digit_count': len(nric_digits)
            })
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid NRIC format - must be 12 digits'})
            }

        logger.debug("NRIC validation passed", extra={'nric_digits': nric_digits})

        # Insert data into both tables
        logger.info("Starting database insertion process", extra={
            'email': email_value,
            'first_name': body.get('firstName'),
            'last_name': body.get('lastName')
        })
        result = insert_lead_and_partner_application(body)

        logger.info("Contact, partner application, and payment submitted successfully", extra={
            'email': email_value,
            'contact_id': result['contact_id'],
            'application_id': result['application_id'],
            'payment_id': result.get('payment_id'),
            'payment_amount': result.get('payment_amount', 0.0)
        })

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Application submitted successfully',
                'contactId': result['contact_id'],
                'applicationId': result['application_id'],
                'paymentId': result.get('payment_id'),
                'paymentAmount': result.get('payment_amount', 0.0)
            })
        }

    except json.JSONDecodeError as e:
        logger.error("JSON decode error in request body", extra={
            'error': str(e),
            'body_preview': str(event.get('body', 'NO_BODY'))[:200]
        })
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Invalid JSON in request body'})
        }

    except Exception as e:
        logger.error("Unexpected error in application route", extra={
            'error_type': type(e).__name__,
            'error_message': str(e),
            'stack_trace': getattr(e, '__traceback__', 'No traceback')
        }, exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error'})
        }


def extract_gender_from_nric(nric: str) -> str:
    """
    Extract gender from Malaysian NRIC.
    Format: YYMMDD-PB-###G where G (last digit) indicates gender
    - Odd number = Male (M)
    - Even number = Female (F)

    Args:
        nric: NRIC string in format XXXXXX-XX-XXXX

    Returns:
        'M' for male, 'F' for female, or 'prefer_not_to_say' if cannot determine
    """
    try:
        # Extract only digits from NRIC
        nric_digits = re.sub(r'[^0-9]', '', nric)

        if len(nric_digits) >= 1:
            # Get the last digit
            last_digit = int(nric_digits[-1])

            # Odd = Male, Even = Female
            if last_digit % 2 == 0:
                return 'F'
            else:
                return 'M'
        else:
            logger.warning("Cannot extract gender from NRIC - no digits found", extra={
                'nric': nric
            })
            return 'prefer_not_to_say'
    except Exception as e:
        logger.error("Error extracting gender from NRIC", extra={
            'error': str(e),
            'nric': nric
        })
        return 'prefer_not_to_say'


def get_db_connection():
    """
    Create and return a MySQL database connection using environment variables.
    """
    logger.debug("Attempting database connection", extra={
        'db_host': os.environ.get('DB_HOST', 'NOT_SET'),
        'db_name': os.environ.get('DB_NAME', 'NOT_SET'),
        'db_user': os.environ.get('DB_USER', 'NOT_SET'),
        'db_port': os.environ.get('DB_PORT', '3306')
    })

    try:
        connection = pymysql.connect(
            host=os.environ['DB_HOST'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            database=os.environ['DB_NAME'],
            port=int(os.environ.get('DB_PORT', 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=False,
            connect_timeout=10,
            read_timeout=30,
            write_timeout=30
        )

        logger.info("Database connection established successfully", extra={
            'db_host': os.environ['DB_HOST'],
            'db_name': os.environ['DB_NAME']
        })
        return connection

    except KeyError as e:
        logger.error("Missing required environment variable for database connection", extra={
            'missing_variable': str(e),
            'available_variables': list(os.environ.keys())
        })
        raise Exception(f"Database configuration error: Missing {str(e)}")

    except pymysql.MySQLError as e:
        logger.error("MySQL connection error", extra={
            'error_code': e.args[0] if e.args else 'UNKNOWN',
            'error_message': e.args[1] if len(e.args) > 1 else str(e),
            'db_host': os.environ.get('DB_HOST', 'NOT_SET')
        })
        raise Exception("Database connection failed")

    except Exception as e:
        logger.error("Unexpected database connection error", extra={
            'error_type': type(e).__name__,
            'error_message': str(e)
        }, exc_info=True)
        raise


def create_pxier_customer(contact_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create customer in Pxier API

    Args:
        contact_data: Contact data from database with keys:
            - first_name, last_name, email_address, phone_number
            - address_line_1, address_line_2, city, state, postcode

    Returns:
        API response from Pxier with customerId and contactId

    Raises:
        Exception: If API call fails
    """
    logger.info("Creating Pxier customer", extra={
        'first_name': contact_data.get('first_name'),
        'last_name': contact_data.get('last_name'),
        'email': contact_data.get('email_address')
    })

    # Validate Pxier configuration
    pxier_token = os.environ.get('PXIER_ACCESS_TOKEN')
    pxier_username = os.environ.get('PXIER_USERNAME')
    pxier_password = os.environ.get('PXIER_PASSWORD')
    pxier_platform = os.environ.get('PXIER_PLATFORM_ADDRESS')

    if not pxier_token or not pxier_username or not pxier_password or not pxier_platform:
        logger.error("Pxier API credentials not configured")
        raise Exception("Pxier API credentials not configured. Please set PXIER_ACCESS_TOKEN, PXIER_USERNAME, PXIER_PASSWORD, and PXIER_PLATFORM_ADDRESS environment variables.")

    # Build customer name
    customer_name = f"{contact_data.get('first_name', '')} {contact_data.get('last_name', '')}".strip()

    # Build Pxier API URL
    pxier_url = f"{pxier_platform}/events/updateCustomer"

    # Prepare phone number
    phone = contact_data.get('phone_number') or ''

    # Prepare payload for Pxier API
    payload = {
        "accessToken": pxier_token,
        "customerId": 0,  # 0 for new customer
        "customerName": customer_name,
        "countryCode": "US",
        "stateCode": contact_data.get('state') or "",
        "customerTypeCode": 0,
        "langCode": "en",
        "address1": contact_data.get('address_line_1') or "",
        "address2": contact_data.get('address_line_2') or "",
        "zipCode": contact_data.get('postcode') or "",
        "city": contact_data.get('city') or "",
        "contact": [{
            "contactId": 0,  # 0 for new contact
            "firstName": contact_data.get('first_name') or "",
            "lastName": contact_data.get('last_name') or "",
            "email": contact_data.get('email_address') or "",
            "phone": phone,
            "mobile": phone
        }]
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        logger.info(f"Sending request to Pxier API")
        logger.debug(f"Pxier API URL: {pxier_url}")

        response = requests.post(
            pxier_url,
            data=json.dumps(payload),
            headers=headers,
            auth=requests.auth.HTTPBasicAuth(pxier_username, pxier_password),
            timeout=30
        )

        response.raise_for_status()
        result = response.json()

        if result.get("error") == False:
            logger.info("Pxier customer created successfully", extra={
                'pxier_customer_id': result.get('data', {}).get('customerId'),
                'pxier_contact_id': result.get('data', {}).get('contactId')
            })
            return result
        else:
            error_msg = result.get('message', 'Unknown error')
            logger.error(f"Pxier API returned error: {result}")
            raise Exception(f"Pxier API error: {error_msg}")

    except requests.exceptions.Timeout:
        logger.error(f"Pxier API request timeout")
        raise Exception("Pxier API request timed out")
    except requests.exceptions.HTTPError as e:
        logger.error(f"Pxier API HTTP error: {str(e)}", exc_info=True)
        raise Exception(f"Pxier API HTTP error: {str(e)}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Pxier API request failed: {str(e)}", exc_info=True)
        raise Exception(f"Failed to communicate with Pxier API: {str(e)}")


def insert_lead_and_partner_application(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Insert data into contacts, partner_applications, and payments tables in a single transaction.

    Flow:
    1. Insert into contacts table -> get contact_id
    2. Insert into partner_applications table -> get application_id
    3. Extract receipt amount using Textract
    4. Insert into payments table with extracted amount

    Returns dict with contact_id, application_id, and payment_id
    """
    connection = None
    email = data['email'].lower()

    # Get first and last name directly from data
    first_name = data.get('firstName', '').strip()
    last_name = data.get('lastName', '').strip()

    # Get receipt information
    receipt_key = data.get('receiptStorageKey', '')
    receipt_file_name = data.get('receiptFileName', '')
    bucket_name = os.environ.get('S3_BUCKET_NAME', '')

    # Get UTM parameters for tracking
    utm_source = data.get('utmSource', '')
    utm_medium = data.get('utmMedium', '')

    logger.info("Starting database transaction", extra={
        'email': email,
        'first_name': first_name,
        'last_name': last_name,
        'has_receipt': bool(receipt_key),
        'utm_source': utm_source,
        'utm_medium': utm_medium
    })

    try:
        connection = get_db_connection()
        current_time = datetime.utcnow()

        with connection.cursor() as cursor:
            # Extract gender from NRIC
            nric = data.get('nric', '')
            gender = extract_gender_from_nric(nric) if nric else 'prefer_not_to_say'

            contact_data = {
                'first_name': first_name,
                'last_name': last_name,
                'email_address': email,
                'gender': gender,
                'phone_number': data['phone'],
                'country_code': data.get('countryCode', ''),
                'identification_card': nric,
                'address_line_1': data.get('addressLine1', 'Not provided'),
                'address_line_2': data.get('addressLine2', ''),
                'city': data.get('city', 'Not provided'),
                'state': data.get('state', 'Not provided'),
                'postcode': data.get('postcode', '00000')
            }

            # Resolve contact_id by email first (do not always insert a new contact)
            cursor.execute(
                """
                SELECT contact_id
                FROM contacts
                WHERE LOWER(email_address) = %s
                LIMIT 1
                """,
                (email,)
            )
            existing_contact = cursor.fetchone()

            if existing_contact and existing_contact.get('contact_id'):
                contact_id = existing_contact['contact_id']
                logger.info("Reusing existing contact_id for email", extra={
                    'contact_id': contact_id,
                    'email': email,
                    'table': 'contacts'
                })
            else:
                # Insert into contacts table FIRST
                contact_insert_query = """
                INSERT INTO contacts (
                    first_name, last_name, email_address, gender, phone_number,
                    country_code, identification_card,
                    address_line_1, address_line_2, city, state, postcode,
                    lead_source, status, created_at, updated_at
                ) VALUES (
                    %(first_name)s, %(last_name)s, %(email_address)s, %(gender)s, %(phone_number)s,
                    %(country_code)s, %(identification_card)s,
                    %(address_line_1)s, %(address_line_2)s, %(city)s, %(state)s,
                    %(postcode)s, 'ccp', 'converted', NOW(), NOW()
                )
                """

                logger.debug("Executing contact insertion query", extra={
                    'query_params_keys': list(contact_data.keys()),
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name
                })

                cursor.execute(contact_insert_query, contact_data)
                contact_id = cursor.lastrowid

                logger.info("Contact record inserted successfully", extra={
                    'contact_id': contact_id,
                    'email': email,
                    'first_name': first_name,
                    'last_name': last_name,
                    'table': 'contacts'
                })

            # Now insert into partner_applications table with the contact_id
            partner_insert_query = """
            INSERT INTO partner_applications (
                contact_id, position, company_name, industry, partnership_tier,
                terms_accepted, total_payable,
                receipt_storage_key, receipt_file_name,
                sales_rep, utm_source, utm_medium, referrer,
                submitted_at, status, created_at, updated_at
            ) VALUES (
                %(contact_id)s, %(position)s, %(company_name)s, %(industry)s,
                %(partnership_tier)s, %(terms_accepted)s, %(total_payable)s,
                %(receipt_storage_key)s, %(receipt_file_name)s,
                %(sales_rep)s, %(utm_source)s, %(utm_medium)s, %(referrer)s,
                NOW(), 'pending', NOW(), NOW()
            )
            """

            # Handle business fields - use defaults if user is not a business owner
            is_not_business_owner = data.get('notBusinessOwner', False)

            partner_data = {
                'contact_id': contact_id,
                'position': data.get('position', 'N/A') if not is_not_business_owner else 'N/A',
                'company_name': data.get('companyName', 'Individual') if not is_not_business_owner else 'Individual',
                'industry': data.get('industry', 'N/A') if not is_not_business_owner else 'N/A',
                'partnership_tier': data['partnershipTier'],
                'terms_accepted': data['termsAccepted'],
                'total_payable': data.get('totalPayable', 0),
                'receipt_storage_key': data.get('receiptStorageKey', ''),
                'receipt_file_name': data.get('receiptFileName', ''),
                'sales_rep': utm_source,  # Keep for backwards compatibility
                'utm_source': utm_source,
                'utm_medium': utm_medium,
                'referrer': data.get('referrer', '')
            }

            logger.debug("Executing partner application insertion query", extra={
                'query_params_keys': list(partner_data.keys()),
                'contact_id': contact_id,
                'table': 'partner_applications'
            })

            cursor.execute(partner_insert_query, partner_data)
            application_id = cursor.lastrowid

            logger.info("Partner application record inserted successfully", extra={
                'application_id': application_id,
                'contact_id': contact_id,
                'email': email
            })

            # Extract amount from receipt using Textract if receipt exists
            payment_amount = 0.0
            if receipt_key and bucket_name and extract_amount_from_receipt:
                logger.info("Extracting amount from receipt using Textract", extra={
                    'bucket': bucket_name,
                    'key': receipt_key
                })
                try:
                    payment_amount = extract_amount_from_receipt(bucket_name, receipt_key)
                    logger.info("Amount extracted from receipt", extra={
                        'amount': payment_amount,
                        'receipt_key': receipt_key
                    })
                except Exception as e:
                    logger.error("Failed to extract amount from receipt", extra={
                        'error_type': type(e).__name__,
                        'error_message': str(e),
                        'receipt_key': receipt_key
                    }, exc_info=True)
                    payment_amount = 0.0
            else:
                logger.info("Skipping Textract extraction", extra={
                    'has_receipt_key': bool(receipt_key),
                    'has_bucket_name': bool(bucket_name),
                    'textract_available': bool(extract_amount_from_receipt)
                })

            # Insert into payments table
            payment_insert_query = """
            INSERT INTO payments (
                contact_id, partner_application_id, amount,
                payment_method, payment_type, description,
                official_receipt, attachment, status,
                transaction_datetime, created_at, updated_at
            ) VALUES (
                %(contact_id)s, %(partner_application_id)s, %(amount)s,
                %(payment_method)s, %(payment_type)s, %(description)s,
                %(official_receipt)s, %(attachment)s, 'pending',
                NOW(), NOW(), NOW()
            )
            """

            # Format: "membership_fee - LastName FirstName"
            payment_description = f"membership_fee - {last_name} {first_name}"

            payment_data = {
                'contact_id': contact_id,
                'partner_application_id': application_id,
                'amount': payment_amount,
                'payment_method': 'bank_transfer',  # Assuming bank transfer since they upload receipt
                'payment_type': 'membership_fee',  # Changed from partnership_fee for proper redirect logic
                'description': payment_description,
                'official_receipt': receipt_key,
                'attachment': receipt_key  # S3 path stored in attachment field
            }

            logger.debug("Executing payment insertion query", extra={
                'query_params_keys': list(payment_data.keys()),
                'contact_id': contact_id,
                'partner_application_id': application_id,
                'amount': payment_amount,
                'table': 'payments'
            })

            cursor.execute(payment_insert_query, payment_data)
            payment_id = cursor.lastrowid

            logger.info("Payment record inserted successfully", extra={
                'payment_id': payment_id,
                'contact_id': contact_id,
                'partner_application_id': application_id,
                'amount': payment_amount,
                'receipt_key': receipt_key
            })

            # Create customer in Pxier after all database records are inserted
            pxier_customer_id = None
            pxier_contact_id = None
            try:
                # Prepare contact data for Pxier
                pxier_contact_data = {
                    'first_name': first_name,
                    'last_name': last_name,
                    'email_address': email,
                    'phone_number': contact_data.get('phone_number'),
                    'address_line_1': contact_data.get('address_line_1'),
                    'address_line_2': contact_data.get('address_line_2'),
                    'city': contact_data.get('city'),
                    'state': contact_data.get('state'),
                    'postcode': contact_data.get('postcode')
                }

                pxier_response = create_pxier_customer(pxier_contact_data)
                pxier_customer_id = pxier_response.get('data', {}).get('customerId')
                pxier_contact_id = pxier_response.get('data', {}).get('contactId')

                logger.info("Pxier customer created successfully", extra={
                    'pxier_customer_id': pxier_customer_id,
                    'pxier_contact_id': pxier_contact_id,
                    'contact_id': contact_id
                })

                # Update contacts table with Pxier IDs
                cursor.execute("""
                    UPDATE contacts
                    SET pxier_customer_id = %s,
                        pxier_contact_id = %s,
                        became_customer_at = NOW(),
                        updated_at = NOW()
                    WHERE contact_id = %s
                """, (pxier_customer_id, pxier_contact_id, contact_id))

                # Update partner_applications with customer_id
                cursor.execute("""
                    UPDATE partner_applications
                    SET customer_id = %s,
                        converted_to_customer_at = NOW(),
                        updated_at = NOW()
                    WHERE id = %s
                """, (pxier_customer_id, application_id))

                logger.info("Updated contacts and partner_applications with Pxier customer IDs", extra={
                    'contact_id': contact_id,
                    'application_id': application_id,
                    'pxier_customer_id': pxier_customer_id
                })

            except Exception as e:
                # Log error but don't fail the entire transaction
                # The application is still submitted even if Pxier creation fails
                logger.error("Failed to create Pxier customer (application still saved)", extra={
                    'error_type': type(e).__name__,
                    'error_message': str(e),
                    'contact_id': contact_id,
                    'application_id': application_id
                }, exc_info=True)

            # Commit all inserts and updates
            connection.commit()
            logger.info("Database transaction committed successfully", extra={
                'contact_id': contact_id,
                'application_id': application_id,
                'payment_id': payment_id,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'payment_amount': payment_amount,
                'tables_updated': ['contacts', 'partner_applications', 'payments']
            })

            # Send confirmation email after successful commit
            if send_partnership_confirmation_email:
                try:
                    # Get CC addresses from environment variable (comma-separated)
                    cc_addresses_str = os.environ.get('SES_CC_ADDRESSES', '')
                    cc_addresses = []
                    if cc_addresses_str:
                        cc_addresses = [addr.strip() for addr in cc_addresses_str.split(',') if addr.strip()]

                    logger.info("Sending confirmation email", extra={
                        'recipient_email': email,
                        'application_id': application_id,
                        'has_cc_addresses': bool(cc_addresses),
                        'cc_count': len(cc_addresses) if cc_addresses else 0
                    })

                    # Generate PDF attachment - simplified approach
                    pdf_bytes = None
                    pdf_filename = None

                    # Check if template is configured
                    if config.TEMPLATE_BUCKET and config.TEMPLATE_KEY:
                        try:
                            logger.info("Generating PDF attachment from template", extra={
                                'application_id': application_id,
                                'template_bucket': config.TEMPLATE_BUCKET,
                                'template_key': config.TEMPLATE_KEY
                            })

                            # Load template from S3
                            template_bytes = load_template_from_s3(
                                config.TEMPLATE_BUCKET,
                                config.TEMPLATE_KEY
                            )

                            # Generate PDF with overlay and signature
                            pdf_bytes = generate_pdf(
                                template_bytes=template_bytes,
                                application_data=data,
                                placeholder_positions=config.PLACEHOLDER_POSITIONS,
                                signature_position=config.SIGNATURE_POSITION,
                                signature_size=config.SIGNATURE_SIZE
                            )

                            pdf_filename = generate_pdf_filename(
                                f"{first_name} {last_name}",
                                data.get('phone', '0000')
                            )

                            logger.info("✓ PDF generated successfully", extra={
                                'pdf_filename': pdf_filename,
                                'pdf_size': len(pdf_bytes)
                            })
                        except Exception as pdf_error:
                            logger.error("✗ Failed to generate PDF attachment", extra={
                                'error_type': type(pdf_error).__name__,
                                'error_message': str(pdf_error),
                                'application_id': application_id
                            }, exc_info=True)
                            pdf_bytes = None
                            pdf_filename = None
                    else:
                        logger.warning("PDF template not configured - skipping PDF generation", extra={
                            'TEMPLATE_BUCKET': config.TEMPLATE_BUCKET or 'NOT SET',
                            'TEMPLATE_KEY': config.TEMPLATE_KEY or 'NOT SET'
                        })

                    # Send email
                    full_name = f"{first_name} {last_name}"
                    email_sent = send_partnership_confirmation_email(
                        recipient_email=email,
                        full_name=full_name,
                        application_id=application_id,
                        contact_id=contact_id,
                        payment_amount=payment_amount,
                        partnership_tier=data['partnershipTier'],
                        company_name=data.get('companyName', 'Individual'),
                        cc_addresses=cc_addresses if cc_addresses else None,
                        pdf_bytes=pdf_bytes,
                        pdf_filename=pdf_filename
                    )

                    if email_sent:
                        logger.info("✓ Confirmation email sent successfully", extra={
                            'recipient_email': email,
                            'application_id': application_id
                        })
                    else:
                        logger.warning("⚠ Failed to send confirmation email, but application was saved", extra={
                            'recipient_email': email,
                            'application_id': application_id
                        })

                except Exception as email_error:
                    # Log email error but don't fail the entire transaction
                    logger.error("Error sending confirmation email (application still saved)", extra={
                        'error_type': type(email_error).__name__,
                        'error_message': str(email_error),
                        'recipient_email': email,
                        'application_id': application_id
                    }, exc_info=True)
            else:
                logger.warning("Email service not available - skipping confirmation email")

            return {
                'contact_id': contact_id,
                'application_id': application_id,
                'payment_id': payment_id,
                'payment_amount': payment_amount
            }

    except pymysql.IntegrityError as e:
        logger.error("Database integrity error", extra={
            'error_code': e.args[0] if e.args else 'UNKNOWN',
            'error_message': e.args[1] if len(e.args) > 1 else str(e),
            'email': email,
            'first_name': first_name,
            'last_name': last_name
        })

        if connection:
            connection.rollback()
            logger.info("Database transaction rolled back due to integrity error")

        raise Exception("Data validation error - please check your information")

    except pymysql.MySQLError as e:
        logger.error("MySQL database error during insertion", extra={
            'error_code': e.args[0] if e.args else 'UNKNOWN',
            'error_message': e.args[1] if len(e.args) > 1 else str(e),
            'email': email,
            'first_name': first_name,
            'last_name': last_name
        })

        if connection:
            connection.rollback()
            logger.info("Database transaction rolled back due to MySQL error")

        raise Exception("Failed to save application due to database error")

    except Exception as e:
        logger.error("Unexpected error during database insertion", extra={
            'error_type': type(e).__name__,
            'error_message': str(e),
            'email': email,
            'first_name': first_name,
            'last_name': last_name
        }, exc_info=True)

        if connection:
            connection.rollback()
            logger.info("Database transaction rolled back due to unexpected error")

        raise Exception("Failed to save application")

    finally:
        if connection:
            try:
                connection.close()
                logger.debug("Database connection closed")
            except Exception as e:
                logger.warning("Error closing database connection", extra={
                    'error_type': type(e).__name__,
                    'error_message': str(e)
                })
