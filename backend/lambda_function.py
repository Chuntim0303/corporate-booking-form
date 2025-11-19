import json
import os
import pymysql
import logging
import re
from datetime import datetime
from typing import Dict, Any

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda function to handle corporate partner application submissions.
    Inserts contact data into leads table and partner data into partner_applications table.
    """
    
    # Set CORS headers
    headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
    
    logger.info("Lambda function started", extra={
        'event_type': type(event).__name__,
        'http_method': event.get('httpMethod'),
        'path': event.get('path'),
        'resource': event.get('resource'),
        'request_id': getattr(context, 'aws_request_id', 'N/A') if context else 'N/A'
    })
    
    try:
        # Handle preflight OPTIONS request
        if event.get('httpMethod') == 'OPTIONS':
            logger.info("Handling CORS preflight request")
            return {
                'statusCode': 200,
                'headers': headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }
        
        # Parse the request body
        if 'body' not in event:
            logger.warning("No request body provided in event")
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No request body provided'})
            }
        
        # Log raw body for debugging
        logger.debug("Raw request body", extra={
            'body_type': type(event['body']).__name__,
            'body_length': len(str(event['body']))
        })
        
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
            'has_contact_name': 'contactName' in body
        })
        
        # Validate required fields (updated to match frontend form)
        required_fields = [
            'contactName', 'position', 'email', 'phone',
            'countryCode', 'nric', 'companyName', 'industry',
            'partnershipTier', 'termsAccepted'
        ]

        missing_fields = [field for field in required_fields if not body.get(field)]
        if missing_fields:
            logger.warning("Missing required fields in request", extra={
                'missing_fields': missing_fields,
                'provided_fields': [f for f in required_fields if f not in missing_fields],
                'email': body.get('email', 'NOT_PROVIDED')
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
            'contact_name': body.get('contactName')
        })
        result = insert_lead_and_partner_application(body)
        
        logger.info("Lead and partner application submitted successfully", extra={
            'email': email_value,
            'lead_id': result['lead_id'],
            'application_id': result['application_id']
        })
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Application submitted successfully',
                'leadId': result['lead_id'],
                'applicationId': result['application_id']
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
        logger.error("Unexpected error in lambda handler", extra={
            'error_type': type(e).__name__,
            'error_message': str(e),
            'stack_trace': getattr(e, '__traceback__', 'No traceback')
        }, exc_info=True)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': 'Internal server error'})
        }


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


def insert_lead_and_partner_application(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Insert data into both leads and partner_applications tables in a single transaction.
    The lead is created first, then its ID is stored in partner_applications.lead_id.
    """
    connection = None
    email = data['email'].lower()

    # Parse contactName into first and last name
    contact_name = data.get('contactName', '').strip()
    name_parts = contact_name.split(None, 1)  # Split on first whitespace
    first_name = name_parts[0] if len(name_parts) > 0 else ''
    last_name = name_parts[1] if len(name_parts) > 1 else ''

    logger.info("Starting database transaction", extra={
        'email': email,
        'contact_name': contact_name,
        'first_name': first_name,
        'last_name': last_name
    })
    
    try:
        connection = get_db_connection()
        current_time = datetime.utcnow()
        
        with connection.cursor() as cursor:
            # Insert into leads table FIRST
            lead_insert_query = """
            INSERT INTO leads (
                first_name, last_name, email_address, gender, phone_number,
                address_line_1, address_line_2, city, state, postal_code,
                lead_source, created_at, updated_at
            ) VALUES (
                %(first_name)s, %(last_name)s, %(email_address)s, %(gender)s, %(phone_number)s,
                %(address_line_1)s, %(address_line_2)s, %(city)s, %(state)s, 
                %(postal_code)s, 'ccp', NOW(), NOW()
            )
            """
            
            lead_data = {
                'first_name': first_name,
                'last_name': last_name,
                'email_address': email,
                'gender': data.get('gender', 'prefer_not_to_say'),  # Default if not provided
                'phone_number': data['phone'],
                'address_line_1': data.get('addressLine1', 'Not provided'),  # Default if not provided
                'address_line_2': data.get('addressLine2', ''),
                'city': data.get('city', 'Not provided'),  # Default if not provided
                'state': data.get('state', 'Not provided'),  # Default if not provided
                'postal_code': data.get('postalCode', '00000')  # Default if not provided
            }
            
            logger.debug("Executing lead insertion query", extra={
                'query_params_keys': list(lead_data.keys()),
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            })
            
            cursor.execute(lead_insert_query, lead_data)
            lead_id = cursor.lastrowid
            
            logger.info("Lead record inserted successfully", extra={
                'lead_id': lead_id,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'table': 'leads'
            })
            
            # Now insert into partner_applications table with the lead_id
            partner_insert_query = """
            INSERT INTO partner_applications (
                lead_id, position, company_name, industry, company_size, partnership_tier,
                event_types, expected_events, terms_accepted,
                submitted_at, status, created_at, updated_at
            ) VALUES (
                %(lead_id)s, %(position)s, %(company_name)s, %(industry)s, 
                %(company_size)s, %(partnership_tier)s, %(event_types)s, 
                %(expected_events)s, %(terms_accepted)s,
                NOW(), 'pending', NOW(), NOW()
            )
            """
            
            partner_data = {
                'lead_id': lead_id,
                'position': data['position'],
                'company_name': data['companyName'],
                'industry': data['industry'],
                'company_size': data.get('companySize', 'Not specified'),  # Default if not provided
                'partnership_tier': data['partnershipTier'],
                'event_types': json.dumps(data.get('eventTypes', [])),
                'expected_events': data.get('expectedEvents', 0),  # Default to 0 if not provided
                'terms_accepted': data['termsAccepted']
            }
            
            logger.debug("Executing partner application insertion query", extra={
                'query_params_keys': list(partner_data.keys()),
                'lead_id': lead_id,
                'table': 'partner_applications'
            })
            
            cursor.execute(partner_insert_query, partner_data)
            application_id = cursor.lastrowid
            
            logger.info("Partner application record inserted successfully", extra={
                'application_id': application_id,
                'lead_id': lead_id,
                'email': email
            })
            
            # Commit both inserts
            connection.commit()
            logger.info("Database transaction committed successfully", extra={
                'lead_id': lead_id,
                'application_id': application_id,
                'email': email,
                'first_name': first_name,
                'last_name': last_name,
                'tables_updated': ['leads', 'partner_applications']
            })
            
            return {
                'lead_id': lead_id,
                'application_id': application_id
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