import React, { useState, useEffect } from 'react';
import { Plus, Droplets, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import { BLOOD_GROUPS, DONATION_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

export const BloodInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    blood_group: 'O+',
    units: 1,
    donation_type: 'Whole Blood',
    batch_number: `BATCH-${Date.now().toString().slice(-6)}`,
    source: 'Central Regional Drive',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [invRes, txRes] = await Promise.all([
        inventoryService.getInventory(),
        inventoryService.getTransactions(),
      ]);
      setInventory(invRes.data || []);
      setTransactions(txRes.data || []);
    } catch (err) {
      toast.error('Failed to load blood inventory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddUnits = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.addUnits(formData);
      toast.success(`Added ${formData.units} units of ${formData.blood_group}`);
      setIsModalOpen(false);
      // update local inventory
      setInventory((prev) =>
        prev.map((item) =>
          item.blood_group === formData.blood_group
            ? { ...item, units: item.units + parseInt(formData.units, 10) }
            : item
        )
      );
    } catch (err) {
      toast.error('Failed to add blood units');
    }
  };

  const lowStock = inventory.filter((i) => i.status === 'LOW' || i.status === 'CRITICAL');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Blood Bank Inventory</h2>
          <p className="text-sm text-slate-500">Real-time telemetry and component units reserve</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={Plus}
        >
          Add Blood Units
        </Button>
      </div>

      {/* Low stock alerts banner */}
      {lowStock.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-rose-900">Low Stock Threshold Warning</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Attention: {lowStock.map((l) => `${l.blood_group} (${l.units} units)`).join(', ')} are currently below safe operational reserves. Prioritize donor drives for these groups.
            </p>
          </div>
        </div>
      )}

      {/* 8 Blood Group Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {inventory.map((item) => {
          const isCritical = item.status === 'CRITICAL';
          const isLow = item.status === 'LOW';
          return (
            <Card
              key={item.blood_group}
              className={`p-4 text-center border transition-all hover:-translate-y-1 ${
                isCritical
                  ? 'border-rose-300 bg-rose-50/50'
                  : isLow
                  ? 'border-amber-300 bg-amber-50/50'
                  : 'border-emerald-200 bg-emerald-50/30'
              }`}
            >
              <div className="flex justify-center mb-1">
                <BloodGroupBadge bloodGroup={item.blood_group} size="sm" />
              </div>
              <h3 className="font-heading text-3xl font-black text-slate-900 mt-2">{item.units}</h3>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Available Units</p>
              <div className="mt-3">
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isCritical
                      ? 'bg-rose-100 text-rose-800'
                      : isLow
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Full Inventory Table */}
      <Card title="Current Blood Stock Levels" subtitle="Detailed breakdown of units and safety thresholds">
        <Table
          data={inventory}
          isLoading={isLoading}
          columns={[
            {
              title: 'Blood Group',
              dataIndex: 'blood_group',
              render: (v) => <BloodGroupBadge bloodGroup={v} size="md" />,
            },
            {
              title: 'Available Units',
              dataIndex: 'units',
              render: (v) => <span className="font-bold text-slate-900 text-base">{v} Units</span>,
            },
            {
              title: 'Optimal Threshold',
              dataIndex: 'optimal_threshold',
              render: (v) => <span className="text-slate-600 font-medium">{v} Units</span>,
            },
            {
              title: 'Critical Threshold',
              dataIndex: 'critical_threshold',
              render: (v) => <span className="text-rose-600 font-semibold">{v} Units</span>,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (v) => <StatusBadge status={v} />,
            },
            {
              title: 'Last Updated',
              dataIndex: 'last_updated',
            },
          ]}
        />
      </Card>

      {/* Transaction History Table */}
      <Card title="Recent Stock Transactions" subtitle="Inflow from donations and outgoing dispatches to hospitals">
        <Table
          data={transactions}
          columns={[
            {
              title: 'Transaction ID',
              dataIndex: 'id',
              render: (v) => <span className="font-mono text-xs font-semibold">#TXN-{v}</span>,
            },
            {
              title: 'Type',
              dataIndex: 'type',
              render: (v) => (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    v === 'INCOMING'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {v === 'INCOMING' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                  {v}
                </span>
              ),
            },
            {
              title: 'Blood Group',
              dataIndex: 'blood_group',
              render: (v) => <BloodGroupBadge bloodGroup={v} size="sm" />,
            },
            {
              title: 'Units',
              dataIndex: 'units',
              render: (v) => <span className="font-bold">{v} Units</span>,
            },
            {
              title: 'Recipient / Donor',
              render: (_, row) => (
                <span className="font-medium text-slate-800">
                  {row.recipient || row.donor_name || 'Central Lab'}
                </span>
              ),
            },
            {
              title: 'Recorded By',
              dataIndex: 'recorded_by',
            },
            {
              title: 'Date & Time',
              dataIndex: 'date',
            },
          ]}
        />
      </Card>

      {/* Add Units Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Blood Units to Inventory"
      >
        <form onSubmit={handleAddUnits} className="space-y-4">
          <Select
            label="Blood Group"
            value={formData.blood_group}
            onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
            options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
            required
          />

          <Input
            label="Quantity (Units)"
            type="number"
            min="1"
            max="100"
            value={formData.units}
            onChange={(e) => setFormData({ ...formData, units: e.target.value })}
            required
          />

          <Select
            label="Donation Component Type"
            value={formData.donation_type}
            onChange={(e) => setFormData({ ...formData, donation_type: e.target.value })}
            options={DONATION_TYPES.map((t) => ({ value: t, label: t }))}
            required
          />

          <Input
            label="Batch Reference Number"
            value={formData.batch_number}
            onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
            required
          />

          <Input
            label="Source / Donation Camp"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm & Add Units
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BloodInventory;
