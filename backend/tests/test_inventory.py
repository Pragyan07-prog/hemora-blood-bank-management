import json
from app.services.inventory_service import InventoryService


def test_get_inventory_public(client, sample_inventory):
    """Test public access to inventory summary."""
    response = client.get('/api/inventory/')
    assert response.status_code == 200
    res_data = response.get_json()
    assert res_data['success'] is True
    # Should contain items grouped by blood group
    assert isinstance(res_data['data'], list)
    o_pos = next((item for item in res_data['data'] if item['blood_group'] == 'O+'), None)
    assert o_pos is not None
    assert o_pos['available_units'] >= 20


def test_add_inventory_admin(client, admin_token):
    """Test admin can add units to inventory."""
    headers = {"Authorization": f"Bearer {admin_token}"}
    payload = {
        "blood_group": "A+",
        "component": "WHOLE_BLOOD",
        "units": 10,
        "notes": "Testing addition of units"
    }
    response = client.post(
        '/api/inventory/',
        data=json.dumps(payload),
        headers=headers,
        content_type='application/json'
    )
    assert response.status_code == 201
    res_data = response.get_json()
    assert res_data['success'] is True
    assert res_data['data']['blood_group'] == "A+"
    assert res_data['data']['available_units'] >= 10


def test_add_inventory_unauthorized(client, donor_token):
    """Test donor role cannot add blood inventory."""
    headers = {"Authorization": f"Bearer {donor_token}"}
    payload = {
        "blood_group": "B+",
        "component": "WHOLE_BLOOD",
        "units": 5
    }
    response = client.post(
        '/api/inventory/',
        data=json.dumps(payload),
        headers=headers,
        content_type='application/json'
    )
    assert response.status_code == 403
    res_data = response.get_json()
    assert res_data['success'] is False


def test_inventory_prevents_negative(app, sample_inventory):
    """Test that issuing more units than available is strictly rejected."""
    with app.app_context():
        # Attempt to issue 50 units when only 20 are available
        inv, errors = InventoryService.issue_units(
            blood_group='O+',
            component='WHOLE_BLOOD',
            units=50,
            reference_type='TEST'
        )
        assert inv is None
        assert errors is not None
        assert any("Insufficient" in err for err in errors)

        # Confirm available units remained 20
        available = InventoryService.get_available_units('O+', 'WHOLE_BLOOD')
        assert available == 20
