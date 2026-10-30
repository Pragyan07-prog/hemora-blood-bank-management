import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Award, Activity } from 'lucide-react';
import donationService from '../../services/donationService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import { BLOOD_GROUPS, DONATION_TYPES, DONATION_CENTERS } from '../../utils/constants';
import toast from 'react-hot-toast';

export const DonationManagement = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    donor_name: '',
    blood_group: 'O+',
    center: DONATION_CENTERS[0].name,
    donation_type: 'Whole Blood',
    units: 1,
    hemoglobin: 14.0,
    blood_pressure: '120/80',
    pulse: 72,
    date: new Date().toISOString().split('T')[0],
  });

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const res = await donationService.getDonations({ status: statusFilter });
      setDonations(res.data || []);
    } catch (err) {
      toast.error('Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [statusFilter]);

  const handleVerify = async (id) => {
    try {
      await donationService.verifyDonation(id);
      toast.success('Donation verified! Units added to inventory & certificate enabled.');
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'VERIFIED', has_certificate: true } : d))
      );
    } catch (err) {
      toast.error('Failed to verify donation');
    }
  };

  const handleReject = async (id) => {
    try {
      await donationService.rejectDonation(id, 'Screening irregularities');
      toast.success('Donation marked as rejected');
      setDonations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'REJECTED' } : d))
      );
    } catch (err) {
      toast.error('Failed to update donation');
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await donationService.recordDonation(formData);
      toast.success(res.message || 'Donation recorded successfully!');
      setRecordModalOpen(false);
      setDonations((prev) => [res.data, ...prev]);
    } catch (err) {
      toast.error('Failed to record donation');
    }
  };

  const columns = [
    {
      title: 'Donor',
      dataIndex: 'donor_name',
      render: (v) => <span className="font-bold text-slate-800">{v}</span>,
    },
    {
      title: 'Group',
      dataIndex: 'blood_group',
      render: (v) => <BloodGroupBadge bloodGroup={v} size="sm" />,
    },
    {
      title: 'Date',
      dataIndex: 'date',
    },
    {
      title: 'Center',
      dataIndex: 'center',
    },
    {
      title: 'Type & Units',
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate-700">{row.donation_type}</p>
          <span className="text-xs text-slate-400 font-bold">{row.units} Unit(s)</span>
        </div>
      ),
    },
    {
      title: 'Vitals',
      render: (_, row) => (
        <span className="text-xs text-slate-500 font-mono">
          Hb: {row.hemoglobin} | BP: {row.blood_pressure}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      title: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleVerify(row.id)}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                title="Verify Donation & Issue Certificate"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleReject(row.id)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                title="Reject Screening"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
          {row.status === 'VERIFIED' && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold">
              <Award className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Donation Logs & Screening</h2>
          <p className="text-sm text-slate-500">Record incoming volunteer donations and lab verification</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setRecordModalOpen(true)}
          icon={Plus}
        >
          Record Donation
        </Button>
      </div>

      {/* Filter Tabs */}
      <Card>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase mr-2">Filter By:</span>
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                statusFilter === st
                  ? 'bg-crimson-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </Card>

      {/* Donations Table */}
      <Card title={`Donation Records (${donations.length})`}>
        <Table columns={columns} data={donations} isLoading={isLoading} />
      </Card>

      {/* Record Donation Modal */}
      <Modal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        title="Record New Blood Donation"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <Input
            label="Donor Full Name"
            placeholder="e.g. Alexander Hayes"
            value={formData.donor_name}
            onChange={(e) => setFormData({ ...formData, donor_name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Blood Group"
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
              required
            />
            <Input
              label="Units"
              type="number"
              min="1"
              max="4"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Donation Type"
              value={formData.donation_type}
              onChange={(e) => setFormData({ ...formData, donation_type: e.target.value })}
              options={DONATION_TYPES.map((t) => ({ value: t, label: t }))}
              required
            />
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <Select
            label="Collection Center"
            value={formData.center}
            onChange={(e) => setFormData({ ...formData, center: e.target.value })}
            options={DONATION_CENTERS.map((c) => ({ value: c.name, label: c.name }))}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Hemoglobin (g/dL)"
              type="number"
              step="0.1"
              value={formData.hemoglobin}
              onChange={(e) => setFormData({ ...formData, hemoglobin: e.target.value })}
              required
            />
            <Input
              label="Blood Pressure"
              placeholder="120/80"
              value={formData.blood_pressure}
              onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })}
              required
            />
            <Input
              label="Pulse (bpm)"
              type="number"
              value={formData.pulse}
              onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save & Record Donation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DonationManagement;
