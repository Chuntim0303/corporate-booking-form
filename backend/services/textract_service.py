import boto3
import logging
import re
from typing import Optional

# Configure logging
logger = logging.getLogger()

# Initialize Textract client
textract_client = boto3.client('textract')


def extract_amount_from_receipt(bucket: str, key: str) -> float:
    """
    Extract the payment amount from a receipt image using AWS Textract.

    Args:
        bucket: S3 bucket name where the receipt is stored
        key: S3 object key of the receipt

    Returns:
        float: Extracted amount, or 0.0 if unable to extract
    """
    logger.info("=== TEXTRACT SERVICE START ===", extra={
        'bucket': bucket,
        'key': key
    })

    try:
        # Call Textract to detect text in the document
        logger.info("Calling Textract to analyze document", extra={
            'bucket': bucket,
            'key': key
        })

        response = textract_client.detect_document_text(
            Document={
                'S3Object': {
                    'Bucket': bucket,
                    'Name': key
                }
            }
        )

        logger.info("Textract response received", extra={
            'blocks_count': len(response.get('Blocks', [])),
            'document_metadata': response.get('DocumentMetadata', {})
        })

        # Extract all text from the document
        text_lines = []
        for block in response.get('Blocks', []):
            if block['BlockType'] == 'LINE':
                text_lines.append(block['Text'])

        logger.info("Text extracted from receipt", extra={
            'line_count': len(text_lines),
            'text_preview': text_lines[:5] if text_lines else []
        })

        # Try to find amounts in the text
        amounts = []
        for line in text_lines:
            # Look for patterns like:
            # RM 100.00, RM100.00, RM 100, 100.00, $100.00, etc.
            # Common keywords: Total, Amount, Grand Total, Payment, etc.

            # Pattern for monetary amounts
            amount_patterns = [
                r'(?:RM|rm|Rs|rs|\$|USD|MYR)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # RM 1,000.00 or $100.00
                r'(\d+(?:,\d{3})*(?:\.\d{2}))\s*(?:RM|rm|Rs|rs|\$|USD|MYR)',   # 1,000.00 RM
                r'(?:total|amount|grand\s*total|payment|paid|subtotal)[:\s]+(?:RM|rm|Rs|rs|\$)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',  # Total: RM 100.00
            ]

            for pattern in amount_patterns:
                matches = re.findall(pattern, line, re.IGNORECASE)
                for match in matches:
                    try:
                        # Remove commas and convert to float
                        amount_str = match.replace(',', '')
                        amount = float(amount_str)
                        amounts.append({
                            'amount': amount,
                            'line': line,
                            'confidence': 'high' if any(keyword in line.lower() for keyword in ['total', 'amount', 'payment', 'paid']) else 'medium'
                        })
                    except ValueError:
                        continue

        logger.info("Amounts found in receipt", extra={
            'amounts_count': len(amounts),
            'amounts': amounts
        })

        if amounts:
            # Prioritize amounts from lines with keywords like "total", "amount", etc.
            high_confidence_amounts = [a for a in amounts if a['confidence'] == 'high']

            if high_confidence_amounts:
                # Return the largest amount from high confidence matches
                final_amount = max(high_confidence_amounts, key=lambda x: x['amount'])['amount']
                logger.info("✓ Amount extracted with high confidence", extra={
                    'amount': final_amount,
                    'line': next(a['line'] for a in amounts if a['amount'] == final_amount)
                })
                return final_amount
            else:
                # Return the largest amount from all matches
                final_amount = max(amounts, key=lambda x: x['amount'])['amount']
                logger.info("✓ Amount extracted with medium confidence", extra={
                    'amount': final_amount,
                    'line': next(a['line'] for a in amounts if a['amount'] == final_amount)
                })
                return final_amount
        else:
            logger.warning("⚠ No amounts found in receipt text")
            return 0.0

    except textract_client.exceptions.InvalidS3ObjectException as e:
        logger.error("Invalid S3 object for Textract", extra={
            'error': str(e),
            'bucket': bucket,
            'key': key
        })
        return 0.0

    except textract_client.exceptions.UnsupportedDocumentException as e:
        logger.error("Unsupported document format for Textract", extra={
            'error': str(e),
            'bucket': bucket,
            'key': key
        })
        return 0.0

    except Exception as e:
        logger.error("Unexpected error in Textract service", extra={
            'error_type': type(e).__name__,
            'error_message': str(e),
            'bucket': bucket,
            'key': key
        }, exc_info=True)
        return 0.0

    finally:
        logger.info("=== TEXTRACT SERVICE END ===")
