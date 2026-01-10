"""
Configuration and constants for the corporate partnership backend.
Simple module-based config (no classes) for better Lambda compatibility.
"""
import os

# MySQL Configuration
DB_HOST = os.environ.get('DB_HOST', 'localhost')
DB_PORT = int(os.environ.get('DB_PORT', '3306'))
DB_USER = os.environ.get('DB_USER', 'root')
DB_PASSWORD = os.environ.get('DB_PASSWORD', '')
DB_NAME = os.environ.get('DB_NAME', 'confetti_db')

# Application Configuration
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'dev')

# SES Email Configuration
SES_SENDER = os.environ.get("SES_SENDER", "noreply@example.com")
SES_SENDER_NAME = os.environ.get("SES_SENDER_NAME", "Confetti Partnership Team")
ALERT_EMAIL = os.environ.get("ALERT_EMAIL", "admin@example.com")
SES_CC_ADDRESSES = os.environ.get("SES_CC_ADDRESSES", "")

# CORS Configuration
ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '*').split(',')

# Pxier API Configuration
PXIER_ACCESS_TOKEN = os.environ.get('PXIER_ACCESS_TOKEN', '')
PXIER_USERNAME = os.environ.get('PXIER_USERNAME', '')
PXIER_PASSWORD = os.environ.get('PXIER_PASSWORD', '')
PXIER_PLATFORM_ADDRESS = os.environ.get('PXIER_PLATFORM_ADDRESS', '')

# PDF Template Configuration
TEMPLATE_BUCKET = os.environ.get('TEMPLATE_BUCKET', '')
TEMPLATE_KEY = os.environ.get('TEMPLATE_KEY', '')
OUTPUT_BUCKET = os.environ.get('OUTPUT_BUCKET', '')

# File upload constraints
MAX_FILE_SIZE = int(os.environ.get('MAX_FILE_SIZE', '10485760'))  # 10MB default
ALLOWED_FILE_TYPES = os.environ.get('ALLOWED_FILE_TYPES', 'image/jpeg,image/png,image/jpg,application/pdf').split(',')

# Placeholder positions for PDF template overlay (x, y coordinates)
# Adjust these positions to match your PDF template layout
PLACEHOLDER_POSITIONS = {
    'full_name': (138, 562),
    'full_name_2': (138, 300),  # Second full_name position - adjust coordinates as needed
    'email_address': (416, 543.8),
    'phone_number': (280, 543.8),
    'position': (416, 523.5),
    'company_name': (138, 523.5),
    'nric': (138, 543),
    'nric_2': (138, 280),  # Second NRIC position - adjust coordinates as needed
    'address': (138, 513.5),
    'partnership_tier': (138, 400),
    'total_payable': (138, 410),
    'submitted_date': (124, 145),
}

# Signature positioning for PDF (if signature field exists)
SIGNATURE_POSITION = (45, 210)
SIGNATURE_SIZE = (120, 60)

# Field width limits for PDF text (in characters)
# Adjust these to control how much text fits in each field
ADDRESS_MAX_WIDTH = 80  # Maximum characters for address field per line

# Second row position for long addresses (x, y coordinates)
# If address exceeds ADDRESS_MAX_WIDTH, remainder continues on this position
ADDRESS_ROW2_POSITION = (138, 490.5)  # 12 points below the first row (503.5 - 12)


