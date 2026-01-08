"""
Configuration and constants for the wedding form backend.
"""
import os

# Environment variables
TEMPLATE_BUCKET = os.environ.get('TEMPLATE_BUCKET')
TEMPLATE_KEY = os.environ.get('TEMPLATE_KEY')
OUTPUT_BUCKET = os.environ.get('OUTPUT_BUCKET')
OUTPUT_KEY = os.environ.get('OUTPUT_KEY', 'output/filled.pdf')
DEPOSITS_BUCKET = os.environ.get('DEPOSITS_BUCKET', 'payment-system-files')
SES_SENDER = os.environ.get("SES_SENDER", "noreply@example.com")
SES_SENDER_NAME = os.environ.get("SES_SENDER_NAME", "Confetti KL Wedding Team")
ALERT_EMAIL = os.environ.get("ALERT_EMAIL", "admin@example.com")
SES_CC_ADDRESSES = os.environ.get("SES_CC_ADDRESSES", "")  # Comma-separated email addresses

# File upload constraints
MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', '10485760'))  # 10MB default
ALLOWED_FILE_TYPES = os.environ.get('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/jpg,application/pdf').split(',')

# Pxier API configuration
PXIER_ACCESS_TOKEN = os.environ.get('PXIER_ACCESS_TOKEN')
PXIER_USERNAME = os.environ.get('PXIER_USERNAME')
PXIER_PASSWORD = os.environ.get('PXIER_PASSWORD')
PXIER_PLATFORM_ADDRESS = os.environ.get('PXIER_PLATFORM_ADDRESS', 'https://api.pxier.com')

# Database environment variables
DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_PORT = os.environ.get('DB_PORT', '3306')
LEADS_TABLE = os.environ.get('LEADS_TABLE', 'leads')
CONTACTS_TABLE = os.environ.get('CONTACTS_TABLE', 'contacts')
PAYMENTS_TABLE = os.environ.get('PAYMENTS_TABLE', 'payments')
WEDDING_FORMS_TABLE = os.environ.get('WEDDING_FORMS_TABLE', 'wedding_forms')

# Frontend to Backend field mapping
FRONTEND_TO_BACKEND_MAPPING = {
    'fullName': 'full_name',  # Will be split into first_name and last_name
    'email': 'email_address',
    'address1': 'address_line_1',
    'address2': 'address_line_2',
    'postcode': 'postcode',
    'city': 'city',
    'state': 'state',
    'gender': 'gender',
    'telNo': 'phone_number',
    'groomName': 'groom_name',
    'groomNRIC': 'groom_nric',
    'brideName': 'bride_name',
    'brideNRIC': 'bride_nric',
    'guests': 'guest_count',
    'consultantName': 'consultant_name',
    'venueSelection': 'venue_selection',
    'eventDate': 'event_date',
    'requests': 'special_requests',
    'hasBookingDeposit': 'has_booking_deposit',
    'depositReceipt': 'deposit_receipt_url',
    'signatureData': 'signature_data',
    'agreedToTerms': 'agreed_to_terms',
    'eventReference': 'event_reference',
    'utmSource': 'utm_source',
    'utmMedium': 'utm_medium'
}

# Placeholder positions for PDF (full_name position will use first_name + last_name)
PLACEHOLDER_POSITIONS = {
    'full_name': (164, 599.5),  # Will combine first_name and last_name for PDF
    'full_name_2': (144, 60),  # Additional full_name position
    'groom_nric_2': (144, 45),  # Groom NRIC below full_name_2
    'signed_date': (144, 30),  # Signed date below groom_nric_2
    'email_address': (164, 574),
    'gender': (446, 599.5),
    'phone_number': (446, 574),
    'address_line_1': (164, 543.8),
    'address_line_2': (164, 516.7),
    'postcode': (250.56, 489.6),
    'city': (446, 489.6),
    'state': (250.56, 462.2),
    'groom_name': (188, 417),
    'groom_nric': (164, 380),
    'bride_name': (391.65, 417),
    'bride_nric': (446, 380),
    'guest_count': (164, 358),
    'consultant_name': (452, 57),
    'venue_selection': (446, 358),
    'event_date': (164, 333),
    'special_requests': (164, 308),
}

# Database field mapping for contacts table
CONTACTS_FIELD_MAPPING = {
    'first_name': 'first_name',
    'last_name': 'last_name',
    'email_address': 'email_address',
    'gender': 'gender',
    'phone_number': 'phone_number',
    'phone': 'phone',  # Alternative phone field
    'address_line_1': 'address_line_1',
    'address_line_2': 'address_line_2',
    'city': 'city',
    'state': 'state',
    'postcode': 'postcode'
}

# Database field mapping for leads table (kept for backwards compatibility)
LEADS_FIELD_MAPPING = {
    'first_name': 'first_name',
    'last_name': 'last_name',
    'email_address': 'email_address',
    'gender': 'gender',
    'phone_number': 'phone_number',
    'address_line_1': 'address_line_1',
    'address_line_2': 'address_line_2',
    'city': 'city',
    'state': 'state',
    'postcode': 'postcode'
}

# Database field mapping for wedding_forms table
WEDDING_FORMS_FIELD_MAPPING = {
    'groom_name': 'groom_name',
    'groom_nric': 'groom_nric',
    'bride_name': 'bride_name',
    'bride_nric': 'bride_nric',
    'guest_count': 'guest_count',
    'consultant_name': 'consultant_name',
    'venue_selection': 'venue_selection',
    'event_date': 'event_date',
    'special_requests': 'special_requests',
    'has_booking_deposit': 'has_booking_deposit',
    'deposit_receipt_url': 'deposit_receipt_url',
    'signature_data': 'signature_data',
    'event_reference': 'event_reference',
    'pdf_url': 'pdf_url',
    'utm_source': 'utm_source',
    'utm_medium': 'utm_medium'
}

# Signature positioning for PDF
SIGNATURE_POSITION = (40, 80)
SIGNATURE_SIZE = (180, 90)