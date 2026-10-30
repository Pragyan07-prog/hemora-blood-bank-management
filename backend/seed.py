"""
HEMORA Database Seed Script
Run this after database migrations to populate initial data.
Idempotent - safe to run multiple times.
"""
import os
import sys
from datetime import datetime, date, timedelta
import random

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.donor import Donor
from app.models.blood_inventory import BloodInventory, InventoryTransaction
from app.models.blood_request import BloodRequest
from app.models.donation import Donation
from app.models.appointment import Appointment
from app.models.blood_camp import BloodCamp, CampRegistration
from app.models.notification import Notification
from app.models.certificate import Certificate
from app.services.certificate_service import CertificateService

app = create_app(os.getenv('FLASK_ENV', 'development'))


def seed_admin():
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@hemora.com')
    admin_password = os.getenv('ADMIN_PASSWORD', 'Admin@123')

    existing = User.query.filter_by(email=admin_email).first()
    if existing:
        print(f"  [SKIP] Admin '{admin_email}' already exists")
        return existing

    admin = User(email=admin_email, role='ADMIN', is_active=True)
    admin.set_password(admin_password)
    db.session.add(admin)
    db.session.flush()
    print(f"  [OK] Created admin: {admin_email}")
    return admin


def seed_donors():
    donors_data = [
        {"name": "Aarav Sharma", "email": "donor1@example.com", "blood_group": "O+", "city": "New York", "state": "NY", "phone": "555-0101", "gender": "Male"},
        {"name": "Priya Patel", "email": "donor2@example.com", "blood_group": "A-", "city": "Brooklyn", "state": "NY", "phone": "555-0102", "gender": "Female"},
        {"name": "Marcus Johnson", "email": "donor3@example.com", "blood_group": "B+", "city": "Queens", "state": "NY", "phone": "555-0103", "gender": "Male"},
        {"name": "Sarah Williams", "email": "donor4@example.com", "blood_group": "AB+", "city": "Bronx", "state": "NY", "phone": "555-0104", "gender": "Female"},
        {"name": "David Chen", "email": "donor5@example.com", "blood_group": "O-", "city": "Manhattan", "state": "NY", "phone": "555-0105", "gender": "Male"},
    ]

    created = []
    for d in donors_data:
        if User.query.filter_by(email=d['email']).first():
            print(f"  [SKIP] Donor '{d['email']}' already exists")
            donor = Donor.query.join(User).filter(User.email == d['email']).first()
            created.append(donor)
            continue

        user = User(email=d['email'], role='DONOR', is_active=True)
        user.set_password('Donor@123')
        db.session.add(user)
        db.session.flush()

        donor = Donor(
            user_id=user.id,
            full_name=d['name'],
            blood_group=d['blood_group'],
            phone=d['phone'],
            date_of_birth=date(1990, random.randint(1, 12), random.randint(1, 28)),
            gender=d['gender'],
            city=d['city'],
            state=d['state'],
            address=f"{random.randint(100, 999)} Main St, {d['city']}, {d['state']}",
            emergency_contact=f"Emergency {d['name']}",
            emergency_phone="555-9999",
            is_eligible=True,
            total_donations=0
        )
        db.session.add(donor)
        db.session.flush()
        created.append(donor)
        print(f"  [OK] Created donor: {d['name']} ({d['blood_group']})")

    return created


def seed_inventory():
    blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    components = ['WHOLE_BLOOD']
    units_map = {
        'O+': 45, 'O-': 12, 'A+': 38, 'A-': 8,
        'B+': 30, 'B-': 6, 'AB+': 15, 'AB-': 4
    }

    created = []
    for bg in blood_groups:
        for component in components:
            existing = BloodInventory.query.filter_by(
                blood_group=bg, component=component
            ).first()
            if existing:
                print(f"  [SKIP] Inventory {bg} {component} already exists")
                created.append(existing)
                continue

            units = units_map.get(bg, 10)
            inv = BloodInventory(
                blood_group=bg,
                component=component,
                total_units=units,
                available_units=units,
                reserved_units=0,
                issued_units=0
            )
            db.session.add(inv)
            db.session.flush()
            created.append(inv)

            # Add initial transaction record
            txn = InventoryTransaction(
                inventory_id=inv.id,
                transaction_type='ADD',
                units=units,
                previous_available=0,
                new_available=units,
                notes='Initial stock',
                performed_by=1
            )
            db.session.add(txn)
            print(f"  [OK] Inventory {bg} {component}: {units} units")

    return created


def seed_appointments(donors, admin_id):
    if Appointment.query.count() > 0:
        print("  [SKIP] Appointments already exist")
        return []

    centers = [
        "HEMORA Main Center - New York",
        "HEMORA Downtown Clinic - New York",
        "HEMORA Medical Plaza - Brooklyn",
    ]
    created = []
    for i, donor in enumerate(donors[:3]):
        appt = Appointment(
            donor_id=donor.id,
            scheduled_date=date.today() + timedelta(days=i + 5),
            scheduled_time="09:00",
            donation_center=centers[i % len(centers)],
            city="New York",
            status='APPROVED',
            notes='Scheduled via seed'
        )
        db.session.add(appt)
        db.session.flush()
        created.append(appt)
        print(f"  [OK] Appointment for {donor.full_name}")
    return created


def seed_blood_camps(admin_id):
    if BloodCamp.query.count() > 0:
        print("  [SKIP] Blood camps already exist")
        return []

    camps_data = [
        {
            "title": "Summer Blood Drive 2026",
            "venue": "Central Park Event Area",
            "city": "New York", "state": "NY",
            "camp_date": date.today() + timedelta(days=15),
            "capacity": 100,
            "status": "PUBLISHED"
        },
        {
            "title": "Community Health & Blood Donation Camp",
            "venue": "Brooklyn Community Center",
            "city": "Brooklyn", "state": "NY",
            "camp_date": date.today() + timedelta(days=30),
            "capacity": 75,
            "status": "PUBLISHED"
        },
        {
            "title": "Emergency Blood Collection Drive",
            "venue": "Queens Hospital Campus",
            "city": "Queens", "state": "NY",
            "camp_date": date.today() + timedelta(days=7),
            "capacity": 50,
            "status": "PUBLISHED"
        },
    ]

    created = []
    for c in camps_data:
        camp = BloodCamp(
            title=c['title'],
            description=f"Join us for {c['title']}. Your donation can save up to 3 lives!",
            venue=c['venue'],
            address=f"{c['venue']}, {c['city']}, {c['state']}",
            city=c['city'],
            state=c['state'],
            camp_date=c['camp_date'],
            start_time="08:00",
            end_time="17:00",
            registration_deadline=c['camp_date'] - timedelta(days=2),
            capacity=c['capacity'],
            registered_count=0,
            status=c['status'],
            organizer_name="HEMORA Blood Bank",
            contact_phone="1-800-HEMORA-1",
            created_by=admin_id
        )
        db.session.add(camp)
        db.session.flush()
        created.append(camp)
        print(f"  [OK] Blood camp: {c['title']}")
    return created


def seed_blood_requests(donors, admin_id):
    if BloodRequest.query.count() > 0:
        print("  [SKIP] Blood requests already exist")
        return []

    requests_data = [
        {"patient": "John Mitchell", "blood_group": "O+", "units": 3, "hospital": "New York General Hospital", "urgency": "URGENT", "status": "PENDING"},
        {"patient": "Elena Rodriguez", "blood_group": "A-", "units": 2, "hospital": "Brooklyn Medical Center", "urgency": "CRITICAL", "status": "APPROVED"},
        {"patient": "Robert Kim", "blood_group": "B+", "units": 4, "hospital": "Queens Hospital", "urgency": "NORMAL", "status": "PENDING"},
        {"patient": "Lisa Thompson", "blood_group": "AB+", "units": 1, "hospital": "Bronx Care Hospital", "urgency": "URGENT", "status": "FULFILLED"},
        {"patient": "James Wilson", "blood_group": "O-", "units": 2, "hospital": "Manhattan Medical", "urgency": "CRITICAL", "status": "APPROVED"},
    ]

    created = []
    for req_data in requests_data:
        req = BloodRequest(
            requester_id=donors[0].user_id if donors else None,
            patient_name=req_data['patient'],
            blood_group=req_data['blood_group'],
            component='WHOLE_BLOOD',
            units_required=req_data['units'],
            units_fulfilled=req_data['units'] if req_data['status'] == 'FULFILLED' else 0,
            hospital_name=req_data['hospital'],
            hospital_city="New York",
            required_date=date.today() + timedelta(days=3),
            urgency=req_data['urgency'],
            contact_number="555-1234",
            status=req_data['status'],
            approved_by=admin_id if req_data['status'] in ['APPROVED', 'FULFILLED'] else None,
            approved_at=datetime.utcnow() if req_data['status'] in ['APPROVED', 'FULFILLED'] else None,
            fulfilled_at=datetime.utcnow() if req_data['status'] == 'FULFILLED' else None,
        )
        db.session.add(req)
        db.session.flush()
        created.append(req)
        print(f"  [OK] Blood request: {req_data['patient']} ({req_data['blood_group']})")
    return created


def seed_donations(donors, appointments, admin_id):
    if Donation.query.count() > 0:
        print("  [SKIP] Donations already exist")
        return []

    created = []
    for i, donor in enumerate(donors[:3]):
        appt_id = appointments[i].id if i < len(appointments) else None
        donation = Donation(
            donor_id=donor.id,
            appointment_id=appt_id,
            donation_date=date.today() - timedelta(days=random.randint(100, 365)),
            donation_center="HEMORA Main Center - New York",
            blood_group=donor.blood_group,
            donation_type='WHOLE_BLOOD',
            units_collected=1,
            hemoglobin_level=14.5,
            blood_pressure="120/80",
            weight=70.0,
            status='COMPLETED',
            is_verified=True,
            verified_by=admin_id,
            verified_at=datetime.utcnow(),
            notes='Seed data donation'
        )
        db.session.add(donation)
        db.session.flush()

        # Update donor stats
        donor.total_donations = (donor.total_donations or 0) + 1
        donor.last_donation_date = donation.donation_date
        # Set eligibility based on last donation
        days_since = (date.today() - donation.donation_date).days
        donor.is_eligible = days_since >= 90

        created.append(donation)
        print(f"  [OK] Donation by {donor.full_name} ({donor.blood_group})")

    return created


def seed_certificates(donations, admin_id):
    if Certificate.query.count() > 0:
        print("  [SKIP] Certificates already exist")
        return []

    created = []
    for donation in donations:
        try:
            cert = CertificateService.generate_certificate(donation.id, admin_id)
            if cert:
                created.append(cert)
                print(f"  [OK] Certificate {cert.certificate_number} for donation #{donation.id}")
        except Exception as e:
            print(f"  [WARN] Could not generate certificate for donation #{donation.id}: {e}")

    return created


def seed_notifications(donors, admin_user):
    if Notification.query.count() > 0:
        print("  [SKIP] Notifications already exist")
        return

    welcome_notifs = []
    for donor in donors:
        notif = Notification(
            recipient_id=donor.user_id,
            title="Welcome to HEMORA!",
            message="Thank you for joining HEMORA. Your generosity can save lives. Please complete your profile and book your first donation appointment.",
            notification_type='SYSTEM',
            is_read=False
        )
        welcome_notifs.append(notif)

    db.session.add_all(welcome_notifs)
    print(f"  [OK] Created {len(welcome_notifs)} welcome notifications")


def main():
    with app.app_context():
        print("\n🩸 HEMORA Database Seeding\n" + "=" * 40)

        print("\n[1/8] Creating tables...")
        db.create_all()
        print("  [OK] Tables created")

        print("\n[2/8] Seeding admin account...")
        admin = seed_admin()
        admin_id = admin.id if admin else 1

        print("\n[3/8] Seeding donor accounts...")
        donors = seed_donors()

        print("\n[4/8] Seeding blood inventory...")
        seed_inventory()

        print("\n[5/8] Seeding appointments...")
        appointments = seed_appointments(donors, admin_id)

        print("\n[6/8] Seeding blood camps...")
        seed_blood_camps(admin_id)

        print("\n[7/8] Seeding blood requests...")
        seed_blood_requests(donors, admin_id)

        print("\n[8/8] Seeding donations...")
        donations = seed_donations(donors, appointments, admin_id)

        print("\n[+] Seeding certificates...")
        seed_certificates(donations, admin_id)

        print("\n[+] Seeding notifications...")
        seed_notifications(donors, admin)

        db.session.commit()

        print("\n" + "=" * 40)
        print("✅ HEMORA seeding complete!\n")
        print("Admin Login:")
        print(f"  Email:    {os.getenv('ADMIN_EMAIL', 'admin@hemora.com')}")
        print(f"  Password: {os.getenv('ADMIN_PASSWORD', 'Admin@123')}")
        print("\nSample Donor Logins:")
        print("  Email:    donor1@example.com")
        print("  Password: Donor@123")
        print("=" * 40)


if __name__ == '__main__':
    main()
