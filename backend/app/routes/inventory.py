from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from app.extensions import db
from app.models.blood_inventory import BloodInventory, InventoryTransaction
from app.services.inventory_service import InventoryService
from app.utils.helpers import success_response, error_response, paginate_query
from app.utils.decorators import admin_required, log_action
from app.utils.validators import VALID_BLOOD_GROUPS, VALID_COMPONENTS

inventory_bp = Blueprint('inventory', __name__)


@inventory_bp.route('/', methods=['GET'])
def list_inventory():
    """
    Public endpoint: Get summary of available units grouped by blood group.
    """
    items = BloodInventory.query.all()
    grouped = {}
    for bg in VALID_BLOOD_GROUPS:
        grouped[bg] = {
            "blood_group": bg,
            "available_units": 0,
            "components": {}
        }

    for item in items:
        if item.blood_group not in grouped:
            grouped[item.blood_group] = {
                "blood_group": item.blood_group,
                "available_units": 0,
                "components": {}
            }
        grouped[item.blood_group]["available_units"] += item.available_units
        grouped[item.blood_group]["components"][item.component] = item.available_units

    return success_response(
        data=list(grouped.values()),
        message="Inventory summary retrieved successfully"
    )


@inventory_bp.route('/details', methods=['GET'])
@admin_required()
def detailed_inventory():
    """
    Admin endpoint: Detailed view of each inventory row.
    """
    items = BloodInventory.query.order_by(BloodInventory.blood_group, BloodInventory.component).all()
    return success_response(
        data=[item.to_dict(include_recent_transactions=True) for item in items],
        message="Detailed inventory retrieved"
    )


@inventory_bp.route('/', methods=['POST'])
@admin_required()
@log_action(action="ADD_INVENTORY_UNITS", entity_type="INVENTORY")
def add_units():
    """
    Admin endpoint: Add blood units to inventory.
    """
    data = request.get_json() or {}
    blood_group = (data.get('blood_group') or '').strip().upper()
    component = (data.get('component') or 'WHOLE_BLOOD').strip().upper()

    try:
        units = int(data.get('units', 0))
    except (ValueError, TypeError):
        units = 0

    if blood_group not in VALID_BLOOD_GROUPS:
        return error_response(message="Invalid blood group", status_code=400)
    if component not in VALID_COMPONENTS:
        return error_response(message="Invalid component", status_code=400)
    if units <= 0:
        return error_response(message="Units must be positive integer", status_code=400)

    admin_id = int(get_jwt_identity())
    notes = data.get('notes')

    inv, errors = InventoryService.add_units(
        blood_group=blood_group,
        component=component,
        units=units,
        performed_by=admin_id,
        reference_type='MANUAL_ADD',
        notes=notes
    )

    if errors:
        return error_response(message="Failed to add units", errors=errors, status_code=400)

    return success_response(data=inv.to_dict(), message="Blood units added successfully", status_code=201)


@inventory_bp.route('/<int:id>', methods=['PUT'])
@admin_required()
@log_action(action="UPDATE_INVENTORY", entity_type="INVENTORY")
def update_inventory_row(id):
    """
    Admin endpoint: Update inventory counts directly.
    """
    inv = BloodInventory.query.get(id)
    if not inv:
        return error_response(message="Inventory record not found", status_code=404)

    data = request.get_json() or {}
    if 'available_units' in data:
        try:
            new_avail = int(data['available_units'])
            if new_avail < 0:
                return error_response(message="Available units cannot be negative", status_code=400)
            admin_id = int(get_jwt_identity())
            inv, errors = InventoryService.adjust_units(
                blood_group=inv.blood_group,
                component=inv.component,
                new_available=new_avail,
                performed_by=admin_id,
                notes=data.get('notes')
            )
            if errors:
                return error_response(message="Failed to update inventory", errors=errors, status_code=400)
        except (ValueError, TypeError):
            return error_response(message="Invalid unit count format", status_code=400)

    return success_response(data=inv.to_dict(), message="Inventory updated successfully")


@inventory_bp.route('/transactions', methods=['GET'])
@admin_required()
def list_transactions():
    """
    Admin endpoint: Paginated list of inventory transactions.
    """
    page = request.args.get('page', 1)
    per_page = request.args.get('per_page', 10)
    tx_type = request.args.get('type')

    query = InventoryTransaction.query
    if tx_type:
        query = query.filter(InventoryTransaction.transaction_type == tx_type.strip().upper())

    query = query.order_by(InventoryTransaction.created_at.desc())
    result = paginate_query(query, page=page, per_page=per_page, serializer=lambda t: t.to_dict())
    return success_response(data=result, message="Transactions retrieved")


@inventory_bp.route('/alerts', methods=['GET'])
@admin_required()
def inventory_alerts():
    """
    Admin endpoint: Low stock and critical inventory alerts.
    """
    low_stock = InventoryService.get_low_stock_alerts(threshold=5)
    expiry = InventoryService.get_expiry_alerts()

    return success_response(
        data={
            "low_stock_alerts": low_stock,
            "expiry_alerts": expiry
        },
        message="Alerts retrieved successfully"
    )


@inventory_bp.route('/adjust', methods=['POST'])
@admin_required()
@log_action(action="MANUAL_INVENTORY_ADJUST", entity_type="INVENTORY")
def adjust_inventory():
    """
    Admin endpoint: Adjust inventory to an absolute count.
    """
    data = request.get_json() or {}
    blood_group = (data.get('blood_group') or '').strip().upper()
    component = (data.get('component') or 'WHOLE_BLOOD').strip().upper()

    try:
        new_available = int(data.get('available_units', 0))
    except (ValueError, TypeError):
        return error_response(message="available_units must be an integer", status_code=400)

    admin_id = int(get_jwt_identity())
    notes = data.get('notes')

    inv, errors = InventoryService.adjust_units(
        blood_group=blood_group,
        component=component,
        new_available=new_available,
        performed_by=admin_id,
        notes=notes
    )

    if errors:
        return error_response(message="Failed to adjust inventory", errors=errors, status_code=400)

    return success_response(data=inv.to_dict(), message="Inventory adjusted successfully")
