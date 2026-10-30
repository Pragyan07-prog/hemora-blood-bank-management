from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models.notification import Notification
from app.services.notification_service import NotificationService
from app.utils.helpers import success_response, error_response, paginate_query
from app.utils.decorators import admin_required, active_required, log_action

notifications_bp = Blueprint('notifications', __name__)


# ---------------------------------------------
# Static/Self routes (Must appear BEFORE /<int:id>)
# ---------------------------------------------
@notifications_bp.route('/mine', methods=['GET'])
@active_required()
def get_my_notifications():
    """Get notifications for current logged in user."""
    user_id = int(get_jwt_identity())
    unread_only = request.args.get('unread_only', 'false').lower() in ('true', '1')
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = NotificationService.get_user_notifications(user_id, unread_only=unread_only)
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda n: n.to_dict())
    return success_response(data=result, message="Notifications retrieved successfully")


@notifications_bp.route('/read-all', methods=['PATCH'])
@active_required()
def mark_all_notifications_read():
    """Mark all unread notifications for current user as read."""
    user_id = int(get_jwt_identity())
    count = NotificationService.mark_all_read(user_id)
    return success_response(data={"marked_read": count}, message=f"{count} notifications marked as read")


@notifications_bp.route('/', methods=['GET'])
@admin_required()
def list_all_notifications():
    """Admin endpoint: View all notifications system-wide."""
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)
    user_id = request.args.get('user_id')

    query = Notification.query
    if user_id:
        query = query.filter_by(recipient_id=int(user_id))

    query = query.order_by(Notification.created_at.desc())
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda n: n.to_dict())
    return success_response(data=result, message="All notifications retrieved successfully")


@notifications_bp.route('/send', methods=['POST'])
@admin_required()
@log_action(action="SEND_BULK_NOTIFICATION", entity_type="NOTIFICATION")
def send_notification():
    """
    Admin endpoint: Send targeted or broadcast notification.
    target: ALL, BLOOD_GROUP:<group>, ELIGIBLE, USER:<id>
    """
    data = request.get_json() or {}
    target = data.get('target', 'ALL')
    title = (data.get('title') or '').strip()
    message = (data.get('message') or '').strip()
    notification_type = data.get('notification_type', 'SYSTEM')

    if not title or not message:
        return error_response(message="Title and message are required", status_code=400)

    result, errors = NotificationService.send_targeted(
        target=target,
        title=title,
        message=message,
        notification_type=notification_type
    )

    if errors:
        return error_response(message="Failed to send notification", errors=errors, status_code=400)

    return success_response(data=result, message="Notifications sent successfully", status_code=201)


@notifications_bp.route('/<int:id>/read', methods=['PATCH'])
@active_required()
def mark_single_notification_read(id):
    """Mark single notification as read."""
    user_id = int(get_jwt_identity())
    notif, errors = NotificationService.mark_as_read(id, user_id=user_id)
    if errors:
        return error_response(message="Failed to update notification", errors=errors, status_code=404)

    return success_response(data=notif.to_dict(), message="Notification marked as read")
