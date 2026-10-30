import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Heart, Building2, Calendar, Phone, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import requestService from '../../services/requestService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { BLOOD_GROUPS, REQUEST_URGENCY } from '../../utils/constants';
import toast from 'react-hot-toast';

const requestSchema = yup.object().shape({
  patient_name: yup.string().required('Patient full name is required'),
  blood_group: yup.string().required('Required blood group must be selected'),
  units: yup.number().typeError('Units must be a number').positive().integer().required('Units required').min(1).max(10),
  hospital: yup.string().required('Hospital or medical clinic name is required'),
  city: yup.string().required('City is required'),
  required_date: yup.string().required('Date needed by is required'),
  urgency: yup.string().required('Please select clinical urgency'),
  contact_name: yup.string().required('Point of contact name is required'),
  contact_phone: yup.string().required('Emergency contact phone number is required'),
  notes: yup.string(),
});

export const RequestBlood = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(requestSchema),
    defaultValues: {
      urgency: 'URGENT',
      units: 1,
      required_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await requestService.createRequest(data);
      setSubmittedRequest(res.data);
      toast.success('Blood request logged successfully!');
      reset();
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h2 className="font-heading text-2xl font-bold text-slate-900">Request Blood Units</h2>
        <p className="text-sm text-slate-500">Submit an urgent patient request directly to our clinical triage network</p>
      </div>

      {submittedRequest ? (
        <Card className="text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-slate-900">Request Successfully Dispatched!</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your request has been registered in the HEMORA triage queue. Our lab logistics desk has alerted nearby hospitals and matched blood units.
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 inline-block max-w-xs mx-auto">
            <span className="text-xs text-slate-400 block font-semibold uppercase">Requisition Tracking ID</span>
            <span className="font-mono text-xl font-black text-crimson-900">{submittedRequest.id}</span>
          </div>
          <div className="pt-4">
            <Button variant="primary" onClick={() => setSubmittedRequest(null)}>
              Submit Another Request
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Patient & Blood Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Patient Full Name"
                placeholder="e.g. Eleanor Vance"
                {...register('patient_name')}
                error={errors.patient_name?.message}
              />

              <Select
                label="Required Blood Group"
                placeholder="Select Blood Group"
                options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
                {...register('blood_group')}
                error={errors.blood_group?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Units Needed"
                type="number"
                min="1"
                max="10"
                {...register('units')}
                error={errors.units?.message}
              />

              <Select
                label="Clinical Urgency"
                options={[
                  { value: REQUEST_URGENCY.NORMAL, label: 'Normal (Scheduled Surgery)' },
                  { value: REQUEST_URGENCY.URGENT, label: 'Urgent (Within 24 Hours)' },
                  { value: REQUEST_URGENCY.CRITICAL, label: 'Critical (Immediate Trauma)' },
                ]}
                {...register('urgency')}
                error={errors.urgency?.message}
              />

              <Input
                label="Date Needed By"
                type="date"
                {...register('required_date')}
                error={errors.required_date?.message}
              />
            </div>

            {/* Hospital & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Hospital / Medical Facility"
                placeholder="e.g. Metro Trauma Center"
                icon={Building2}
                {...register('hospital')}
                error={errors.hospital?.message}
              />

              <Input
                label="City / District"
                placeholder="e.g. Metro City"
                {...register('city')}
                error={errors.city?.message}
              />
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Attending Doctor or Family Contact Name"
                placeholder="Dr. Clara Oswald"
                {...register('contact_name')}
                error={errors.contact_name?.message}
              />

              <Input
                label="Emergency Contact Phone"
                placeholder="+1 (555) 000-0000"
                icon={Phone}
                {...register('contact_phone')}
                error={errors.contact_phone?.message}
              />
            </div>

            {/* Clinical Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Clinical Diagnosis & Surgical Notes (Optional)
              </label>
              <textarea
                className="input w-full h-24"
                placeholder="Provide medical context: reason for transfusion, cross-match status, physician department..."
                {...register('notes')}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" variant="primary" isLoading={isSubmitting} icon={Heart}>
                Submit Emergency Request
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default RequestBlood;
