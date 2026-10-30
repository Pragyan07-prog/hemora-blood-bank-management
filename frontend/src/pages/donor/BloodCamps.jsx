import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Users, Phone, CheckCircle, Heart } from 'lucide-react';
import campService from '../../services/campService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusBadge from '../../components/shared/StatusBadge';
import toast from 'react-hot-toast';

export const BloodCamps = () => {
  const [camps, setCamps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCamps = async () => {
    setIsLoading(true);
    try {
      const res = await campService.getCamps();
      setCamps(res.data || []);
    } catch (err) {
      toast.error('Failed to load blood camps');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, []);

  const handleToggleRegistration = async (camp) => {
    try {
      if (camp.is_registered) {
        await campService.cancelCampRegistration(camp.id);
        toast.success('Registration cancelled');
        setCamps((prev) =>
          prev.map((c) =>
            c.id === camp.id
              ? { ...c, is_registered: false, registered_donors: c.registered_donors - 1 }
              : c
          )
        );
      } else {
        await campService.registerForCamp(camp.id);
        toast.success('Successfully registered for this blood drive!');
        setCamps((prev) =>
          prev.map((c) =>
            c.id === camp.id
              ? { ...c, is_registered: true, registered_donors: c.registered_donors + 1 }
              : c
          )
        );
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Community Blood Camps</h2>
        <p className="text-sm text-slate-500">Participate in regional mobile blood drives and university donation camps</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {camps.map((camp) => (
          <Card key={camp.id} className="border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-crimson-800 uppercase tracking-wider block mb-1">
                    {camp.organizer}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-slate-900">{camp.title}</h3>
                </div>
                <StatusBadge status={camp.status} />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{camp.description}</p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-crimson-600 flex-shrink-0" />
                  <span>{camp.venue} • {camp.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-crimson-600 flex-shrink-0" />
                  <span>{camp.start_date} {camp.start_date !== camp.end_date ? `to ${camp.end_date}` : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-crimson-600 flex-shrink-0" />
                  <span>{camp.start_time} - {camp.end_time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-crimson-600 flex-shrink-0" />
                  <span>Coordinator: {camp.contact_phone}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">
                    {camp.registered_donors} Registered Donors
                  </span>
                  <span className="text-slate-400">Target: {camp.target_units} Units</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-crimson-900 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, Math.round((camp.registered_donors / camp.target_units) * 100))}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
              {camp.is_registered ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>You're Registered</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Walk-ins & Pre-registrations Welcome</span>
              )}

              {camp.status !== 'COMPLETED' && (
                <Button
                  size="sm"
                  variant={camp.is_registered ? 'secondary' : 'primary'}
                  onClick={() => handleToggleRegistration(camp)}
                  icon={Heart}
                >
                  {camp.is_registered ? 'Cancel Registration' : 'Register for Drive'}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BloodCamps;
