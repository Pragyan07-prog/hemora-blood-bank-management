import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  User,
  Search,
  Heart,
  CalendarPlus,
  Calendar,
  Activity,
  CheckCircle,
  MapPin,
  Bell,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Droplet,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import BloodGroupBadge from '../components/shared/BloodGroupBadge';

export const DonorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/donor/dashboard', icon: Home },
    { name: 'My Profile', path: '/donor/profile', icon: User },
    { name: 'Find Blood', path: '/donor/find-blood', icon: Search },
    { name: 'Request Blood', path: '/donor/request-blood', icon: Heart },
    { name: 'Book Appointment', path: '/donor/book-appointment', icon: CalendarPlus },
    { name: 'My Appointments', path: '/donor/appointments', icon: Calendar },
    { name: 'Donation History', path: '/donor/donations', icon: Activity },
    { name: 'My Eligibility', path: '/donor/eligibility', icon: CheckCircle },
    { name: 'Blood Camps', path: '/donor/camps', icon: MapPin },
    { name: 'Notifications', path: '/donor/notifications', icon: Bell },
    { name: 'My Certificates', path: '/donor/certificates', icon: Award },
    { name: 'Settings', path: '/donor/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentItem = navItems.find((item) => location.pathname.startsWith(item.path));
  const pageTitle = currentItem ? currentItem.name : 'Donor Portal';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-30 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-18 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-crimson-900 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-heading font-black text-xl text-crimson-900 leading-tight">
                  HEMORA
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Donor Portal
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `sidebar-link group ${
                    isActive ? 'active' : ''
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Donor Badge */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-crimson-900 text-white font-bold flex items-center justify-center flex-shrink-0">
                {user?.name?.charAt(0) || 'D'}
              </div>
              {!collapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Alexander Hayes'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user?.email || 'donor@hemora.org'}</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-crimson-700 hover:bg-crimson-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-18 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900">{pageTitle}</h1>
            <p className="text-xs text-slate-400 hidden sm:block">Welcome back to your lifesaver hub</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Prominent Blood Group Badge */}
            <div className="flex items-center gap-2 bg-crimson-50/60 border border-crimson-100 rounded-xl px-3 py-1.5">
              <span className="text-xs font-semibold text-crimson-900 hidden sm:inline">Blood Type:</span>
              <BloodGroupBadge bloodGroup={user?.blood_group || 'O+'} size="sm" />
            </div>

            {/* Notification Bell */}
            <NavLink
              to="/donor/notifications"
              className="relative p-2.5 rounded-xl text-slate-500 hover:text-crimson-900 hover:bg-crimson-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson-600 ring-2 ring-white"></span>
            </NavLink>

            {/* Profile Avatar */}
            <NavLink to="/donor/profile" className="flex items-center gap-2 pl-2">
              <div className="w-10 h-10 rounded-xl bg-crimson-800 text-white font-bold flex items-center justify-center shadow-xs hover:ring-2 hover:ring-crimson-300 transition-all">
                {user?.name?.charAt(0) || 'D'}
              </div>
            </NavLink>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DonorLayout;
