import React, { useState } from 'react';
import { UserPlus, Search, Shield, Power, Mail, Phone, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';

const MOCK_USERS = [
  { id: 1, name: 'Dr. Sarah Mitchell', email: 'admin@hemora.org', role: 'ADMIN', phone: '+1 (555) 234-5678', status: 'ACTIVE', created_at: '2023-01-10' },
  { id: 2, name: 'Alexander Hayes', email: 'donor@hemora.org', role: 'DONOR', phone: '+1 (555) 876-5432', status: 'ACTIVE', created_at: '2023-01-15' },
  { id: 3, name: 'Nurse Jennifer Adams', email: 'jennifer@hemora.org', role: 'STAFF', phone: '+1 (555) 345-6789', status: 'ACTIVE', created_at: '2023-04-20' },
  { id: 4, name: 'Dr. Robert Chen', email: 'robert.chen@hemora.org', role: 'ADMIN', phone: '+1 (555) 901-2345', status: 'ACTIVE', created_at: '2023-06-12' },
  { id: 5, name: 'Marcus Vance', email: 'marcus.vance@example.com', role: 'DONOR', phone: '+1 (555) 678-9012', status: 'INACTIVE', created_at: '2022-08-10' },
];

export const UserManagement = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    password: '',
  });

  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u))
    );
    toast.success('User status updated');
  };

  const handleCreateAdmin = (e) => {
    e.preventDefault();
    const newUser = {
      id: Date.now(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      status: 'ACTIVE',
      created_at: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    setIsModalOpen(false);
    toast.success(`${formData.role} created successfully!`);
  };

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const columns = [
    {
      title: 'User Name',
      dataIndex: 'name',
      render: (v, row) => (
        <div>
          <p className="font-bold text-slate-800">{v}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (v) => {
        const colors = {
          ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
          STAFF: 'bg-blue-100 text-blue-800 border-blue-200',
          DONOR: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${colors[v] || colors.DONOR}`}>
            <Shield className="w-3 h-3" />
            {v}
          </span>
        );
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      title: 'Registered Date',
      dataIndex: 'created_at',
    },
    {
      title: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className={`p-1.5 rounded-lg border transition-colors ${
            row.status === 'ACTIVE'
              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
              : 'text-emerald-600 bg-emerald-50 border-emerald-200'
          }`}
          title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        >
          <Power className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">User Governance & Roles</h2>
          <p className="text-sm text-slate-500">Manage administrator privileges, staff access, and registered donors</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          icon={UserPlus}
        >
          Create Admin / Staff
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search user by name or email..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Roles' },
              { value: 'ADMIN', label: 'Administrators' },
              { value: 'STAFF', label: 'Clinical Staff' },
              { value: 'DONOR', label: 'Registered Donors' },
            ]}
          />
        </div>
      </Card>

      <Card title={`System Users (${filtered.length})`}>
        <Table columns={columns} data={filtered} />
      </Card>

      {/* Create Admin Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Admin or Staff Account"
      >
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Dr. Evelyn Harper"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="evelyn@hemora.org"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            placeholder="+1 (555) 000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Select
            label="Role Assignment"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'ADMIN', label: 'Administrator (Full Access)' },
              { value: 'STAFF', label: 'Clinical Staff (Blood Banks & Lab)' },
            ]}
          />
          <Input
            label="Temporary Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagement;
