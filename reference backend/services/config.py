"""
Configuration and constants for the event booking form backend.
Adapted from reference backend for event venue bookings.
"""
import os

# Environment variables
TEMPLATE_BUCKET = os.environ.get('TEMPLATE_BUCKET')
TEMPLATE_KEY = os.environ.get('TEMPLATE_KEY')
OUTPUT_BUCKET = os.environ.get('OUTPUT_BUCKET')
SES_SENDER = os.environ.get("SES_SENDER", "noreply@example.com")
SES_SENDER_NAME = os.environ.get("SES_SENDER_NAME", "Confetti KL Events Team")
ALERT_EMAIL = os.environ.get("ALERT_EMAIL", "admin@example.com")
SES_CC_ADDRESSES = os.environ.get("SES_CC_ADDRESSES", "")

# File upload constraints
MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', '10485760'))  # 10MB default
ALLOWED_FILE_TYPES = os.environ.get('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/jpg,application/pdf').split(',')

# Pxier API configuration
PXIER_ACCESS_TOKEN = os.environ.get('PXIER_ACCESS_TOKEN')
PXIER_USERNAME = os.environ.get('PXIER_USERNAME')
PXIER_PASSWORD = os.environ.get('PXIER_PASSWORD')
PXIER_PLATFORM_ADDRESS = os.environ.get('PXIER_PLATFORM_ADDRESS', 'https://api.pxier.com')

# Database environment variables (if needed for future use)
DB_NAME = os.environ.get('DB_NAME')
DB_HOST = os.environ.get('DB_HOST')
DB_USER = os.environ.get('DB_USER')
DB_PASSWORD = os.environ.get('DB_PASSWORD')
DB_PORT = os.environ.get('DB_PORT', '3306')

# Placeholder positions for PDF (coordinates for event booking form)
PLACEHOLDER_POSITIONS = {
    'firstName': (164, 599.5),
    'email': (164, 543.8),
    'phoneNumber': (425, 574),
    'nric': (164, 574),
    'addressLine1': (164, 516.7),
    'addressLine2': (164, 489.5),
    'postcode': (250.56, 462.2),
    'city': (425, 462.2),
    'state': (250.56, 436.2),
    'companyName': (164, 380),
    'guestCount': (164, 350),
    'additionalRequests': (164, 271),
    'eventDate': (164, 325),
    'eventTime': (250.56, 325),
    'hall': (164, 298),
}

# Signature positioning for PDF
SIGNATURE_POSITION = (40, 80)
SIGNATURE_SIZE = (180, 90)
