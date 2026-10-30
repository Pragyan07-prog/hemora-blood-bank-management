import React, { useState, useEffect } from 'react';
import { Award, Search, Download, Eye, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import certificateService from '../../services/certificateService';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import toast from 'react-hot-toast';

export const CertificateManagement = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyQuery, setVerifyQuery] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const res = await certificateService.getCertificates();
      setCertificates(res.data || []);
    } catch (err) {
      toast.error('Failed to load certificates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleVerifySearch = async (e) => {
    e.preventDefault();
    if (!verifyQuery) return;
    try {
      const res = await certificateService.verifyCertificate(verifyQuery);
      setVerifyResult(res);
      if (res.verified) {
        toast.success('Certificate is valid and authentic!');
      } else {
        toast.error('Certificate not found or unverified.');
      }
    } catch (err) {
      toast.error('Verification error');
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const columns = [
    {
      title: 'Certificate Number',
      dataIndex: 'certificate_number',
      render: (v) => <span className="font-mono text-xs font-bold text-crimson-900">{v}</span>,
    },
    {
      title: 'Donor Name',
      dataIndex: 'donor_name',
      render: (v) => <span className="font-bold text-slate-800">{v}</span>,
    },
    {
      title: 'Blood Group',
      dataIndex: 'blood_group',
      render: (v) => <BloodGroupBadge bloodGroup={v} size="sm" />,
    },
    {
      title: 'Donation Date',
      dataIndex: 'donation_date',
    },
    {
      title: 'Issued Date',
      dataIndex: 'issued_date',
    },
    {
      title: 'Collection Center',
      dataIndex: 'center',
    },
    {
      title: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setPreviewCert(row)}
            icon={Eye}
          >
            Preview
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Certificate Registry</h2>
        <p className="text-sm text-slate-500">Official digital donor appreciation credentials and verification registry</p>
      </div>

      {/* Verification Search Bar */}
      <Card>
        <form onSubmit={handleVerifySearch} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Input
              placeholder="Verify Certificate by Credential ID (e.g. HEMORA-CERT-901-2026)..."
              icon={Search}
              value={verifyQuery}
              onChange={(e) => setVerifyQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" icon={ShieldCheck}>
            Verify Authenticity
          </Button>
        </form>

        {verifyResult && (
          <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${
            verifyResult.verified
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              {verifyResult.verified ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <Award className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold">
                {verifyResult.verified
                  ? `Authentic Certificate: Awarded to ${verifyResult.data?.donor_name} on ${verifyResult.data?.donation_date} for donating ${verifyResult.data?.blood_group}.`
                  : verifyResult.message}
              </span>
            </div>
            {verifyResult.verified && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setPreviewCert(verifyResult.data)}
              >
                View
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Certificates Table */}
      <Card title={`Issued Certificates (${certificates.length})`}>
        <Table columns={columns} data={certificates} isLoading={isLoading} />
      </Card>

      {/* Preview / Print Certificate Modal */}
      {previewCert && (
        <Modal
          isOpen={!!previewCert}
          onClose={() => setPreviewCert(null)}
          maxWidth="max-w-2xl"
          title="Lifesaver Certificate Preview"
        >
          {/* Official Printable Certificate Canvas */}
          <div className="p-8 rounded-3xl border-8 border-double border-crimson-900/30 bg-gradient-to-br from-amber-50/40 via-white to-red-50/20 text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-2 left-2 text-crimson-200 text-xs font-mono">
              OFFICIAL CERTIFICATE
            </div>
            <div className="w-16 h-16 rounded-full bg-crimson-900 text-white flex items-center justify-center mx-auto mb-4 shadow-md">
              <Award className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-crimson-800">
              HEMORA Blood Bank Network
            </span>
            <h2 className="font-heading text-3xl font-black text-slate-900 mt-2 mb-1">
              Certificate of Appreciation
            </h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-6">
              Presented in recognition of outstanding humanitarian contribution
            </p>

            <p className="text-sm text-slate-600">This certifies that</p>
            <h3 className="font-heading text-2xl font-black text-crimson-900 my-2 underline decoration-crimson-200">
              {previewCert.donor_name}
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              has generously and voluntarily donated <strong className="text-slate-900">{previewCert.units || 1} unit(s)</strong> of <strong className="text-slate-900">{previewCert.blood_group}</strong> blood at <strong className="text-slate-900">{previewCert.center}</strong>, making a direct and vital contribution toward saving human lives.
            </p>

            <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
              <div>
                <p className="font-bold text-slate-800">Dr. Sarah Mitchell</p>
                <p className="text-[11px] text-slate-400">Chief Medical Director, HEMORA</p>
              </div>
              <div>
                <p className="font-mono font-bold text-slate-800">{previewCert.certificate_number}</p>
                <p className="text-[11px] text-slate-400">Issued: {previewCert.issued_date}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setPreviewCert(null)}>
              Close
            </Button>
            <Button variant="primary" onClick={handlePrintCertificate} icon={Printer}>
              Print / Save PDF
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CertificateManagement;
