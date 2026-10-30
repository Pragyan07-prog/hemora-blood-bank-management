from datetime import datetime
from app.extensions import db
from app.utils.helpers import format_datetime


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(30), nullable=False, default='SYSTEM')
    # APPOINTMENT, DONATION, BLOOD_REQUEST, BLOOD_CAMP, CERTIFICATE, SYSTEM, REMINDER
    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    read_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    recipient = db.relationship('User', back_populates='notifications')

    def to_dict(self):
        """Serialize notification."""
        return {
            'id': self.id,
            'recipient_id': self.recipient_id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'is_read': self.is_read,
            'read_at': format_datetime(self.read_at),
            'created_at': format_datetime(self.created_at)
        }

    def __repr__(self):
        return f"<Notification #{self.id} to User #{self.recipient_id}: {self.title}>"
