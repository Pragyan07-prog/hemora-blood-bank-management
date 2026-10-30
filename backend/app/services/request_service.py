from datetime import datetime
from app.extensions import db
from app.models.blood_request import BloodRequest
from app.models.notification import Notification
from app.services.inventory_service import InventoryService
from app.utils.validators import (
    validate_blood_group,
    VALID_COMPONENTS,
    VALID_URGENCIES,
    parse_date
)


class RequestService:
    @staticmethod
    def create_request(data, requester_id=None):
        """
        Create a blood request (either by authenticated user or public guest).
        """
        patient_name = (data.get('patient_name') or '').strip()
        blood_group = (data.get('blood_group') or '').strip().upper()
        component = (data.get('component') or 'WHOLE_BLOOD').strip().upper()
        hospital_name = (data.get('hospital_name') or '').strip()
        hospital_city = (data.get('hospital_city') or '').strip()
        hospital_address = (data.get('hospital_address') or '').strip()
        req_date_raw = data.get('required_date')
        urgency = (data.get('urgency') or 'NORMAL').strip().upper()
        contact_number = (data.get('contact_number') or '').strip()
        additional_info = (data.get('additional_info') or '').strip()

        try:
            units_required = int(data.get('units_required', 1))
        except (ValueError, TypeError):
            units_required = 1

        errors = []
        if not patient_name:
            errors.append("Patient name is required")
        if not validate_blood_group(blood_group):
            errors.append("Valid blood group is required")
        if component not in VALID_COMPONENTS:
            errors.append(f"Invalid blood component. Must be one of: {', '.join(VALID_COMPONENTS)}")
        if units_required <= 0:
            errors.append("Units required must be greater than zero")
        if not hospital_name:
            errors.append("Hospital name is required")
        if not hospital_city:
            errors.append("Hospital city is required")
        if not contact_number:
            errors.append("Contact phone number is required")

        required_date = parse_date(req_date_raw)
        if not required_date:
            errors.append("Valid required date (YYYY-MM-DD) is required")

        if urgency not in VALID_URGENCIES:
            urgency = 'NORMAL'

        if errors:
            return None, errors

        request_obj = BloodRequest(
            requester_id=requester_id,
            patient_name=patient_name,
            blood_group=blood_group,
            component=component,
            units_required=units_required,
            units_fulfilled=0,
            hospital_name=hospital_name,
            hospital_city=hospital_city,
            hospital_address=hospital_address,
            required_date=required_date,
            urgency=urgency,
            contact_number=contact_number,
            additional_info=additional_info,
            status='PENDING'
        )

        db.session.add(request_obj)
        db.session.commit()

        # Send confirmation notification if user is logged in
        if requester_id:
            notif = Notification(
                recipient_id=requester_id,
                title="Blood Request Submitted",
                message=f"Your request #{request_obj.id} for {units_required} unit(s) of {blood_group} has been submitted and is pending review.",
                notification_type="BLOOD_REQUEST"
            )
            db.session.add(notif)
            db.session.commit()

        return request_obj, None

    @staticmethod
    def get_requests(status=None, urgency=None, blood_group=None, requester_id=None):
        """
        Query blood requests with filters.
        """
        query = BloodRequest.query
        if status:
            query = query.filter(BloodRequest.status == status.strip().upper())
        if urgency:
            query = query.filter(BloodRequest.urgency == urgency.strip().upper())
        if blood_group:
            query = query.filter(BloodRequest.blood_group == blood_group.strip().upper())
        if requester_id:
            query = query.filter(BloodRequest.requester_id == requester_id)

        return query.order_by(BloodRequest.created_at.desc())

    @staticmethod
    def get_request_by_id(request_id):
        """Retrieve request by ID."""
        return BloodRequest.query.get(request_id)

    @staticmethod
    def approve_request(request_id, admin_id):
        """
        Approve blood request.
        """
        req = BloodRequest.query.get(request_id)
        if not req:
            return None, ["Blood request not found"]

        if req.status != 'PENDING':
            return None, [f"Cannot approve request with status '{req.status}'"]

        req.status = 'APPROVED'
        req.approved_by = admin_id
        req.approved_at = datetime.utcnow()

        # Notify requester
        if req.requester_id:
            notif = Notification(
                recipient_id=req.requester_id,
                title="Blood Request Approved",
                message=f"Your blood request #{req.id} for {req.patient_name} has been approved by admin.",
                notification_type="BLOOD_REQUEST"
            )
            db.session.add(notif)

        db.session.commit()
        return req, None

    @staticmethod
    def reject_request(request_id, admin_id, reason):
        """
        Reject blood request with reason.
        """
        req = BloodRequest.query.get(request_id)
        if not req:
            return None, ["Blood request not found"]

        if req.status not in ('PENDING', 'APPROVED'):
            return None, [f"Cannot reject request with status '{req.status}'"]

        req.status = 'REJECTED'
        req.rejection_reason = reason or "Request rejected by administrator"
        req.approved_by = admin_id

        # Notify requester
        if req.requester_id:
            notif = Notification(
                recipient_id=req.requester_id,
                title="Blood Request Rejected",
                message=f"Your blood request #{req.id} was rejected: {req.rejection_reason}",
                notification_type="BLOOD_REQUEST"
            )
            db.session.add(notif)

        db.session.commit()
        return req, None

    @staticmethod
    def fulfill_request(request_id, admin_id, units=None):
        """
        Fulfill blood request and deduct units from inventory.
        """
        req = BloodRequest.query.get(request_id)
        if not req:
            return None, ["Blood request not found"]

        if req.status not in ('APPROVED', 'PARTIALLY_FULFILLED'):
            return None, [f"Cannot fulfill request with status '{req.status}'. Must be APPROVED or PARTIALLY_FULFILLED."]

        units_to_fulfill = units if units is not None else (req.units_required - req.units_fulfilled)
        if units_to_fulfill <= 0:
            return None, ["Units to fulfill must be greater than zero"]

        # Deduct from inventory
        inv, err = InventoryService.issue_units(
            blood_group=req.blood_group,
            component=req.component,
            units=units_to_fulfill,
            reference_id=req.id,
            reference_type='REQUEST',
            performed_by=admin_id,
            notes=f"Fulfillment for Request #{req.id} ({req.patient_name})"
        )
        if err:
            return None, err

        req.units_fulfilled += units_to_fulfill
        if req.units_fulfilled >= req.units_required:
            req.status = 'FULFILLED'
            req.fulfilled_at = datetime.utcnow()
        else:
            req.status = 'PARTIALLY_FULFILLED'

        if req.requester_id:
            notif = Notification(
                recipient_id=req.requester_id,
                title="Blood Request Fulfilled",
                message=f"{units_to_fulfill} unit(s) of {req.blood_group} have been issued for patient {req.patient_name}.",
                notification_type="BLOOD_REQUEST"
            )
            db.session.add(notif)

        db.session.commit()
        return req, None

    @staticmethod
    def cancel_request(request_id, user_id=None, is_admin=False):
        """
        Cancel a blood request.
        """
        req = BloodRequest.query.get(request_id)
        if not req:
            return None, ["Blood request not found"]

        if not is_admin and req.requester_id != user_id:
            return None, ["You do not have permission to cancel this request"]

        if req.status in ('FULFILLED', 'CANCELLED'):
            return None, [f"Cannot cancel a request that is already {req.status}"]

        req.status = 'CANCELLED'
        db.session.commit()
        return req, None
