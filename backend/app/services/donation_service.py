from datetime import datetime, date
from app.extensions import db
from app.models.donation import Donation
from app.models.donor import Donor
from app.models.appointment import Appointment
from app.models.notification import Notification
from app.services.inventory_service import InventoryService
from app.services.certificate_service import CertificateService
from app.utils.validators import parse_date, VALID_DONATION_TYPES, validate_blood_group


class DonationService:
    @staticmethod
    def record_donation(data):
        """
        Record a donation by admin or staff.
        """
        donor_id = data.get('donor_id')
        if not donor_id:
            return None, ["Donor ID is required"]

        donor = Donor.query.get(donor_id)
        if not donor:
            return None, ["Donor not found"]

        donation_date_raw = data.get('donation_date')
        donation_date = parse_date(donation_date_raw) or date.today()

        donation_center = (data.get('donation_center') or '').strip()
        if not donation_center:
            return None, ["Donation center name is required"]

        blood_group = (data.get('blood_group') or donor.blood_group).strip().upper()
        if not validate_blood_group(blood_group):
            return None, ["Invalid blood group"]

        donation_type = (data.get('donation_type') or 'WHOLE_BLOOD').strip().upper()
        if donation_type not in VALID_DONATION_TYPES:
            donation_type = 'WHOLE_BLOOD'

        try:
            units = int(data.get('units_collected', 1))
        except (ValueError, TypeError):
            units = 1

        appointment_id = data.get('appointment_id')
        if appointment_id:
            appt = Appointment.query.get(appointment_id)
            if not appt:
                appointment_id = None

        donation = Donation(
            donor_id=donor.id,
            appointment_id=appointment_id,
            donation_date=donation_date,
            donation_center=donation_center,
            blood_group=blood_group,
            donation_type=donation_type,
            units_collected=units,
            hemoglobin_level=float(data.get('hemoglobin_level')) if data.get('hemoglobin_level') is not None else None,
            blood_pressure=data.get('blood_pressure'),
            weight=float(data.get('weight')) if data.get('weight') is not None else None,
            status='COMPLETED',
            is_verified=False,
            notes=data.get('notes')
        )

        db.session.add(donation)
        db.session.commit()

        # If linked to appointment, mark appointment complete
        if appointment_id:
            appt = Appointment.query.get(appointment_id)
            if appt:
                appt.status = 'COMPLETED'
                db.session.commit()

        return donation, None

    @staticmethod
    def get_donations(donor_id=None, status=None, is_verified=None, blood_group=None):
        """
        Query donations with optional filters.
        """
        query = Donation.query
        if donor_id:
            query = query.filter(Donation.donor_id == donor_id)
        if status:
            query = query.filter(Donation.status == status.strip().upper())
        if is_verified is not None:
            if isinstance(is_verified, str):
                is_verified = is_verified.lower() in ('true', '1')
            query = query.filter(Donation.is_verified == is_verified)
        if blood_group:
            query = query.filter(Donation.blood_group == blood_group.strip().upper())

        return query.order_by(Donation.donation_date.desc(), Donation.created_at.desc())

    @staticmethod
    def get_donation_by_id(donation_id):
        """Retrieve donation by ID."""
        return Donation.query.get(donation_id)

    @staticmethod
    def verify_donation(donation_id, admin_id):
        """
        Verify donation, add units to blood inventory, update donor stats, and issue certificate.
        """
        donation = Donation.query.get(donation_id)
        if not donation:
            return None, ["Donation record not found"]

        if donation.is_verified:
            return donation, None

        donation.is_verified = True
        donation.verified_by = admin_id
        donation.verified_at = datetime.utcnow()
        donation.status = 'COMPLETED'

        # Update donor statistics
        donor = donation.donor
        if donor:
            donor.last_donation_date = donation.donation_date
            donor.total_donations = (donor.total_donations or 0) + donation.units_collected

        # Add units to blood inventory
        component_map = {
            'WHOLE_BLOOD': 'WHOLE_BLOOD',
            'PLASMA': 'PLASMA',
            'PLATELETS': 'PLATELETS'
        }
        component = component_map.get(donation.donation_type, 'WHOLE_BLOOD')
        InventoryService.add_units(
            blood_group=donation.blood_group,
            component=component,
            units=donation.units_collected,
            performed_by=admin_id,
            reference_id=donation.id,
            reference_type='DONATION',
            notes=f"Verified donation #{donation.id} from donor {donor.full_name if donor else donation.donor_id}"
        )

        # Issue Certificate
        CertificateService.generate_certificate(donation.id, admin_id)

        # Send notification to donor
        if donor and donor.user_id:
            notif = Notification(
                recipient_id=donor.user_id,
                title="Donation Verified!",
                message=f"Thank you! Your donation of {donation.units_collected} unit(s) of {donation.blood_group} has been verified. Your certificate is now available.",
                notification_type="DONATION"
            )
            db.session.add(notif)

        db.session.commit()
        return donation, None

    @staticmethod
    def reject_donation(donation_id, admin_id, reason):
        """
        Reject a donation with a reason.
        """
        donation = Donation.query.get(donation_id)
        if not donation:
            return None, ["Donation record not found"]

        donation.status = 'REJECTED'
        donation.is_verified = False
        donation.rejection_reason = reason or "Donation rejected during screening"
        donation.verified_by = admin_id
        donation.verified_at = datetime.utcnow()

        donor = donation.donor
        if donor and donor.user_id:
            notif = Notification(
                recipient_id=donor.user_id,
                title="Donation Update",
                message=f"Your donation was marked as rejected: {donation.rejection_reason}",
                notification_type="DONATION"
            )
            db.session.add(notif)

        db.session.commit()
        return donation, None
