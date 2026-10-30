from flask import Blueprint, request
from app.services.analytics_service import AnalyticsService
from app.utils.helpers import success_response
from app.utils.decorators import admin_required

analytics_bp = Blueprint('analytics', __name__)


@analytics_bp.route('/dashboard', methods=['GET'])
@admin_required()
def dashboard_stats():
    """Main dashboard metrics."""
    stats = AnalyticsService.get_dashboard_stats()
    return success_response(data=stats, message="Dashboard statistics retrieved successfully")


@analytics_bp.route('/blood-groups', methods=['GET'])
@admin_required()
def blood_groups_distribution():
    """Donor distribution by blood group."""
    data = AnalyticsService.get_blood_group_distribution()
    return success_response(data=data, message="Blood group distribution retrieved")


@analytics_bp.route('/monthly-donations', methods=['GET'])
@admin_required()
def monthly_donations():
    """Monthly completed donation count for past 12 months."""
    months = request.args.get('months', 12)
    try:
        months = int(months)
    except (ValueError, TypeError):
        months = 12

    data = AnalyticsService.get_monthly_donations(months=months)
    return success_response(data=data, message="Monthly donation trends retrieved")


@analytics_bp.route('/inventory-distribution', methods=['GET'])
@admin_required()
def inventory_distribution():
    """Blood inventory breakdown by blood group and component."""
    data = AnalyticsService.get_inventory_distribution()
    return success_response(data=data, message="Inventory distribution retrieved")


@analytics_bp.route('/request-trends', methods=['GET'])
@admin_required()
def request_trends():
    """Request submission and fulfillment trend for past 6 months."""
    months = request.args.get('months', 6)
    try:
        months = int(months)
    except (ValueError, TypeError):
        months = 6

    data = AnalyticsService.get_request_trends(months=months)
    return success_response(data=data, message="Request trends retrieved")


@analytics_bp.route('/request-status', methods=['GET'])
@admin_required()
def request_status_distribution():
    """Request count breakdown by status."""
    data = AnalyticsService.get_request_status_distribution()
    return success_response(data=data, message="Request status distribution retrieved")
