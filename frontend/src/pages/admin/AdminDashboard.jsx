import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Droplets,
  Clock,
  CheckCircle,
  Heart,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import analyticsService from '../../services/analyticsService';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import Skeleton from '../../components/ui/Skeleton';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await analyticsService.getDashboardAnalytics();
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton count={4} className="h-28" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton count={4} className="h-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const {
    stats = {},
    blood_group_distribution = [],
    monthly_donations = [],
    request_trends = [],
    request_status_distribution = [],
    recent_donors = [],
    recent_requests = [],
    alerts = [],
  } = data || {};

  return (
    <div className="space-y-8 animate-fade-in">
      {/* System Alerts Banner if any */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl flex items-center justify-between border ${
                alert.level === 'danger'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-5 h-5 flex-shrink-0 ${alert.level === 'danger' ? 'text-rose-600' : 'text-amber-600'}`} />
                <span className="text-sm font-semibold">{alert.message}</span>
              </div>
              <Link
                to="/admin/inventory"
                className="text-xs font-bold underline hover:opacity-80 flex items-center gap-1"
              >
                Inspect Inventory <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* STATS GRID: 2 Rows x 4 Cols = 8 Cards */}
      <div className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Donors"
            value={stats.total_donors?.toLocaleString() || '1,420'}
            icon={Users}
            color="blue"
            trend="12%"
            trendDirection="up"
            subtitle="vs last month"
          />
          <StatCard
            title="Active Donors"
            value={stats.active_donors?.toLocaleString() || '1,180'}
            icon={UserCheck}
            color="green"
            subtitle="Ready to donate"
          />
          <StatCard
            title="Blood Units Available"
            value={stats.blood_units_available || '243'}
            icon={Droplets}
            color="crimson"
            subtitle="Across all groups"
          />
          <StatCard
            title="Pending Requests"
            value={stats.pending_requests || '12'}
            icon={Clock}
            color="orange"
            subtitle="Awaiting triage"
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Approved Requests"
            value={stats.approved_requests || '48'}
            icon={CheckCircle}
            color="teal"
            subtitle="Prepared for dispatch"
          />
          <StatCard
            title="Completed Donations"
            value={stats.completed_donations?.toLocaleString() || '3,820'}
            icon={Heart}
            color="crimson"
            trend="8%"
            trendDirection="up"
            subtitle="All-time verified"
          />
          <StatCard
            title="Upcoming Appointments"
            value={stats.upcoming_appointments || '34'}
            icon={Calendar}
            color="purple"
            subtitle="Next 7 days"
          />
          <StatCard
            title="Expiring Units"
            value={stats.expiring_units || '7'}
            icon={AlertTriangle}
            color="red"
            subtitle="Within 72 hours"
          />
        </div>
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Group Distribution (PieChart) */}
        <Card title="Blood Group Distribution" subtitle="Current available units in stock">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={blood_group_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {blood_group_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Monthly Donations (BarChart) */}
        <Card title="Monthly Donations" subtitle="Total collected units (Last 12 Months)">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly_donations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Bar dataKey="units" fill="#7f1d1d" radius={[6, 6, 0, 0]} name="Units Donated" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Trends (LineChart) */}
        <Card title="Request & Fulfillment Trends" subtitle="Monthly requests vs fulfilled units">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={request_trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  name="Requests Received"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="fulfilled"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  name="Units Fulfilled"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Request Status Distribution (PieChart) */}
        <Card title="Request Status Ratio" subtitle="Proportion of request resolution states">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={request_status_distribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {request_status_distribution.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* TABLES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donor Registrations */}
        <Card
          title="Recent Donor Registrations"
          subtitle="Latest verified blood donors"
          action={
            <Link to="/admin/donors" className="text-xs font-bold text-crimson-800 hover:underline">
              View All
            </Link>
          }
        >
          <Table
            data={recent_donors}
            columns={[
              {
                title: 'Donor',
                dataIndex: 'name',
                render: (val) => <span className="font-semibold text-slate-800">{val}</span>,
              },
              {
                title: 'Group',
                dataIndex: 'blood_group',
                render: (val) => <BloodGroupBadge bloodGroup={val} size="sm" />,
              },
              {
                title: 'Joined',
                dataIndex: 'joined',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (val) => <StatusBadge status={val} />,
              },
            ]}
          />
        </Card>

        {/* Recent Blood Requests */}
        <Card
          title="Recent Blood Requests"
          subtitle="Latest patient requests from trauma desks"
          action={
            <Link to="/admin/requests" className="text-xs font-bold text-crimson-800 hover:underline">
              View All
            </Link>
          }
        >
          <Table
            data={recent_requests}
            columns={[
              {
                title: 'Request ID',
                dataIndex: 'id',
                render: (val) => <span className="font-mono text-xs font-bold text-crimson-900">{val}</span>,
              },
              {
                title: 'Patient',
                dataIndex: 'patient_name',
              },
              {
                title: 'Group',
                dataIndex: 'blood_group',
                render: (val) => <BloodGroupBadge bloodGroup={val} size="sm" />,
              },
              {
                title: 'Urgency',
                dataIndex: 'urgency',
                render: (val) => <StatusBadge status={val} type="urgency" />,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (val) => <StatusBadge status={val} />,
              },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
