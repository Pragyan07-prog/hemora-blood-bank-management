import io
from flask import Blueprint, request, send_file
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.models.certificate import Certificate
from app.models.donor import Donor
from app.models.user import User
from app.services.certificate_service import CertificateService
from app.utils.helpers import success_response, error_response, paginate_query
from app.utils.decorators import admin_required, donor_required, log_action

certificates_bp = Blueprint('certificates', __name__)


# -------------------------------------------------------------
# Public & Self Routes (Must appear BEFORE /<int:id>)
# -------------------------------------------------------------
@certificates_bp.route('/verify/<string:certificate_number>', methods=['GET'])
def verify_certificate(certificate_number):
    """Public endpoint: Verify certificate authenticity by its unique code."""
    cert = CertificateService.verify_certificate(certificate_number)
    if not cert:
        return error_response(message="Certificate is invalid or does not exist", status_code=404)

    return success_response(
        data=cert.to_dict(),
        message="Certificate is valid and authentic"
    )


@certificates_bp.route('/mine', methods=['GET'])
@donor_required()
def get_own_certificates():
    """Get certificates issued to the logged-in donor."""
    user_id = int(get_jwt_identity())
    donor = Donor.query.filter_by(user_id=user_id).first()
    if not donor:
        return error_response(message="Donor profile not found", status_code=404)

    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)

    query = Certificate.query.filter_by(donor_id=donor.id, is_valid=True).order_by(Certificate.issued_date.desc())
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda c: c.to_dict())
    return success_response(data=result, message="Your certificates retrieved successfully")


@certificates_bp.route('/', methods=['GET'])
@admin_required()
def list_certificates():
    """Admin endpoint: List all certificates issued."""
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)
    donor_id = request.args.get('donor_id')

    query = Certificate.query
    if donor_id:
        query = query.filter_by(donor_id=int(donor_id))

    query = query.order_by(Certificate.issued_date.desc(), Certificate.created_at.desc())
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda c: c.to_dict())
    return success_response(data=result, message="Certificates retrieved successfully")


@certificates_bp.route('/generate/<int:donation_id>', methods=['POST'])
@admin_required()
@log_action(action="GENERATE_CERTIFICATE", entity_type="CERTIFICATE")
def generate_certificate(donation_id):
    """Admin endpoint: Manually trigger certificate generation for a donation."""
    admin_id = int(get_jwt_identity())
    cert, errors = CertificateService.generate_certificate(donation_id, admin_id=admin_id)
    if errors:
        return error_response(message="Failed to generate certificate", errors=errors, status_code=400)

    return success_response(data=cert.to_dict(), message="Certificate generated successfully", status_code=201)


@certificates_bp.route('/<int:id>', methods=['GET'])
def get_certificate_details(id):
    """Get certificate details (accessible by owner or admin)."""
    cert = CertificateService.get_certificate_by_id(id)
    if not cert:
        return error_response(message="Certificate not found", status_code=404)

    # Check permission
    try:
        verify_jwt_in_request()
        identity = int(get_jwt_identity())
        user = User.query.get(identity)
        if user and user.role != 'ADMIN':
            donor = Donor.query.filter_by(user_id=user.id).first()
            if not donor or donor.id != cert.donor_id:
                return error_response(message="Unauthorized to view this certificate", status_code=403)
    except Exception:
        return error_response(message="Authentication required", status_code=401)

    return success_response(data=cert.to_dict(), message="Certificate details retrieved")


@certificates_bp.route('/<int:id>/download', methods=['GET'])
def download_certificate_pdf(id):
    """Download certificate as a high-quality PDF document."""
    cert = CertificateService.get_certificate_by_id(id)
    if not cert:
        return error_response(message="Certificate not found", status_code=404)

    # Permission check
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user = User.query.get(int(identity))
            if user and user.role != 'ADMIN':
                donor = Donor.query.filter_by(user_id=user.id).first()
                if not donor or donor.id != cert.donor_id:
                    return error_response(message="Unauthorized to download this certificate", status_code=403)
    except Exception:
        pass

    pdf_bytes = CertificateService.generate_pdf(cert)

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"Certificate_{cert.certificate_number}.pdf"
    )
