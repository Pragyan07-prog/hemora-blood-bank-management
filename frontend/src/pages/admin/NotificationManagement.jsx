import React, { useState, useEffect } from 'react';
import { Send, Bell, Users, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import notificationService from '../../services/notificationService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { BLOOD_GROUPS } from '../../utils/constants';
import toast from 'react-hot-toast';

export const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    target: 'ALL',
    blood_group: 'O+',
    type: 'ALERT',
    title: '',
    message: '',
  });

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await notificationService.getNotifications();
      setNotifications(res.data || []);
    } catch (err) {
      toast.error('Failed to load notification history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Please enter both title and message');
      return;
    }

    setIsSending(true);
    try {
      const res = await notificationService.sendNotification(formData);
      toast.success(res.message || 'Notification broadcasted successfully!');
      setNotifications((prev) => [res.data, ...prev]);
      setFormData({
        target: 'ALL',
        blood_group: 'O+',
        type: 'ALERT',
        title: '',
        message: '',
      });
    } catch (err) {
      toast.error('Failed to send broadcast');
    } finally {
      setIsSending(false);
    }
  };

  const columns = [
    {
      title: 'Title & Summary',
      render: (_, row) => (
        <div>
          <p className="font-bold text-slate-800">{row.title}</p>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{row.message}</p>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (v) => {
        const colors = {
          ALERT: 'bg-rose-100 text-rose-800',
          INFO: 'bg-blue-100 text-blue-800',
          SUCCESS: 'bg-emerald-100 text-emerald-800',
          EVENT: 'bg-purple-100 text-purple-800',
        };
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${colors[v] || colors.INFO}`}>
            {v}
          </span>
        );
      },
    },
    {
      title: 'Target Audience',
      render: (_, row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.target === 'GROUP' ? `Group: ${row.blood_group}` : row.target || 'All Donors'}
        </span>
      ),
    },
    {
      title: 'Date Broadcasted',
      dataIndex: 'created_at',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Notification & Alert Center</h2>
        <p className="text-sm text-slate-500">Dispatch instant emergency donor calls, drive reminders, and notices</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Broadcast Form */}
        <div className="lg:col-span-1">
          <Card title="Broadcast Message" subtitle="Target specific donor groups or whole community">
            <form onSubmit={handleSend} className="space-y-4">
              <Select
                label="Target Audience"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                options={[
                  { value: 'ALL', label: 'All Registered Donors' },
                  { value: 'ELIGIBLE', label: 'Eligible Donors Only' },
                  { value: 'GROUP', label: 'Specific Blood Group' },
                ]}
              />

              {formData.target === 'GROUP' && (
                <Select
                  label="Select Blood Group"
                  value={formData.blood_group}
                  onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
                />
              )}

              <Select
                label="Notification Priority / Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                options={[
                  { value: 'ALERT', label: 'Urgent Alert (Emergency Shortage)' },
                  { value: 'INFO', label: 'General Information' },
                  { value: 'EVENT', label: 'Camp / Drive Event Announcement' },
                  { value: 'SUCCESS', label: 'Appreciation & Milestone' },
                ]}
              />

              <Input
                label="Headline / Title"
                placeholder="e.g. Critical O- Negative Shortage"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Message Content
                </label>
                <textarea
                  className="input w-full h-24"
                  placeholder="Enter detailed notice message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isSending}
                icon={Send}
              >
                Send Broadcast
              </Button>
            </form>
          </Card>
        </div>

        {/* Broadcast History Table */}
        <div className="lg:col-span-2">
          <Card title="Broadcast History" subtitle="Sent alerts, calls, and donor bulletins">
            <Table columns={columns} data={notifications} isLoading={isLoading} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationManagement;
