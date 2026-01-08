"""
Pxier Service
Handles customer creation via Pxier API for event booking submissions
"""
import os
import json
import requests
from requests.auth import HTTPBasicAuth
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger()


class PxierService:
    """Service for creating customers in Pxier API"""

    @staticmethod
    def create_customer(booking_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Create customer in Pxier API

        Args:
            booking_data: Booking data containing customer information

        Returns:
            Dict containing customerId and contactId from Pxier, or None if creation fails

        Raises:
            Exception: If API call fails
        """
        operation = "create_pxier_customer"
        logger.info(f"=== {operation.upper()} START ===")

        # Get Pxier configuration from environment
        pxier_access_token = os.environ.get('PXIER_ACCESS_TOKEN')
        pxier_username = os.environ.get('PXIER_USERNAME')
        pxier_password = os.environ.get('PXIER_PASSWORD')
        pxier_platform_address = os.environ.get('PXIER_PLATFORM_ADDRESS', 'https://api.pxier.com')

        # Validate Pxier configuration
        if not pxier_access_token or not pxier_username or not pxier_password:
            logger.warning("Pxier API credentials not configured - skipping Pxier customer creation")
            return None

        # Build customer name (MySQL returns first_name/last_name, not firstName/lastName)
        first_name = booking_data.get('first_name') or booking_data.get('firstName') or ''
        last_name = booking_data.get('last_name') or booking_data.get('lastName') or ''
        customer_name = f"{first_name} {last_name}".strip()

        # Build Pxier API URL
        pxier_url = f"{pxier_platform_address}/events/updateCustomer"

        # Prepare phone number (MySQL returns phone_number, not phoneNumber)
        phone = booking_data.get('phone_number') or booking_data.get('phoneNumber') or ''

        # Get email (MySQL returns email_address)
        email = booking_data.get('email_address') or booking_data.get('email') or ''

        # Get address fields (MySQL returns snake_case with underscores)
        address_line1 = booking_data.get('address_line_1') or booking_data.get('addressLine1') or ''
        address_line2 = booking_data.get('address_line_2') or booking_data.get('addressLine2') or ''
        city = booking_data.get('city') or ''
        state = booking_data.get('state') or ''
        postcode = booking_data.get('postcode') or ''

        # Prepare payload for Pxier API
        payload = {
            "accessToken": pxier_access_token,
            "customerId": 0,  # 0 for new customer
            "customerName": customer_name,
            "countryCode": "MY",  # Malaysia
            "stateCode": state,
            "customerTypeCode": 0,
            "langCode": "en",
            "address1": address_line1,
            "address2": address_line2,
            "zipCode": postcode,
            "city": city,
            "contact": [{
                "contactId": 0,  # 0 for new contact
                "firstName": first_name,
                "lastName": last_name,
                "email": email,
                "phone": phone,
                "mobile": phone
            }]
        }

        # Log the payload for debugging
        logger.info(f"Pxier API payload: {json.dumps({**payload, 'accessToken': '***'}, indent=2)}")

        headers = {
            "Content-Type": "application/json"
        }

        try:
            logger.info(f"Sending request to Pxier API")
            logger.debug(f"Pxier API URL: {pxier_url}")

            response = requests.post(
                pxier_url,
                data=json.dumps(payload),
                headers=headers,
                auth=HTTPBasicAuth(pxier_username, pxier_password),
                timeout=30
            )

            response.raise_for_status()
            result = response.json()

            if result.get("error") == False:
                pxier_customer_id = result.get('data', {}).get('customerId')
                pxier_contact_id = result.get('data', {}).get('contactId')

                logger.info(
                    f"✓ Pxier customer created successfully - "
                    f"Customer ID: {pxier_customer_id}, Contact ID: {pxier_contact_id}"
                )

                return {
                    'customerId': pxier_customer_id,
                    'contactId': pxier_contact_id
                }
            else:
                error_msg = result.get('message', 'Unknown error')
                logger.error(f"Pxier API returned error: {result}")
                raise Exception(f"Pxier API error: {error_msg}")

        except requests.exceptions.Timeout:
            logger.error(f"Pxier API request timeout")
            raise Exception("Pxier API request timed out")
        except requests.exceptions.HTTPError as e:
            logger.error(f"Pxier API HTTP error: {str(e)}", exc_info=True)
            raise Exception(f"Pxier API HTTP error: {str(e)}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Pxier API request failed: {str(e)}", exc_info=True)
            raise Exception(f"Failed to communicate with Pxier API: {str(e)}")
        finally:
            logger.info(f"=== {operation.upper()} END ===")


    @staticmethod
    def check_customer_exists(email: str) -> Optional[Dict[str, Any]]:
        """
        Check if customer exists in Pxier by email
        
        Args:
            email: Customer email address
            
        Returns:
            Dict with customer info if found, None otherwise
        """
        logger.info(f"Checking if customer exists in Pxier with email: {email}")
        
        # This would require a search/lookup endpoint in Pxier API
        # For now, we'll return None and always create new customers
        # You can implement this if Pxier provides a search endpoint
        
        return None
