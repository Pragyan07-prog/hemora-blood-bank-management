import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, Power, CheckCircle, XCircle } from 'lucide-react';
import donorService from '../../services/donorService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import { BLOOD_GROUPS } from '../../utils/constants';
import toast from 'react-hot-toast';

export const DonorManagement = () => {
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [eligibility, setEligibility] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchDonors = async () => {
    setIsLoading(true);
    try {
      const res = await donorService.getDonors({
        search,
        blood_group: bloodGroup,
        is_eligible: eligibility,
      });
      setDonors(res.data || []);
    } catch (err) {
      toast.error('Failed to load donors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, eligibility]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleToggleStatus = async (id, e) => {
    e.stopPropagation();
    try {
      await donorService.toggleDonorStatus(id);
      toast.success('Donor status toggled');
      setDonors((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: d.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : d
        )
      );
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const columns = [
    {
      title: 'Donor Name',
      dataIndex: 'name',
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-800">{val}</p>
          <p className="text-xs text-slate-400">{row.gender}, Born {row.dob}</p>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Blood Group',
      dataIndex: 'blood_group',
      render: (val) => <BloodGroupBadge bloodGroup={val} size="sm" />,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
    },
    {
      title: 'City',
      dataIndex: 'city',
    },
    {
      title: 'Eligibility',
      dataIndex: 'is_eligible',
      render: (val) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            val ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          {val ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {val ? 'Eligible' : 'Cooldown'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/admin/donors/${row.id}`)}
            icon={Eye}
          >
            Profile
          </Button>
          <button
            onClick={(e) => handleToggleStatus(row.id, e)}
            className={`p-1.5 rounded-lg border transition-colors ${
              row.status === 'ACTIVE'
                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-slate-200'
                : 'text-emerald-600 bg-emerald-50 border-emerald-200'
            }`}
            title={row.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
          >
            <Power className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <Card>
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by name, email, or phone..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            placeholder="All Blood Groups"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
          />
          <Select
            placeholder="All Eligibility"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            options={[
              { value: 'true', label: 'Eligible Only' },
              { value: 'false', label: 'Cooldown / Ineligible' },
            ]}
          />
        </form>
      </Card>

      {/* Donors Table */}
      <Card
        title={`Registered Donors (${donors.length})`}
        subtitle="Manage active volunteer donors and review eligibility statuses"
      >
        <Table
          columns={columns}
          data={donors}
          isLoading={isLoading}
          onRowClick={(row) => navigate(`/admin/donors/${row.id}`)}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={1}
          totalItems={donors.length}
          pageSize={10}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
};

export default DonorManagement;
