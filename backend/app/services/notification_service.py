from datetime import datetime
from app.extensions import db
from app.models.notification import Notification
from app.models.user import User
from app.models.donor import Donor


class NotificationService:
    @staticmethod
    def send_to_user(user_id, title, message, notification_type='SYSTEM'):
        """Send notification to a specific user."""
        user = User.query.get(user_id)
        if not user:
            return None, ["User not found"]

        notif = Notification(
            recipient_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type
        )
        db.session.add(notif)
        db.session.commit()
        return notif, None

    @staticmethod
    def send_to_all(title, message, notification_type='SYSTEM'):
        """Broadcast notification to all active users."""
        users = User.query.filter_by(is_active=True).all()
        notifications = []
        for user in users:
            notifications.append(
                Notification(
                    recipient_id=user.id,
                    title=title,
                    message=message,
                    notification_type=notification_type
                )
            )
        db.session.bulk_save_objects(notifications)
        db.session.commit()
        return len(notifications)

    @staticmethod
    def send_to_blood_group(blood_group, title, message, notification_type='BLOOD_REQUEST'):
        """Send notification to all donors matching a blood group."""
        donors = Donor.query.join(User, Donor.user_id == User.id).filter(
            Donor.blood_group == blood_group.strip().upper(),
            User.is_active == True
        ).all()

        notifications = []
        for donor in donors:
            notifications.append(
                Notification(
                    recipient_id=donor.user_id,
                    title=title,
                    message=message,
                    notification_type=notification_type
                )
            )
        db.session.bulk_save_objects(notifications)
        db.session.commit()
        return len(notifications)

    @staticmethod
    def send_to_eligible(title, message, notification_type='REMINDER'):
        """Send notification to all eligible donors."""
        donors = Donor.query.join(User, Donor.user_id == User.id).filter(
            Donor.is_eligible == True,
            User.is_active == True
        ).all()

        notifications = []
        for donor in donors:
            notifications.append(
                Notification(
                    recipient_id=donor.user_id,
                    title=title,
                    message=message,
                    notification_type=notification_type
                )
            )
        db.session.bulk_save_objects(notifications)
        db.session.commit()
        return len(notifications)

    @staticmethod
    def send_targeted(target, title, message, notification_type='SYSTEM'):
        """
        Handle targeted sending based on target string format:
        - ALL
        - BLOOD_GROUP:<group>
        - ELIGIBLE
        - USER:<id>
        """
        target = (target or 'ALL').strip()

        if target == 'ALL':
            count = NotificationService.send_to_all(title, message, notification_type)
            return {"recipient_count": count}, None
        elif target == 'ELIGIBLE':
            count = NotificationService.send_to_eligible(title, message, notification_type)
            return {"recipient_count": count}, None
        elif target.startswith('BLOOD_GROUP:'):
            bg = target.split(':', 1)[1]
            count = NotificationService.send_to_blood_group(bg, title, message, notification_type)
            return {"recipient_count": count, "blood_group": bg}, None
        elif target.startswith('USER:'):
            uid = int(target.split(':', 1)[1])
            notif, err = NotificationService.send_to_user(uid, title, message, notification_type)
            if err:
                return None, err
            return {"recipient_count": 1, "user_id": uid}, None
        else:
            return None, ["Invalid target specification. Use ALL, ELIGIBLE, BLOOD_GROUP:<group>, or USER:<id>"]

    @staticmethod
    def get_user_notifications(user_id, unread_only=False):
        """Get notifications for a user."""
        query = Notification.query.filter_by(recipient_id=user_id)
        if unread_only:
            query = query.filter_by(is_read=False)
        return query.order_by(Notification.created_at.desc())

    @staticmethod
    def mark_as_read(notification_id, user_id=None):
        """Mark single notification as read."""
        notif = Notification.query.get(notification_id)
        if not notif:
            return None, ["Notification not found"]

        if user_id and notif.recipient_id != user_id:
            return None, ["Unauthorized to access this notification"]

        notif.is_read = True
        notif.read_at = datetime.utcnow()
        db.session.commit()
        return notif, None

    @staticmethod
    def mark_all_read(user_id):
        """Mark all unread notifications for a user as read."""
        now = datetime.utcnow()
        updated = Notification.query.filter_by(
            recipient_id=user_id,
            is_read=False
        ).update({"is_read": True, "read_at": now})

        db.session.commit()
        return updated
