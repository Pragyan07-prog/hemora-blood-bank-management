import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Droplets,
  Heart,
  Activity,
  Calendar,
  MapPin,
  Bell,
  Award,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Donors', path: '/admin/donors', icon: Users },
    { name: 'Blood Inventory', path: '/admin/inventory', icon: Droplets },
    { name: 'Blood Requests', path: '/admin/requests', icon: Heart },
    { name: 'Donations', path: '/admin/donations', icon: Activity },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Blood Camps', path: '/admin/camps', icon: MapPin },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Certificates', path: '/admin/certificates', icon: Award },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'User Management', path: '/admin/users', icon: UserCog },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get current page title
  const currentItem = navItems.find((item) => location.pathname.startsWith(item.path));
  const pageTitle = currentItem ? currentItem.name : 'Admin Portal';

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-crimson-900 to-crimson-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
              <Droplets className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-heading font-black text-xl text-crimson-900 leading-tight">
                  HEMORA
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                  Admin System
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

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} gap-2`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-crimson-100 text-crimson-900 font-bold flex items-center justify-center flex-shrink-0 border border-crimson-200">
                {user?.name?.charAt(0) || 'A'}
              </div>
              {!collapsed && (
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Administrator'}</p>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    <span>System Admin</span>
                  </div>
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
            <p className="text-xs text-slate-400 hidden sm:block">Central Blood Bank Administration & Governance</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NavLink
              to="/admin/notifications"
              className="relative p-2.5 rounded-xl text-slate-500 hover:text-crimson-900 hover:bg-crimson-50 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-crimson-600 ring-2 ring-white"></span>
            </NavLink>

            {/* Profile pill */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">{user?.name || 'Dr. Sarah Mitchell'}</p>
                <p className="text-xs text-slate-400">{user?.email || 'admin@hemora.org'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-crimson-900 to-crimson-700 text-white font-bold flex items-center justify-center shadow-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
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

export default AdminLayout;
