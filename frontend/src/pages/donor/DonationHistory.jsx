import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, CheckCircle, Droplet } from 'lucide-react';
import donationService from '../../services/donationService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';

export const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      setIsLoading(true);
      try {
        const res = await donationService.getMyDonations();
        setDonations(res.data || []);
      } catch (err) {
        toast.error('Failed to load donation history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const columns = [
    {
      title: 'Donation Date',
      dataIndex: 'date',
      render: (v) => <span className="font-bold text-slate-900">{v}</span>,
    },
    {
      title: 'Collection Center',
      dataIndex: 'center',
    },
    {
      title: 'Donation Type',
      dataIndex: 'donation_type',
    },
    {
      title: 'Units Contributed',
      dataIndex: 'units',
      render: (v) => <span className="font-bold text-crimson-900">{v} Unit</span>,
    },
    {
      title: 'Screening Hemoglobin',
      dataIndex: 'hemoglobin',
      render: (v) => <span className="text-xs text-slate-500">{v} g/dL (Cleared)</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      title: 'Certificate',
      render: (_, row) =>
        row.has_certificate ? (
          <Link to="/donor/certificates">
            <Button size="sm" variant="secondary" icon={Award} className="text-xs py-1">
              View Cert
            </Button>
          </Link>
        ) : (
          <span className="text-xs text-slate-400">Processing</span>
        ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">My Donation History</h2>
          <p className="text-sm text-slate-500">Your verified humanitarian legacy of life-saving contributions</p>
        </div>
        <div className="p-3 bg-crimson-50 border border-crimson-100 rounded-2xl flex items-center gap-3">
          <Droplet className="w-6 h-6 text-crimson-600 fill-crimson-600" />
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold">Total Donated</p>
            <p className="font-heading text-lg font-black text-crimson-900">{donations.length} Units</p>
          </div>
        </div>
      </div>

      <Card title="Verified Donations">
        <Table columns={columns} data={donations} isLoading={isLoading} />
      </Card>
    </div>
  );
};

export default DonationHistory;
