"""
Pxier Service
Handles customer creation via Pxier API for wedding form submissions
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
    def create_customer(contact_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Create customer in Pxier API

        Args:
            contact_data: Contact data containing customer information

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

        # Build customer name
        customer_name = f"{contact_data.get('first_name', '')} {contact_data.get('last_name', '')}".strip()

        # Build Pxier API URL
        pxier_url = f"{pxier_platform_address}/events/updateCustomer"

        # Prepare phone number
        phone = contact_data.get('phone_number') or ''

        # Prepare payload for Pxier API
        payload = {
            "accessToken": pxier_access_token,
            "customerId": 0,  # 0 for new customer
            "customerName": customer_name,
            "countryCode": "US",
            "stateCode": contact_data.get('state') or "",
            "customerTypeCode": 0,
            "langCode": "en",
            "address1": contact_data.get('address_line_1') or "",
            "address2": contact_data.get('address_line_2') or "",
            "zipCode": contact_data.get('postcode') or "",
            "city": contact_data.get('city') or "",
            "contact": [{
                "contactId": 0,  # 0 for new contact
                "firstName": contact_data.get('first_name') or "",
                "lastName": contact_data.get('last_name') or "",
                "email": contact_data.get('email_address') or "",
                "phone": phone,
                "mobile": phone
            }]
        }

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