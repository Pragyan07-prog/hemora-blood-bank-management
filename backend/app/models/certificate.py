from datetime import date, datetime
import random
from app.extensions import db
from app.utils.helpers import format_date, format_datetime


def generate_certificate_code():
    """Generate HMRA-YYYY-XXXXXX certificate number format."""
    year = datetime.utcnow().year
    random_digits = f"{random.randint(100000, 999999)}"
    return f"HMRA-{year}-{random_digits}"


class Certificate(db.Model):
    __tablename__ = 'certificates'

    id = db.Column(db.Integer, primary_key=True)
    donation_id = db.Column(db.Integer, db.ForeignKey('donations.id', ondelete='CASCADE'), unique=True, nullable=False)
    donor_id = db.Column(db.Integer, db.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False, index=True)
    certificate_number = db.Column(db.String(50), unique=True, nullable=False, default=generate_certificate_code, index=True)
    issued_date = db.Column(db.Date, nullable=False, default=date.today)
    donor_name = db.Column(db.String(120), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False)
    donation_date = db.Column(db.Date, nullable=False)
    donation_center = db.Column(db.String(150), nullable=False)
    units_collected = db.Column(db.Integer, default=1, nullable=False)
    is_valid = db.Column(db.Boolean, default=True, nullable=False, index=True)
    revoked_at = db.Column(db.DateTime, nullable=True)
    revoked_reason = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    donation = db.relationship('Donation', back_populates='certificate')
    donor = db.relationship('Donor', back_populates='certificates')

    def to_dict(self):
        """Serialize certificate."""
        return {
            'id': self.id,
            'donation_id': self.donation_id,
            'donor_id': self.donor_id,
            'certificate_number': self.certificate_number,
            'issued_date': format_date(self.issued_date),
            'donor_name': self.donor_name,
            'blood_group': self.blood_group,
            'donation_date': format_date(self.donation_date),
            'donation_center': self.donation_center,
            'units_collected': self.units_collected,
            'is_valid': self.is_valid,
            'revoked_at': format_datetime(self.revoked_at),
            'revoked_reason': self.revoked_reason,
            'created_at': format_datetime(self.created_at)
        }

    def __repr__(self):
        return f"<Certificate {self.certificate_number} for {self.donor_name}>"
