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