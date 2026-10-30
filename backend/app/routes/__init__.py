# Routes package
from .auth import auth_bp
from .donors import donors_bp
from .inventory import inventory_bp
from .blood_requests import blood_requests_bp
from .donations import donations_bp
from .appointments import appointments_bp
from .camps import camps_bp
from .notifications import notifications_bp
from .certificates import certificates_bp
from .analytics import analytics_bp
from .reports import reports_bp
from .admin import admin_bp

__all__ = [
    'auth_bp', 'donors_bp', 'inventory_bp', 'blood_requests_bp',
    'donations_bp', 'appointments_bp', 'camps_bp', 'notifications_bp',
    'certificates_bp', 'analytics_bp', 'reports_bp', 'admin_bp'
]
