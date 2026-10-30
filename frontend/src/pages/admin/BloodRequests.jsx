import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, Truck, Eye, AlertCircle } from 'lucide-react';
import requestService from '../../services/requestService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';

export const BloodRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await requestService.getRequests({
        status: activeTab,
        search,
      });
      setRequests(res.data || []);
    } catch (err) {
      toast.error('Failed to load blood requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const handleApprove = async (id) => {
    try {
      await requestService.updateRequestStatus(id, 'APPROVED');
      toast.success('Blood request approved for preparation!');
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
      );
    } catch (err) {
      toast.error('Failed to approve request');
    }
  };

  const handleFulfill = async (id) => {
    try {
      await requestService.updateRequestStatus(id, 'FULFILLED');
      toast.success('Blood request fulfilled and units dispatched!');
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'FULFILLED' } : r))
      );
    } catch (err) {
      toast.error('Failed to fulfill request');
    }
  };

  const handleOpenReject = (req) => {
    setSelectedRequest(req);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectReason) {
      toast.error('Please enter a rejection reason');
      return;
    }
    try {
      await requestService.updateRequestStatus(selectedRequest.id, 'REJECTED', rejectReason);
      toast.success('Request rejected.');
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedRequest.id
            ? { ...r, status: 'REJECTED', rejection_reason: rejectReason }
            : r
        )
      );
      setRejectModalOpen(false);
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  const handleOpenDetail = (req) => {
    setSelectedRequest(req);
    setDetailModalOpen(true);
  };

  const tabs = ['ALL', 'PENDING', 'APPROVED', 'FULFILLED', 'REJECTED'];

  const columns = [
    {
      title: 'Patient & ID',
      render: (_, row) => (
        <div>
          <p className="font-bold text-slate-800">{row.patient_name}</p>
          <span className="font-mono text-xs text-crimson-900 font-semibold">{row.id}</span>
        </div>
      ),
    },
    {
      title: 'Group',
      dataIndex: 'blood_group',
      render: (v) => <BloodGroupBadge bloodGroup={v} size="sm" />,
    },
    {
      title: 'Units',
      dataIndex: 'units',
      render: (v) => <span className="font-bold">{v} Units</span>,
    },
    {
      title: 'Hospital',
      dataIndex: 'hospital',
      render: (v, row) => (
        <div>
          <p className="font-medium text-slate-800">{v}</p>
          <p className="text-xs text-slate-400">{row.city}</p>
        </div>
      ),
    },
    {
      title: 'Urgency',
      dataIndex: 'urgency',
      render: (v) => <StatusBadge status={v} type="urgency" />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (v) => <StatusBadge status={v} />,
    },
    {
      title: 'Required Date',
      dataIndex: 'required_date',
    },
    {
      title: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleOpenDetail(row)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                title="Approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenReject(row)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                title="Reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}

          {row.status === 'APPROVED' && (
            <Button
              size="sm"
              variant="primary"
              className="py-1 px-2.5 text-xs"
              onClick={() => handleFulfill(row.id)}
              icon={Truck}
            >
              Fulfill
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Hospital Blood Requests</h2>
          <p className="text-sm text-slate-500">Triage emergency patient requisitions and blood shipments</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab
                    ? 'bg-white text-crimson-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="sm:w-72">
            <Input
              placeholder="Search patient, hospital, or ID..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
      </Card>

      {/* Requests Table */}
      <Card title={`Blood Requests (${requests.length})`}>
        <Table
          columns={columns}
          data={requests}
          isLoading={isLoading}
        />
      </Card>

      {/* Details Modal */}
      {selectedRequest && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Requisition Details: ${selectedRequest.id}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Requested Group & Units</p>
                <div className="flex items-center gap-3 mt-1">
                  <BloodGroupBadge bloodGroup={selectedRequest.blood_group} size="lg" />
                  <span className="font-heading text-xl font-black text-slate-800">
                    {selectedRequest.units} Units
                  </span>
                </div>
              </div>
              <div className="text-right">
                <StatusBadge status={selectedRequest.urgency} type="urgency" />
                <div className="mt-1">
                  <StatusBadge status={selectedRequest.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Patient Name:</span>
                <span className="font-semibold text-slate-800">{selectedRequest.patient_name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Hospital Facility:</span>
                <span className="font-semibold text-slate-800">{selectedRequest.hospital}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Contact Doctor/Nurse:</span>
                <span className="text-slate-700">{selectedRequest.contact_name}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Contact Phone:</span>
                <span className="text-slate-700">{selectedRequest.contact_phone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Required By Date:</span>
                <span className="text-slate-700">{selectedRequest.required_date}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold">Submitted On:</span>
                <span className="text-slate-700">{selectedRequest.created_at}</span>
              </div>
            </div>

            {selectedRequest.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Clinical Notes</span>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedRequest.notes}</p>
              </div>
            )}

            {selectedRequest.rejection_reason && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-xs font-bold text-rose-800 uppercase block mb-1">Rejection Rationale</span>
                <p className="text-xs text-rose-700">{selectedRequest.rejection_reason}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Blood Requisition"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-sm text-slate-500">
            Please provide a clinical or inventory reason for rejecting request{' '}
            <strong>{selectedRequest?.id}</strong>.
          </p>
          <textarea
            className="input w-full h-28"
            placeholder="e.g., Unverifiable medical requisition, insufficient clinical crossmatch paperwork..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BloodRequests;
