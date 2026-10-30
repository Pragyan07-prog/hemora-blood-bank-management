import React, { useState, useEffect } from 'react';
import { Award, Download, Printer, ShieldCheck, Search, CheckCircle2 } from 'lucide-react';
import certificateService from '../../services/certificateService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import toast from 'react-hot-toast';

export const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [searchCert, setSearchCert] = useState('');
  const [verifiedInfo, setVerifiedInfo] = useState(null);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await certificateService.getMyCertificates();
        setCertificates(res.data || []);
      } catch (err) {
        toast.error('Failed to load certificates');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCerts();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!searchCert) return;
    try {
      const res = await certificateService.verifyCertificate(searchCert);
      setVerifiedInfo(res);
      if (res.verified) {
        toast.success('Certificate is authentic and valid!');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-5xl animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">My Humanitarian Certificates</h2>
        <p className="text-sm text-slate-500">Official digital credentials of appreciation issued for your blood donations</p>
      </div>

      {/* Verification Query Card */}
      <Card>
        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search / verify any certificate credential number..."
              icon={Search}
              value={searchCert}
              onChange={(e) => setSearchCert(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" icon={ShieldCheck}>
            Verify Authenticity
          </Button>
        </form>

        {verifiedInfo && (
          <div className={`mt-4 p-4 rounded-xl border flex items-center justify-between ${
            verifiedInfo.verified
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-semibold">
                {verifiedInfo.verified
                  ? `Authentic Certificate: Awarded to ${verifiedInfo.data?.donor_name} on ${verifiedInfo.data?.donation_date} for donating ${verifiedInfo.data?.blood_group}.`
                  : verifiedInfo.message}
              </span>
            </div>
          </div>
        )}
      </Card>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <Card
            key={cert.id}
            className="border border-slate-200 hover:border-crimson-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-crimson-100 text-crimson-900 flex items-center justify-center shadow-xs">
                <Award className="w-7 h-7" />
              </div>

              <div>
                <span className="font-mono text-xs text-crimson-900 font-bold block mb-1">
                  {cert.certificate_number}
                </span>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Certificate of Appreciation
                </h3>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Donation Date:</span>
                  <span className="font-semibold text-slate-800">{cert.donation_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Component:</span>
                  <span className="font-semibold text-slate-800">{cert.donation_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Center:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">{cert.center}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <BloodGroupBadge bloodGroup={cert.blood_group} size="sm" />
              <Button
                size="sm"
                variant="primary"
                onClick={() => setSelectedCert(cert)}
                icon={Printer}
              >
                View & Print
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          maxWidth="max-w-2xl"
          title="Lifesaver Certificate Preview"
        >
          <div className="p-8 rounded-3xl border-8 border-double border-crimson-900/30 bg-gradient-to-br from-amber-50/40 via-white to-red-50/20 text-center relative overflow-hidden shadow-sm">
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
              {selectedCert.donor_name}
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              has generously and voluntarily donated <strong className="text-slate-900">{selectedCert.units || 1} unit(s)</strong> of <strong className="text-slate-900">{selectedCert.blood_group}</strong> blood at <strong className="text-slate-900">{selectedCert.center}</strong>, making a direct and vital contribution toward saving human lives.
            </p>

            <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-slate-200 text-xs text-slate-500">
              <div>
                <p className="font-bold text-slate-800">Dr. Sarah Mitchell</p>
                <p className="text-[11px] text-slate-400">Chief Medical Director, HEMORA</p>
              </div>
              <div>
                <p className="font-mono font-bold text-slate-800">{selectedCert.certificate_number}</p>
                <p className="text-[11px] text-slate-400">Issued: {selectedCert.issued_date}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setSelectedCert(null)}>
              Close
            </Button>
            <Button variant="primary" onClick={handlePrint} icon={Printer}>
              Print Certificate / Save PDF
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyCertificates;
