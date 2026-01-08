import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # MySQL Configuration
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'confetti_db')

    # Application Configuration
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'dev')

    # CORS Configuration
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*').split(',')

    # Pxier API Configuration
    PXIER_ACCESS_TOKEN = os.getenv('PXIER_ACCESS_TOKEN', '')
    PXIER_USERNAME = os.getenv('PXIER_USERNAME', '')
    PXIER_PASSWORD = os.getenv('PXIER_PASSWORD', '')
    PXIER_PLATFORM_ADDRESS = os.getenv('PXIER_PLATFORM_ADDRESS', '')

    # PDF Template Configuration
    TEMPLATE_BUCKET = os.getenv('TEMPLATE_BUCKET', '')
    TEMPLATE_KEY = os.getenv('TEMPLATE_KEY', '')

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

    @staticmethod
    def get_cors_headers(origin=None):
        """Generate CORS headers for API responses"""
        allowed_origin = '*'

        if origin and Config.ALLOWED_ORIGINS[0] != '*':
            if origin in Config.ALLOWED_ORIGINS:
                allowed_origin = origin
        
        return {
            'Access-Control-Allow-Origin': allowed_origin,
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Request-ID',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Max-Age': '3600'
        }

config = Config()