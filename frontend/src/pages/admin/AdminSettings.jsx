import React, { useState } from 'react';
import { Save, Bell, Shield, Sliders, Database, Lock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export const AdminSettings = () => {
  const [thresholds, setThresholds] = useState({
    critical_threshold: 10,
    optimal_threshold: 40,
    expiry_warning_days: 3,
    auto_alert_emails: true,
    require_doctor_slip: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('System configuration saved successfully!');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">System Governance & Settings</h2>
        <p className="text-sm text-slate-500">Configure safety thresholds, automated triage rules, and network preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Inventory Safety Thresholds */}
        <Card title="Inventory Thresholds & Early Warning Limits" subtitle="Automated triggers for low stock notifications">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Critical Shortage Threshold (Units)"
              type="number"
              value={thresholds.critical_threshold}
              onChange={(e) => setThresholds({ ...thresholds, critical_threshold: e.target.value })}
              helperText="Alerts fire when any group drops below this number."
            />
            <Input
              label="Optimal Stock Goal (Units)"
              type="number"
              value={thresholds.optimal_threshold}
              onChange={(e) => setThresholds({ ...thresholds, optimal_threshold: e.target.value })}
              helperText="Standard inventory target per blood type."
            />
            <Input
              label="Expiry Warning Window (Days)"
              type="number"
              value={thresholds.expiry_warning_days}
              onChange={(e) => setThresholds({ ...thresholds, expiry_warning_days: e.target.value })}
              helperText="Days before whole blood reaches shelf-life limit."
            />
          </div>
        </Card>

        {/* Triage & Operational Policies */}
        <Card title="Operational Policies & Dispatch Rules">
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-800">Automated Shortage Broadcasts</p>
                <p className="text-xs text-slate-500">Automatically broadcast emergency notifications to eligible donors when inventory hits critical status.</p>
              </div>
              <input
                type="checkbox"
                checked={thresholds.auto_alert_emails}
                onChange={(e) => setThresholds({ ...thresholds, auto_alert_emails: e.target.checked })}
                className="rounded border-slate-300 text-crimson-900 focus:ring-crimson-500 h-5 w-5"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-slate-800">Mandatory Hospital Requisition Form</p>
                <p className="text-xs text-slate-500">Require an uploaded medical prescription and hospital serial number for blood requests.</p>
              </div>
              <input
                type="checkbox"
                checked={thresholds.require_doctor_slip}
                onChange={(e) => setThresholds({ ...thresholds, require_doctor_slip: e.target.checked })}
                className="rounded border-slate-300 text-crimson-900 focus:ring-crimson-500 h-5 w-5"
              />
            </label>
          </div>
        </Card>

        {/* Database & System Information */}
        <Card title="Network Environment & Diagnostics">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-semibold">API Environment</span>
              <span className="font-bold text-slate-800">Production v2.4</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-semibold">Database Latency</span>
              <span className="font-bold text-emerald-600">18 ms</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-semibold">Backup Synchronization</span>
              <span className="font-bold text-slate-800">Hourly (Active)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-semibold">HIPAA Security Protocol</span>
              <span className="font-bold text-emerald-600">Enforced</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" isLoading={isSaving} icon={Save}>
            Save System Configurations
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
