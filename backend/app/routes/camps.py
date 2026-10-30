from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from app.services.camp_service import CampService
from app.utils.helpers import success_response, error_response, paginate_query
from app.utils.decorators import admin_required, donor_required, log_action

camps_bp = Blueprint('camps', __name__)


# ---------------------------------------------
# Static/Admin routes (Must appear BEFORE /<int:id>)
# ---------------------------------------------
@camps_bp.route('/', methods=['GET'])
def list_published_camps():
    """Public endpoint: List published upcoming blood camps."""
    city = request.args.get('city')
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = CampService.get_camps(status='PUBLISHED', city=city, upcoming_only=False)
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda c: c.to_dict())
    return success_response(data=result, message="Blood camps retrieved successfully")


@camps_bp.route('/all', methods=['GET'])
@admin_required()
def list_all_camps():
    """Admin endpoint: List camps of all statuses (Draft, Published, Completed, Cancelled)."""
    status = request.args.get('status')
    city = request.args.get('city')
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = CampService.get_camps(status=status, city=city, upcoming_only=False)
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda c: c.to_dict())
    return success_response(data=result, message="All blood camps retrieved successfully")


@camps_bp.route('/', methods=['POST'])
@admin_required()
@log_action(action="CREATE_BLOOD_CAMP", entity_type="BLOOD_CAMP")
def create_camp():
    """Admin endpoint: Create a new blood camp."""
    admin_id = int(get_jwt_identity())
    data = request.get_json() or {}

    camp, errors = CampService.create_camp(data, created_by=admin_id)
    if errors:
        return error_response(message="Failed to create blood camp", errors=errors, status_code=400)

    return success_response(data=camp.to_dict(), message="Blood camp created successfully", status_code=201)


@camps_bp.route('/<int:id>', methods=['GET'])
def get_camp(id):
    """Get single blood camp details."""
    camp = CampService.get_camp_by_id(id)
    if not camp:
        return error_response(message="Blood camp not found", status_code=404)

    return success_response(data=camp.to_dict(include_registrations=False), message="Camp details retrieved")


@camps_bp.route('/<int:id>', methods=['PUT'])
@admin_required()
@log_action(action="UPDATE_BLOOD_CAMP", entity_type="BLOOD_CAMP")
def update_camp(id):
    """Admin endpoint: Update blood camp details."""
    data = request.get_json() or {}
    camp, errors = CampService.update_camp(id, data)
    if errors:
        return error_response(message="Failed to update blood camp", errors=errors, status_code=400)

    return success_response(data=camp.to_dict(), message="Blood camp updated successfully")


@camps_bp.route('/<int:id>/publish', methods=['PATCH'])
@admin_required()
@log_action(action="PUBLISH_BLOOD_CAMP", entity_type="BLOOD_CAMP")
def publish_camp(id):
    """Admin endpoint: Publish a draft blood camp."""
    camp, errors = CampService.set_camp_status(id, status='PUBLISHED')
    if errors:
        return error_response(message="Failed to publish camp", errors=errors, status_code=400)

    return success_response(data=camp.to_dict(), message="Blood camp published successfully")


@camps_bp.route('/<int:id>/cancel', methods=['PATCH'])
@admin_required()
@log_action(action="CANCEL_BLOOD_CAMP", entity_type="BLOOD_CAMP")
def cancel_camp(id):
    """Admin endpoint: Cancel a blood camp."""
    camp, errors = CampService.set_camp_status(id, status='CANCELLED')
    if errors:
        return error_response(message="Failed to cancel camp", errors=errors, status_code=400)

    return success_response(data=camp.to_dict(), message="Blood camp cancelled")


@camps_bp.route('/<int:id>/register', methods=['POST'])
@donor_required()
@log_action(action="REGISTER_CAMP", entity_type="CAMP_REGISTRATION")
def register_for_camp(id):
    """Donor endpoint: Register for a published blood camp."""
    user_id = int(get_jwt_identity())
    reg, errors = CampService.register_donor(id, user_id)
    if errors:
        return error_response(message="Registration failed", errors=errors, status_code=400)

    return success_response(data=reg.to_dict(), message="Registered for blood camp successfully", status_code=201)


@camps_bp.route('/<int:id>/register', methods=['DELETE'])
@donor_required()
@log_action(action="CANCEL_CAMP_REGISTRATION", entity_type="CAMP_REGISTRATION")
def cancel_camp_registration(id):
    """Donor endpoint: Cancel blood camp registration."""
    user_id = int(get_jwt_identity())
    success, errors = CampService.cancel_registration(id, user_id)
    if errors:
        return error_response(message="Cancellation failed", errors=errors, status_code=400)

    return success_response(message="Blood camp registration cancelled successfully")


@camps_bp.route('/<int:id>/registrations', methods=['GET'])
@admin_required()
def list_camp_registrations(id):
    """Admin endpoint: View all registered donors for a camp."""
    camp = CampService.get_camp_by_id(id)
    if not camp:
        return error_response(message="Blood camp not found", status_code=404)

    registrations = CampService.get_camp_registrations(id)
    return success_response(
        data=[r.to_dict() for r in registrations],
        message="Camp registrations retrieved successfully"
    )
