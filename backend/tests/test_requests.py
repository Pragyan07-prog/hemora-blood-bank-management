import json


def test_create_blood_request(client, donor_token):
    """Test creating a new blood request."""
    headers = {"Authorization": f"Bearer {donor_token}"}
    payload = {
        "patient_name": "Test Patient",
        "blood_group": "O+",
        "component": "WHOLE_BLOOD",
        "units_required": 2,
        "hospital_name": "City General Hospital",
        "hospital_city": "Metropolis",
        "hospital_address": "42 Broadway",
        "required_date": "2026-11-15",
        "urgency": "URGENT",
        "contact_number": "+1-555-4444"
    }
    response = client.post(
        '/api/requests/',
        data=json.dumps(payload),
        headers=headers,
        content_type='application/json'
    )
    assert response.status_code == 201
    res_data = response.get_json()
    assert res_data['success'] is True
    assert res_data['data']['patient_name'] == "Test Patient"
    assert res_data['data']['status'] == "PENDING"


def test_approve_request_admin(client, admin_token, donor_token):
    """Test admin approving a blood request."""
    # 1. Create request
    donor_headers = {"Authorization": f"Bearer {donor_token}"}
    payload = {
        "patient_name": "Approval Test Patient",
        "blood_group": "A+",
        "component": "WHOLE_BLOOD",
        "units_required": 1,
        "hospital_name": "St. Luke's",
        "hospital_city": "Metropolis",
        "required_date": "2026-11-20",
        "contact_number": "+1-555-3333"
    }
    create_res = client.post('/api/requests/', data=json.dumps(payload), headers=donor_headers, content_type='application/json')
    req_id = create_res.get_json()['data']['id']

    # 2. Approve as admin
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    approve_res = client.patch(f'/api/requests/{req_id}/approve', headers=admin_headers)
    assert approve_res.status_code == 200
    res_data = approve_res.get_json()
    assert res_data['success'] is True
    assert res_data['data']['status'] == "APPROVED"


def test_reject_request_admin(client, admin_token, donor_token):
    """Test admin rejecting a blood request with reason."""
    donor_headers = {"Authorization": f"Bearer {donor_token}"}
    payload = {
        "patient_name": "Rejection Test Patient",
        "blood_group": "B+",
        "component": "WHOLE_BLOOD",
        "units_required": 1,
        "hospital_name": "Mercy Clinic",
        "hospital_city": "Gotham",
        "required_date": "2026-11-25",
        "contact_number": "+1-555-2222"
    }
    create_res = client.post('/api/requests/', data=json.dumps(payload), headers=donor_headers, content_type='application/json')
    req_id = create_res.get_json()['data']['id']

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    reject_payload = {"reason": "Hospital information could not be verified"}
    reject_res = client.patch(
        f'/api/requests/{req_id}/reject',
        data=json.dumps(reject_payload),
        headers=admin_headers,
        content_type='application/json'
    )
    assert reject_res.status_code == 200
    res_data = reject_res.get_json()
    assert res_data['success'] is True
    assert res_data['data']['status'] == "REJECTED"
    assert "Hospital information" in res_data['data']['rejection_reason']


def test_fulfill_request_updates_inventory(client, admin_token, sample_inventory):
    """Test fulfilling an approved request deducts inventory correctly."""
    # 1. Create a request for O+
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    req_payload = {
        "patient_name": "Fulfillment Test Patient",
        "blood_group": "O+",
        "component": "WHOLE_BLOOD",
        "units_required": 3,
        "hospital_name": "Memorial General",
        "hospital_city": "Metropolis",
        "required_date": "2026-11-10",
        "contact_number": "+1-555-1111"
    }
    create_res = client.post('/api/requests/', data=json.dumps(req_payload), headers=admin_headers, content_type='application/json')
    req_id = create_res.get_json()['data']['id']

    # 2. Approve request
    client.patch(f'/api/requests/{req_id}/approve', headers=admin_headers)

    # 3. Fulfill request
    fulfill_res = client.patch(f'/api/requests/{req_id}/fulfill', headers=admin_headers)
    assert fulfill_res.status_code == 200
    res_data = fulfill_res.get_json()
    assert res_data['success'] is True
    assert res_data['data']['status'] == "FULFILLED"
    assert res_data['data']['units_fulfilled'] == 3

    # 4. Verify inventory was deducted from 20 to 17
    inv_res = client.get('/api/inventory/')
    o_pos = next(item for item in inv_res.get_json()['data'] if item['blood_group'] == 'O+')
    assert o_pos['available_units'] == 17
