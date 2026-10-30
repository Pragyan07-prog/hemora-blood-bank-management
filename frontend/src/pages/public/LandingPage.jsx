import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Droplet,
  Users,
  ShieldCheck,
  Calendar,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Activity,
  Building2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import inventoryService from '../../services/inventoryService';
import BloodGroupBadge from '../../components/shared/BloodGroupBadge';
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY } from '../../utils/constants';

export const LandingPage = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O+');
  const [inventoryLoading, setInventoryLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await inventoryService.getInventory();
        if (res?.data) {
          setInventory(res.data);
        }
      } catch (err) {
        console.error('Failed to load inventory', err);
      } finally {
        setInventoryLoading(false);
      }
    };
    fetchInventory();
  }, []);

  return (
    <div id="home" className="relative overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center bg-gradient-to-br from-crimson-950 via-crimson-900 to-slate-950 text-white overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        {/* Animated Background Blood Drops */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-crimson-600/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-500/15 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-60 h-60 bg-crimson-700/20 rounded-full blur-2xl"></div>

          {/* Floating Blood Drop Glyphs */}
          <div className="absolute top-20 left-[15%] text-crimson-400/20 animate-bounce duration-[4000ms]">
            <Droplet className="w-16 h-16 fill-current" />
          </div>
          <div className="absolute bottom-32 left-[20%] text-crimson-300/15 animate-pulse duration-[3000ms]">
            <Droplet className="w-10 h-10 fill-current" />
          </div>
          <div className="absolute top-40 right-[18%] text-red-400/20 animate-bounce duration-[5000ms]">
            <Droplet className="w-20 h-20 fill-current" />
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center z-10 space-y-8 animate-fade-in">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs sm:text-sm font-semibold tracking-wide text-crimson-100 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-crimson-400 animate-ping" />
            Empowering Over 200+ Hospitals & Thousands of Lifesavers
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Be Someone’s Lifeline. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-200 to-crimson-300">
              Donate Blood. Save Lives.
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-light leading-relaxed">
            Every Drop Counts. Every Life Matters. Connect directly with hospitals, schedule rapid donations, and trace your life-saving impact in real time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-crimson-600 hover:bg-crimson-500 text-white font-bold rounded-2xl shadow-lg shadow-crimson-900/50 hover:shadow-crimson-600/40 hover:-translate-y-0.5 transition-all text-base flex items-center justify-center gap-2 group"
            >
              <Heart className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              Become a Donor
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/donor/request-blood"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 backdrop-blur-md hover:-translate-y-0.5 transition-all text-base flex items-center justify-center gap-2"
            >
              <Droplet className="w-5 h-5" />
              Request Blood
            </Link>
          </div>

          {/* Live Quick Counter Badges */}
          <div className="pt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto border-t border-white/10">
            <div>
              <p className="font-heading text-2xl sm:text-4xl font-extrabold text-white">50K+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Lives Saved</p>
            </div>
            <div>
              <p className="font-heading text-2xl sm:text-4xl font-extrabold text-white">10K+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Active Donors</p>
            </div>
            <div>
              <p className="font-heading text-2xl sm:text-4xl font-extrabold text-white">200+</p>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Partner Hospitals</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-crimson-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-crimson-100 text-crimson-800 flex items-center justify-center mb-3">
                <Heart className="w-5 h-5 fill-crimson-600" />
              </div>
              <h4 className="font-heading text-3xl font-extrabold text-slate-900">3,800+</h4>
              <p className="text-sm font-medium text-slate-500 mt-1">Donations Recorded</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-crimson-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-3xl font-extrabold text-slate-900">98.4%</h4>
              <p className="text-sm font-medium text-slate-500 mt-1">Emergency Fulfillment</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-crimson-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-3xl font-extrabold text-slate-900">&lt; 15 min</h4>
              <p className="text-sm font-medium text-slate-500 mt-1">Average Dispatch Match</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-crimson-200 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-3xl font-extrabold text-slate-900">100%</h4>
              <p className="text-sm font-medium text-slate-500 mt-1">Verified Laboratory Safety</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT HEMORA SECTION */}
      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-100 text-crimson-900 text-xs font-bold uppercase tracking-wider">
                About HEMORA
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Transforming Blood Banking Into a Seamless, Life-Saving Digital Network
              </h2>
              <p className="text-slate-600 leading-relaxed">
                HEMORA was established to eradicate critical blood shortages. By connecting volunteer donors directly with regional trauma units and hospital facilities through real-time telemetry, we ensure zero blood unit goes to waste and patients receive emergency cross-matched blood when every second counts.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-crimson-100 text-crimson-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Direct Patient & Hospital Integration</h4>
                    <p className="text-xs text-slate-500">Eliminates communication delays during acute trauma and obstetric emergencies.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-crimson-100 text-crimson-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Certified Laboratory Protocols</h4>
                    <p className="text-xs text-slate-500">Every unit is screened against strict hematology protocols and serology guidelines.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-crimson-100 text-crimson-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Donor Recognition & Digital Certificates</h4>
                    <p className="text-xs text-slate-500">Official verified credentials awarded immediately following every completed donation.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link to="/register" className="btn-primary">
                  Join As Volunteer Donor
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Box */}
            <div className="relative">
              <div className="relative rounded-3xl bg-gradient-to-tr from-crimson-900 to-crimson-800 p-8 sm:p-10 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
                <h3 className="font-heading text-2xl font-bold mb-4">Our Vision for 2026</h3>
                <p className="text-crimson-100 text-sm leading-relaxed mb-6">
                  "No human being should lose their life due to a shortage of blood. We leverage intelligent dispatch algorithms, community volunteer camps, and clinical safety standards to maintain optimal reserves across all regional blood hubs."
                </p>

                <div className="space-y-4 border-t border-crimson-700/60 pt-6">
                  <div className="flex items-center justify-between text-xs text-crimson-200">
                    <span>Emergency Response Window</span>
                    <span className="font-bold text-white">Under 15 Minutes</span>
                  </div>
                  <div className="w-full bg-crimson-950/40 rounded-full h-2 overflow-hidden">
                    <div className="bg-white h-2 rounded-full w-[94%]"></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-crimson-200 pt-2">
                    <span>Donation Repeat Retention</span>
                    <span className="font-bold text-white">78% Rate</span>
                  </div>
                  <div className="w-full bg-crimson-950/40 rounded-full h-2 overflow-hidden">
                    <div className="bg-red-300 h-2 rounded-full w-[78%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-crimson-800 bg-crimson-50 px-3 py-1 rounded-full">
              Simple 3-Step Journey
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
              How Donation Works with HEMORA
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Giving the gift of life is quick, safe, and entirely organized around your comfort and availability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all duration-200 relative group text-left">
              <div className="w-14 h-14 rounded-2xl bg-crimson-900 text-white font-heading font-black text-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                1
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Register & Verify</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Create your secure donor profile in less than 2 minutes. Enter your blood group and emergency contact details for automated eligibility clearance.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all duration-200 relative group text-left">
              <div className="w-14 h-14 rounded-2xl bg-crimson-800 text-white font-heading font-black text-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                2
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Schedule Slot</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Select your preferred donation center or community blood drive camp. Pick a convenient time slot that fits seamlessly into your routine.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all duration-200 relative group text-left">
              <div className="w-14 h-14 rounded-2xl bg-crimson-700 text-white font-heading font-black text-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform">
                3
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-2">Donate & Save Lives</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Relax in a sanitized medical station while skilled phlebotomists assist you. Receive refreshments and your instant digital lifesaver certificate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BLOOD GROUPS & COMPATIBILITY SECTION */}
      <section id="blood-groups" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-crimson-800 bg-crimson-100 px-3 py-1 rounded-full">
              Blood Compatibility Matrix
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
              Know Your Blood Type Compatibility
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              Click on any blood group to examine its compatibility: who you can donate to, and who you can safely receive blood from.
            </p>
          </div>

          {/* 8 Blood Type Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 mb-10">
            {BLOOD_GROUPS.map((group) => {
              const isSelected = selectedBloodGroup === group;
              return (
                <button
                  key={group}
                  onClick={() => setSelectedBloodGroup(group)}
                  className={`p-4 rounded-2xl border text-center transition-all duration-200 ${
                    isSelected
                      ? 'bg-crimson-900 text-white border-crimson-900 shadow-md scale-105'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-crimson-300 hover:bg-crimson-50/50'
                  }`}
                >
                  <span className="block font-heading text-2xl font-black">{group}</span>
                  <span className={`text-[10px] font-semibold uppercase mt-1 block ${isSelected ? 'text-crimson-200' : 'text-slate-400'}`}>
                    {group === 'O-' ? 'Univ. Donor' : group === 'AB+' ? 'Univ. Recipient' : 'Type'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Detailed Info for Selected Blood Group */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-3xl mx-auto">
            <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-crimson-100 text-crimson-900 font-heading text-3xl font-black flex items-center justify-center">
                {selectedBloodGroup}
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold text-slate-900">
                  Blood Group {selectedBloodGroup} Compatibility Details
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedBloodGroup === 'O-'
                    ? 'Universal Red Blood Cell Donor: Essential for emergency trauma transfusions.'
                    : selectedBloodGroup === 'AB+'
                    ? 'Universal Recipient: Can safely receive red blood cells from all blood groups.'
                    : 'Vital community blood type with targeted compatibility matches.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Can Give To */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-3">
                  ✓ Can Donate Red Cells To:
                </span>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_COMPATIBILITY[selectedBloodGroup]?.give.map((grp) => (
                    <BloodGroupBadge key={grp} bloodGroup={grp} size="md" />
                  ))}
                </div>
              </div>

              {/* Can Receive From */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700 block mb-3">
                  ✓ Can Receive Blood From:
                </span>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_COMPATIBILITY[selectedBloodGroup]?.receive.map((grp) => (
                    <BloodGroupBadge key={grp} bloodGroup={grp} size="md" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY DONATE BLOOD SECTION */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-crimson-800 bg-crimson-50 px-3 py-1 rounded-full">
              Why Donate
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
              The Powerful Impact of a Single Donation
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              A single donation session takes less than one hour and creates ripples of positive health outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card hover:border-crimson-300 transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-800 flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 fill-crimson-600" />
              </div>
              <h4 className="font-heading text-lg font-bold text-slate-900 mb-2">Save Up to 3 Lives</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Whole blood can be separated into red cells, platelets, and plasma, providing tailored treatments for up to 3 different patients.
              </p>
            </div>

            <div className="card hover:border-crimson-300 transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-lg font-bold text-slate-900 mb-2">Free Health Check</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Receive complimentary monitoring of your pulse, blood pressure, body temperature, and hemoglobin levels with each screening.
              </p>
            </div>

            <div className="card hover:border-crimson-300 transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-lg font-bold text-slate-900 mb-2">Cardiovascular Wellness</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Regular donations help maintain healthy blood viscosity and reduce excess iron stores, supporting overall cardiovascular vigor.
              </p>
            </div>

            <div className="card hover:border-crimson-300 transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-lg font-bold text-slate-900 mb-2">Emergency Preparedness</h4>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Blood cannot be manufactured synthetically; keeping regional banks stocked guarantees safety during natural disasters and trauma surges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ELIGIBILITY SECTION */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-crimson-800 bg-crimson-100 px-3 py-1 rounded-full">
                Donor Eligibility Checklist
              </span>
              <h2 className="font-heading text-3xl font-extrabold text-slate-900">
                Are You Eligible to Donate?
              </h2>
              <p className="text-slate-500 text-sm">
                Check these baseline standards before scheduling your appointment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Age Requirements</h4>
                    <p className="text-xs text-slate-500">Between 18 and 65 years of age (16-17 with parental authorization in select states).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Weight Standard</h4>
                    <p className="text-xs text-slate-500">At least 50 kg (110 lbs) for your safety and proper hemodynamic balance.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Donation Frequency</h4>
                    <p className="text-xs text-slate-500">Whole blood: Every 56 days (8 weeks). Platelets: Every 7 days up to 24 times/year.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Hemoglobin Level</h4>
                    <p className="text-xs text-slate-500">Minimum 12.5 g/dL for females and 13.0 g/dL for males, tested on-site.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">General Health</h4>
                    <p className="text-xs text-slate-500">Feeling well and healthy on donation day; free of cold, flu, or fever symptoms.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Hydration & Nutrition</h4>
                    <p className="text-xs text-slate-500">A nutritious meal within 3 hours and at least 500ml water prior to donating.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. BLOOD AVAILABILITY SECTION (Calling GET /api/inventory) */}
      <section id="availability" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-crimson-800 bg-crimson-50 px-3 py-1 rounded-full">
                Real-Time Reserves
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
                Live Blood Bank Availability
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Live inventory tracking across our regional hospital partner nodes.
              </p>
            </div>
            <Link to="/donor/request-blood" className="btn-secondary self-start md:self-auto text-xs sm:text-sm">
              Submit Patient Request
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {inventory.map((item) => {
              const isLow = item.status === 'LOW';
              const isCritical = item.status === 'CRITICAL';
              return (
                <div
                  key={item.blood_group}
                  className={`p-5 rounded-2xl border text-center transition-all ${
                    isCritical
                      ? 'bg-rose-50/50 border-rose-200'
                      : isLow
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                  }`}
                >
                  <span className="block font-heading text-3xl font-black text-slate-900">
                    {item.blood_group}
                  </span>
                  <div className="my-2">
                    <span className="font-heading text-xl font-bold text-slate-800">
                      {item.units}
                    </span>
                    <span className="text-[10px] text-slate-500 block">units in stock</span>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
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
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. BECOME A DONOR CTA SECTION */}
      <section className="py-20 bg-gradient-to-r from-crimson-950 via-crimson-900 to-crimson-800 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="font-heading text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Give Someone the Gift of Tomorrow?
          </h2>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-crimson-100 font-light leading-relaxed">
            Register today as an active donor. Whenever an emergency matches your blood group in your area, you have the opportunity to directly save a life.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 bg-white text-crimson-900 hover:bg-slate-100 font-bold rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all text-base inline-flex items-center gap-2"
            >
              <Heart className="w-5 h-5 fill-crimson-900" />
              Register As Donor Now
            </Link>
            <Link
              to="/donor/find-blood"
              className="px-8 py-4 bg-crimson-950/60 hover:bg-crimson-950 text-white font-bold rounded-2xl border border-white/20 hover:-translate-y-0.5 transition-all text-base"
            >
              Locate Nearest Center
            </Link>
          </div>
        </div>
      </section>

      {/* 10. CONTACT SECTION */}
      <section id="contact" className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-crimson-800 bg-crimson-100 px-3 py-1 rounded-full">
              Get In Touch
            </span>
            <h2 className="font-heading text-3xl font-extrabold text-slate-900">
              HEMORA Network Headquarters
            </h2>
            <p className="text-slate-500 text-sm">
              Our clinical coordination desk is active 24/7 for emergency dispatches and inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-800 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-slate-900 mb-1">Central Blood Center</h4>
              <p className="text-xs text-slate-500">100 Medical Center Blvd, Suite 101<br />Metro City, CA 90210</p>
            </div>

            <div className="card text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-800 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-slate-900 mb-1">Emergency Hotline</h4>
              <p className="text-xs text-slate-500">+1 (800) 555-HEMO<br />Available 24 hours a day, 365 days</p>
            </div>

            <div className="card text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-crimson-50 text-crimson-800 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h4 className="font-heading text-base font-bold text-slate-900 mb-1">Email Inquiries</h4>
              <p className="text-xs text-slate-500">support@hemora-bloodbank.org<br />clinical@hemora-bloodbank.org</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
