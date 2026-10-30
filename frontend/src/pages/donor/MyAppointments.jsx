import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, X, CalendarPlus } from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.data || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id);
      toast.success('Appointment cancelled');
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'CANCELLED' } : a))
      );
    } catch (err) {
      toast.error('Failed to cancel appointment');
    }
  };

  const filtered = appointments.filter((a) => {
    if (activeTab === 'UPCOMING') return a.status === 'CONFIRMED' || a.status === 'PENDING';
    if (activeTab === 'COMPLETED') return a.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return a.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">My Appointments</h2>
          <p className="text-sm text-slate-500">View and manage your upcoming and completed donation visits</p>
        </div>
        <Link to="/donor/book-appointment">
          <Button variant="primary" icon={CalendarPlus}>
            Book New Slot
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <Card>
        <div className="flex items-center gap-2">
          {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
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

      {/* Appointments List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="No Appointments Found"
            description="You don't have any appointments matching this category."
            actionLabel="Schedule Appointment"
            onAction={() => (window.location.href = '/donor/book-appointment')}
          />
        ) : (
          filtered.map((appt) => (
            <Card key={appt.id} className="border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-lg font-bold text-slate-900">
                      {appt.center}
                    </span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Calendar className="w-4 h-4 text-crimson-600" />
                      {appt.date}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock className="w-4 h-4 text-crimson-600" />
                      {appt.time_slot}
                    </span>
                    <span>Type: <strong>{appt.donation_type}</strong></span>
                  </div>
                  {appt.notes && (
                    <p className="text-xs text-slate-400 italic">Notes: {appt.notes}</p>
                  )}
                </div>

                {appt.status === 'PENDING' && (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleCancel(appt.id)}
                    icon={X}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
