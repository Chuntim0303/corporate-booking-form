"""
Database operations for the wedding form backend.
"""
import logging
import pymysql
from datetime import timedelta

from config import (
    DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT,
    LEADS_TABLE, WEDDING_FORMS_TABLE, CONTACTS_TABLE, PAYMENTS_TABLE,
    LEADS_FIELD_MAPPING, WEDDING_FORMS_FIELD_MAPPING, CONTACTS_FIELD_MAPPING
)
from utils import get_malaysia_time, process_phone_number, format_proper_case

logger = logging.getLogger()


def get_existing_contact_by_email(email_address):
    """
    Check if a contact with the given email already exists.
    Returns contact data with Pxier IDs if found, None otherwise.
    """
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        query = f"""
        SELECT contact_id, pxier_customer_id, pxier_contact_id, status
        FROM {CONTACTS_TABLE}
        WHERE email_address = %s AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
        """

        cursor.execute(query, (email_address,))
        result = cursor.fetchone()

        cursor.close()
        connection.close()

        if result:
            contact_id, pxier_customer_id, pxier_contact_id, status = result
            return {
                'contact_id': contact_id,
                'pxier_customer_id': pxier_customer_id,
                'pxier_contact_id': pxier_contact_id,
                'status': status
            }

        return None

    except Exception as e:
        logger.error(f"Error checking for existing contact: {str(e)}")
        if connection:
            connection.close()
        return None


def get_db_connection():
    """Establish database connection"""
    try:
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=int(DB_PORT),
            charset='utf8mb4',
            autocommit=False
        )
        logger.info("Database connection established successfully")
        return connection
    except Exception as e:
        logger.error(f"Error connecting to database: {str(e)}")
        raise


def check_duplicate_submission(form_data, time_window_minutes=5):
    """
    Check if a similar submission exists within the time window.
    Returns (is_duplicate, duplicate_info) tuple.
    """
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        malaysia_now = get_malaysia_time()
        time_threshold = malaysia_now - timedelta(minutes=time_window_minutes)

        # Check for duplicates based on email, NRIC, or phone number
        email = form_data.get('email_address')
        phone = form_data.get('phone_number')
        groom_nric = form_data.get('groom_nric')
        bride_nric = form_data.get('bride_nric')

        # Build query to check for recent submissions with same identifiers (using contacts table)
        check_query = f"""
        SELECT w.id, w.created_at, c.email_address, c.phone_number, w.groom_nric, w.bride_nric
        FROM {WEDDING_FORMS_TABLE} w
        JOIN {CONTACTS_TABLE} c ON w.contact_id = c.contact_id
        WHERE w.created_at >= %s
        AND (
            c.email_address = %s
            OR c.phone_number = %s
            OR w.groom_nric = %s
            OR w.bride_nric = %s
        )
        ORDER BY w.created_at DESC
        LIMIT 1
        """

        cursor.execute(check_query, (time_threshold, email, phone, groom_nric, bride_nric))
        result = cursor.fetchone()

        cursor.close()
        connection.close()

        if result:
            wedding_id, created_at, dup_email, dup_phone, dup_groom_nric, dup_bride_nric = result
            duplicate_info = {
                'wedding_id': wedding_id,
                'created_at': created_at,
                'email': dup_email,
                'phone': dup_phone,
                'groom_nric': dup_groom_nric,
                'bride_nric': dup_bride_nric
            }
            return True, duplicate_info

        return False, None

    except Exception as e:
        logger.error(f"Error checking for duplicate submission: {str(e)}")
        if connection:
            connection.close()
        # Don't block submission if duplicate check fails
        return False, None


def insert_contact_and_wedding_data(form_data, deposit_receipt_url=None, pdf_url=None, pxier_data=None):
    """Insert data into contacts and wedding_forms tables"""
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        malaysia_now = get_malaysia_time()

        # Step 1: Check if contact with this email already exists
        email_address = form_data.get('email_address')
        existing_contact = get_existing_contact_by_email(email_address)

        if existing_contact:
            # Use existing contact_id
            contact_id = existing_contact['contact_id']
            logger.info(f"Using existing contact ID {contact_id} for email: {email_address}")

            # Update existing contact with latest info and Pxier IDs if needed
            update_data = []
            update_values = []

            # Update status if deposit receipt is attached and current status is 'new'
            if form_data.get('has_booking_deposit') and deposit_receipt_url:
                if existing_contact['status'] == 'new':
                    update_data.append('status = %s')
                    update_values.append('converted')
                    update_data.append('became_customer_at = %s')
                    update_values.append(malaysia_now)

            # Update Pxier IDs if provided and not already set
            if pxier_data:
                if not existing_contact.get('pxier_customer_id'):
                    update_data.append('pxier_customer_id = %s')
                    update_values.append(pxier_data.get('customerId'))
                if not existing_contact.get('pxier_contact_id'):
                    update_data.append('pxier_contact_id = %s')
                    update_values.append(pxier_data.get('contactId'))

            # Always update last_activity_date and updated_at
            update_data.append('last_activity_date = %s')
            update_values.append(malaysia_now.date())
            update_data.append('updated_at = %s')
            update_values.append(malaysia_now)

            if update_data:
                update_values.append(contact_id)
                update_query = f"""
                UPDATE {CONTACTS_TABLE}
                SET {', '.join(update_data)}
                WHERE contact_id = %s
                """
                cursor.execute(update_query, update_values)
                logger.info(f"Updated existing contact {contact_id} with latest information")

        else:
            # Create new contact
            contacts_data = {}
            for form_field, db_column in CONTACTS_FIELD_MAPPING.items():
                if form_field in form_data:
                    value = form_data[form_field]
                    if form_field == 'phone_number':
                        value = process_phone_number(value)
                        contacts_data[db_column] = str(value) if value is not None else None
                        contacts_data['phone'] = str(value) if value is not None else None  # Also set phone field
                    else:
                        contacts_data[db_column] = str(value) if value is not None else None

            contacts_data['lead_source'] = 'wedding form'
            contacts_data['became_lead_at'] = malaysia_now
            contacts_data['last_activity_date'] = malaysia_now.date()

            # Set status based on whether deposit receipt is attached
            if form_data.get('has_booking_deposit') and deposit_receipt_url:
                contacts_data['status'] = 'converted'
                contacts_data['became_customer_at'] = malaysia_now
            else:
                contacts_data['status'] = 'new'

            # Add Pxier IDs if available
            if pxier_data:
                contacts_data['pxier_customer_id'] = pxier_data.get('customerId')
                contacts_data['pxier_contact_id'] = pxier_data.get('contactId')

            contacts_data['created_at'] = malaysia_now
            contacts_data['updated_at'] = malaysia_now

            contacts_columns = list(contacts_data.keys())
            contacts_placeholders = ['%s'] * len(contacts_columns)
            contacts_values = list(contacts_data.values())

            insert_contacts_query = f"""
            INSERT INTO {CONTACTS_TABLE} ({', '.join(contacts_columns)})
            VALUES ({', '.join(contacts_placeholders)})
            """

            cursor.execute(insert_contacts_query, contacts_values)
            contact_id = cursor.lastrowid
            logger.info(f"New contact created successfully with ID: {contact_id}")

        # Step 2: Insert into wedding_forms table
        wedding_forms_data = {'contact_id': contact_id}

        for form_field, db_column in WEDDING_FORMS_FIELD_MAPPING.items():
            if form_field in form_data:
                value = form_data[form_field]
                if form_field == 'event_date' and value:
                    wedding_forms_data[db_column] = value
                elif form_field == 'guest_count' and value:
                    try:
                        wedding_forms_data[db_column] = int(str(value))
                    except ValueError:
                        wedding_forms_data[db_column] = str(value)
                elif form_field == 'has_booking_deposit':
                    wedding_forms_data[db_column] = bool(value)
                elif form_field == 'signature_data' and value:
                    wedding_forms_data[db_column] = value
                elif form_field in ['groom_name', 'bride_name'] and value:
                    wedding_forms_data[db_column] = format_proper_case(value)
                    logger.info(f"Formatted {form_field} from '{value}' to '{wedding_forms_data[db_column]}'")
                elif form_field in ['utm_source', 'utm_medium'] and value:
                    wedding_forms_data[db_column] = str(value)
                else:
                    wedding_forms_data[db_column] = str(value) if value is not None else None

        if deposit_receipt_url:
            wedding_forms_data['deposit_receipt_url'] = deposit_receipt_url

        if pdf_url:
            wedding_forms_data['pdf_url'] = pdf_url

        wedding_forms_data['created_at'] = malaysia_now
        wedding_forms_data['updated_at'] = malaysia_now

        wedding_columns = list(wedding_forms_data.keys())
        wedding_placeholders = ['%s'] * len(wedding_columns)
        wedding_values = list(wedding_forms_data.values())

        insert_wedding_query = f"""
        INSERT INTO {WEDDING_FORMS_TABLE} ({', '.join(wedding_columns)})
        VALUES ({', '.join(wedding_placeholders)})
        """

        cursor.execute(insert_wedding_query, wedding_values)
        wedding_form_id = cursor.lastrowid

        connection.commit()
        cursor.close()
        connection.close()

        logger.info(f"Wedding form data inserted successfully with ID: {wedding_form_id}")
        return wedding_form_id, contact_id

    except Exception as e:
        logger.error(f"Error inserting data into database: {str(e)}", exc_info=True)
        if connection:
            connection.rollback()
            connection.close()
        raise


def insert_lead_and_wedding_data(form_data, deposit_receipt_url=None, pdf_url=None):
    """
    Deprecated: Use insert_contact_and_wedding_data instead.
    This function is kept for backwards compatibility.
    """
    logger.warning("insert_lead_and_wedding_data is deprecated, use insert_contact_and_wedding_data instead")
    return insert_contact_and_wedding_data(form_data, deposit_receipt_url, pdf_url)


def insert_payment_record(form_data, contact_id, wedding_form_id, deposit_receipt_url=None):
    """Insert payment record into payments table"""
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        malaysia_now = get_malaysia_time()

        # Build customer name for description
        first_name = form_data.get('first_name', '')
        last_name = form_data.get('last_name', '')
        customer_name = f"{last_name} {first_name}".strip()

        # Prepare payment data
        payment_data = {
            'contact_id': contact_id,
            'wedding_form_id': wedding_form_id,
            'payment_type': 'event_wedding',
            'description': f"event_wedding - {customer_name}",
            'status': 'pending',  # Default status
            'attachment': deposit_receipt_url,  # S3 path
            'transaction_datetime': malaysia_now,
            'created_at': malaysia_now,
            'updated_at': malaysia_now
        }

        # Remove None values
        payment_data = {k: v for k, v in payment_data.items() if v is not None}

        payment_columns = list(payment_data.keys())
        payment_placeholders = ['%s'] * len(payment_columns)
        payment_values = list(payment_data.values())

        insert_payment_query = f"""
        INSERT INTO {PAYMENTS_TABLE} ({', '.join(payment_columns)})
        VALUES ({', '.join(payment_placeholders)})
        """

        cursor.execute(insert_payment_query, payment_values)
        payment_id = cursor.lastrowid

        connection.commit()
        cursor.close()
        connection.close()

        logger.info(f"Payment record inserted successfully with ID: {payment_id}")
        return payment_id

    except Exception as e:
        logger.error(f"Error inserting payment record: {str(e)}", exc_info=True)
        if connection:
            connection.rollback()
            connection.close()
        # Don't fail the entire submission if payment insert fails
        logger.warning(f"Payment record insertion failed but continuing with submission")
        return None


def update_pdf_url(wedding_form_id, pdf_url):
    """Update the pdf_url for a wedding form record"""
    connection = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        malaysia_now = get_malaysia_time()

        update_query = f"""
        UPDATE {WEDDING_FORMS_TABLE}
        SET pdf_url = %s, updated_at = %s
        WHERE id = %s
        """

        cursor.execute(update_query, (pdf_url, malaysia_now, wedding_form_id))
        connection.commit()
        cursor.close()
        connection.close()

        logger.info(f"PDF URL updated successfully for wedding form ID: {wedding_form_id}")
        return True

    except Exception as e:
        logger.error(f"Error updating PDF URL in database: {str(e)}", exc_info=True)
        if connection:
            connection.rollback()
            connection.close()
        raise