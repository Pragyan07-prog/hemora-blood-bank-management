from datetime import datetime
from app.extensions import db
from app.utils.helpers import format_date, format_datetime


class BloodRequest(db.Model):
    __tablename__ = 'blood_requests'

    id = db.Column(db.Integer, primary_key=True)
    requester_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    patient_name = db.Column(db.String(120), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False, index=True)
    component = db.Column(db.String(30), nullable=False, default='WHOLE_BLOOD')
    units_required = db.Column(db.Integer, nullable=False, default=1)
    units_fulfilled = db.Column(db.Integer, default=0, nullable=False)
    hospital_name = db.Column(db.String(200), nullable=False)
    hospital_city = db.Column(db.String(100), nullable=False, index=True)
    hospital_address = db.Column(db.Text, nullable=True)
    required_date = db.Column(db.Date, nullable=False)
    urgency = db.Column(db.String(20), nullable=False, default='NORMAL')  # NORMAL, URGENT, CRITICAL
    contact_number = db.Column(db.String(20), nullable=False)
    additional_info = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), nullable=False, default='PENDING', index=True)  # PENDING, APPROVED, REJECTED, PARTIALLY_FULFILLED, FULFILLED, CANCELLED
    rejection_reason = db.Column(db.Text, nullable=True)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    approved_at = db.Column(db.DateTime, nullable=True)
    fulfilled_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    requester = db.relationship('User', foreign_keys=[requester_id], back_populates='blood_requests')
    approver = db.relationship('User', foreign_keys=[approved_by])

    def to_dict(self):
        """Serialize blood request."""
        return {
            'id': self.id,
            'requester_id': self.requester_id,
            'requester_email': self.requester.email if self.requester else None,
            'patient_name': self.patient_name,
            'blood_group': self.blood_group,
            'component': self.component,
            'units_required': self.units_required,
            'units_fulfilled': self.units_fulfilled,
            'hospital_name': self.hospital_name,
            'hospital_city': self.hospital_city,
            'hospital_address': self.hospital_address,
            'required_date': format_date(self.required_date),
            'urgency': self.urgency,
            'contact_number': self.contact_number,
            'additional_info': self.additional_info,
            'status': self.status,
            'rejection_reason': self.rejection_reason,
            'approved_by': self.approved_by,
            'approver_email': self.approver.email if self.approver else None,
            'approved_at': format_datetime(self.approved_at),
            'fulfilled_at': format_datetime(self.fulfilled_at),
            'created_at': format_datetime(self.created_at),
            'updated_at': format_datetime(self.updated_at)
        }

    def __repr__(self):
        return f"<BloodRequest #{self.id} for {self.patient_name} ({self.blood_group}) - {self.status}>"
