from datetime import date, datetime, timedelta
from app.extensions import db
from app.utils.helpers import format_date, format_datetime


class Donor(db.Model):
    __tablename__ = 'donors'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    full_name = db.Column(db.String(120), nullable=False)
    blood_group = db.Column(db.String(5), nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    city = db.Column(db.String(100), nullable=False, index=True)
    state = db.Column(db.String(100), nullable=True)
    address = db.Column(db.Text, nullable=True)
    emergency_contact = db.Column(db.String(120), nullable=True)
    emergency_phone = db.Column(db.String(20), nullable=True)
    last_donation_date = db.Column(db.Date, nullable=True)
    is_eligible = db.Column(db.Boolean, default=True, nullable=False, index=True)
    total_donations = db.Column(db.Integer, default=0, nullable=False)
    profile_picture = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='donor')
    donations = db.relationship('Donation', back_populates='donor', cascade='all, delete-orphan', order_by='desc(Donation.donation_date)')
    appointments = db.relationship('Appointment', back_populates='donor', cascade='all, delete-orphan', order_by='desc(Appointment.scheduled_date)')
    certificates = db.relationship('Certificate', back_populates='donor', cascade='all, delete-orphan', order_by='desc(Certificate.issued_date)')
    camp_registrations = db.relationship('CampRegistration', back_populates='donor', cascade='all, delete-orphan')

    @property
    def next_eligible_date(self):
        """Calculate next eligible donation date (90 days after last donation)."""
        if not self.last_donation_date:
            return date.today()
        return self.last_donation_date + timedelta(days=90)

    @property
    def age(self):
        """Calculate donor age in years."""
        if not self.date_of_birth:
            return None
        today = date.today()
        return today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )

    def check_eligibility(self, donation_type='WHOLE_BLOOD') -> bool:
        """
        Check if the donor is currently eligible based on days since last donation.
        90 days for WHOLE_BLOOD, 14 days for PLASMA.
        """
        if not self.is_eligible:
            return False
        if not self.last_donation_date:
            return True
        wait_days = 14 if donation_type == 'PLASMA' else 90
        min_date = self.last_donation_date + timedelta(days=wait_days)
        return date.today() >= min_date

    def to_dict(self, include_user=True):
        """Serialize donor model."""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'blood_group': self.blood_group,
            'phone': self.phone,
            'date_of_birth': format_date(self.date_of_birth),
            'age': self.age,
            'gender': self.gender,
            'city': self.city,
            'state': self.state,
            'address': self.address,
            'emergency_contact': self.emergency_contact,
            'emergency_phone': self.emergency_phone,
            'last_donation_date': format_date(self.last_donation_date),
            'next_eligible_date': format_date(self.next_eligible_date),
            'is_eligible': self.is_eligible,
            'total_donations': self.total_donations,
            'profile_picture': self.profile_picture,
            'created_at': format_datetime(self.created_at),
            'updated_at': format_datetime(self.updated_at)
        }
        if include_user and self.user:
            data['email'] = self.user.email
            data['is_active'] = self.user.is_active
        return data

    def __repr__(self):
        return f"<Donor {self.full_name} ({self.blood_group})>"
