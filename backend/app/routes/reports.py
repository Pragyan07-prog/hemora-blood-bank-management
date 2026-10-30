import io
from flask import Blueprint, request, Response, send_file
from app.services.report_service import ReportService
from app.utils.decorators import admin_required

reports_bp = Blueprint('reports', __name__)


@reports_bp.route('/donations', methods=['GET'])
@admin_required()
def donation_report():
    """Generate donation report in CSV or PDF format."""
    fmt = request.args.get('format', 'csv').lower()
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if fmt == 'pdf':
        pdf_bytes = ReportService.generate_donations_pdf(start_date=start_date, end_date=end_date)
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name="HEMORA_Donations_Report.pdf"
        )
    else:
        csv_data = ReportService.generate_donations_csv(start_date=start_date, end_date=end_date)
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=HEMORA_Donations_Report.csv'}
        )


@reports_bp.route('/inventory', methods=['GET'])
@admin_required()
def inventory_report():
    """Generate blood inventory report in CSV or PDF format."""
    fmt = request.args.get('format', 'csv').lower()

    if fmt == 'pdf':
        pdf_bytes = ReportService.generate_inventory_pdf()
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name="HEMORA_Inventory_Report.pdf"
        )
    else:
        csv_data = ReportService.generate_inventory_csv()
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=HEMORA_Inventory_Report.csv'}
        )


@reports_bp.route('/requests', methods=['GET'])
@admin_required()
def requests_report():
    """Generate blood requests report in CSV or PDF format."""
    fmt = request.args.get('format', 'csv').lower()
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if fmt == 'pdf':
        pdf_bytes = ReportService.generate_requests_pdf(start_date=start_date, end_date=end_date)
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name="HEMORA_Blood_Requests_Report.pdf"
        )
    else:
        csv_data = ReportService.generate_requests_csv(start_date=start_date, end_date=end_date)
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=HEMORA_Blood_Requests_Report.csv'}
        )


@reports_bp.route('/donors', methods=['GET'])
@admin_required()
def donors_report():
    """Generate donor registration report in CSV or PDF format."""
    fmt = request.args.get('format', 'csv').lower()
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if fmt == 'pdf':
        pdf_bytes = ReportService.generate_donors_pdf(start_date=start_date, end_date=end_date)
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name="HEMORA_Donors_Report.pdf"
        )
    else:
        csv_data = ReportService.generate_donors_csv(start_date=start_date, end_date=end_date)
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=HEMORA_Donors_Report.csv'}
        )


@reports_bp.route('/camps', methods=['GET'])
@admin_required()
def camps_report():
    """Generate blood donation camps report in CSV or PDF format."""
    fmt = request.args.get('format', 'csv').lower()

    if fmt == 'pdf':
        pdf_bytes = ReportService.generate_camps_pdf()
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name="HEMORA_Camps_Report.pdf"
        )
    else:
        csv_data = ReportService.generate_camps_csv()
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=HEMORA_Camps_Report.csv'}
        )
