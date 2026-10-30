import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Bell,
  Droplet,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CalendarPlus,
  Award,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import donorService from '../../services/donorService';
import appointmentService from '../../services/appointmentService';
import notificationService from '../../services/notificationService';
import donationService from '../../services/donationService';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import StatusBadge from '../../components/shared/StatusBadge';

export const DonorDashboard = () => {
  const { user } = useAuth();
  const [eligibility, setEligibility] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        const [eligRes, apptRes, donRes, notifRes] = await Promise.all([
          donorService.getEligibility(),
          appointmentService.getMyAppointments(),
          donationService.getMyDonations(),
          notificationService.getNotifications(),
        ]);
        setEligibility(eligRes.data);
        setAppointments(apptRes.data || []);
        setDonations(donRes.data || []);
        setNotifications(notifRes.data || []);
      } catch (err) {
        console.error('Failed to load donor dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonorData();
  }, []);

  const upcomingAppt = appointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
  );
  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Welcome Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-crimson-950 via-crimson-900 to-crimson-800 text-white p-6 sm:p-8 overflow-hidden shadow-lg">
        {/* Animated Drop shape */}
        <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-4 right-8 text-crimson-400/20 animate-pulse-slow pointer-events-none">
          <Droplet className="w-36 h-36 fill-current" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Active Lifesaver Community
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-black">
              Welcome back, {user?.name || 'Alexander'}!
            </h2>
            <p className="text-sm text-crimson-100 max-w-lg">
              Your dedication fuels regional emergency care. You have contributed to saving multiple human lives through your verified donations.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/15">
            <span className="text-xs uppercase font-bold tracking-wider text-crimson-200">
              Registered Blood Group
            </span>
            <div className="bg-white px-3 py-1.5 rounded-xl shadow-md">
              <BloodGroupBadge bloodGroup={user?.blood_group || 'O+'} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lifetime Donations"
          value={user?.total_donations || '8'}
          icon={Heart}
          color="crimson"
          subtitle="Whole Blood Units"
        />
        <StatCard
          title="Scheduled Visits"
          value={appointments.length}
          icon={Calendar}
          color="blue"
          subtitle="All Centers"
        />
        <StatCard
          title="Unread Alerts"
          value={unreadNotifs}
          icon={Bell}
          color="orange"
          subtitle="Hospital & Drives"
        />
        <StatCard
          title="Certificates"
          value={donations.filter((d) => d.has_certificate).length}
          icon={Award}
          color="green"
          subtitle="Official Credentials"
        />
      </div>

      {/* 3. ELIGIBILITY & NEXT APPOINTMENT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Eligibility Card */}
        <div className="lg:col-span-2">
          <Card
            title="Donation Eligibility Status"
            subtitle="Calculated based on clinical rest interval protocols"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      eligibility?.is_eligible
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {eligibility?.is_eligible ? 'Eligible to Donate' : 'Rest Cooldown Active'}
                  </span>
                </div>
                <h4 className="font-heading text-lg font-bold text-slate-800 mt-2">
                  {eligibility?.is_eligible
                    ? 'You are clinically cleared for blood donation!'
                    : `Next eligible donation date: ${eligibility?.next_eligible_date}`}
                </h4>
                <p className="text-xs text-slate-500 max-w-md">
                  {eligibility?.recommendation ||
                    'Thank you for keeping regular donation habits. Your next contribution can make an extraordinary difference.'}
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link to="/donor/book-appointment">
                  <Button variant="primary" size="md" icon={CalendarPlus}>
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Appointment Card */}
        <div className="lg:col-span-1">
          <Card title="Upcoming Appointment" subtitle="Your next scheduled visit">
            {upcomingAppt ? (
              <div className="p-4 rounded-2xl bg-crimson-50/50 border border-crimson-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-crimson-900">{upcomingAppt.date}</span>
                  <StatusBadge status={upcomingAppt.status} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{upcomingAppt.center}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {upcomingAppt.time_slot}
                  </p>
                </div>
                <Link
                  to="/donor/appointments"
                  className="text-xs font-bold text-crimson-900 hover:underline flex items-center gap-1 pt-1"
                >
                  Manage Appointment <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-500">No scheduled visits in queue.</p>
                <Link to="/donor/book-appointment">
                  <Button variant="secondary" size="sm">
                    Schedule Now
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 4. RECENT DONATIONS & NOTIFICATIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <Card
          title="Recent Donation History"
          subtitle="Your verified track record"
          action={
            <Link to="/donor/donations" className="text-xs font-bold text-crimson-900 hover:underline">
              View All
            </Link>
          }
        >
          <Table
            data={donations.slice(0, 3)}
            columns={[
              {
                title: 'Date',
                dataIndex: 'date',
                render: (v) => <span className="font-semibold text-slate-800">{v}</span>,
              },
              {
                title: 'Center',
                dataIndex: 'center',
              },
              {
                title: 'Units',
                dataIndex: 'units',
                render: (v) => <span>{v} Unit</span>,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (v) => <StatusBadge status={v} />,
              },
            ]}
          />
        </Card>

        {/* Notifications Feed */}
        <Card
          title="Latest Alerts & Notices"
          subtitle="Emergency shortages & network updates"
          action={
            <Link to="/donor/notifications" className="text-xs font-bold text-crimson-900 hover:underline">
              View All
            </Link>
          }
        >
          <div className="space-y-3">
            {notifications.slice(0, 3).map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-crimson-50 text-crimson-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DonorDashboard;
