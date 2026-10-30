from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.services.auth_service import AuthService
from app.utils.helpers import success_response, error_response
from app.utils.decorators import log_action

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
@log_action(action="USER_REGISTER", entity_type="USER")
def register():
    """Register a new donor account."""
    data = request.get_json() or {}
    result, errors = AuthService.register_donor(data)
    if errors:
        return error_response(message="Registration failed", errors=errors, status_code=400)

    return success_response(data=result, message="Registration successful", status_code=201)


@auth_bp.route('/login', methods=['POST'])
@log_action(action="USER_LOGIN", entity_type="USER")
def login():
    """Login with email and password."""
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    result, errors = AuthService.authenticate_user(email, password)
    if errors:
        return error_response(message="Authentication failed", errors=errors, status_code=401)

    return success_response(data=result, message="Login successful")


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using a valid refresh token."""
    identity = get_jwt_identity()
    result, errors = AuthService.refresh_access_token(int(identity))
    if errors:
        return error_response(message="Token refresh failed", errors=errors, status_code=401)

    return success_response(data=result, message="Token refreshed successfully")


@auth_bp.route('/logout', methods=['POST'])
@jwt_required(verify_type=False)
def logout():
    """Logout current user and revoke JWT token."""
    jwt_data = get_jwt()
    jti = jwt_data.get("jti")
    if jti:
        AuthService.revoke_token(jti)
    return success_response(message="Successfully logged out")


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """Get current user information and profile."""
    identity = get_jwt_identity()
    user_id = int(identity)
    profile, errors = AuthService.get_user_profile(user_id)
    if errors:
        return error_response(message="Failed to fetch profile", errors=errors, status_code=404)

    return success_response(data=profile, message="Profile retrieved successfully")
