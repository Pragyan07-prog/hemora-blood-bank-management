import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Droplet, User, Mail, Lock, Phone, Calendar, Heart, Shield, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { BLOOD_GROUPS } from '../../utils/constants';

// Step validation schemas
const step1Schema = yup.object().shape({
  name: yup.string().required('Full name is required').min(3, 'At least 3 characters'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
  phone: yup.string().required('Phone number is required'),
  dob: yup.string().required('Date of birth is required'),
  gender: yup.string().required('Please select your gender'),
});

const step2Schema = yup.object().shape({
  blood_group: yup.string().required('Blood group is required'),
  address: yup.string().required('Street address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State is required'),
});

const step3Schema = yup.object().shape({
  emergency_contact_name: yup.string().required('Emergency contact name is required'),
  emergency_contact_phone: yup.string().required('Emergency contact phone is required'),
});

const fullSchema = step1Schema.concat(step2Schema).concat(step3Schema);

export const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(fullSchema),
    mode: 'onTouched',
  });

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'email', 'password', 'phone', 'dob', 'gender'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['blood_group', 'address', 'city', 'state'];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await authRegister(data);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info' },
    { number: 2, title: 'Medical & Address' },
    { number: 3, title: 'Emergency Contact' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-crimson-950 via-slate-900 to-crimson-900 px-4 py-12 relative overflow-hidden">
      <div className="w-full max-w-xl relative z-10 animate-fade-in">
        {/* Logo and header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-3">
            <div className="w-12 h-12 rounded-2xl bg-crimson-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Droplet className="w-7 h-7 fill-white" />
            </div>
            <span className="font-heading text-3xl font-black tracking-tight text-white">
              HEMORA
            </span>
          </Link>
          <h2 className="font-heading text-2xl font-bold text-white">Donor Registration</h2>
          <p className="text-sm text-slate-400 mt-1">Join a life-saving network of committed volunteers</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 z-0"></div>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-crimson-800 transition-all duration-300 z-0"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((s) => {
                const isCompleted = currentStep > s.number;
                const isCurrent = currentStep === s.number;
                return (
                  <div key={s.number} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-crimson-800 text-white'
                          : isCurrent
                          ? 'bg-crimson-900 text-white ring-4 ring-crimson-100'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : s.number}
                    </div>
                    <span
                      className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${
                        isCurrent ? 'text-crimson-900' : 'text-slate-400'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {isSuccess ? (
            <div className="text-center py-8 space-y-4 animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-slate-900">Registration Complete!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Thank you for signing up to save lives. Redirecting you to the login screen...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* STEP 1: Personal Info */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <Input
                    label="Full Name"
                    placeholder="Alexander Hayes"
                    icon={User}
                    {...register('name')}
                    error={errors.name?.message}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="alex@example.com"
                    icon={Mail}
                    {...register('email')}
                    error={errors.email?.message}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      icon={Lock}
                      {...register('password')}
                      error={errors.password?.message}
                    />
                    <Input
                      label="Phone Number"
                      placeholder="+1 (555) 000-0000"
                      icon={Phone}
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Date of Birth"
                      type="date"
                      {...register('dob')}
                      error={errors.dob?.message}
                    />
                    <Select
                      label="Gender"
                      placeholder="Select Gender"
                      options={[
                        { value: 'Male', label: 'Male' },
                        { value: 'Female', label: 'Female' },
                        { value: 'Other', label: 'Other' },
                      ]}
                      {...register('gender')}
                      error={errors.gender?.message}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Medical & Address Info */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <Select
                    label="Blood Group"
                    placeholder="Choose Blood Group"
                    options={BLOOD_GROUPS.map((bg) => ({ value: bg, label: bg }))}
                    {...register('blood_group')}
                    error={errors.blood_group?.message}
                    helperText="If unsure, please visit our nearest donation center for free screening."
                  />

                  <Input
                    label="Residential Street Address"
                    placeholder="742 Evergreen Terrace"
                    {...register('address')}
                    error={errors.address?.message}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="Metro City"
                      {...register('city')}
                      error={errors.city?.message}
                    />
                    <Input
                      label="State / Province"
                      placeholder="California"
                      {...register('state')}
                      error={errors.state?.message}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Emergency Contact */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-2xl bg-crimson-50 border border-crimson-100 flex items-start gap-3 mb-2">
                    <Shield className="w-5 h-5 text-crimson-700 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-crimson-900 leading-relaxed">
                      Emergency contact information is kept strictly confidential and only accessed in clinical necessity.
                    </p>
                  </div>

                  <Input
                    label="Emergency Contact Name"
                    placeholder="Emily Hayes (Spouse / Guardian)"
                    icon={User}
                    {...register('emergency_contact_name')}
                    error={errors.emergency_contact_name?.message}
                  />

                  <Input
                    label="Emergency Contact Phone"
                    placeholder="+1 (555) 999-8888"
                    icon={Phone}
                    {...register('emergency_contact_phone')}
                    error={errors.emergency_contact_phone?.message}
                  />
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-slate-100">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={prevStep}
                    icon={ArrowLeft}
                  >
                    Back
                  </Button>
                ) : (
                  <div></div>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                  >
                    Complete Registration
                    <Check className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Footer Login Link */}
        <p className="text-center text-sm text-slate-300 mt-6">
          Already registered as a donor?{' '}
          <Link to="/login" className="font-bold text-white hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
