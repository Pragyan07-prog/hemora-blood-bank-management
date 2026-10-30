from datetime import datetime
from app.extensions import db
from app.utils.helpers import format_datetime


class BloodInventory(db.Model):
    __tablename__ = 'blood_inventories'

    id = db.Column(db.Integer, primary_key=True)
    blood_group = db.Column(db.String(5), nullable=False, index=True)
    component = db.Column(db.String(30), nullable=False, default='WHOLE_BLOOD', index=True)
    total_units = db.Column(db.Integer, default=0, nullable=False)
    available_units = db.Column(db.Integer, default=0, nullable=False)
    reserved_units = db.Column(db.Integer, default=0, nullable=False)
    issued_units = db.Column(db.Integer, default=0, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    updated_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)

    __table_args__ = (
        db.UniqueConstraint('blood_group', 'component', name='uq_blood_group_component'),
    )

    # Relationships
    transactions = db.relationship('InventoryTransaction', back_populates='inventory', cascade='all, delete-orphan', order_by='desc(InventoryTransaction.created_at)')
    updater = db.relationship('User', foreign_keys=[updated_by])

    def to_dict(self, include_recent_transactions=False):
        """Serialize blood inventory row."""
        data = {
            'id': self.id,
            'blood_group': self.blood_group,
            'component': self.component,
            'total_units': self.total_units,
            'available_units': self.available_units,
            'reserved_units': self.reserved_units,
            'issued_units': self.issued_units,
            'last_updated': format_datetime(self.last_updated),
            'updated_by': self.updated_by
        }
        if include_recent_transactions:
            data['recent_transactions'] = [t.to_dict() for t in self.transactions[:5]]
        return data

    def __repr__(self):
        return f"<BloodInventory {self.blood_group} - {self.component}: {self.available_units} units>"


class InventoryTransaction(db.Model):
    __tablename__ = 'inventory_transactions'

    id = db.Column(db.Integer, primary_key=True)
    inventory_id = db.Column(db.Integer, db.ForeignKey('blood_inventories.id', ondelete='CASCADE'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # ADD, RESERVE, ISSUE, RETURN, EXPIRE, ADJUST
    units = db.Column(db.Integer, nullable=False)
    previous_available = db.Column(db.Integer, nullable=False)
    new_available = db.Column(db.Integer, nullable=False)
    reference_id = db.Column(db.String(100), nullable=True)
    reference_type = db.Column(db.String(50), nullable=True)  # 'DONATION', 'REQUEST', 'MANUAL', 'AUDIT'
    notes = db.Column(db.Text, nullable=True)
    performed_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    inventory = db.relationship('BloodInventory', back_populates='transactions')
    performer = db.relationship('User', foreign_keys=[performed_by])

    def to_dict(self):
        """Serialize inventory transaction."""
        return {
            'id': self.id,
            'inventory_id': self.inventory_id,
            'blood_group': self.inventory.blood_group if self.inventory else None,
            'component': self.inventory.component if self.inventory else None,
            'transaction_type': self.transaction_type,
            'units': self.units,
            'previous_available': self.previous_available,
            'new_available': self.new_available,
            'reference_id': self.reference_id,
            'reference_type': self.reference_type,
            'notes': self.notes,
            'performed_by': self.performed_by,
            'performer_email': self.performer.email if self.performer else None,
            'created_at': format_datetime(self.created_at)
        }

    def __repr__(self):
        return f"<InventoryTransaction {self.transaction_type} {self.units} units (Inv #{self.inventory_id})>"
