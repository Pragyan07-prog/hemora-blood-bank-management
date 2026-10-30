from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models.user import User
from ..models.audit_log import AuditLog
from ..utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)


def success_response(data=None, message="Success", status=200):
    return jsonify({"success": True, "message": message, "data": data}), status


def error_response(message="Error", errors=None, status=400):
    return jsonify({"success": False, "message": message, "errors": errors or []}), status


@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    role_filter = request.args.get('role')
    status_filter = request.args.get('is_active')

    query = User.query
    if role_filter:
        query = query.filter(User.role == role_filter.upper())
    if status_filter is not None:
        is_active = status_filter.lower() == 'true'
        query = query.filter(User.is_active == is_active)

    pagination = query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    users = []
    for u in pagination.items:
        user_dict = u.to_dict()
        if u.donor_profile:
            user_dict['donor_name'] = u.donor_profile.full_name
            user_dict['blood_group'] = u.donor_profile.blood_group
        users.append(user_dict)

    return success_response({
        "users": users,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page,
        "per_page": per_page
    })


@admin_bp.route('/users/<int:user_id>/activate', methods=['PATCH'])
@admin_required
def activate_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return error_response("Cannot modify your own account status")
    user.is_active = True
    db.session.commit()
    return success_response(user.to_dict(), "User activated successfully")


@admin_bp.route('/users/<int:user_id>/deactivate', methods=['PATCH'])
@admin_required
def deactivate_user(current_user, user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return error_response("Cannot deactivate your own account")
    user.is_active = False
    db.session.commit()
    return success_response(user.to_dict(), "User deactivated successfully")


@admin_bp.route('/audit-logs', methods=['GET'])
@admin_required
def get_audit_logs(current_user):
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)
    entity_type = request.args.get('entity_type')

    query = AuditLog.query
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)

    pagination = query.order_by(AuditLog.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        "logs": [log.to_dict() for log in pagination.items],
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    })


@admin_bp.route('/settings', methods=['GET'])
@admin_required
def get_settings(current_user):
    # Return configurable system settings (can be extended to use a DB table)
    settings = {
        "min_donation_interval_days": 90,
        "plasma_donation_interval_days": 14,
        "low_stock_threshold": 5,
        "expiry_alert_days": 7,
        "max_appointment_days_advance": 30,
        "organization_name": "HEMORA Blood Bank",
        "contact_email": "info@hemora.com",
        "contact_phone": "+1-800-HEMORA-1",
        "address": "123 Healthcare Blvd, Medical District",
        "city": "New York",
        "state": "NY",
        "donation_centers": [
            "HEMORA Main Center - New York",
            "HEMORA Downtown Clinic - New York",
            "HEMORA Medical Plaza - Brooklyn",
            "HEMORA Health Hub - Queens",
            "HEMORA Care Center - Bronx"
        ]
    }
    return success_response(settings)


@admin_bp.route('/settings', methods=['PUT'])
@admin_required
def update_settings(current_user):
    # Placeholder - in production this would persist to a settings table
    data = request.get_json()
    return success_response(data, "Settings updated successfully")


@admin_bp.route('/create-admin', methods=['POST'])
@admin_required
def create_admin(current_user):
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return error_response("Email and password are required")
    
    if User.query.filter_by(email=email).first():
        return error_response("Email already registered", status=409)
    
    if len(password) < 8:
        return error_response("Password must be at least 8 characters")
    
    new_admin = User(email=email, role='ADMIN', is_active=True)
    new_admin.set_password(password)
    db.session.add(new_admin)
    db.session.commit()
    
    return success_response(new_admin.to_dict(), "Admin account created successfully", 201)
