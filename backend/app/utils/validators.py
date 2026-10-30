import re
from datetime import datetime, date

VALID_BLOOD_GROUPS = ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
VALID_COMPONENTS = ('WHOLE_BLOOD', 'PACKED_RBC', 'PLASMA', 'PLATELETS')
VALID_ROLES = ('ADMIN', 'DONOR')
VALID_DONATION_TYPES = ('WHOLE_BLOOD', 'PLASMA', 'PLATELETS')
VALID_URGENCIES = ('NORMAL', 'URGENT', 'CRITICAL')
VALID_REQUEST_STATUSES = ('PENDING', 'APPROVED', 'REJECTED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED')
VALID_APPOINTMENT_STATUSES = ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'MISSED', 'CANCELLED', 'RESCHEDULED')
VALID_CAMP_STATUSES = ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')
VALID_NOTIFICATION_TYPES = ('APPOINTMENT', 'DONATION', 'BLOOD_REQUEST', 'BLOOD_CAMP', 'CERTIFICATE', 'SYSTEM', 'REMINDER')


def validate_email(email):
    """Validate email format."""
    if not email or not isinstance(email, str):
        return False
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(email_regex, email.strip()))


def validate_password(password):
    """Validate password strength (minimum 8 characters)."""
    if not password or not isinstance(password, str):
        return False
    return len(password) >= 8


def validate_blood_group(blood_group):
    """Validate blood group against accepted values."""
    if not blood_group:
        return False
    return blood_group.strip().upper() in VALID_BLOOD_GROUPS


def validate_phone(phone):
    """Validate phone number format."""
    if not phone or not isinstance(phone, str):
        return False
    # Accepts 7-15 digits, optional leading '+'
    phone_regex = r'^\+?[0-9]{7,15}$'
    cleaned = phone.strip().replace(" ", "").replace("-", "")
    return bool(re.match(phone_regex, cleaned))


def parse_date(date_str):
    """Parse string to date object. Supports YYYY-MM-DD format."""
    if not date_str:
        return None
    if isinstance(date_str, date):
        return date_str
    if isinstance(date_str, datetime):
        return date_str.date()
    try:
        return datetime.strptime(str(date_str).strip(), "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def parse_datetime(dt_str):
    """Parse string to datetime object."""
    if not dt_str:
        return None
    if isinstance(dt_str, datetime):
        return dt_str
    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(str(dt_str).strip(), fmt)
        except (ValueError, TypeError):
            continue
    return None
