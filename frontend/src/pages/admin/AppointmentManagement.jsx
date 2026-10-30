import React, { useState, useEffect } from 'react';
import { Check, X, CheckCheck, Clock, UserX } from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';

export const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentService.getAppointments({ status: activeTab });
      setAppointments(res.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(id, newStatus);
      toast.success(`Appointment updated to ${newStatus}`);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      toast.error('Failed to update appointment');
    }
  };

  const tabs = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  const columns = [
    {
      title: 'Donor',
      dataIndex: 'donor_name',
      render: (v) => <span className="font-bold text-slate-800">{v}</span>,
    },
    {
      title: 'Blood Group',
      dataIndex: 'blood_group',
      render: (v) => <BloodGroupBadge bloodGroup={v} size="sm" />,
    },
    {
      title: 'Appointment Date',
      dataIndex: 'date',
    },
    {
      title: 'Time Slot',
      dataIndex: 'time_slot',
      render: (v) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
          <Clock className="w-3.5 h-3.5" />
          {v}
        </span>
      ),
    },
    {
      title: 'Center',
      dataIndex: 'center',
    },
    {
      title: 'Type',
      dataIndex: 'donation_type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      title: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleUpdateStatus(row.id, 'CONFIRMED')}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                title="Confirm Appointment"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleUpdateStatus(row.id, 'CANCELLED')}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                title="Cancel Appointment"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}

          {row.status === 'CONFIRMED' && (
            <>
              <Button
                size="sm"
                variant="primary"
                className="py-1 px-2.5 text-xs"
                onClick={() => handleUpdateStatus(row.id, 'COMPLETED')}
                icon={CheckCheck}
              >
                Mark Attended
              </Button>
              <button
                onClick={() => handleUpdateStatus(row.id, 'MISSED')}
                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50"
                title="Mark No-Show / Missed"
              >
                <UserX className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Appointment Management</h2>
        <p className="text-sm text-slate-500">Track and confirm incoming donor booking slots across centers</p>
      </div>

      <Card>
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-crimson-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </Card>

      <Card title={`Scheduled Appointments (${appointments.length})`}>
        <Table columns={columns} data={appointments} isLoading={isLoading} />
      </Card>
    </div>
  );
};

export default AppointmentManagement;
