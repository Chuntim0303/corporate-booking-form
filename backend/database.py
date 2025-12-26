import pymysql
from pymysql.cursors import DictCursor
from datetime import datetime
from typing import Dict, List, Optional, Any
from contextlib import contextmanager
from config import config
import logging

logger = logging.getLogger()

class DatabaseError(Exception):
    """Custom database error"""
    pass

class Database:
    def __init__(self):
        self.connection_params = {
            'host': config.DB_HOST,
            'port': config.DB_PORT,
            'user': config.DB_USER,
            'password': config.DB_PASSWORD,
            'database': config.DB_NAME,
            'cursorclass': DictCursor,
            'charset': 'utf8mb4',
            'connect_timeout': 5
        }
    
    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        connection = None
        try:
            connection = pymysql.connect(**self.connection_params)
            yield connection
        except pymysql.Error as e:
            logger.error(f"Database connection error: {str(e)}")
            raise DatabaseError(f"Database connection failed: {str(e)}")
        finally:
            if connection:
                connection.close()
    
    def create_lead(self, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new lead in the database"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    # Check if email already exists
                    cursor.execute(
                        "SELECT lead_id FROM leads WHERE email_address = %s",
                        (application_data['email'],)
                    )
                    
                    if cursor.fetchone():
                        raise DatabaseError('A lead with this email already exists')
                    
                    # Split name into first and last name
                    name_parts = application_data['contactName'].strip().split(' ', 1)
                    first_name = name_parts[0]
                    last_name = name_parts[1] if len(name_parts) > 1 else ''
                    
                    # Prepare phone number (combine country code and phone)
                    full_phone = f"{application_data['countryCode']}{application_data['phone']}"
                    
                    # Prepare notes with additional application details
                    notes = self._build_notes(application_data)
                    
                    # Insert lead
                    insert_query = """
                        INSERT INTO leads (
                            full_name, first_name, last_name, email_address,
                            phone_number, lead_source, lead_source_id, status, 
                            notes, created_at, updated_at
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                        )
                    """
                    
                    current_time = datetime.utcnow()
                    
                    cursor.execute(insert_query, (
                        application_data['contactName'],
                        first_name,
                        last_name,
                        application_data['email'],
                        full_phone,
                        'partnership_application',  # lead_source
                        application_data.get('partnershipTier', 'unknown'),  # lead_source_id
                        'new',  # status
                        notes,
                        current_time,
                        current_time
                    ))
                    
                    conn.commit()
                    lead_id = cursor.lastrowid
                    
                    # Return created lead
                    cursor.execute(
                        "SELECT * FROM leads WHERE lead_id = %s",
                        (lead_id,)
                    )
                    
                    return cursor.fetchone()
        
        except pymysql.IntegrityError as e:
            if 'Duplicate entry' in str(e):
                raise DatabaseError('A lead with this email already exists')
            raise DatabaseError(f"Database integrity error: {str(e)}")
        except pymysql.Error as e:
            logger.error(f"Database error: {str(e)}")
            raise DatabaseError(f"Database operation failed: {str(e)}")
    
    def _build_notes(self, data: Dict[str, Any]) -> str:
        """Build notes field from application data"""
        notes_parts = [
            f"Partnership Application - {data.get('partnershipTier', 'Unknown').title()} Tier",
            f"\nCompany: {data.get('companyName', 'N/A')}",
            f"Position: {data.get('position', 'N/A')}",
            f"Industry: {data.get('industry', 'N/A')}",
            f"NRIC: {data.get('nric', 'N/A')}",
            f"Expected Events: {data.get('expectedEvents', 'N/A')} per year"
        ]
        
        if data.get('eventTypes'):
            notes_parts.append(f"Event Types: {', '.join(data['eventTypes'])}")
        
        notes_parts.append(f"\nSubmitted: {data.get('submittedAt', datetime.utcnow().isoformat())}")
        
        return '\n'.join(notes_parts)
    
    def get_lead(self, lead_id: int) -> Optional[Dict[str, Any]]:
        """Get a lead by ID"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "SELECT * FROM leads WHERE lead_id = %s",
                        (lead_id,)
                    )
                    return cursor.fetchone()
        except pymysql.Error as e:
            logger.error(f"Database error: {str(e)}")
            raise DatabaseError(f"Failed to retrieve lead: {str(e)}")
    
    def get_lead_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get a lead by email"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "SELECT * FROM leads WHERE email_address = %s",
                        (email,)
                    )
                    return cursor.fetchone()
        except pymysql.Error as e:
            logger.error(f"Database error: {str(e)}")
            raise DatabaseError(f"Failed to retrieve lead: {str(e)}")
    
    def update_lead_status(
        self, 
        lead_id: int, 
        status: str,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update lead status"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    update_parts = ["status = %s", "updated_at = %s"]
                    params = [status, datetime.utcnow()]
                    
                    if notes:
                        update_parts.append("notes = CONCAT(COALESCE(notes, ''), %s)")
                        params.append(f"\n---\n{notes}")
                    
                    params.append(lead_id)
                    
                    update_query = f"""
                        UPDATE leads 
                        SET {', '.join(update_parts)}
                        WHERE lead_id = %s
                    """
                    
                    cursor.execute(update_query, params)
                    conn.commit()
                    
                    if cursor.rowcount == 0:
                        return None
                    
                    # Return updated lead
                    cursor.execute(
                        "SELECT * FROM leads WHERE lead_id = %s",
                        (lead_id,)
                    )
                    return cursor.fetchone()
        except pymysql.Error as e:
            logger.error(f"Database error: {str(e)}")
            raise DatabaseError(f"Failed to update lead: {str(e)}")
    
    def list_leads(
        self, 
        status: Optional[str] = None,
        lead_source: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List leads with optional filters"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    query = "SELECT * FROM leads WHERE 1=1"
                    params = []
                    
                    if status:
                        query += " AND status = %s"
                        params.append(status)
                    
                    if lead_source:
                        query += " AND lead_source = %s"
                        params.append(lead_source)
                    
                    query += " ORDER BY created_at DESC LIMIT %s OFFSET %s"
                    params.extend([limit, offset])
                    
                    cursor.execute(query, params)
                    return cursor.fetchall()
        except pymysql.Error as e:
            logger.error(f"Database error: {str(e)}")
            raise DatabaseError(f"Failed to list leads: {str(e)}")
    
    def delete_lead(self, lead_id: int) -> bool:
        """Delete a lead"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute(
                        "DELETE FROM leads WHERE lead_id = %s",
                        (lead_id,)
                    )
                    conn.commit()
                    return cursor.rowcount > 0
        except pymysql.Error as e:
            logger.error(f"Database error: {str(e)}")
            raise DatabaseError(f"Failed to delete lead: {str(e)}")

# Singleton instance
db = Database()