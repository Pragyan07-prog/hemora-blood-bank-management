from functools import wraps
from flask import request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.utils.helpers import error_response


def admin_required():
    """
    Decorator to protect routes requiring ADMIN role.
    Verifies valid JWT and checks that current user has ADMIN role.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            from app.models.user import User

            try:
                verify_jwt_in_request()
            except Exception as e:
                return error_response(message="Invalid or missing authentication token", errors=[str(e)], status_code=401)

            identity = get_jwt_identity()
            try:
                user_id = int(identity)
            except (ValueError, TypeError):
                return error_response(message="Invalid user identity in token", status_code=401)

            user = User.query.get(user_id)
            if not user:
                return error_response(message="User not found", status_code=404)

            if not user.is_active:
                return error_response(message="Account is inactive", status_code=403)

            if user.role != 'ADMIN':
                return error_response(message="Admin access required", status_code=403)

            return fn(*args, **kwargs)
        return decorator
    return wrapper


def donor_required():
    """
    Decorator to protect routes requiring DONOR role.
    Verifies valid JWT and checks that current user has DONOR role.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            from app.models.user import User

            try:
                verify_jwt_in_request()
            except Exception as e:
                return error_response(message="Invalid or missing authentication token", errors=[str(e)], status_code=401)

            identity = get_jwt_identity()
            try:
                user_id = int(identity)
            except (ValueError, TypeError):
                return error_response(message="Invalid user identity in token", status_code=401)

            user = User.query.get(user_id)
            if not user:
                return error_response(message="User not found", status_code=404)

            if not user.is_active:
                return error_response(message="Account is inactive", status_code=403)

            if user.role != 'DONOR':
                return error_response(message="Donor access required", status_code=403)

            return fn(*args, **kwargs)
        return decorator
    return wrapper


def active_required():
    """
    Decorator to protect routes requiring an active user (either role).
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            from app.models.user import User

            try:
                verify_jwt_in_request()
            except Exception as e:
                return error_response(message="Invalid or missing authentication token", errors=[str(e)], status_code=401)

            identity = get_jwt_identity()
            try:
                user_id = int(identity)
            except (ValueError, TypeError):
                return error_response(message="Invalid user identity in token", status_code=401)

            user = User.query.get(user_id)
            if not user:
                return error_response(message="User not found", status_code=404)

            if not user.is_active:
                return error_response(message="Account is inactive", status_code=403)

            return fn(*args, **kwargs)
        return decorator
    return wrapper


def log_action(action, entity_type="GENERAL"):
    """
    Decorator to log actions into AuditLog.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            from app.models.audit_log import AuditLog
            from app.extensions import db

            # Get user identity if present
            user_id = None
            try:
                verify_jwt_in_request(optional=True)
                identity = get_jwt_identity()
                if identity is not None:
                    user_id = int(identity)
            except Exception:
                pass

            response = fn(*args, **kwargs)

            # Record audit log
            try:
                ip_addr = request.remote_addr or request.headers.get('X-Forwarded-For', '')
                user_agent = request.headers.get('User-Agent', '')[:255]
                log_entry = AuditLog(
                    user_id=user_id,
                    action=action,
                    entity_type=entity_type,
                    entity_id=str(kwargs.get('id', '')) if 'id' in kwargs else None,
                    ip_address=ip_addr,
                    user_agent=user_agent
                )
                db.session.add(log_entry)
                db.session.commit()
            except Exception:
                db.session.rollback()

            return response
        return decorator
    return wrapper
