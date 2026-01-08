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
    'full_name': (164, 599.5),
    'email_address': (164, 574),
    'phone_number': (446, 574),
    'position': (164, 543.8),
    'company_name': (164, 516.7),
    'industry': (164, 489.6),
    'nric': (164, 462.2),
    'address_line_1': (164, 435),
    'address_line_2': (164, 408),
    'city': (164, 381),
    'state': (164, 354),
    'postal_code': (164, 327),
    'partnership_tier': (164, 300),
    'total_payable': (164, 273),
    'submitted_date': (164, 246),
}

# Signature positioning for PDF (if signature field exists)
SIGNATURE_POSITION = (40, 80)
SIGNATURE_SIZE = (180, 90)