import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Edit3,
  Power,
  Shield,
  Heart,
  Droplet,
} from 'lucide-react';
import donorService from '../../services/donorService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export const DonorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchDonor = async () => {
      try {
        const res = await donorService.getDonorById(id);
        setDonor(res.data);
        setFormData(res.data);
      } catch (err) {
        toast.error('Failed to load donor profile');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonor();
  }, [id]);

  const handleToggleStatus = async () => {
    try {
      await donorService.toggleDonorStatus(id);
      setDonor((prev) => ({
        ...prev,
        status: prev.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
      }));
      toast.success('Donor status toggled');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await donorService.updateDonor(id, formData);
      setDonor((prev) => ({ ...prev, ...formData }));
      setIsEditModalOpen(false);
      toast.success('Donor profile updated successfully');
    } catch (err) {
      toast.error('Failed to update donor');
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" text="Loading donor profile..." />
      </div>
    );
  }

  if (!donor) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Donor not found.</p>
        <Button variant="secondary" onClick={() => navigate('/admin/donors')} className="mt-4">
          Return to Donors List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/admin/donors')}
          icon={ArrowLeft}
        >
          Back to Donors
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            icon={Edit3}
          >
            Edit Profile
          </Button>
          <Button
            variant={donor.status === 'ACTIVE' ? 'danger' : 'primary'}
            size="sm"
            onClick={handleToggleStatus}
            icon={Power}
          >
            {donor.status === 'ACTIVE' ? 'Deactivate Donor' : 'Activate Donor'}
          </Button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-crimson-900 to-crimson-700 text-white font-heading font-black text-2xl flex items-center justify-center shadow-md">
              {donor.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-2xl font-black text-slate-900">{donor.name}</h2>
                <StatusBadge status={donor.status} />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Donor ID: #{donor.id} • Registered on {donor.created_at}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold uppercase">Blood Group</span>
              <BloodGroupBadge bloodGroup={donor.blood_group} size="lg" />
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {/* Col 1: Personal Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{donor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{donor.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{donor.address}, {donor.city}, {donor.state}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Born: {donor.dob} ({donor.gender})</span>
              </div>
            </div>
          </div>

          {/* Col 2: Clinical & Eligibility */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Eligibility Status</h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Current Status:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    donor.is_eligible
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {donor.is_eligible ? 'Eligible to Donate' : 'In Cooldown'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Last Donation:</span>
                <span className="font-semibold text-slate-700">{donor.last_donation_date || 'None'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Next Eligible Date:</span>
                <span className="font-semibold text-slate-700">{donor.next_eligible_date || 'Immediate'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total Lifetime Donations:</span>
                <span className="font-bold text-crimson-900">{donor.total_donations} Units</span>
              </div>
            </div>
          </div>

          {/* Col 3: Emergency Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Contact</h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-crimson-700" />
                <span className="font-semibold text-slate-800">{donor.emergency_contact_name || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{donor.emergency_contact_phone || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Donation History Table */}
      <Card title="Donation History" subtitle="Verified past donations made by this donor">
        <Table
          data={donor.donations || []}
          emptyMessage="No donation history recorded for this donor yet."
          columns={[
            {
              title: 'Date',
              dataIndex: 'date',
            },
            {
              title: 'Center',
              dataIndex: 'center',
            },
            {
              title: 'Donation Type',
              dataIndex: 'type',
            },
            {
              title: 'Units',
              dataIndex: 'units',
              render: (v) => <span className="font-bold">{v} Unit</span>,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (v) => <StatusBadge status={v} />,
            },
          ]}
        />
      </Card>

      {/* Appointment History Table */}
      <Card title="Appointment History" subtitle="Scheduled slots and attendance records">
        <Table
          data={donor.appointments || []}
          emptyMessage="No appointment bookings found."
          columns={[
            {
              title: 'Date',
              dataIndex: 'date',
            },
            {
              title: 'Time Slot',
              dataIndex: 'time_slot',
            },
            {
              title: 'Donation Center',
              dataIndex: 'center',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (v) => <StatusBadge status={v} />,
            },
          ]}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Donor Profile"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Address"
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="State"
              value={formData.state || ''}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
          </div>
          <Input
            label="Emergency Contact Name"
            value={formData.emergency_contact_name || ''}
            onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
          />
          <Input
            label="Emergency Contact Phone"
            value={formData.emergency_contact_phone || ''}
            onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DonorDetail;
