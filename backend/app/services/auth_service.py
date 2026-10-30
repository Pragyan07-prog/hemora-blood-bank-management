from datetime import datetime, date
from flask_jwt_extended import create_access_token, create_refresh_token
from app.extensions import db, TOKEN_BLOCKLIST
from app.models.user import User
from app.models.donor import Donor
from app.models.notification import Notification
from app.utils.validators import (
    validate_email,
    validate_password,
    validate_blood_group,
    validate_phone,
    parse_date
)


class AuthService:
    @staticmethod
    def register_donor(data):
        """
        Register a new donor account.
        Validates email uniqueness, password strength, and blood group.
        Creates User + Donor records in a database transaction.
        """
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        full_name = (data.get('full_name') or '').strip()
        blood_group = (data.get('blood_group') or '').strip().upper()
        phone = (data.get('phone') or '').strip()
        dob_raw = data.get('date_of_birth')
        gender = (data.get('gender') or '').strip()
        city = (data.get('city') or '').strip()
        state = (data.get('state') or '').strip()
        address = (data.get('address') or '').strip()
        emergency_contact = (data.get('emergency_contact') or '').strip()
        emergency_phone = (data.get('emergency_phone') or '').strip()

        errors = []
        if not validate_email(email):
            errors.append("A valid email address is required")
        if not validate_password(password):
            errors.append("Password must be at least 8 characters long")
        if not full_name:
            errors.append("Full name is required")
        if not validate_blood_group(blood_group):
            errors.append("Valid blood group is required (A+, A-, B+, B-, AB+, AB-, O+, O-)")
        if not phone:
            errors.append("Contact phone is required")
        if not dob_raw:
            errors.append("Date of birth is required")
        if not gender:
            errors.append("Gender is required")
        if not city:
            errors.append("City is required")

        dob = parse_date(dob_raw)
        if dob_raw and not dob:
            errors.append("Date of birth must be in YYYY-MM-DD format")

        if errors:
            return None, errors

        # Check email uniqueness
        if User.query.filter_by(email=email).first():
            return None, ["An account with this email already exists"]

        try:
            # Create user
            user = User(
                email=email,
                role='DONOR',
                is_active=True,
                last_login=datetime.utcnow()
            )
            user.set_password(password)
            db.session.add(user)
            db.session.flush()

            # Create donor profile
            donor = Donor(
                user_id=user.id,
                full_name=full_name,
                blood_group=blood_group,
                phone=phone,
                date_of_birth=dob,
                gender=gender,
                city=city,
                state=state,
                address=address,
                emergency_contact=emergency_contact,
                emergency_phone=emergency_phone,
                is_eligible=True,
                total_donations=0
            )
            db.session.add(donor)

            # Welcome notification
            welcome_notif = Notification(
                recipient_id=user.id,
                title="Welcome to HEMORA!",
                message=f"Welcome {full_name}! Thank you for joining our community of blood donors.",
                notification_type="SYSTEM"
            )
            db.session.add(welcome_notif)

            db.session.commit()

            # Generate tokens (identity as string for Flask-JWT-Extended)
            access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
            refresh_token = create_refresh_token(identity=str(user.id), additional_claims={"role": user.role})

            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": user.to_dict(include_donor=True)
            }, None

        except Exception as e:
            db.session.rollback()
            return None, [f"Failed to register user: {str(e)}"]

    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticate user credentials and generate tokens.
        """
        if not email or not password:
            return None, ["Email and password are required"]

        user = User.query.filter_by(email=email.strip().lower()).first()
        if not user or not user.check_password(password):
            return None, ["Invalid email or password"]

        if not user.is_active:
            return None, ["Account is deactivated. Please contact support."]

        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()

        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
        refresh_token = create_refresh_token(identity=str(user.id), additional_claims={"role": user.role})

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "role": user.role,
            "user": user.to_dict(include_donor=True)
        }, None

    @staticmethod
    def refresh_access_token(user_id):
        """
        Issue a new access token from refresh token identity.
        """
        user = User.query.get(user_id)
        if not user or not user.is_active:
            return None, ["User inactive or not found"]

        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})
        return {"access_token": access_token}, None

    @staticmethod
    def revoke_token(jti):
        """
        Add token JTI to blocklist.
        """
        TOKEN_BLOCKLIST.add(jti)
        return True

    @staticmethod
    def get_user_profile(user_id):
        """
        Fetch user details including donor profile.
        """
        user = User.query.get(user_id)
        if not user:
            return None, ["User not found"]
        return user.to_dict(include_donor=True), None
