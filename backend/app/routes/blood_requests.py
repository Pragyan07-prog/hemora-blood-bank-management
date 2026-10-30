from flask import Blueprint, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User
from app.services.request_service import RequestService
from app.utils.helpers import success_response, error_response, paginate_query
from app.utils.decorators import admin_required, donor_required, log_action

blood_requests_bp = Blueprint('blood_requests', __name__)


# ---------------------------------------------
# Donor Mine Route (Must appear BEFORE /<int:id>)
# ---------------------------------------------
@blood_requests_bp.route('/mine', methods=['GET'])
@donor_required()
def get_own_requests():
    """Get all blood requests created by the current donor."""
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = RequestService.get_requests(requester_id=user_id)
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda r: r.to_dict())
    return success_response(data=result, message="Your requests retrieved successfully")


@blood_requests_bp.route('/', methods=['GET'])
def list_requests():
    """
    List blood requests.
    If authenticated as admin: list all requests with filters.
    If authenticated as donor: list own requests.
    """
    user_id = None
    role = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user = User.query.get(int(identity))
            if user:
                user_id = user.id
                role = user.role
    except Exception:
        pass

    if not user_id:
        return error_response(message="Authentication required to view requests", status_code=401)

    status = request.args.get('status')
    urgency = request.args.get('urgency')
    blood_group = request.args.get('blood_group')
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    if role == 'ADMIN':
        query = RequestService.get_requests(status=status, urgency=urgency, blood_group=blood_group)
    else:
        query = RequestService.get_requests(status=status, urgency=urgency, blood_group=blood_group, requester_id=user_id)

    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda r: r.to_dict())
    return success_response(data=result, message="Requests retrieved successfully")


@blood_requests_bp.route('/', methods=['POST'])
@log_action(action="CREATE_BLOOD_REQUEST", entity_type="BLOOD_REQUEST")
def create_request():
    """
    Create a new blood request. Can be called by authenticated users or guest.
    """
    data = request.get_json() or {}
    requester_id = None

    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            requester_id = int(identity)
    except Exception:
        pass

    req_obj, errors = RequestService.create_request(data, requester_id=requester_id)
    if errors:
        return error_response(message="Failed to create request", errors=errors, status_code=400)

    return success_response(data=req_obj.to_dict(), message="Blood request submitted successfully", status_code=201)


@blood_requests_bp.route('/<int:id>', methods=['GET'])
def get_request_details(id):
    """Retrieve details for a single blood request."""
    req_obj = RequestService.get_request_by_id(id)
    if not req_obj:
        return error_response(message="Blood request not found", status_code=404)

    return success_response(data=req_obj.to_dict(), message="Request details retrieved")


@blood_requests_bp.route('/<int:id>/approve', methods=['PATCH'])
@admin_required()
@log_action(action="APPROVE_BLOOD_REQUEST", entity_type="BLOOD_REQUEST")
def approve_request(id):
    """Admin approves a pending blood request."""
    admin_id = int(get_jwt_identity())
    req_obj, errors = RequestService.approve_request(id, admin_id=admin_id)
    if errors:
        return error_response(message="Approval failed", errors=errors, status_code=400)

    return success_response(data=req_obj.to_dict(), message="Blood request approved successfully")


@blood_requests_bp.route('/<int:id>/reject', methods=['PATCH'])
@admin_required()
@log_action(action="REJECT_BLOOD_REQUEST", entity_type="BLOOD_REQUEST")
def reject_request(id):
    """Admin rejects a blood request with reason."""
    admin_id = int(get_jwt_identity())
    data = request.get_json() or {}
    reason = data.get('reason') or "Request rejected by administrator"

    req_obj, errors = RequestService.reject_request(id, admin_id=admin_id, reason=reason)
    if errors:
        return error_response(message="Rejection failed", errors=errors, status_code=400)

    return success_response(data=req_obj.to_dict(), message="Blood request rejected")


@blood_requests_bp.route('/<int:id>/fulfill', methods=['PATCH'])
@admin_required()
@log_action(action="FULFILL_BLOOD_REQUEST", entity_type="BLOOD_REQUEST")
def fulfill_request(id):
    """
    Admin fulfills blood request, deducting units from blood inventory.
    """
    admin_id = int(get_jwt_identity())
    data = request.get_json() or {}
    units = data.get('units')
    if units is not None:
        try:
            units = int(units)
        except (ValueError, TypeError):
            units = None

    req_obj, errors = RequestService.fulfill_request(id, admin_id=admin_id, units=units)
    if errors:
        return error_response(message="Fulfillment failed", errors=errors, status_code=400)

    return success_response(data=req_obj.to_dict(), message="Blood request fulfilled successfully")


@blood_requests_bp.route('/<int:id>/cancel', methods=['PATCH'])
@log_action(action="CANCEL_BLOOD_REQUEST", entity_type="BLOOD_REQUEST")
def cancel_request(id):
    """Cancel a blood request (by requester or admin)."""
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

    req_obj, errors = RequestService.cancel_request(id, user_id=user_id, is_admin=is_admin)
    if errors:
        return error_response(message="Cancellation failed", errors=errors, status_code=400)

    return success_response(data=req_obj.to_dict(), message="Blood request cancelled")
