from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from app.services.donor_service import DonorService
from app.utils.helpers import success_response, error_response, paginate_query
from app.utils.decorators import admin_required, donor_required, log_action

donors_bp = Blueprint('donors', __name__)


# ---------------------------------------------
# Donor Self Profile Routes (@donor_required)
# Must appear BEFORE /<int:id> routes
# ---------------------------------------------
@donors_bp.route('/me', methods=['GET'])
@donor_required()
def get_own_profile():
    """Retrieve profile of the currently logged-in donor."""
    user_id = int(get_jwt_identity())
    donor = DonorService.get_donor_by_user_id(user_id)
    if not donor:
        return error_response(message="Donor profile not found", status_code=404)

    return success_response(data=donor.to_dict(include_user=True), message="Profile retrieved")


@donors_bp.route('/me', methods=['PUT'])
@donor_required()
@log_action(action="DONOR_UPDATE_SELF", entity_type="DONOR")
def update_own_profile():
    """Update profile fields for currently logged-in donor."""
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    donor, errors = DonorService.update_own_profile(user_id, data)
    if errors:
        return error_response(message="Failed to update profile", errors=errors, status_code=400)

    return success_response(data=donor.to_dict(include_user=True), message="Profile updated successfully")


# ---------------------------------------------
# Admin Donor Management Routes (@admin_required)
# ---------------------------------------------
@donors_bp.route('/', methods=['GET'])
@admin_required()
def list_donors():
    """List donors with pagination and optional search/filter."""
    search = request.args.get('search')
    blood_group = request.args.get('blood_group')
    city = request.args.get('city')
    is_eligible = request.args.get('is_eligible')
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = DonorService.get_all_donors(
        query_filter=search,
        blood_group=blood_group,
        city=city,
        is_eligible=is_eligible
    )
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda d: d.to_dict(include_user=True))
    return success_response(data=result, message="Donors retrieved successfully")


@donors_bp.route('/<int:id>', methods=['GET'])
@admin_required()
def get_donor(id):
    """Get single donor details including histories."""
    donor = DonorService.get_donor_by_id(id)
    if not donor:
        return error_response(message="Donor not found", status_code=404)

    data = donor.to_dict(include_user=True)
    data['donations'] = [d.to_dict() for d in donor.donations]
    data['appointments'] = [a.to_dict() for a in donor.appointments]
    data['certificates'] = [c.to_dict() for c in donor.certificates]

    return success_response(data=data, message="Donor details retrieved")


@donors_bp.route('/<int:id>', methods=['PUT'])
@admin_required()
@log_action(action="ADMIN_UPDATE_DONOR", entity_type="DONOR")
def update_donor(id):
    """Admin update of donor details."""
    data = request.get_json() or {}
    donor, errors = DonorService.update_donor(id, data)
    if errors:
        return error_response(message="Failed to update donor", errors=errors, status_code=400)

    return success_response(data=donor.to_dict(include_user=True), message="Donor updated successfully")


@donors_bp.route('/<int:id>/activate', methods=['PATCH'])
@admin_required()
@log_action(action="ACTIVATE_DONOR", entity_type="DONOR")
def activate_donor(id):
    """Activate donor and their user account."""
    donor, errors = DonorService.set_donor_status(id, is_active=True)
    if errors:
        return error_response(message="Failed to activate donor", errors=errors, status_code=404)

    return success_response(data=donor.to_dict(), message="Donor activated successfully")


@donors_bp.route('/<int:id>/deactivate', methods=['PATCH'])
@admin_required()
@log_action(action="DEACTIVATE_DONOR", entity_type="DONOR")
def deactivate_donor(id):
    """Deactivate donor and their user account."""
    donor, errors = DonorService.set_donor_status(id, is_active=False)
    if errors:
        return error_response(message="Failed to deactivate donor", errors=errors, status_code=404)

    return success_response(data=donor.to_dict(), message="Donor deactivated successfully")


@donors_bp.route('/<int:id>/donations', methods=['GET'])
@admin_required()
def get_donor_donations(id):
    """Get donor's donation records."""
    donor = DonorService.get_donor_by_id(id)
    if not donor:
        return error_response(message="Donor not found", status_code=404)

    donations = DonorService.get_donor_donations(id)
    return success_response(data=[d.to_dict() for d in donations], message="Donations retrieved")


@donors_bp.route('/<int:id>/appointments', methods=['GET'])
@admin_required()
def get_donor_appointments(id):
    """Get donor's appointment records."""
    donor = DonorService.get_donor_by_id(id)
    if not donor:
        return error_response(message="Donor not found", status_code=404)

    appointments = DonorService.get_donor_appointments(id)
    return success_response(data=[a.to_dict() for a in appointments], message="Appointments retrieved")
