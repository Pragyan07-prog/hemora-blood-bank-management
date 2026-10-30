import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Lock, Shield, Heart, Save, KeyRound } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

export const DonorProfile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    phone: user?.phone || '+1 (555) 876-5432',
    address: user?.address || '742 Evergreen Terrace',
    city: user?.city || 'Metro City',
    state: user?.state || 'California',
    emergency_contact_name: user?.emergency_contact_name || 'Emily Hayes',
    emergency_contact_phone: user?.emergency_contact_phone || '+1 (555) 876-9999',
  });

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (err) {
      // handled by context toast
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await authService.changePassword(passwordData);
      toast.success('Password updated successfully');
      setPasswordModalOpen(false);
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error('Failed to update password');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Donor Profile & Credentials</h2>
          <p className="text-sm text-slate-500">Manage your contact information, address, and emergency details</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setPasswordModalOpen(true)}
            icon={KeyRound}
          >
            Change Password
          </Button>
          <Button
            variant={isEditing ? 'secondary' : 'primary'}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel Edit' : 'Edit Information'}
          </Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card>
        {/* Header with Avatar & Blood Group */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 text-center sm:text-left">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-crimson-900 to-crimson-700 text-white font-heading font-black text-3xl flex items-center justify-center shadow-lg ring-4 ring-crimson-50">
            {user?.name?.charAt(0) || 'A'}
          </div>

          <div className="flex-1 space-y-1">
            <h3 className="font-heading text-2xl font-black text-slate-900">{user?.name || 'Alexander Hayes'}</h3>
            <p className="text-sm text-slate-500">{user?.email || 'donor@hemora.org'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <BloodGroupBadge bloodGroup={user?.blood_group || 'O+'} size="md" />
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Verified Volunteer Donor
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleProfileSave} className="space-y-6 pt-6">
          {/* Non-editable notice */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
            <strong>Note on Clinical Verification:</strong> Full name, registered email, and certified blood group cannot be directly modified online as they are linked to clinical laboratory crossmatches. Contact your blood bank administrator if corrections are required.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Contact Phone Number"
              icon={Phone}
              disabled={!isEditing}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <Input
              label="Street Address"
              icon={MapPin}
              disabled={!isEditing}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />

            <Input
              label="City"
              disabled={!isEditing}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />

            <Input
              label="State / Province"
              disabled={!isEditing}
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </div>

          {/* Emergency Contact */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Emergency Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Emergency Contact Person"
                icon={Shield}
                disabled={!isEditing}
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                required
              />
              <Input
                label="Emergency Contact Phone"
                icon={Phone}
                disabled={!isEditing}
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                required
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={Save}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Change Password Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Change Account Password"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            value={passwordData.current_password}
            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
            required
          />
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
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DonorProfile;
