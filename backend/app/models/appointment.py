from datetime import datetime
from app.extensions import db
from app.utils.helpers import format_date, format_datetime


class Appointment(db.Model):
    __tablename__ = 'appointments'

    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False, index=True)
    scheduled_date = db.Column(db.Date, nullable=False, index=True)
    scheduled_time = db.Column(db.String(20), nullable=False)
    donation_center = db.Column(db.String(150), nullable=False)
    city = db.Column(db.String(100), nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default='PENDING', index=True)
    # PENDING, APPROVED, REJECTED, COMPLETED, MISSED, CANCELLED, RESCHEDULED
    rejection_reason = db.Column(db.Text, nullable=True)
    reschedule_reason = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    donor = db.relationship('Donor', back_populates='appointments')
    donation = db.relationship('Donation', back_populates='appointment', uselist=False)

    def to_dict(self):
        """Serialize appointment."""
        return {
            'id': self.id,
            'donor_id': self.donor_id,
            'donor_name': self.donor.full_name if self.donor else None,
            'donor_blood_group': self.donor.blood_group if self.donor else None,
            'donor_phone': self.donor.phone if self.donor else None,
            'scheduled_date': format_date(self.scheduled_date),
            'scheduled_time': self.scheduled_time,
            'donation_center': self.donation_center,
            'city': self.city,
            'status': self.status,
            'rejection_reason': self.rejection_reason,
            'reschedule_reason': self.reschedule_reason,
            'notes': self.notes,
            'created_at': format_datetime(self.created_at),
            'updated_at': format_datetime(self.updated_at)
        }

    def __repr__(self):
        return f"<Appointment #{self.id} Donor #{self.donor_id} on {self.scheduled_date} - {self.status}>"
