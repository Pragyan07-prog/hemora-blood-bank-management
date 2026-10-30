import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import appointmentService from '../../services/appointmentService';
import donorService from '../../services/donorService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { TIME_SLOTS, DONATION_CENTERS, DONATION_TYPES } from '../../utils/constants';
import toast from 'react-hot-toast';

export const BookAppointment = () => {
  const navigate = useNavigate();
  const [eligibility, setEligibility] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time_slot: TIME_SLOTS[0],
    center: DONATION_CENTERS[0].name,
    donation_type: DONATION_TYPES[0],
    notes: '',
  });

  useEffect(() => {
    const checkElig = async () => {
      try {
        const res = await donorService.getEligibility();
        setEligibility(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    checkElig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await appointmentService.bookAppointment(formData);
      toast.success('Donation appointment scheduled!');
      navigate('/donor/appointments');
    } catch (err) {
      toast.error('Failed to book appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Book a Donation Appointment</h2>
        <p className="text-sm text-slate-500">Choose your preferred collection center, date, and comfortable time slot</p>
      </div>

      {/* Eligibility Warning if Ineligible */}
      {eligibility && !eligibility.is_eligible && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">Rest Interval Advisory</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Your next recommended whole blood donation date is <strong>{eligibility.next_eligible_date}</strong>. You may still book a slot scheduled on or after this date.
            </p>
          </div>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Preferred Date"
              type="date"
              value={formData.date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              icon={Calendar}
              required
            />

            <Select
              label="Preferred Time Slot"
              value={formData.time_slot}
              onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
              options={TIME_SLOTS.map((slot) => ({ value: slot, label: slot }))}
              required
            />
          </div>

          <Select
            label="Donation Center Location"
            value={formData.center}
            onChange={(e) => setFormData({ ...formData, center: e.target.value })}
            options={DONATION_CENTERS.map((c) => ({
              value: c.name,
              label: `${c.name} (${c.city} - ${c.address})`,
            }))}
            required
          />

          <Select
            label="Donation Component"
            value={formData.donation_type}
            onChange={(e) => setFormData({ ...formData, donation_type: e.target.value })}
            options={DONATION_TYPES.map((t) => ({ value: t, label: t }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Special Notes / Preferences (Optional)
            </label>
            <textarea
              className="input w-full h-20"
              placeholder="e.g. Preferred left arm, donating on lunch break..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Appointment Slot
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BookAppointment;
