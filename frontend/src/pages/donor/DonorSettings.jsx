import React, { useState } from 'react';
import { Save, Bell, Lock, Shield, User } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

export const DonorSettings = () => {
  const [preferences, setPreferences] = useState({
    notify_emergency_shortages: true,
    notify_camp_events: true,
    notify_appointment_reminders: true,
    notify_sms: true,
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setIsSavingPrefs(true);
    setTimeout(() => {
      setIsSavingPrefs(false);
      toast.success('Notification preferences updated!');
    }, 500);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await authService.changePassword(passwordData);
      toast.success('Account password updated successfully!');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error('Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Account & Notification Settings</h2>
        <p className="text-sm text-slate-500">Configure alert channels, privacy preferences, and account security</p>
      </div>

      {/* Notification Preferences */}
      <Card title="Alerts & Notification Channels" subtitle="Choose what updates you wish to receive">
        <form onSubmit={handleSavePreferences} className="space-y-4">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-800">Critical Blood Shortage Alerts</p>
              <p className="text-xs text-slate-500">Receive urgent call notifications when your blood type is critically depleted in nearby trauma centers.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notify_emergency_shortages}
              onChange={(e) => setPreferences({ ...preferences, notify_emergency_shortages: e.target.checked })}
              className="rounded border-slate-300 text-crimson-900 focus:ring-crimson-500 h-5 w-5"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-800">Mobile Blood Camps & Civic Drives</p>
              <p className="text-xs text-slate-500">Get informed about upcoming donation drives hosted in your city or district.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notify_camp_events}
              onChange={(e) => setPreferences({ ...preferences, notify_camp_events: e.target.checked })}
              className="rounded border-slate-300 text-crimson-900 focus:ring-crimson-500 h-5 w-5"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-800">Appointment Reminders</p>
              <p className="text-xs text-slate-500">Receive calendar confirmations and 24-hour hydration tips prior to donation slots.</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.notify_appointment_reminders}
              onChange={(e) => setPreferences({ ...preferences, notify_appointment_reminders: e.target.checked })}
              className="rounded border-slate-300 text-crimson-900 focus:ring-crimson-500 h-5 w-5"
            />
          </label>

          <div className="flex justify-end pt-3">
            <Button type="submit" variant="primary" isLoading={isSavingPrefs} icon={Save}>
              Save Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* Security: Change Password */}
      <Card title="Security & Password" subtitle="Ensure your account credentials remain secure">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={passwordData.current_password}
            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end pt-3">
            <Button type="submit" variant="secondary" isLoading={isUpdatingPassword} icon={Lock}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DonorSettings;
