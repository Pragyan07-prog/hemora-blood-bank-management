from datetime import datetime
from app.extensions import db
from app.utils.helpers import format_date, format_datetime


class BloodCamp(db.Model):
    __tablename__ = 'blood_camps'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    venue = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=False, index=True)
    state = db.Column(db.String(100), nullable=True)
    camp_date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.String(20), nullable=False)
    end_time = db.Column(db.String(20), nullable=False)
    registration_deadline = db.Column(db.Date, nullable=True)
    capacity = db.Column(db.Integer, default=100, nullable=False)
    registered_count = db.Column(db.Integer, default=0, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='DRAFT', index=True)  # DRAFT, PUBLISHED, CANCELLED, COMPLETED
    organizer_name = db.Column(db.String(150), nullable=False)
    contact_phone = db.Column(db.String(20), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    registrations = db.relationship('CampRegistration', back_populates='camp', cascade='all, delete-orphan')
    creator = db.relationship('User', foreign_keys=[created_by])

    def to_dict(self, include_registrations=False):
        """Serialize blood camp."""
        data = {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'venue': self.venue,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'camp_date': format_date(self.camp_date),
            'start_time': self.start_time,
            'end_time': self.end_time,
            'registration_deadline': format_date(self.registration_deadline),
            'capacity': self.capacity,
            'registered_count': self.registered_count,
            'available_slots': max(0, self.capacity - self.registered_count),
            'status': self.status,
            'organizer_name': self.organizer_name,
            'contact_phone': self.contact_phone,
            'created_by': self.created_by,
            'created_at': format_datetime(self.created_at),
            'updated_at': format_datetime(self.updated_at)
        }
        if include_registrations:
            data['registrations'] = [r.to_dict() for r in self.registrations]
        return data

    def __repr__(self):
        return f"<BloodCamp #{self.id} {self.title} on {self.camp_date}>"


class CampRegistration(db.Model):
    __tablename__ = 'camp_registrations'

    id = db.Column(db.Integer, primary_key=True)
    camp_id = db.Column(db.Integer, db.ForeignKey('blood_camps.id', ondelete='CASCADE'), nullable=False, index=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('donors.id', ondelete='CASCADE'), nullable=False, index=True)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='REGISTERED')  # REGISTERED, CANCELLED, ATTENDED

    __table_args__ = (
        db.UniqueConstraint('camp_id', 'donor_id', name='uq_camp_donor_registration'),
    )

    # Relationships
    camp = db.relationship('BloodCamp', back_populates='registrations')
    donor = db.relationship('Donor', back_populates='camp_registrations')

    def to_dict(self):
        """Serialize camp registration."""
        return {
            'id': self.id,
            'camp_id': self.camp_id,
            'camp_title': self.camp.title if self.camp else None,
            'camp_date': format_date(self.camp.camp_date) if self.camp else None,
            'camp_venue': self.camp.venue if self.camp else None,
            'donor_id': self.donor_id,
            'donor_name': self.donor.full_name if self.donor else None,
            'donor_blood_group': self.donor.blood_group if self.donor else None,
            'donor_phone': self.donor.phone if self.donor else None,
            'registered_at': format_datetime(self.registered_at),
            'status': self.status
        }

    def __repr__(self):
        return f"<CampRegistration Donor #{self.donor_id} -> Camp #{self.camp_id}>"
