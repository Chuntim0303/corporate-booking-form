"""
Utility functions for the wedding form backend.
"""
import logging
from datetime import datetime, timedelta

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def get_malaysia_time():
    """Get current time in Malaysia timezone (UTC+8)"""
    utc_time = datetime.utcnow()
    malaysia_time = utc_time + timedelta(hours=8)
    return malaysia_time


def map_frontend_to_backend_fields(frontend_data):
    """
    Convert frontend camelCase field names to backend snake_case field names.
    Also handles splitting fullName into first_name and last_name.
    """
    from config import FRONTEND_TO_BACKEND_MAPPING

    backend_data = {}

    for frontend_key, value in frontend_data.items():
        # Check if we have a mapping for this field
        if frontend_key in FRONTEND_TO_BACKEND_MAPPING:
            backend_key = FRONTEND_TO_BACKEND_MAPPING[frontend_key]

            # Special handling for fullName - split into first_name and last_name
            if frontend_key == 'fullName' and value:
                name_parts = str(value).strip().split(None, 1)  # Split on first whitespace
                backend_data['first_name'] = name_parts[0] if len(name_parts) > 0 else ''
                backend_data['last_name'] = name_parts[1] if len(name_parts) > 1 else ''
                logger.info(f"Split fullName '{value}' into first_name='{backend_data['first_name']}' and last_name='{backend_data['last_name']}'")
            else:
                backend_data[backend_key] = value
        else:
            # If no mapping exists, keep the original key
            backend_data[frontend_key] = value

    return backend_data


def process_phone_number(phone_number):
    """Process phone number to maintain E.164 format (+60122232334)"""
    if not phone_number:
        return phone_number

    phone_str = str(phone_number).strip()

    if phone_str.startswith('+'):
        return phone_str

    return phone_str


def format_proper_case(name):
    """Format name to proper case (Title Case)"""
    if not name:
        return name

    name_str = str(name).strip()
    if not name_str:
        return name_str

    parts = name_str.split()
    formatted_parts = []

    for part in parts:
        if not part:
            continue

        lower_words = ['bin', 'binti', 'al', 'de', 'van', 'von', 'da', 'del', 'della', 'di']
        suffix_words = ['jr', 'sr', 'ii', 'iii', 'iv']

        if len(formatted_parts) > 0 and part.lower() in lower_words:
            formatted_parts.append(part.lower())
        elif part.lower() in suffix_words:
            formatted_parts.append(part.upper())
        elif '-' in part:
            hyphen_parts = part.split('-')
            formatted_hyphen = '-'.join([hp.capitalize() for hp in hyphen_parts if hp])
            formatted_parts.append(formatted_hyphen)
        elif "'" in part:
            apostrophe_parts = part.split("'")
            if len(apostrophe_parts) == 2:
                first_part, second_part = apostrophe_parts
                if len(first_part) <= 2:
                    formatted_apostrophe = first_part.capitalize() + "'" + second_part.capitalize()
                else:
                    formatted_apostrophe = first_part.capitalize() + "'" + second_part.lower()
                formatted_parts.append(formatted_apostrophe)
            else:
                formatted_parts.append(part.capitalize())
        else:
            formatted_parts.append(part.capitalize())

    return ' '.join(formatted_parts)
