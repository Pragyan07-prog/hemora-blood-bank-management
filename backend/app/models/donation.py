from datetime import date, datetime
from app.extensions import db
from app.utils.helpers import format_date, format_datetime


class Donation(db.Model):
    __tablename__ = 'donations'

    id = db.Column(db.Integer, primary_key=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False, index=True)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id', ondelete='SET NULL'), nullable=True)
    donation_date = db.Column(db.Date, nullable=False, default=date.today, index=True)
    donation_center = db.Column(db.String(150), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False, index=True)
    donation_type = db.Column(db.String(30), nullable=False, default='WHOLE_BLOOD')  # WHOLE_BLOOD, PLASMA, PLATELETS
    units_collected = db.Column(db.Integer, default=1, nullable=False)
    hemoglobin_level = db.Column(db.Float, nullable=True)
    blood_pressure = db.Column(db.String(20), nullable=True)
    weight = db.Column(db.Float, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='COMPLETED')  # SCHEDULED, COMPLETED, REJECTED, CANCELLED
    is_verified = db.Column(db.Boolean, default=False, nullable=False, index=True)
    verified_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    verified_at = db.Column(db.DateTime, nullable=True)
    rejection_reason = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    donor = db.relationship('Donor', back_populates='donations')
    appointment = db.relationship('Appointment', back_populates='donation', uselist=False)
    verifier = db.relationship('User', foreign_keys=[verified_by])
    certificate = db.relationship('Certificate', back_populates='donation', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        """Serialize donation."""
        return {
            'id': self.id,
            'donor_id': self.donor_id,
            'donor_name': self.donor.full_name if self.donor else None,
            'donor_phone': self.donor.phone if self.donor else None,
            'appointment_id': self.appointment_id,
            'donation_date': format_date(self.donation_date),
            'donation_center': self.donation_center,
            'blood_group': self.blood_group,
            'donation_type': self.donation_type,
            'units_collected': self.units_collected,
            'hemoglobin_level': self.hemoglobin_level,
            'blood_pressure': self.blood_pressure,
            'weight': self.weight,
            'status': self.status,
            'is_verified': self.is_verified,
            'verified_by': self.verified_by,
            'verifier_email': self.verifier.email if self.verifier else None,
            'verified_at': format_datetime(self.verified_at),
            'rejection_reason': self.rejection_reason,
            'notes': self.notes,
            'certificate_id': self.certificate.id if self.certificate else None,
            'certificate_number': self.certificate.certificate_number if self.certificate else None,
            'created_at': format_datetime(self.created_at),
            'updated_at': format_datetime(self.updated_at)
        }

    def __repr__(self):
        return f"<Donation #{self.id} Donor #{self.donor_id} ({self.blood_group}) - {self.status}>"
