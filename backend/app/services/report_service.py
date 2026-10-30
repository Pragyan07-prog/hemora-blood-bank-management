import csv
import io
from datetime import datetime, date
from app.models.donation import Donation
from app.models.blood_inventory import BloodInventory
from app.models.blood_request import BloodRequest
from app.models.donor import Donor
from app.models.blood_camp import BloodCamp
from app.utils.validators import parse_date


class ReportService:
    # -----------------------------
    # CSV GENERATORS
    # -----------------------------
    @staticmethod
    def generate_donations_csv(start_date=None, end_date=None):
        """Export donations within date range to CSV."""
        query = Donation.query
        if start_date:
            d = parse_date(start_date)
            if d:
                query = query.filter(Donation.donation_date >= d)
        if end_date:
            d = parse_date(end_date)
            if d:
                query = query.filter(Donation.donation_date <= d)

        donations = query.order_by(Donation.donation_date.desc()).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Donor Name', 'Blood Group', 'Donation Type', 'Units', 'Center', 'Date', 'Status', 'Verified'])

        for item in donations:
            writer.writerow([
                item.id,
                item.donor.full_name if item.donor else f"Donor #{item.donor_id}",
                item.blood_group,
                item.donation_type,
                item.units_collected,
                item.donation_center,
                item.donation_date,
                item.status,
                'Yes' if item.is_verified else 'No'
            ])

        output.seek(0)
        return output.getvalue()

    @staticmethod
    def generate_inventory_csv():
        """Export current blood inventory to CSV."""
        inventory = BloodInventory.query.order_by(BloodInventory.blood_group, BloodInventory.component).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Blood Group', 'Component', 'Available Units', 'Reserved Units', 'Issued Units', 'Total Units', 'Last Updated'])

        for item in inventory:
            writer.writerow([
                item.id,
                item.blood_group,
                item.component,
                item.available_units,
                item.reserved_units,
                item.issued_units,
                item.total_units,
                item.last_updated.strftime("%Y-%m-%d %H:%M:%S") if item.last_updated else ''
            ])

        output.seek(0)
        return output.getvalue()

    @staticmethod
    def generate_requests_csv(start_date=None, end_date=None):
        """Export blood requests to CSV."""
        query = BloodRequest.query
        if start_date:
            d = parse_date(start_date)
            if d:
                query = query.filter(BloodRequest.required_date >= d)
        if end_date:
            d = parse_date(end_date)
            if d:
                query = query.filter(BloodRequest.required_date <= d)

        requests = query.order_by(BloodRequest.created_at.desc()).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Patient Name', 'Blood Group', 'Component', 'Units Required', 'Units Fulfilled', 'Hospital', 'City', 'Urgency', 'Status', 'Required Date'])

        for r in requests:
            writer.writerow([
                r.id,
                r.patient_name,
                r.blood_group,
                r.component,
                r.units_required,
                r.units_fulfilled,
                r.hospital_name,
                r.hospital_city,
                r.urgency,
                r.status,
                r.required_date
            ])

        output.seek(0)
        return output.getvalue()

    @staticmethod
    def generate_donors_csv(start_date=None, end_date=None):
        """Export donor registrations to CSV."""
        query = Donor.query
        if start_date:
            d = parse_date(start_date)
            if d:
                query = query.filter(Donor.created_at >= datetime.combine(d, datetime.min.time()))
        if end_date:
            d = parse_date(end_date)
            if d:
                query = query.filter(Donor.created_at <= datetime.combine(d, datetime.max.time()))

        donors = query.order_by(Donor.created_at.desc()).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Full Name', 'Email', 'Blood Group', 'Phone', 'City', 'State', 'Eligible', 'Total Donations', 'Registered Date'])

        for d in donors:
            writer.writerow([
                d.id,
                d.full_name,
                d.user.email if d.user else '',
                d.blood_group,
                d.phone,
                d.city,
                d.state or '',
                'Yes' if d.is_eligible else 'No',
                d.total_donations,
                d.created_at.strftime("%Y-%m-%d")
            ])

        output.seek(0)
        return output.getvalue()

    @staticmethod
    def generate_camps_csv():
        """Export blood camps to CSV."""
        camps = BloodCamp.query.order_by(BloodCamp.camp_date.desc()).all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Title', 'Date', 'Time', 'Venue', 'City', 'Capacity', 'Registered', 'Status', 'Organizer', 'Phone'])

        for c in camps:
            writer.writerow([
                c.id,
                c.title,
                c.camp_date,
                f"{c.start_time} - {c.end_time}",
                c.venue,
                c.city,
                c.capacity,
                c.registered_count,
                c.status,
                c.organizer_name,
                c.contact_phone
            ])

        output.seek(0)
        return output.getvalue()

    # -----------------------------
    # PDF GENERATORS (ReportLab)
    # -----------------------------
    @staticmethod
    def _create_report_pdf(title, headers, rows):
        """Helper to create a formatted tabular PDF report."""
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib import colors
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=36,
                leftMargin=36,
                topMargin=36,
                bottomMargin=36
            )

            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'ReportTitle',
                parent=styles['Heading1'],
                fontSize=20,
                leading=24,
                textColor=colors.HexColor('#DC2626')
            )
            subtitle_style = ParagraphStyle(
                'ReportSubtitle',
                parent=styles['Normal'],
                fontSize=10,
                textColor=colors.HexColor('#4B5563')
            )

            story = [
                Paragraph("HEMORA BLOOD BANK MANAGEMENT SYSTEM", title_style),
                Paragraph(f"<b>Report:</b> {title} | Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", subtitle_style),
                Spacer(1, 16)
            ]

            table_data = [headers]
            for row in rows:
                table_data.append([str(c) if c is not None else '' for c in row])

            table = Table(table_data, repeatRows=1)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#DC2626')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 9),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                ('TOPPADDING', (0, 0), (-1, 0), 6),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 8),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F9FAFB')]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))

            story.append(table)
            doc.build(story)

            buffer.seek(0)
            return buffer.getvalue()

        except Exception as e:
            fallback = f"HEMORA REPORT: {title}\nGenerated: {datetime.utcnow().isoformat()}\n\n"
            fallback += "\t".join(headers) + "\n"
            for r in rows:
                fallback += "\t".join([str(x) for x in r]) + "\n"
            return fallback.encode('utf-8')

    @staticmethod
    def generate_donations_pdf(start_date=None, end_date=None):
        query = Donation.query
        if start_date:
            d = parse_date(start_date)
            if d:
                query = query.filter(Donation.donation_date >= d)
        if end_date:
            d = parse_date(end_date)
            if d:
                query = query.filter(Donation.donation_date <= d)

        donations = query.order_by(Donation.donation_date.desc()).all()
        headers = ['ID', 'Donor Name', 'Group', 'Type', 'Units', 'Center', 'Date', 'Status']
        rows = [
            [
                item.id,
                item.donor.full_name if item.donor else f"#{item.donor_id}",
                item.blood_group,
                item.donation_type,
                item.units_collected,
                item.donation_center[:18],
                str(item.donation_date),
                item.status
            ]
            for item in donations
        ]
        return ReportService._create_report_pdf("Donations Summary Report", headers, rows)

    @staticmethod
    def generate_inventory_pdf():
        inventory = BloodInventory.query.order_by(BloodInventory.blood_group, BloodInventory.component).all()
        headers = ['ID', 'Blood Group', 'Component', 'Available', 'Reserved', 'Issued', 'Total']
        rows = [
            [
                inv.id,
                inv.blood_group,
                inv.component,
                inv.available_units,
                inv.reserved_units,
                inv.issued_units,
                inv.total_units
            ]
            for inv in inventory
        ]
        return ReportService._create_report_pdf("Current Blood Inventory Report", headers, rows)

    @staticmethod
    def generate_requests_pdf(start_date=None, end_date=None):
        query = BloodRequest.query
        if start_date:
            d = parse_date(start_date)
            if d:
                query = query.filter(BloodRequest.required_date >= d)
        if end_date:
            d = parse_date(end_date)
            if d:
                query = query.filter(BloodRequest.required_date <= d)

        requests = query.order_by(BloodRequest.created_at.desc()).all()
        headers = ['ID', 'Patient', 'Group', 'Units', 'Hospital', 'City', 'Urgency', 'Status']
        rows = [
            [
                r.id,
                r.patient_name[:16],
                r.blood_group,
                f"{r.units_fulfilled}/{r.units_required}",
                r.hospital_name[:18],
                r.hospital_city,
                r.urgency,
                r.status
            ]
            for r in requests
        ]
        return ReportService._create_report_pdf("Blood Requests Report", headers, rows)

    @staticmethod
    def generate_donors_pdf(start_date=None, end_date=None):
        query = Donor.query
        if start_date:
            d = parse_date(start_date)
            if d:
                query = query.filter(Donor.created_at >= datetime.combine(d, datetime.min.time()))
        if end_date:
            d = parse_date(end_date)
            if d:
                query = query.filter(Donor.created_at <= datetime.combine(d, datetime.max.time()))

        donors = query.order_by(Donor.created_at.desc()).all()
        headers = ['ID', 'Donor Name', 'Blood Group', 'Phone', 'City', 'Eligible', 'Donations']
        rows = [
            [
                d.id,
                d.full_name,
                d.blood_group,
                d.phone,
                d.city,
                'Yes' if d.is_eligible else 'No',
                d.total_donations
            ]
            for d in donors
        ]
        return ReportService._create_report_pdf("Donor Registrations Report", headers, rows)

    @staticmethod
    def generate_camps_pdf():
        camps = BloodCamp.query.order_by(BloodCamp.camp_date.desc()).all()
        headers = ['ID', 'Title', 'Date', 'Venue', 'City', 'Capacity', 'Reg.', 'Status']
        rows = [
            [
                c.id,
                c.title[:20],
                str(c.camp_date),
                c.venue[:18],
                c.city,
                c.capacity,
                c.registered_count,
                c.status
            ]
            for c in camps
        ]
        return ReportService._create_report_pdf("Blood Donation Camps Report", headers, rows)
