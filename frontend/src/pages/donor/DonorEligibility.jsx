import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, Heart, CalendarPlus } from 'lucide-react';
import donorService from '../../services/donorService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

export const DonorEligibility = () => {
  const [eligibility, setEligibility] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElig = async () => {
      try {
        const res = await donorService.getEligibility();
        setEligibility(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchElig();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Donation Eligibility Tracker</h2>
        <p className="text-sm text-slate-500">Clinical health screening criteria and rest cycle countdown</p>
      </div>

      {/* Hero Status Card */}
      <Card
        className={`p-8 text-center border-2 ${
          eligibility?.is_eligible
            ? 'border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white'
            : 'border-amber-200 bg-gradient-to-b from-amber-50/50 to-white'
        }`}
      >
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-md ${
            eligibility?.is_eligible
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-amber-100 text-amber-600'
          }`}
        >
          {eligibility?.is_eligible ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <Clock className="w-10 h-10" />
          )}
        </div>

        <span
          className={`inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 ${
            eligibility?.is_eligible
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {eligibility?.is_eligible ? 'Cleared for Donation' : 'Active Rest Cooldown'}
        </span>

        <h3 className="font-heading text-3xl font-extrabold text-slate-900">
          {eligibility?.is_eligible
            ? 'You Are Eligible to Donate Blood!'
            : `Eligible in Approximately ${eligibility?.days_remaining || 16} Days`}
        </h3>

        <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
          {eligibility?.recommendation}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto my-8 pt-6 border-t border-slate-100 text-left">
          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Last Donated
            </span>
            <span className="text-sm font-black text-slate-800">{eligibility?.last_donation_date || 'N/A'}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Next Eligible Date
            </span>
            <span className="text-sm font-black text-crimson-900">{eligibility?.next_eligible_date}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Rest Standard
            </span>
            <span className="text-sm font-black text-slate-800">56 Days Interval</span>
          </div>
        </div>

        <div className="flex justify-center">
          <Link to="/donor/book-appointment">
            <Button variant="primary" size="lg" icon={CalendarPlus}>
              Schedule Upcoming Slot
            </Button>
          </Link>
        </div>
      </Card>

      {/* Clinical Checklist Rules */}
      <Card title="Eligibility Safety Standards" subtitle="Established hematology criteria for volunteer protection">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Weight & Vital Mass</h4>
                <p className="text-xs text-slate-500">Minimum 50 kg (110 lbs). Ensures sufficient blood volume reserves.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Age Qualification</h4>
                <p className="text-xs text-slate-500">Ages 18 to 65 years. Donors over 65 cleared upon medical evaluation.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Hemoglobin Levels</h4>
                <p className="text-xs text-slate-500">Minimum 12.5 g/dL (Females) and 13.0 g/dL (Males) verified prior to phlebotomy.</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Medication Deferrals</h4>
                <p className="text-xs text-slate-500">Blood thinners, certain antibiotics, and retinoids carry temporary deferral windows.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Recent Tattoos or Piercings</h4>
                <p className="text-xs text-slate-500">Standard 3-month wait interval unless performed at a state-regulated sterile facility.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-800">Pregnancy & Nursing</h4>
                <p className="text-xs text-slate-500">Eligible 6 months postpartum and after completion of breastfeeding.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 text-xs text-slate-500 leading-relaxed">
        <strong>Medical Disclaimer:</strong> This tracker serves as an operational estimate based on recorded donation logs. Final donor acceptance is subject to rapid on-site confidential hemoglobin testing, blood pressure assessment, and a brief health questionnaire on donation day.
      </div>
    </div>
  );
};

export default DonorEligibility;
