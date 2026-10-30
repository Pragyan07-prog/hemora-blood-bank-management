from app.extensions import db
from app.models.donor import Donor
from app.models.user import User
from app.models.donation import Donation
from app.models.appointment import Appointment
from app.utils.validators import validate_blood_group, validate_phone, parse_date


class DonorService:
    @staticmethod
    def get_all_donors(query_filter=None, blood_group=None, city=None, is_eligible=None):
        """
        Build query to filter and search donors.
        """
        query = Donor.query.join(User, Donor.user_id == User.id)

        if query_filter:
            term = f"%{query_filter.strip()}%"
            query = query.filter(
                (Donor.full_name.ilike(term)) |
                (User.email.ilike(term)) |
                (Donor.phone.ilike(term)) |
                (Donor.city.ilike(term))
            )

        if blood_group:
            query = query.filter(Donor.blood_group == blood_group.strip().upper())

        if city:
            query = query.filter(Donor.city.ilike(f"%{city.strip()}%"))

        if is_eligible is not None:
            if isinstance(is_eligible, str):
                is_eligible = is_eligible.lower() in ('true', '1')
            query = query.filter(Donor.is_eligible == is_eligible)

        return query.order_by(Donor.created_at.desc())

    @staticmethod
    def get_donor_by_id(donor_id):
        """Fetch donor by ID."""
        return Donor.query.get(donor_id)

    @staticmethod
    def get_donor_by_user_id(user_id):
        """Fetch donor by linked user ID."""
        return Donor.query.filter_by(user_id=user_id).first()

    @staticmethod
    def update_donor(donor_id, data):
        """
        Update donor profile details (admin access).
        """
        donor = Donor.query.get(donor_id)
        if not donor:
            return None, ["Donor not found"]

        if 'full_name' in data and data['full_name']:
            donor.full_name = data['full_name'].strip()

        if 'blood_group' in data and data['blood_group']:
            bg = data['blood_group'].strip().upper()
            if not validate_blood_group(bg):
                return None, ["Invalid blood group"]
            donor.blood_group = bg

        if 'phone' in data and data['phone']:
            donor.phone = data['phone'].strip()

        if 'date_of_birth' in data and data['date_of_birth']:
            dob = parse_date(data['date_of_birth'])
            if not dob:
                return None, ["Invalid date_of_birth format (use YYYY-MM-DD)"]
            donor.date_of_birth = dob

        if 'gender' in data and data['gender']:
            donor.gender = data['gender'].strip()

        if 'city' in data and data['city']:
            donor.city = data['city'].strip()

        if 'state' in data:
            donor.state = data['state'].strip() if data['state'] else None

        if 'address' in data:
            donor.address = data['address'].strip() if data['address'] else None

        if 'emergency_contact' in data:
            donor.emergency_contact = data['emergency_contact'].strip() if data['emergency_contact'] else None

        if 'emergency_phone' in data:
            donor.emergency_phone = data['emergency_phone'].strip() if data['emergency_phone'] else None

        if 'is_eligible' in data:
            donor.is_eligible = bool(data['is_eligible'])

        if 'profile_picture' in data:
            donor.profile_picture = data['profile_picture']

        db.session.commit()
        return donor, None

    @staticmethod
    def update_own_profile(user_id, data):
        """
        Update own donor profile (donor access - restricted fields).
        """
        donor = Donor.query.filter_by(user_id=user_id).first()
        if not donor:
            return None, ["Donor profile not found"]

        allowed_fields = ['phone', 'city', 'state', 'address', 'emergency_contact', 'emergency_phone', 'profile_picture']

        for field in allowed_fields:
            if field in data and data[field] is not None:
                val = str(data[field]).strip()
                setattr(donor, field, val)

        db.session.commit()
        return donor, None

    @staticmethod
    def set_donor_status(donor_id, is_active):
        """
        Activate or deactivate a donor and linked user account.
        """
        donor = Donor.query.get(donor_id)
        if not donor:
            return None, ["Donor not found"]

        if donor.user:
            donor.user.is_active = is_active
        donor.is_eligible = is_active
        db.session.commit()
        return donor, None

    @staticmethod
    def get_donor_donations(donor_id):
        """Fetch donation history for donor."""
        return Donation.query.filter_by(donor_id=donor_id).order_by(Donation.donation_date.desc()).all()

    @staticmethod
    def get_donor_appointments(donor_id):
        """Fetch appointment history for donor."""
        return Appointment.query.filter_by(donor_id=donor_id).order_by(Appointment.scheduled_date.desc()).all()
