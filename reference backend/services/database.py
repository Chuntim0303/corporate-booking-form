"""
MySQL Database Service
Handles all database operations for contacts and event bookings
"""
import pymysql
import json
import os
import logging
from datetime import datetime
from contextlib import contextmanager

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Database configuration from environment variables
DB_CONFIG = {
    'host': os.environ.get('DB_HOST'),
    'user': os.environ.get('DB_USER'),
    'password': os.environ.get('DB_PASSWORD'),
    'database': os.environ.get('DB_NAME'),
    'port': int(os.environ.get('DB_PORT', 3306)),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor,
    'autocommit': False
}

@contextmanager
def get_db_connection():
    """
    Context manager for database connections
    Automatically handles connection opening, closing, and error handling
    """
    connection = None
    try:
        logger.info(f"Connecting to database: {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
        connection = pymysql.connect(**DB_CONFIG)
        yield connection
        connection.commit()
    except Exception as e:
        if connection:
            connection.rollback()
        logger.error(f"Database error: {str(e)}", exc_info=True)
        raise
    finally:
        if connection:
            connection.close()
            logger.info("Database connection closed")


def create_or_update_contact(booking_data):
    """
    Create a new contact or update existing contact
    Returns the contact_id

    Args:
        booking_data: Dictionary containing booking information

    Returns:
        int: contact_id
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Check if contact exists by email or phone number
        contact_id = None
        if booking_data.get('email'):
            cursor.execute(
                "SELECT contact_id FROM contacts WHERE email_address = %s AND deleted_at IS NULL LIMIT 1",
                (booking_data['email'],)
            )
            result = cursor.fetchone()
            if result:
                contact_id = result['contact_id']

        if not contact_id and booking_data.get('phoneNumber'):
            cursor.execute(
                "SELECT contact_id FROM contacts WHERE phone_number = %s AND deleted_at IS NULL LIMIT 1",
                (booking_data['phoneNumber'],)
            )
            result = cursor.fetchone()
            if result:
                contact_id = result['contact_id']

        # Prepare contact data
        contact_data = {
            'first_name': booking_data.get('firstName', ''),
            'last_name': booking_data.get('lastName', ''),
            'email_address': booking_data.get('email', ''),
            'phone_number': booking_data.get('phoneNumber', ''),
            'company_name': booking_data.get('companyName', ''),
            'industry': booking_data.get('industry', ''),
            'position': booking_data.get('position', ''),
            'identification_card': booking_data.get('nric', ''),
            'address_line_1': booking_data.get('addressLine1', ''),
            'address_line_2': booking_data.get('addressLine2', ''),
            'city': booking_data.get('city', ''),
            'state': booking_data.get('state', ''),
            'postcode': booking_data.get('postcode', ''),
        }

        if contact_id:
            # Update existing contact
            logger.info(f"Updating existing contact: {contact_id}")
            update_query = """
                UPDATE contacts
                SET first_name = %s,
                    last_name = %s,
                    email_address = %s,
                    phone_number = %s,
                    company_name = %s,
                    industry = %s,
                    position = %s,
                    identification_card = %s,
                    address_line_1 = %s,
                    address_line_2 = %s,
                    city = %s,
                    state = %s,
                    postcode = %s,
                    updated_at = NOW()
                WHERE contact_id = %s
            """
            cursor.execute(update_query, (
                contact_data['first_name'],
                contact_data['last_name'],
                contact_data['email_address'],
                contact_data['phone_number'],
                contact_data['company_name'],
                contact_data['industry'],
                contact_data['position'],
                contact_data['identification_card'],
                contact_data['address_line_1'],
                contact_data['address_line_2'],
                contact_data['city'],
                contact_data['state'],
                contact_data['postcode'],
                contact_id
            ))
        else:
            # Create new contact
            logger.info("Creating new contact")
            insert_query = """
                INSERT INTO contacts (
                    first_name, last_name, email_address, phone_number,
                    company_name, industry, position, identification_card,
                    address_line_1, address_line_2, city, state, postcode,
                    status, created_at, updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'lead', NOW(), NOW())
            """
            cursor.execute(insert_query, (
                contact_data['first_name'],
                contact_data['last_name'],
                contact_data['email_address'],
                contact_data['phone_number'],
                contact_data['company_name'],
                contact_data['industry'],
                contact_data['position'],
                contact_data['identification_card'],
                contact_data['address_line_1'],
                contact_data['address_line_2'],
                contact_data['city'],
                contact_data['state'],
                contact_data['postcode']
            ))
            contact_id = cursor.lastrowid

        logger.info(f"Contact saved with ID: {contact_id}")
        return contact_id


def create_event_booking(booking_id, contact_id, booking_data):
    """
    Create a new event booking

    Args:
        booking_id: Unique booking ID
        contact_id: Contact ID from contacts table
        booking_data: Dictionary containing booking information

    Returns:
        dict: Created booking record
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        logger.info(f"Creating event booking: {booking_id} for contact: {contact_id}")

        # Prepare payment proof URLs as JSON
        payment_proof_urls = json.dumps(booking_data.get('paymentProofUrls', []))

        # Prepare metadata (any additional fields)
        metadata = {
            'nric': booking_data.get('nric', ''),
            'isCompanyEvent': booking_data.get('isCompanyEvent', False),
            'guestCount': booking_data.get('guestCount'),
            'additionalRequests': booking_data.get('additionalRequests'),
        }
        metadata_json = json.dumps(metadata)

        # Insert booking
        insert_query = """
            INSERT INTO event_bookings (
                booking_id, contact_id, event_date, event_time, hall,
                is_company_event, payment_proof_urls, metadata, status,
                created_at, updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending', NOW(), NOW())
        """

        cursor.execute(insert_query, (
            booking_id,
            contact_id,
            booking_data.get('eventDate'),
            booking_data.get('eventTime'),
            booking_data.get('hall'),
            booking_data.get('isCompanyEvent', False),
            payment_proof_urls,
            metadata_json,
        ))

        # Fetch the created booking
        cursor.execute("""
            SELECT
                eb.*,
                c.first_name,
                c.last_name,
                c.email_address,
                c.phone_number,
                c.company_name,
                c.industry,
                c.position,
                c.address_line_1,
                c.address_line_2,
                c.city,
                c.state,
                c.postcode
            FROM event_bookings eb
            JOIN contacts c ON eb.contact_id = c.contact_id
            WHERE eb.booking_id = %s
        """, (booking_id,))

        booking = cursor.fetchone()
        logger.info(f"Event booking created successfully: {booking_id}")

        return booking


def get_booking(booking_id):
    """
    Get a booking by ID

    Args:
        booking_id: Booking ID to fetch

    Returns:
        dict: Booking record with contact information
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                eb.*,
                c.first_name,
                c.last_name,
                c.email_address,
                c.phone_number,
                c.company_name,
                c.industry,
                c.position,
                c.identification_card,
                c.address_line_1,
                c.address_line_2,
                c.city,
                c.state,
                c.postcode
            FROM event_bookings eb
            JOIN contacts c ON eb.contact_id = c.contact_id
            WHERE eb.booking_id = %s AND eb.deleted_at IS NULL
        """, (booking_id,))

        return cursor.fetchone()


def get_all_bookings(limit=100, offset=0):
    """
    Get all bookings with pagination

    Args:
        limit: Maximum number of records to return
        offset: Number of records to skip

    Returns:
        list: List of booking records
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                eb.*,
                c.first_name,
                c.last_name,
                c.email_address,
                c.phone_number,
                c.company_name,
                c.industry,
                c.position,
                c.address_line_1,
                c.address_line_2,
                c.city,
                c.state,
                c.postcode
            FROM event_bookings eb
            JOIN contacts c ON eb.contact_id = c.contact_id
            WHERE eb.deleted_at IS NULL
            ORDER BY eb.created_at DESC
            LIMIT %s OFFSET %s
        """, (limit, offset))

        return cursor.fetchall()


def update_booking_status(booking_id, status):
    """
    Update booking status

    Args:
        booking_id: Booking ID to update
        status: New status (pending, confirmed, cancelled, completed)

    Returns:
        bool: Success status
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE event_bookings
            SET status = %s, updated_at = NOW()
            WHERE booking_id = %s
        """, (status, booking_id))

        return cursor.rowcount > 0


def add_pdf_url_to_booking(booking_id, pdf_url):
    """
    Add PDF URL to booking metadata

    Args:
        booking_id: Booking ID
        pdf_url: S3 URL of generated PDF

    Returns:
        bool: Success status
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Get current metadata
        cursor.execute(
            "SELECT metadata FROM event_bookings WHERE booking_id = %s",
            (booking_id,)
        )
        result = cursor.fetchone()

        if result:
            metadata = json.loads(result['metadata']) if result['metadata'] else {}
            metadata['pdfUrl'] = pdf_url

            cursor.execute("""
                UPDATE event_bookings
                SET metadata = %s, updated_at = NOW()
                WHERE booking_id = %s
            """, (json.dumps(metadata), booking_id))

            return cursor.rowcount > 0

        return False


def update_contact_pxier_ids(contact_id, pxier_customer_id, pxier_contact_id):
    """
    Update contact with Pxier customer and contact IDs

    Args:
        contact_id: Contact ID
        pxier_customer_id: Pxier customer ID
        pxier_contact_id: Pxier contact ID

    Returns:
        bool: Success status
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE contacts
            SET pxier_customer_id = %s,
                pxier_contact_id = %s,
                updated_at = NOW()
            WHERE contact_id = %s
        """, (pxier_customer_id, pxier_contact_id, contact_id))

        return cursor.rowcount > 0


def test_connection():
    """
    Test database connection
    Returns True if successful, raises exception otherwise
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        logger.info("Database connection test successful")
        return True
