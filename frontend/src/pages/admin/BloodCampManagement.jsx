import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Calendar, Clock, Users, Eye, X, Building } from 'lucide-react';
import campService from '../../services/campService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import StatusBadge from '../../components/shared/StatusBadge';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import toast from 'react-hot-toast';

export const BloodCampManagement = () => {
  const [camps, setCamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [registrationsModalOpen, setRegistrationsModalOpen] = useState(false);
  const [currentCamp, setCurrentCamp] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    organizer: '',
    venue: '',
    address: '',
    start_date: '',
    end_date: '',
    start_time: '09:00 AM',
    end_time: '04:00 PM',
    target_units: 100,
    contact_phone: '',
    description: '',
  });

  const fetchCamps = async () => {
    setIsLoading(true);
    try {
      const res = await campService.getCamps();
      setCamps(res.data || []);
    } catch (err) {
      toast.error('Failed to load blood camps');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await campService.createCamp(formData);
      toast.success('Blood camp created and published!');
      setCamps((prev) => [res.data, ...prev]);
      setCreateModalOpen(false);
    } catch (err) {
      toast.error('Failed to create blood camp');
    }
  };

  const handleViewRegistrations = async (camp) => {
    setCurrentCamp(camp);
    try {
      const res = await campService.getCampRegistrations(camp.id);
      setRegistrations(res.data || []);
      setRegistrationsModalOpen(true);
    } catch (err) {
      toast.error('Failed to load registrations');
    }
  };

  const handleCancelCamp = async (campId) => {
    if (!window.confirm('Are you sure you want to cancel this blood drive camp?')) return;
    try {
      await campService.cancelCamp(campId);
      toast.success('Camp marked as cancelled');
      setCamps((prev) =>
        prev.map((c) => (c.id === campId ? { ...c, status: 'CANCELLED' } : c))
      );
    } catch (err) {
      toast.error('Failed to cancel camp');
    }
  };

  const columns = [
    {
      title: 'Camp Name & Venue',
      render: (_, row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-crimson-600" />
            {row.venue}, {row.address}
          </p>
        </div>
      ),
    },
    {
      title: 'Organizer',
      dataIndex: 'organizer',
    },
    {
      title: 'Date & Time',
      render: (_, row) => (
        <div className="text-xs text-slate-600">
          <p className="font-semibold">{row.start_date}</p>
          <p className="text-slate-400">{row.start_time} - {row.end_time}</p>
        </div>
      ),
    },
    {
      title: 'Target & Progress',
      render: (_, row) => (
        <div className="w-32">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold text-slate-700">{row.registered_donors} Reg.</span>
            <span className="text-slate-400">Goal: {row.target_units}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-crimson-800 h-1.5 rounded-full"
              style={{
                width: `${Math.min(100, Math.round((row.registered_donors / row.target_units) * 100))}%`,
              }}
            ></div>
          </div>
        </div>
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
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleViewRegistrations(row)}
            icon={Eye}
          >
            Donors
          </Button>
          {row.status !== 'CANCELLED' && (
            <button
              onClick={() => handleCancelCamp(row.id)}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
              title="Cancel Blood Camp"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Blood Donation Camps</h2>
          <p className="text-sm text-slate-500">Coordinate regional mobile blood drives and monitor donor turnout</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setCreateModalOpen(true)}
          icon={Plus}
        >
          Organize Blood Camp
        </Button>
      </div>

      <Card title={`Organized Blood Drives (${camps.length})`}>
        <Table columns={columns} data={camps} isLoading={isLoading} />
      </Card>

      {/* Create Camp Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule New Blood Camp"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Camp Campaign Title"
            placeholder="e.g. City Tech Park Annual Blood Drive"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Input
            label="Organizing Partner / Sponsor"
            placeholder="e.g. Red Cross Chapter & Tech Park Guild"
            value={formData.organizer}
            onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Venue Name"
              placeholder="e.g. Community Center Hall B"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              required
            />
            <Input
              label="Full Address"
              placeholder="e.g. 500 Civic Ave, Metro City"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Start Time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            />
            <Input
              label="End Time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            />
            <Input
              label="Target Units"
              type="number"
              value={formData.target_units}
              onChange={(e) => setFormData({ ...formData, target_units: e.target.value })}
              required
            />
          </div>

          <Input
            label="Coordination Phone"
            placeholder="+1 (555) 000-0000"
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Publish Camp
            </Button>
          </div>
        </form>
      </Modal>

      {/* Registrations List Modal */}
      <Modal
        isOpen={registrationsModalOpen}
        onClose={() => setRegistrationsModalOpen(false)}
        title={`Registered Donors - ${currentCamp?.title || 'Camp'}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Below are volunteer donors who have pre-registered for this donation drive.
          </p>
          <Table
            data={registrations}
            columns={[
              {
                title: 'Donor Name',
                dataIndex: 'donor_name',
                render: (v) => <span className="font-bold text-slate-800">{v}</span>,
              },
              {
                title: 'Blood Group',
                dataIndex: 'blood_group',
                render: (v) => <BloodGroupBadge bloodGroup={v} size="sm" />,
              },
              {
                title: 'Phone',
                dataIndex: 'phone',
              },
              {
                title: 'Registered On',
                dataIndex: 'registered_at',
              },
            ]}
          />
          <div className="flex justify-end pt-3">
            <Button variant="secondary" onClick={() => setRegistrationsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BloodCampManagement;
