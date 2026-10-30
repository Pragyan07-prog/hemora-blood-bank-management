from datetime import date, datetime, timedelta
from sqlalchemy import func
from app.extensions import db
from app.models.donor import Donor
from app.models.user import User
from app.models.blood_inventory import BloodInventory
from app.models.blood_request import BloodRequest
from app.models.donation import Donation
from app.models.appointment import Appointment
from app.models.audit_log import AuditLog
from app.utils.validators import VALID_BLOOD_GROUPS


class AnalyticsService:
    @staticmethod
    def get_dashboard_stats():
        """Comprehensive summary metrics for admin dashboard."""
        today = date.today()

        total_donors = Donor.query.count()
        active_donors = Donor.query.join(User, Donor.user_id == User.id).filter(
            User.is_active == True,
            Donor.is_eligible == True
        ).count()

        total_blood_units = db.session.query(
            func.coalesce(func.sum(BloodInventory.available_units), 0)
        ).scalar()

        pending_requests = BloodRequest.query.filter_by(status='PENDING').count()
        approved_requests = BloodRequest.query.filter_by(status='APPROVED').count()
        completed_donations = Donation.query.filter_by(status='COMPLETED').count()

        upcoming_appointments = Appointment.query.filter(
            Appointment.scheduled_date >= today,
            Appointment.status.in_(['PENDING', 'APPROVED'])
        ).count()

        # Units with stock <= 5
        expiring_units = BloodInventory.query.filter(BloodInventory.available_units <= 5).count()

        # Recent records
        recent_donors = [d.to_dict(include_user=False) for d in Donor.query.order_by(Donor.created_at.desc()).limit(5).all()]
        recent_requests = [r.to_dict() for r in BloodRequest.query.order_by(BloodRequest.created_at.desc()).limit(5).all()]
        recent_activities = [a.to_dict() for a in AuditLog.query.order_by(AuditLog.created_at.desc()).limit(10).all()]

        return {
            "total_donors": total_donors,
            "active_donors": active_donors,
            "total_blood_units": int(total_blood_units),
            "pending_requests": pending_requests,
            "approved_requests": approved_requests,
            "completed_donations": completed_donations,
            "upcoming_appointments": upcoming_appointments,
            "expiring_units": expiring_units,
            "recent_registrations": recent_donors,
            "recent_requests": recent_requests,
            "recent_activities": recent_activities
        }

    @staticmethod
    def get_blood_group_distribution():
        """Count of donors by blood group."""
        results = db.session.query(
            Donor.blood_group,
            func.count(Donor.id)
        ).group_by(Donor.blood_group).all()

        counts = {bg: 0 for bg in VALID_BLOOD_GROUPS}
        for bg, count in results:
            counts[bg] = count

        return [{"blood_group": bg, "count": count} for bg, count in counts.items()]

    @staticmethod
    def get_monthly_donations(months=12):
        """Monthly donation count trend for past N months."""
        today = date.today()
        trends = []

        for i in range(months - 1, -1, -1):
            # Calculate target month and year
            year = today.year
            month = today.month - i
            while month <= 0:
                month += 12
                year -= 1

            start_date = date(year, month, 1)
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)

            count = Donation.query.filter(
                Donation.donation_date >= start_date,
                Donation.donation_date < end_date,
                Donation.status == 'COMPLETED'
            ).count()

            trends.append({
                "month": start_date.strftime("%b %Y"),
                "year": year,
                "month_num": month,
                "donations": count
            })

        return trends

    @staticmethod
    def get_inventory_distribution():
        """Inventory breakdown by blood group and component."""
        inventory = BloodInventory.query.all()
        by_blood_group = {}

        for item in inventory:
            if item.blood_group not in by_blood_group:
                by_blood_group[item.blood_group] = {
                    "blood_group": item.blood_group,
                    "available_units": 0,
                    "reserved_units": 0,
                    "total_units": 0,
                    "components": {}
                }
            by_blood_group[item.blood_group]["available_units"] += item.available_units
            by_blood_group[item.blood_group]["reserved_units"] += item.reserved_units
            by_blood_group[item.blood_group]["total_units"] += item.total_units
            by_blood_group[item.blood_group]["components"][item.component] = item.available_units

        # Fill in any missing blood groups
        for bg in VALID_BLOOD_GROUPS:
            if bg not in by_blood_group:
                by_blood_group[bg] = {
                    "blood_group": bg,
                    "available_units": 0,
                    "reserved_units": 0,
                    "total_units": 0,
                    "components": {}
                }

        return list(by_blood_group.values())

    @staticmethod
    def get_request_trends(months=6):
        """Request submission trends over past N months."""
        today = date.today()
        trends = []

        for i in range(months - 1, -1, -1):
            year = today.year
            month = today.month - i
            while month <= 0:
                month += 12
                year -= 1

            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1)
            else:
                end_date = datetime(year, month + 1, 1)

            total_reqs = BloodRequest.query.filter(
                BloodRequest.created_at >= start_date,
                BloodRequest.created_at < end_date
            ).count()

            fulfilled_reqs = BloodRequest.query.filter(
                BloodRequest.created_at >= start_date,
                BloodRequest.created_at < end_date,
                BloodRequest.status == 'FULFILLED'
            ).count()

            trends.append({
                "month": start_date.strftime("%b %Y"),
                "total_requests": total_reqs,
                "fulfilled_requests": fulfilled_reqs
            })

        return trends

    @staticmethod
    def get_request_status_distribution():
        """Breakdown of blood requests by current status."""
        results = db.session.query(
            BloodRequest.status,
            func.count(BloodRequest.id)
        ).group_by(BloodRequest.status).all()

        statuses = {
            'PENDING': 0,
            'APPROVED': 0,
            'REJECTED': 0,
            'PARTIALLY_FULFILLED': 0,
            'FULFILLED': 0,
            'CANCELLED': 0
        }
        for status, count in results:
            statuses[status] = count

        return [{"status": status, "count": count} for status, count in statuses.items()]
