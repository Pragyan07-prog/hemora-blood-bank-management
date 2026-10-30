"""
HEMORA Test Configuration
"""
import pytest
import os
os.environ['FLASK_ENV'] = 'testing'

from app import create_app
from app.extensions import db as _db


@pytest.fixture(scope='session')
def app():
    """Create Flask app for testing with in-memory SQLite."""
    app = create_app('testing')
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture(scope='session')
def client(app):
    return app.test_client()


@pytest.fixture(scope='session')
def db(app):
    return _db


@pytest.fixture(scope='function')
def admin_token(client, db):
    """Create admin user and return auth token."""
    from app.models.user import User
    
    # Clean up any existing admin
    User.query.filter_by(email='testadmin@hemora.com').delete()
    db.session.commit()
    
    admin = User(email='testadmin@hemora.com', role='ADMIN', is_active=True)
    admin.set_password('Admin@123')
    db.session.add(admin)
    db.session.commit()
    
    resp = client.post('/api/auth/login', json={
        'email': 'testadmin@hemora.com',
        'password': 'Admin@123'
    })
    return resp.json['data']['access_token']


@pytest.fixture(scope='function')
def donor_token(client, db):
    """Create donor user and return auth token."""
    from app.models.user import User
    from app.models.donor import Donor
    from datetime import date
    
    # Clean up
    existing_user = User.query.filter_by(email='testdonor@example.com').first()
    if existing_user:
        Donor.query.filter_by(user_id=existing_user.id).delete()
        User.query.filter_by(email='testdonor@example.com').delete()
        db.session.commit()
    
    user = User(email='testdonor@example.com', role='DONOR', is_active=True)
    user.set_password('Donor@123')
    db.session.add(user)
    db.session.flush()
    
    donor = Donor(
        user_id=user.id,
        full_name='Test Donor',
        blood_group='A+',
        phone='555-0001',
        date_of_birth=date(1990, 1, 1),
        gender='Male',
        city='New York',
        state='NY',
        address='123 Test St',
        emergency_contact='Emergency Contact',
        emergency_phone='555-9999',
        is_eligible=True,
        total_donations=0
    )
    db.session.add(donor)
    db.session.commit()
    
    resp = client.post('/api/auth/login', json={
        'email': 'testdonor@example.com',
        'password': 'Donor@123'
    })
    return resp.json['data']['access_token']


@pytest.fixture(scope='function')
def sample_inventory(db):
    """Create sample blood inventory."""
    from app.models.blood_inventory import BloodInventory
    
    BloodInventory.query.filter_by(blood_group='A+', component='WHOLE_BLOOD').delete()
    db.session.commit()
    
    inv = BloodInventory(
        blood_group='A+',
        component='WHOLE_BLOOD',
        total_units=20,
        available_units=20,
        reserved_units=0,
        issued_units=0
    )
    db.session.add(inv)
    db.session.commit()
    return inv
