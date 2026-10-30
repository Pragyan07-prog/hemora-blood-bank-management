from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.donor import Donor
from app.models.user import User
from app.services.appointment_service import AppointmentService
from app.utils.helpers import success_response, error_response, paginate_query
from app.utils.decorators import admin_required, donor_required, active_required, log_action

appointments_bp = Blueprint('appointments', __name__)


# -------------------------------------------------------------
# Static slots & Donor Own Appointments (Before /<int:id>)
# -------------------------------------------------------------
@appointments_bp.route('/slots', methods=['GET'])
@active_required()
def get_appointment_slots():
    """Get available centers and appointment time slots."""
    slots = AppointmentService.get_static_slots()
    return success_response(data=slots, message="Appointment slots retrieved successfully")


@appointments_bp.route('/mine', methods=['GET'])
@donor_required()
def get_own_appointments():
    """Get appointments booked by currently logged-in donor."""
    user_id = int(get_jwt_identity())
    donor = Donor.query.filter_by(user_id=user_id).first()
    if not donor:
        return error_response(message="Donor profile not found", status_code=404)

    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = AppointmentService.get_appointments(donor_id=donor.id)
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda a: a.to_dict())
    return success_response(data=result, message="Your appointments retrieved successfully")


@appointments_bp.route('/', methods=['GET'])
@admin_required()
def list_appointments():
    """Admin endpoint: List all appointments with filters."""
    donor_id = request.args.get('donor_id')
    status = request.args.get('status')
    city = request.args.get('city')
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = AppointmentService.get_appointments(
        donor_id=int(donor_id) if donor_id else None,
        status=status,
        city=city
    )
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda a: a.to_dict())
    return success_response(data=result, message="Appointments retrieved successfully")


@appointments_bp.route('/', methods=['POST'])
@donor_required()
@log_action(action="BOOK_APPOINTMENT", entity_type="APPOINTMENT")
def book_appointment():
    """Donor endpoint: Book a donation appointment."""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    appt, errors = AppointmentService.book_appointment(user_id, data)
    if errors:
        return error_response(message="Failed to book appointment", errors=errors, status_code=400)

    return success_response(data=appt.to_dict(), message="Appointment booked successfully", status_code=201)


@appointments_bp.route('/<int:id>', methods=['GET'])
def get_appointment(id):
    """Get appointment details."""
    appt = AppointmentService.get_appointment_by_id(id)
    if not appt:
        return error_response(message="Appointment not found", status_code=404)

    return success_response(data=appt.to_dict(), message="Appointment details retrieved")


@appointments_bp.route('/<int:id>/approve', methods=['PATCH'])
@admin_required()
@log_action(action="APPROVE_APPOINTMENT", entity_type="APPOINTMENT")
def approve_appointment(id):
    """Admin approves appointment."""
    admin_id = int(get_jwt_identity())
    appt, errors = AppointmentService.approve_appointment(id, admin_id=admin_id)
    if errors:
        return error_response(message="Failed to approve appointment", errors=errors, status_code=400)

    return success_response(data=appt.to_dict(), message="Appointment approved successfully")


@appointments_bp.route('/<int:id>/reject', methods=['PATCH'])
@admin_required()
@log_action(action="REJECT_APPOINTMENT", entity_type="APPOINTMENT")
def reject_appointment(id):
    """Admin rejects appointment with reason."""
    admin_id = int(get_jwt_identity())
    data = request.get_json() or {}
    reason = data.get('reason') or "Appointment slot unavailable"

    appt, errors = AppointmentService.reject_appointment(id, reason=reason, admin_id=admin_id)
    if errors:
        return error_response(message="Failed to reject appointment", errors=errors, status_code=400)

    return success_response(data=appt.to_dict(), message="Appointment rejected")


@appointments_bp.route('/<int:id>/complete', methods=['PATCH'])
@admin_required()
@log_action(action="COMPLETE_APPOINTMENT", entity_type="APPOINTMENT")
def complete_appointment(id):
    """Admin marks appointment as completed."""
    appt, errors = AppointmentService.complete_appointment(id)
    if errors:
        return error_response(message="Failed to complete appointment", errors=errors, status_code=400)

    return success_response(data=appt.to_dict(), message="Appointment marked as completed")


@appointments_bp.route('/<int:id>/miss', methods=['PATCH'])
@admin_required()
@log_action(action="MISS_APPOINTMENT", entity_type="APPOINTMENT")
def miss_appointment(id):
    """Admin marks appointment as missed."""
    appt, errors = AppointmentService.miss_appointment(id)
    if errors:
        return error_response(message="Failed to mark missed", errors=errors, status_code=400)

    return success_response(data=appt.to_dict(), message="Appointment marked as missed")


@appointments_bp.route('/<int:id>/cancel', methods=['PATCH'])
@log_action(action="CANCEL_APPOINTMENT", entity_type="APPOINTMENT")
def cancel_appointment(id):
    """Cancel appointment (donor or admin)."""
    user_id = None
    is_admin = False
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user = User.query.get(int(identity))
            if user:
                user_id = user.id
                is_admin = (user.role == 'ADMIN')
    except Exception:
        pass

    data = request.get_json() or {}
    reason = data.get('reason')

    appt, errors = AppointmentService.cancel_appointment(id, user_id=user_id, is_admin=is_admin, reason=reason)
    if errors:
        return error_response(message="Failed to cancel appointment", errors=errors, status_code=400)

    return success_response(data=appt.to_dict(), message="Appointment cancelled successfully")
