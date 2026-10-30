from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.donor import Donor
from app.models.user import User
from app.services.donation_service import DonationService
from app.utils.helpers import success_response, error_response, paginate_query
from app.utils.decorators import admin_required, donor_required, log_action

donations_bp = Blueprint('donations', __name__)


# ---------------------------------------------
# Donor Mine Route (Must appear BEFORE /<int:id>)
# ---------------------------------------------
@donations_bp.route('/mine', methods=['GET'])
@donor_required()
def get_own_donations():
    """Get all donation records for the logged-in donor."""
    user_id = int(get_jwt_identity())
    donor = Donor.query.filter_by(user_id=user_id).first()
    if not donor:
        return error_response(message="Donor profile not found", status_code=404)

    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = DonationService.get_donations(donor_id=donor.id)
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda d: d.to_dict())
    return success_response(data=result, message="Your donation history retrieved")


@donations_bp.route('/', methods=['GET'])
@admin_required()
def list_donations():
    """Admin endpoint: List all donations with optional filters."""
    donor_id = request.args.get('donor_id')
    status = request.args.get('status')
    is_verified = request.args.get('is_verified')
    blood_group = request.args.get('blood_group')
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = DonationService.get_donations(
        donor_id=int(donor_id) if donor_id else None,
        status=status,
        is_verified=is_verified,
        blood_group=blood_group
    )
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda d: d.to_dict())
    return success_response(data=result, message="Donations retrieved successfully")


@donations_bp.route('/', methods=['POST'])
@admin_required()
@log_action(action="RECORD_DONATION", entity_type="DONATION")
def record_donation():
    """Admin endpoint: Record a new blood donation."""
    data = request.get_json() or {}
    donation, errors = DonationService.record_donation(data)
    if errors:
        return error_response(message="Failed to record donation", errors=errors, status_code=400)

    return success_response(data=donation.to_dict(), message="Donation recorded successfully", status_code=201)


@donations_bp.route('/<int:id>', methods=['GET'])
def get_donation(id):
    """Retrieve details of a single donation."""
    donation = DonationService.get_donation_by_id(id)
    if not donation:
        return error_response(message="Donation not found", status_code=404)

    return success_response(data=donation.to_dict(), message="Donation details retrieved")


@donations_bp.route('/<int:id>/verify', methods=['PATCH'])
@admin_required()
@log_action(action="VERIFY_DONATION", entity_type="DONATION")
def verify_donation(id):
    """
    Admin verifies a donation, updating donor stats, blood inventory, and issuing a certificate.
    """
    admin_id = int(get_jwt_identity())
    donation, errors = DonationService.verify_donation(id, admin_id=admin_id)
    if errors:
        return error_response(message="Verification failed", errors=errors, status_code=400)

    return success_response(data=donation.to_dict(), message="Donation verified and inventory updated successfully")


@donations_bp.route('/<int:id>/reject', methods=['PATCH'])
@admin_required()
@log_action(action="REJECT_DONATION", entity_type="DONATION")
def reject_donation(id):
    """Admin rejects a donation."""
    admin_id = int(get_jwt_identity())
    data = request.get_json() or {}
    reason = data.get('reason') or "Failed screening criteria"

    donation, errors = DonationService.reject_donation(id, admin_id=admin_id, reason=reason)
    if errors:
        return error_response(message="Rejection failed", errors=errors, status_code=400)

    return success_response(data=donation.to_dict(), message="Donation marked as rejected")
