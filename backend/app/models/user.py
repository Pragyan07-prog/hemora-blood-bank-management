from datetime import datetime
from app.extensions import db, bcrypt
from app.utils.helpers import format_datetime


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='DONOR')  # 'ADMIN' or 'DONOR'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)

    # Relationships
    donor = db.relationship('Donor', back_populates='user', uselist=False, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', back_populates='recipient', cascade='all, delete-orphan')
    audit_logs = db.relationship('AuditLog', back_populates='user')
    blood_requests = db.relationship('BloodRequest', back_populates='requester', foreign_keys='BloodRequest.requester_id')

    def set_password(self, password: str):
        """Hash and set user password using bcrypt."""
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password: str) -> bool:
        """Verify password against stored bcrypt hash."""
        if not self.password_hash:
            return False
        return bcrypt.check_password_hash(self.password_hash, password)

    def to_dict(self, include_donor=False):
        """Serialize user to dictionary."""
        data = {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': format_datetime(self.created_at),
            'updated_at': format_datetime(self.updated_at),
            'last_login': format_datetime(self.last_login)
        }
        if include_donor and self.donor:
            data['donor'] = self.donor.to_dict(include_user=False)
        return data

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"
