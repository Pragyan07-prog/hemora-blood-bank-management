import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Droplet, Heart, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const PublicLayout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Blood Groups', href: '#blood-groups' },
    { name: 'Availability', href: '#availability' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-crimson-500 selection:text-white">
      {/* Top Banner for Emergency */}
      <div className="bg-crimson-950 text-crimson-100 px-4 py-2 text-xs sm:text-sm font-medium flex items-center justify-between z-50">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crimson-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-crimson-500"></span>
            </span>
            <span>24/7 Emergency Blood Bank Helpline: <strong>+1 (800) 555-HEMO</strong></span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-crimson-200">
            <span>Critical shortages: AB-, B-</span>
            <span>|</span>
            <span>Metro City Central Hub</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-slate-100'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-crimson-900 to-crimson-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-200">
                <Droplet className="w-6 h-6 fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-2xl font-black tracking-tight text-crimson-900 leading-none">
                  HEMORA
                </span>
                <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase mt-0.5">
                  Blood Bank Network
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-semibold text-slate-700 hover:text-crimson-900 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/donor/dashboard'}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="text-xs font-semibold text-slate-500 hover:text-crimson-800"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-slate-700 hover:text-crimson-900 px-3 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-crimson-900 hover:bg-crimson-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5"
                  >
                    <Heart className="w-4 h-4 fill-white/80" />
                    Become a Donor
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-slide-up">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-base font-semibold text-slate-700 hover:bg-crimson-50 hover:text-crimson-900 rounded-lg"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/donor/dashboard'}
                  className="btn-primary w-full text-center py-2.5"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-secondary w-full text-center py-2.5"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary w-full text-center py-2.5"
                  >
                    Become a Donor
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
            {/* Col 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-crimson-600 flex items-center justify-center text-white">
                  <Droplet className="w-6 h-6 fill-white" />
                </div>
                <span className="font-heading text-2xl font-black tracking-tight text-white">
                  HEMORA
                </span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Empowering lives through a modern, transparent, and connected blood donation and inventory management ecosystem.
              </p>
              <div className="pt-2 text-xs text-crimson-400 font-semibold flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-crimson-500" />
                Every Drop Counts. Every Life Matters.
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#about" className="hover:text-crimson-400 transition-colors">About HEMORA</a></li>
                <li><a href="#how-it-works" className="hover:text-crimson-400 transition-colors">Donation Process</a></li>
                <li><a href="#blood-groups" className="hover:text-crimson-400 transition-colors">Blood Types & Compatibility</a></li>
                <li><a href="#availability" className="hover:text-crimson-400 transition-colors">Live Inventory Status</a></li>
                <li><Link to="/register" className="hover:text-crimson-400 transition-colors">Register as Volunteer Donor</Link></li>
              </ul>
            </div>

            {/* Col 3: Donor Guidelines */}
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-4">Guidelines</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li>Minimum age: 18 years</li>
                <li>Minimum weight: 50 kg (110 lbs)</li>
                <li>Donation interval: 56-84 days</li>
                <li>Drink plentiful water beforehand</li>
                <li>Bring a valid government photo ID</li>
              </ul>
            </div>

            {/* Col 4: Contact & Hotline */}
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-white mb-4">Emergency Contact</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-crimson-500 flex-shrink-0 mt-0.5" />
                  <span>100 Medical Center Blvd, Suite 101, Metro City, CA 90210</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-5 h-5 text-crimson-500 flex-shrink-0" />
                  <span className="text-white font-medium">+1 (800) 555-HEMO / 4366</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-5 h-5 text-crimson-500 flex-shrink-0" />
                  <span>support@hemora-bloodbank.org</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© {new Date().getFullYear()} HEMORA Blood Bank Network. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400">Terms of Service</a>
              <a href="#" className="hover:text-slate-400">HIPAA & Medical Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
