from datetime import datetime
from app.extensions import db
from app.models.blood_inventory import BloodInventory, InventoryTransaction
from app.utils.validators import VALID_BLOOD_GROUPS, VALID_COMPONENTS


class InventoryService:
    @staticmethod
    def get_or_create_inventory(blood_group, component='WHOLE_BLOOD'):
        """Retrieve existing inventory record or initialize a new row."""
        blood_group = blood_group.strip().upper()
        component = component.strip().upper()

        inventory = BloodInventory.query.filter_by(
            blood_group=blood_group,
            component=component
        ).first()

        if not inventory:
            inventory = BloodInventory(
                blood_group=blood_group,
                component=component,
                total_units=0,
                available_units=0,
                reserved_units=0,
                issued_units=0
            )
            db.session.add(inventory)
            db.session.flush()

        return inventory

    @staticmethod
    def add_units(blood_group, component, units, performed_by=None, reference_id=None, reference_type='MANUAL', notes=None):
        """
        Add units to inventory and log transaction.
        """
        if units <= 0:
            return None, ["Units must be greater than zero"]

        inventory = InventoryService.get_or_create_inventory(blood_group, component)
        prev_available = inventory.available_units

        inventory.total_units += units
        inventory.available_units += units
        inventory.last_updated = datetime.utcnow()
        if performed_by:
            inventory.updated_by = performed_by

        tx = InventoryTransaction(
            inventory_id=inventory.id,
            transaction_type='ADD',
            units=units,
            previous_available=prev_available,
            new_available=inventory.available_units,
            reference_id=str(reference_id) if reference_id else None,
            reference_type=reference_type,
            notes=notes,
            performed_by=performed_by
        )
        db.session.add(tx)
        db.session.commit()

        return inventory, None

    @staticmethod
    def reserve_units(blood_group, component, units, reference_id=None, reference_type='REQUEST', performed_by=None, notes=None):
        """
        Reserve units for an approved request. Prevents negative inventory.
        """
        if units <= 0:
            return None, ["Units must be greater than zero"]

        inventory = InventoryService.get_or_create_inventory(blood_group, component)
        if inventory.available_units < units:
            return None, [f"Insufficient units available for {blood_group} ({component}). Available: {inventory.available_units}, Requested: {units}"]

        prev_available = inventory.available_units
        inventory.available_units -= units
        inventory.reserved_units += units
        inventory.last_updated = datetime.utcnow()
        if performed_by:
            inventory.updated_by = performed_by

        tx = InventoryTransaction(
            inventory_id=inventory.id,
            transaction_type='RESERVE',
            units=units,
            previous_available=prev_available,
            new_available=inventory.available_units,
            reference_id=str(reference_id) if reference_id else None,
            reference_type=reference_type,
            notes=notes,
            performed_by=performed_by
        )
        db.session.add(tx)
        db.session.commit()

        return inventory, None

    @staticmethod
    def issue_units(blood_group, component, units, reference_id=None, reference_type='REQUEST', performed_by=None, from_reserved=False, notes=None):
        """
        Issue units from inventory.
        If from_reserved=True, deducts from reserved units.
        Otherwise deducts directly from available units.
        """
        if units <= 0:
            return None, ["Units must be greater than zero"]

        inventory = InventoryService.get_or_create_inventory(blood_group, component)
        prev_available = inventory.available_units

        if from_reserved:
            if inventory.reserved_units < units:
                return None, [f"Insufficient reserved units. Reserved: {inventory.reserved_units}, Needed: {units}"]
            inventory.reserved_units -= units
            inventory.issued_units += units
        else:
            if inventory.available_units < units:
                return None, [f"Insufficient available units. Available: {inventory.available_units}, Needed: {units}"]
            inventory.available_units -= units
            inventory.issued_units += units

        inventory.last_updated = datetime.utcnow()
        if performed_by:
            inventory.updated_by = performed_by

        tx = InventoryTransaction(
            inventory_id=inventory.id,
            transaction_type='ISSUE',
            units=units,
            previous_available=prev_available,
            new_available=inventory.available_units,
            reference_id=str(reference_id) if reference_id else None,
            reference_type=reference_type,
            notes=notes,
            performed_by=performed_by
        )
        db.session.add(tx)
        db.session.commit()

        return inventory, None

    @staticmethod
    def return_units(blood_group, component, units, reference_id=None, reference_type='REQUEST', performed_by=None, notes=None):
        """
        Return unused units back into available inventory.
        """
        if units <= 0:
            return None, ["Units must be greater than zero"]

        inventory = InventoryService.get_or_create_inventory(blood_group, component)
        prev_available = inventory.available_units

        inventory.available_units += units
        if inventory.issued_units >= units:
            inventory.issued_units -= units

        inventory.last_updated = datetime.utcnow()
        if performed_by:
            inventory.updated_by = performed_by

        tx = InventoryTransaction(
            inventory_id=inventory.id,
            transaction_type='RETURN',
            units=units,
            previous_available=prev_available,
            new_available=inventory.available_units,
            reference_id=str(reference_id) if reference_id else None,
            reference_type=reference_type,
            notes=notes,
            performed_by=performed_by
        )
        db.session.add(tx)
        db.session.commit()

        return inventory, None

    @staticmethod
    def adjust_units(blood_group, component, new_available, performed_by=None, notes=None):
        """
        Manually adjust available units (audit/stock count adjustment).
        """
        if new_available < 0:
            return None, ["Inventory units cannot be negative"]

        inventory = InventoryService.get_or_create_inventory(blood_group, component)
        prev_available = inventory.available_units
        difference = new_available - prev_available

        inventory.available_units = new_available
        inventory.total_units = inventory.available_units + inventory.reserved_units + inventory.issued_units
        inventory.last_updated = datetime.utcnow()
        if performed_by:
            inventory.updated_by = performed_by

        tx = InventoryTransaction(
            inventory_id=inventory.id,
            transaction_type='ADJUST',
            units=difference,
            previous_available=prev_available,
            new_available=new_available,
            reference_id=None,
            reference_type='MANUAL_AUDIT',
            notes=notes or f"Manual adjustment from {prev_available} to {new_available}",
            performed_by=performed_by
        )
        db.session.add(tx)
        db.session.commit()

        return inventory, None

    @staticmethod
    def get_available_units(blood_group, component='WHOLE_BLOOD'):
        """Get currently available units for blood group and component."""
        inventory = BloodInventory.query.filter_by(
            blood_group=blood_group.strip().upper(),
            component=component.strip().upper()
        ).first()
        return inventory.available_units if inventory else 0

    @staticmethod
    def check_availability(blood_group, component, units):
        """Check if requested units are available."""
        available = InventoryService.get_available_units(blood_group, component)
        return available >= units

    @staticmethod
    def get_low_stock_alerts(threshold=5):
        """Return inventory items where available units <= threshold."""
        low_stock = BloodInventory.query.filter(
            BloodInventory.available_units <= threshold
        ).all()
        return [
            {
                "blood_group": inv.blood_group,
                "component": inv.component,
                "available_units": inv.available_units,
                "threshold": threshold,
                "status": "CRITICAL" if inv.available_units <= 2 else "LOW"
            }
            for inv in low_stock
        ]

    @staticmethod
    def get_expiry_alerts():
        """
        Blood inventory tracks aggregate stock.
        Return urgent inventory alerts (critical low stock < 3 units).
        """
        critical_items = BloodInventory.query.filter(
            BloodInventory.available_units < 3
        ).all()
        return [
            {
                "blood_group": item.blood_group,
                "component": item.component,
                "available_units": item.available_units,
                "message": f"Critical stock: Only {item.available_units} units of {item.blood_group} ({item.component}) remaining."
            }
            for item in critical_items
        ]
