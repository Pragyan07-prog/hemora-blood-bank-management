from datetime import date, datetime
from app.extensions import db
from app.models.blood_camp import BloodCamp, CampRegistration
from app.models.donor import Donor
from app.models.notification import Notification
from app.utils.validators import parse_date, VALID_CAMP_STATUSES


class CampService:
    @staticmethod
    def create_camp(data, created_by=None):
        """Create a new blood donation camp."""
        title = (data.get('title') or '').strip()
        venue = (data.get('venue') or '').strip()
        city = (data.get('city') or '').strip()
        camp_date_raw = data.get('camp_date')
        start_time = (data.get('start_time') or '').strip()
        end_time = (data.get('end_time') or '').strip()
        organizer_name = (data.get('organizer_name') or '').strip()
        contact_phone = (data.get('contact_phone') or '').strip()

        errors = []
        if not title:
            errors.append("Camp title is required")
        if not venue:
            errors.append("Venue is required")
        if not city:
            errors.append("City is required")
        if not start_time:
            errors.append("Start time is required")
        if not end_time:
            errors.append("End time is required")
        if not organizer_name:
            errors.append("Organizer name is required")
        if not contact_phone:
            errors.append("Contact phone is required")

        camp_date = parse_date(camp_date_raw)
        if not camp_date:
            errors.append("Valid camp date (YYYY-MM-DD) is required")

        reg_deadline = parse_date(data.get('registration_deadline'))

        try:
            capacity = max(1, int(data.get('capacity', 100)))
        except (ValueError, TypeError):
            capacity = 100

        status = (data.get('status') or 'DRAFT').strip().upper()
        if status not in VALID_CAMP_STATUSES:
            status = 'DRAFT'

        if errors:
            return None, errors

        camp = BloodCamp(
            title=title,
            description=data.get('description'),
            venue=venue,
            address=data.get('address'),
            city=city,
            state=data.get('state'),
            camp_date=camp_date,
            start_time=start_time,
            end_time=end_time,
            registration_deadline=reg_deadline,
            capacity=capacity,
            registered_count=0,
            status=status,
            organizer_name=organizer_name,
            contact_phone=contact_phone,
            created_by=created_by
        )

        db.session.add(camp)
        db.session.commit()
        return camp, None

    @staticmethod
    def get_camps(status=None, city=None, upcoming_only=False):
        """Query camps with optional status, city, or date filtering."""
        query = BloodCamp.query

        if status:
            query = query.filter(BloodCamp.status == status.strip().upper())
        if city:
            query = query.filter(BloodCamp.city.ilike(f"%{city.strip()}%"))
        if upcoming_only:
            query = query.filter(BloodCamp.camp_date >= date.today())

        return query.order_by(BloodCamp.camp_date.asc())

    @staticmethod
    def get_camp_by_id(camp_id):
        """Retrieve camp by ID."""
        return BloodCamp.query.get(camp_id)

    @staticmethod
    def update_camp(camp_id, data):
        """Update existing blood camp."""
        camp = BloodCamp.query.get(camp_id)
        if not camp:
            return None, ["Blood camp not found"]

        if 'title' in data and data['title']:
            camp.title = data['title'].strip()
        if 'description' in data:
            camp.description = data['description']
        if 'venue' in data and data['venue']:
            camp.venue = data['venue'].strip()
        if 'address' in data:
            camp.address = data['address']
        if 'city' in data and data['city']:
            camp.city = data['city'].strip()
        if 'state' in data:
            camp.state = data['state']
        if 'camp_date' in data and data['camp_date']:
            d = parse_date(data['camp_date'])
            if d:
                camp.camp_date = d
        if 'start_time' in data and data['start_time']:
            camp.start_time = data['start_time'].strip()
        if 'end_time' in data and data['end_time']:
            camp.end_time = data['end_time'].strip()
        if 'registration_deadline' in data:
            camp.registration_deadline = parse_date(data['registration_deadline'])
        if 'capacity' in data and data['capacity']:
            try:
                camp.capacity = max(1, int(data['capacity']))
            except (ValueError, TypeError):
                pass
        if 'organizer_name' in data and data['organizer_name']:
            camp.organizer_name = data['organizer_name'].strip()
        if 'contact_phone' in data and data['contact_phone']:
            camp.contact_phone = data['contact_phone'].strip()
        if 'status' in data and data['status'].upper() in VALID_CAMP_STATUSES:
            camp.status = data['status'].upper()

        db.session.commit()
        return camp, None

    @staticmethod
    def set_camp_status(camp_id, status):
        """Change status of a camp (e.g. PUBLISHED or CANCELLED)."""
        camp = BloodCamp.query.get(camp_id)
        if not camp:
            return None, ["Blood camp not found"]

        status = status.strip().upper()
        if status not in VALID_CAMP_STATUSES:
            return None, ["Invalid camp status"]

        camp.status = status
        db.session.commit()
        return camp, None

    @staticmethod
    def register_donor(camp_id, user_id):
        """Register a donor for a blood camp."""
        camp = BloodCamp.query.get(camp_id)
        if not camp:
            return None, ["Blood camp not found"]

        if camp.status != 'PUBLISHED':
            return None, ["Registrations are only open for published camps"]

        if camp.camp_date < date.today():
            return None, ["Cannot register for a past blood camp"]

        if camp.registration_deadline and date.today() > camp.registration_deadline:
            return None, ["Registration deadline for this camp has passed"]

        donor = Donor.query.filter_by(user_id=user_id).first()
        if not donor:
            return None, ["Donor profile not found"]

        # Check existing registration
        existing = CampRegistration.query.filter_by(camp_id=camp.id, donor_id=donor.id).first()
        if existing and existing.status == 'REGISTERED':
            return None, ["You are already registered for this blood camp"]

        if camp.registered_count >= camp.capacity:
            return None, ["Camp capacity has been reached"]

        if existing:
            existing.status = 'REGISTERED'
            registration = existing
        else:
            registration = CampRegistration(
                camp_id=camp.id,
                donor_id=donor.id,
                status='REGISTERED'
            )
            db.session.add(registration)

        camp.registered_count += 1

        # Send notification
        notif = Notification(
            recipient_id=user_id,
            title="Blood Camp Registration",
            message=f"You are successfully registered for '{camp.title}' on {camp.camp_date} at {camp.venue}.",
            notification_type="BLOOD_CAMP"
        )
        db.session.add(notif)

        db.session.commit()
        return registration, None

    @staticmethod
    def cancel_registration(camp_id, user_id):
        """Cancel donor registration for a camp."""
        donor = Donor.query.filter_by(user_id=user_id).first()
        if not donor:
            return None, ["Donor profile not found"]

        reg = CampRegistration.query.filter_by(camp_id=camp_id, donor_id=donor.id).first()
        if not reg or reg.status != 'REGISTERED':
            return None, ["Active registration not found for this camp"]

        reg.status = 'CANCELLED'
        camp = BloodCamp.query.get(camp_id)
        if camp and camp.registered_count > 0:
            camp.registered_count -= 1

        db.session.commit()
        return True, None

    @staticmethod
    def get_camp_registrations(camp_id):
        """List all donor registrations for a given camp."""
        return CampRegistration.query.filter_by(camp_id=camp_id).all()
