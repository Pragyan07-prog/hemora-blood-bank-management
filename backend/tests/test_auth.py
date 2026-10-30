"""
Test Authentication Endpoints
"""
import pytest


class TestRegister:
    def test_register_success(self, client, db):
        resp = client.post('/api/auth/register', json={
            'email': 'newdonor@example.com',
            'password': 'NewPass@123',
            'full_name': 'New Donor',
            'phone': '555-9876',
            'date_of_birth': '1995-06-15',
            'gender': 'Female',
            'blood_group': 'B+',
            'city': 'New York',
            'state': 'NY',
            'address': '456 Park Ave',
            'emergency_contact': 'Jane Doe',
            'emergency_phone': '555-1111'
        })
        assert resp.status_code == 201
        data = resp.json
        assert data['success'] is True
        assert 'access_token' in data['data']
        assert data['data']['role'] == 'DONOR'

    def test_register_duplicate_email(self, client, db):
        payload = {
            'email': 'dup@example.com', 'password': 'Pass@123',
            'full_name': 'Dup User', 'phone': '555-0000',
            'date_of_birth': '1990-01-01', 'gender': 'Male',
            'blood_group': 'O+', 'city': 'NY', 'state': 'NY',
            'address': '1 Main St', 'emergency_contact': 'EC', 'emergency_phone': '555-9999'
        }
        client.post('/api/auth/register', json=payload)
        resp = client.post('/api/auth/register', json=payload)
        assert resp.status_code == 409
        assert resp.json['success'] is False

    def test_register_invalid_blood_group(self, client, db):
        resp = client.post('/api/auth/register', json={
            'email': 'bad@example.com', 'password': 'Pass@123',
            'full_name': 'Bad User', 'phone': '555-0000',
            'date_of_birth': '1990-01-01', 'gender': 'Male',
            'blood_group': 'X+',  # Invalid
            'city': 'NY', 'state': 'NY', 'address': '1 Main St',
            'emergency_contact': 'EC', 'emergency_phone': '555-9999'
        })
        assert resp.status_code == 400
        assert resp.json['success'] is False

    def test_register_short_password(self, client, db):
        resp = client.post('/api/auth/register', json={
            'email': 'short@example.com', 'password': 'abc',
            'full_name': 'Short Pass', 'phone': '555-0000',
            'date_of_birth': '1990-01-01', 'gender': 'Male',
            'blood_group': 'A+', 'city': 'NY', 'state': 'NY',
            'address': '1 Main St', 'emergency_contact': 'EC', 'emergency_phone': '555-9999'
        })
        assert resp.status_code == 400


class TestLogin:
    def test_login_success(self, client, db):
        # Create user first
        client.post('/api/auth/register', json={
            'email': 'logintest@example.com', 'password': 'Login@123',
            'full_name': 'Login Test', 'phone': '555-9999',
            'date_of_birth': '1990-01-01', 'gender': 'Male',
            'blood_group': 'A+', 'city': 'NY', 'state': 'NY',
            'address': '1 Main St', 'emergency_contact': 'EC', 'emergency_phone': '555-0000'
        })
        resp = client.post('/api/auth/login', json={
            'email': 'logintest@example.com',
            'password': 'Login@123'
        })
        assert resp.status_code == 200
        data = resp.json
        assert data['success'] is True
        assert 'access_token' in data['data']
        assert 'refresh_token' in data['data']
        assert data['data']['role'] == 'DONOR'

    def test_login_wrong_password(self, client, db):
        client.post('/api/auth/register', json={
            'email': 'wrongpass@example.com', 'password': 'Correct@123',
            'full_name': 'Wrong Pass', 'phone': '555-0000',
            'date_of_birth': '1990-01-01', 'gender': 'Male',
            'blood_group': 'A+', 'city': 'NY', 'state': 'NY',
            'address': '1 Main St', 'emergency_contact': 'EC', 'emergency_phone': '555-9999'
        })
        resp = client.post('/api/auth/login', json={
            'email': 'wrongpass@example.com',
            'password': 'Wrong@123'
        })
        assert resp.status_code == 401
        assert resp.json['success'] is False

    def test_login_nonexistent_user(self, client, db):
        resp = client.post('/api/auth/login', json={
            'email': 'nobody@example.com',
            'password': 'NoPass@123'
        })
        assert resp.status_code == 401

    def test_login_inactive_account(self, client, db):
        from app.models.user import User
        from app.extensions import db as _db
        # Register then deactivate
        client.post('/api/auth/register', json={
            'email': 'inactive@example.com', 'password': 'Pass@123',
            'full_name': 'Inactive', 'phone': '555-0000',
            'date_of_birth': '1990-01-01', 'gender': 'Male',
            'blood_group': 'A+', 'city': 'NY', 'state': 'NY',
            'address': '1 Main St', 'emergency_contact': 'EC', 'emergency_phone': '555-9999'
        })
        user = User.query.filter_by(email='inactive@example.com').first()
        user.is_active = False
        _db.session.commit()
        
        resp = client.post('/api/auth/login', json={
            'email': 'inactive@example.com',
            'password': 'Pass@123'
        })
        assert resp.status_code == 403


class TestMe:
    def test_get_current_user(self, client, donor_token):
        resp = client.get('/api/auth/me', headers={
            'Authorization': f'Bearer {donor_token}'
        })
        assert resp.status_code == 200
        assert resp.json['success'] is True
        assert 'email' in resp.json['data']

    def test_get_current_user_no_token(self, client):
        resp = client.get('/api/auth/me')
        assert resp.status_code == 401
