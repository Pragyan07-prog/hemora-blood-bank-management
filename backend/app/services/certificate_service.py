import io
from datetime import date, datetime
from app.extensions import db
from app.models.certificate import Certificate, generate_certificate_code
from app.models.donation import Donation
from app.models.donor import Donor


class CertificateService:
    @staticmethod
    def generate_certificate(donation_id, admin_id=None):
        """
        Create a certificate record for a verified donation.
        Idempotent: returns existing certificate if already issued.
        """
        existing = Certificate.query.filter_by(donation_id=donation_id).first()
        if existing:
            return existing, None

        donation = Donation.query.get(donation_id)
        if not donation:
            return None, ["Donation record not found"]

        donor = donation.donor or Donor.query.get(donation.donor_id)
        donor_name = donor.full_name if donor else f"Donor #{donation.donor_id}"

        cert = Certificate(
            donation_id=donation.id,
            donor_id=donation.donor_id,
            certificate_number=generate_certificate_code(),
            issued_date=date.today(),
            donor_name=donor_name,
            blood_group=donation.blood_group,
            donation_date=donation.donation_date,
            donation_center=donation.donation_center,
            units_collected=donation.units_collected,
            is_valid=True
        )

        db.session.add(cert)
        db.session.commit()
        return cert, None

    @staticmethod
    def get_certificate_by_id(cert_id):
        """Fetch certificate by primary key."""
        return Certificate.query.get(cert_id)

    @staticmethod
    def verify_certificate(certificate_number):
        """Public verification of certificate code."""
        cert = Certificate.query.filter_by(
            certificate_number=certificate_number.strip().upper(),
            is_valid=True
        ).first()
        return cert

    @staticmethod
    def generate_pdf(certificate):
        """
        Generate a professional PDF certificate using ReportLab.
        Returns bytes buffer.
        """
        try:
            from reportlab.lib.pagesizes import letter, landscape
            from reportlab.lib import colors
            from reportlab.pdfgen import canvas

            buffer = io.BytesIO()
            # Landscape letter page: 792 x 612 points
            c = canvas.Canvas(buffer, pagesize=landscape(letter))
            width, height = landscape(letter)

            # Draw outer decorative border
            c.setStrokeColor(colors.HexColor("#DC2626"))  # Hemora Red
            c.setLineWidth(5)
            c.rect(25, 25, width - 50, height - 50)

            c.setStrokeColor(colors.HexColor("#991B1B"))  # Dark Crimson inner border
            c.setLineWidth(1.5)
            c.rect(33, 33, width - 66, height - 66)

            # Draw background watermark / subtle accent
            c.setFillColor(colors.HexColor("#FEF2F2"))
            c.rect(35, 35, width - 70, height - 70, fill=1, stroke=0)

            # Header - HEMORA Logo Text
            c.setFont("Helvetica-Bold", 32)
            c.setFillColor(colors.HexColor("#DC2626"))
            c.drawCentredString(width / 2.0, height - 90, "HEMORA BLOOD BANK")

            c.setFont("Helvetica-Bold", 13)
            c.setFillColor(colors.HexColor("#4B5563"))
            c.drawCentredString(width / 2.0, height - 110, "LIFESAVING BLOOD MANAGEMENT SYSTEM")

            # Decorative Divider Line
            c.setStrokeColor(colors.HexColor("#DC2626"))
            c.setLineWidth(2)
            c.line(width / 2.0 - 180, height - 125, width / 2.0 + 180, height - 125)

            # Certificate Title
            c.setFont("Times-BoldItalic", 28)
            c.setFillColor(colors.HexColor("#1F2937"))
            c.drawCentredString(width / 2.0, height - 170, "Certificate of Appreciation")

            # Main Body Presentation Text
            c.setFont("Helvetica", 14)
            c.setFillColor(colors.HexColor("#374151"))
            c.drawCentredString(width / 2.0, height - 210, "This is proudly presented in deep gratitude to")

            # Donor Name
            c.setFont("Helvetica-Bold", 26)
            c.setFillColor(colors.HexColor("#991B1B"))
            c.drawCentredString(width / 2.0, height - 250, certificate.donor_name.upper())

            # Recognition text
            c.setFont("Helvetica", 13)
            c.setFillColor(colors.HexColor("#374151"))
            recognition_text = (
                f"for their selfless contribution and donation of {certificate.units_collected} unit(s) "
                f"of {certificate.blood_group} blood,"
            )
            c.drawCentredString(width / 2.0, height - 285, recognition_text)
            c.drawCentredString(width / 2.0, height - 305, "helping save lives and bringing hope to patients in critical need.")

            # Details Box
            box_y = height - 410
            c.setFillColor(colors.HexColor("#FFFFFF"))
            c.setStrokeColor(colors.HexColor("#E5E7EB"))
            c.roundRect(width / 2.0 - 260, box_y, 520, 80, 8, fill=1, stroke=1)

            c.setFont("Helvetica-Bold", 11)
            c.setFillColor(colors.HexColor("#4B5563"))
            c.drawString(width / 2.0 - 240, box_y + 50, f"Donation Center: {certificate.donation_center}")
            c.drawString(width / 2.0 - 240, box_y + 25, f"Donation Date: {certificate.donation_date}")

            c.drawString(width / 2.0 + 20, box_y + 50, f"Certificate No: {certificate.certificate_number}")
            c.drawString(width / 2.0 + 20, box_y + 25, f"Issue Date: {certificate.issued_date}")

            # Tagline
            c.setFont("Times-Italic", 15)
            c.setFillColor(colors.HexColor("#DC2626"))
            c.drawCentredString(width / 2.0, height - 445, '"Every Drop Counts. Every Life Matters."')

            # Signatures
            sig_y = height - 510
            c.setStrokeColor(colors.HexColor("#9CA3AF"))
            c.setLineWidth(1)
            c.line(90, sig_y, 250, sig_y)
            c.line(width - 250, sig_y, width - 90, sig_y)

            c.setFont("Helvetica", 10)
            c.setFillColor(colors.HexColor("#4B5563"))
            c.drawCentredString(170, sig_y - 15, "Medical Director")
            c.drawCentredString(width - 170, sig_y - 15, "Authorized Officer")

            # Verification notice at footer
            c.setFont("Helvetica", 8)
            c.setFillColor(colors.HexColor("#9CA3AF"))
            c.drawCentredString(width / 2.0, 42, f"Verify authenticity at: /api/certificates/verify/{certificate.certificate_number}")

            c.showPage()
            c.save()

            buffer.seek(0)
            return buffer.getvalue()

        except Exception as e:
            # Fallback simple text buffer if reportlab fails
            fallback = f"HEMORA BLOOD BANK CERTIFICATE\nCertificate Number: {certificate.certificate_number}\nDonor: {certificate.donor_name}\nBlood Group: {certificate.blood_group}\nDate: {certificate.donation_date}\nEvery Drop Counts. Every Life Matters."
            return fallback.encode('utf-8')
