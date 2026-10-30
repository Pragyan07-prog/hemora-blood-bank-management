from datetime import datetime, date
from app.extensions import db
from app.models.appointment import Appointment
from app.models.donor import Donor
from app.models.notification import Notification
from app.utils.validators import parse_date


STATIC_DONATION_CENTERS = [
    {
        "name": "Hemora Central Blood Bank",
        "city": "Metropolis",
        "address": "100 Medical Center Blvd, Suite 101",
        "slots": ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"]
    },
    {
        "name": "City General Hospital Center",
        "city": "Gotham",
        "address": "45 Wayne Memorial Drive",
        "slots": ["09:30 AM", "10:30 AM", "11:30 AM", "01:30 PM", "02:30 PM", "03:30 PM"]
    },
    {
        "name": "St. Jude Community Health Wing",
        "city": "Star City",
        "address": "77 Queen Way",
        "slots": ["10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"]
    }
]


class AppointmentService:
    @staticmethod
    def book_appointment(user_id, data):
        """
        Book a donation appointment for a registered donor.
        """
        donor = Donor.query.filter_by(user_id=user_id).first()
        if not donor:
            return None, ["Donor profile not found for this account"]

        # Check eligibility
        if not donor.is_eligible:
            return None, ["Donor is marked ineligible for donation"]

        scheduled_date_raw = data.get('scheduled_date')
        scheduled_date = parse_date(scheduled_date_raw)
        if not scheduled_date:
            return None, ["A valid scheduled date (YYYY-MM-DD) is required"]

        if scheduled_date < date.today():
            return None, ["Appointment date cannot be in the past"]

        scheduled_time = (data.get('scheduled_time') or '').strip()
        if not scheduled_time:
            return None, ["Scheduled time slot is required"]

        donation_center = (data.get('donation_center') or '').strip()
        if not donation_center:
            return None, ["Donation center is required"]

        city = (data.get('city') or donor.city or '').strip()
        if not city:
            return None, ["City is required"]

        notes = (data.get('notes') or '').strip()

        appt = Appointment(
            donor_id=donor.id,
            scheduled_date=scheduled_date,
            scheduled_time=scheduled_time,
            donation_center=donation_center,
            city=city,
            status='PENDING',
            notes=notes
        )

        db.session.add(appt)
        db.session.commit()

        # Notification to donor
        notif = Notification(
            recipient_id=user_id,
            title="Appointment Booked",
            message=f"Your appointment #{appt.id} at {donation_center} on {scheduled_date} at {scheduled_time} is pending confirmation.",
            notification_type="APPOINTMENT"
        )
        db.session.add(notif)
        db.session.commit()

        return appt, None

    @staticmethod
    def get_appointments(donor_id=None, status=None, city=None):
        """Query appointments with filters."""
        query = Appointment.query
        if donor_id:
            query = query.filter(Appointment.donor_id == donor_id)
        if status:
            query = query.filter(Appointment.status == status.strip().upper())
        if city:
            query = query.filter(Appointment.city.ilike(f"%{city.strip()}%"))

        return query.order_by(Appointment.scheduled_date.asc(), Appointment.created_at.desc())

    @staticmethod
    def get_appointment_by_id(appt_id):
        """Retrieve appointment by ID."""
        return Appointment.query.get(appt_id)

    @staticmethod
    def approve_appointment(appt_id, admin_id=None):
        """Approve a pending appointment."""
        appt = Appointment.query.get(appt_id)
        if not appt:
            return None, ["Appointment not found"]

        appt.status = 'APPROVED'

        if appt.donor and appt.donor.user_id:
            notif = Notification(
                recipient_id=appt.donor.user_id,
                title="Appointment Confirmed",
                message=f"Your appointment at {appt.donation_center} on {appt.scheduled_date} at {appt.scheduled_time} has been confirmed.",
                notification_type="APPOINTMENT"
            )
            db.session.add(notif)

        db.session.commit()
        return appt, None

    @staticmethod
    def reject_appointment(appt_id, reason=None, admin_id=None):
        """Reject appointment with reason."""
        appt = Appointment.query.get(appt_id)
        if not appt:
            return None, ["Appointment not found"]

        appt.status = 'REJECTED'
        appt.rejection_reason = reason or "Slot unavailable"

        if appt.donor and appt.donor.user_id:
            notif = Notification(
                recipient_id=appt.donor.user_id,
                title="Appointment Rejected",
                message=f"Your appointment on {appt.scheduled_date} could not be confirmed: {appt.rejection_reason}",
                notification_type="APPOINTMENT"
            )
            db.session.add(notif)

        db.session.commit()
        return appt, None

    @staticmethod
    def complete_appointment(appt_id):
        """Mark appointment completed."""
        appt = Appointment.query.get(appt_id)
        if not appt:
            return None, ["Appointment not found"]

        appt.status = 'COMPLETED'
        db.session.commit()
        return appt, None

    @staticmethod
    def miss_appointment(appt_id):
        """Mark appointment missed."""
        appt = Appointment.query.get(appt_id)
        if not appt:
            return None, ["Appointment not found"]

        appt.status = 'MISSED'
        db.session.commit()
        return appt, None

    @staticmethod
    def cancel_appointment(appt_id, user_id=None, is_admin=False, reason=None):
        """Cancel an appointment."""
        appt = Appointment.query.get(appt_id)
        if not appt:
            return None, ["Appointment not found"]

        if not is_admin and (not appt.donor or appt.donor.user_id != user_id):
            return None, ["You do not have permission to cancel this appointment"]

        appt.status = 'CANCELLED'
        if reason:
            appt.rejection_reason = reason

        db.session.commit()
        return appt, None

    @staticmethod
    def get_static_slots():
        """Return available donation centers and time slots."""
        return STATIC_DONATION_CENTERS
