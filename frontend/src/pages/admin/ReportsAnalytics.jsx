import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import reportService from '../../services/reportService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import toast from 'react-hot-toast';

export const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('donations');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getReportData(activeTab, { startDate, endDate });
      setReportData(res.data);
    } catch (err) {
      toast.error('Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handleExportCSV = () => {
    if (!reportData?.table || !reportData.table.length) {
      toast.error('No table data to export');
      return;
    }
    reportService.exportCSV(`hemora_${activeTab}_report`, reportData.table);
    toast.success('CSV downloaded successfully!');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const tabs = [
    { id: 'donations', label: 'Donations' },
    { id: 'inventory', label: 'Inventory Turnover' },
    { id: 'requests', label: 'Hospital Requests' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-500">Comprehensive metric audits, compliance exports, and telemetry</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExportCSV} icon={Download}>
            Export CSV
          </Button>
          <Button variant="primary" onClick={handlePrintReport} icon={FileText}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter and Date Bar */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-crimson-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date range picker */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="input py-1.5 text-xs w-36"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              className="input py-1.5 text-xs w-36"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button size="sm" variant="secondary" onClick={fetchReport}>
              Apply
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      {reportData?.summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(reportData.summary).map(([key, value]) => (
            <Card key={key} className="p-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {key.replace(/_/g, ' ')}
              </span>
              <h3 className="font-heading text-2xl font-black text-slate-900 mt-1">{value}</h3>
            </Card>
          ))}
        </div>
      )}

      {/* Chart */}
      {reportData?.chart_data && (
        <Card title="Activity Breakdown" subtitle="Visual aggregation for selected date parameters">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.chart_data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip />
                <Bar dataKey={reportData.chart_data[0]?.units !== undefined ? 'units' : reportData.chart_data[0]?.value !== undefined ? 'value' : 'count'} fill="#7f1d1d" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Table */}
      {reportData?.table && (
        <Card title="Detailed Record Breakdown" subtitle="Tabular dataset for the current report">
          <Table
            data={reportData.table}
            isLoading={isLoading}
            columns={Object.keys(reportData.table[0] || {}).map((col) => ({
              title: col.replace(/_/g, ' ').toUpperCase(),
              dataIndex: col,
              render: (v) => <span className="text-sm font-medium text-slate-700">{String(v)}</span>,
            }))}
          />
        </Card>
      )}
    </div>
  );
};

export default ReportsAnalytics;
