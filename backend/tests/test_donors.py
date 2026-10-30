import json


def test_list_donors_admin(client, admin_token, sample_donor):
    """Test admin can list all donors."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get('/api/donors/', headers=headers)
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data['success'] is True
    assert 'items' in res_data['data']
    assert len(res_data['data']['items']) >= 1


def test_list_donors_unauthorized(client, donor_token):
    """Test donor role cannot access admin donor list endpoint."""
    headers = {"Authorization": f"Bearer {donor_token}"}
    response = client.get('/api/donors/', headers=headers)
    assert response.status_code == 403
    res_data = response.get_json()
    assert res_data['success'] is False


def test_get_donor_profile(client, admin_token, sample_donor):
    """Test retrieving a single donor profile by ID as admin."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get(f'/api/donors/{sample_donor.id}', headers=headers)
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data['success'] is True
    assert res_data['data']['full_name'] == "Test Donor"
    assert res_data['data']['blood_group'] == "O+"


def test_update_own_profile(client, donor_token):
    """Test donor updating their own profile via /me."""
    headers = {"Authorization": f"Bearer {donor_token}"}
    payload = {
        "city": "Neo Metropolis",
        "emergency_contact": "Marcus Aurelius",
        "emergency_phone": "+1-555-4321"
    }
    response = client.put(
        '/api/donors/me',
        data=json.dumps(payload),
        headers=headers,
        content_type='application/json'
    )
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data['success'] is True
    assert res_data['data']['city'] == "Neo Metropolis"
    assert res_data['data']['emergency_contact'] == "Marcus Aurelius"
