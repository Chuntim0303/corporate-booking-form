import React, { useEffect, useState, useId, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  CreditCard,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  Trophy,
  Crown,
  Check,
  Loader2,
  Award,
  ChevronDown,
  PenTool,
  RotateCcw
} from 'lucide-react';
import { popularCountryCodes, countryCodes } from '../data/countryCodes';
import SignatureCanvas from './SignatureCanvas';

// Enhanced Input Component
const EnhancedInput = ({ 
  label, 
  name, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  icon: Icon, 
  required = false,
  disabled = false,
  helpText,
  maxLength
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const id = useId();

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-black" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
        {label} {required && <span style={{color: '#6b7280'}}>*</span>}
      </label>
      
      <div className={`relative transition-all duration-200 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-4 w-4 transition-colors duration-200`} style={{color: error ? '#ef4444' : isFocused ? '#6b7280' : '#6b7280'}} />
          </div>
        )}
        
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 text-sm text-black placeholder-gray-400 focus:outline-none transition-all duration-200 rounded-md border ${
            error
              ? 'border-red-500 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-400'
              : isFocused
              ? 'focus:ring-1'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: error ? '' : 'white',
            ...(isFocused && !error ? {
              borderColor: '#6B7280',
              boxShadow: '0 0 0 1px rgba(218, 171, 45, 0.1), 0 4px 6px -1px rgba(218, 171, 45, 0.1)'
            } : {})
          }}
        />
      </div>
      
      {helpText && !error && (
        <p className="text-xs text-gray-400" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>{helpText}</p>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>{error}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Select Component
const EnhancedSelect = ({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  options = []
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const id = useId();

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-black" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
        {label} {required && <span style={{color: '#6b7280'}}>*</span>}
      </label>
      
      <div className={`relative transition-all duration-200 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-4 w-4 transition-colors duration-200`} style={{color: error ? '#ef4444' : isFocused ? '#6b7280' : '#6b7280'}} />
          </div>
        )}
        
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          disabled={disabled}
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-10 py-3 text-sm text-black focus:outline-none appearance-none transition-all duration-200 rounded-md border ${
            error
              ? 'border-red-500 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-400'
              : isFocused
              ? 'focus:ring-1'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: error ? '' : 'white',
            ...(isFocused && !error ? {
              borderColor: '#6B7280',
              boxShadow: '0 0 0 1px rgba(218, 171, 45, 0.1), 0 4px 6px -1px rgba(218, 171, 45, 0.1)'
            } : {})
          }}
        >
          <option value="" style={{backgroundColor: 'white', color: '#9ca3af'}}>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} style={{backgroundColor: 'white', color: 'black'}}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-400">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>{error}</span>
        </div>
      )}
    </div>
  );
};

// Corporate Form Steps Component
const CorporateFormSteps = ({ onComplete, initialTier }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const signatureRef = useRef(null);
  const [formData, setFormData] = useState({
    // Step 1: Contact Person
    firstName: '',
    lastName: '',
    position: '',
    email: '',
    countryCode: '+60',
    phone: '',
    nric: '',

    // Step 2: Company Information
    notBusinessOwner: false,
    companyName: '',
    industry: '',
    industryOther: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postcode: '',

    // Step 3: Payment
    partnershipTier: initialTier || '',
    receiptFile: null,
    receiptFileName: '',
    receiptStorageKey: '',

    // Step 4: Terms & Signature
    termsAccepted: false,
    signatureData: ''
  });

  const tierPricing = {
    silver: { label: 'Silver', amount: 30000 },
    gold: { label: 'Gold', amount: 50000 },
    platinum: { label: 'Platinum', amount: 100000 },
    diamond: { label: 'Diamond', amount: 200000 }
  };

  const totalPayable = tierPricing[formData.partnershipTier]?.amount || 0;

  const formatRM = (amount) => {
    try {
      return new Intl.NumberFormat('en-MY', {
        style: 'currency',
        currency: 'MYR',
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      return `RM ${amount.toLocaleString('en-MY')}`;
    }
  };

  const uploadReceiptIfNeeded = async () => {
    if (!formData.receiptFile || formData.receiptStorageKey) return;

    const presignEndpoint = import.meta?.env?.VITE_RECEIPT_PRESIGN_URL;

    // Debug logging
    console.group('🔍 Receipt Upload Debug');
    console.log('Environment check:', {
      hasEnv: !!import.meta.env,
      presignEndpoint,
      isDev: import.meta.env.DEV,
      mode: import.meta.env.MODE,
      allEnv: import.meta.env
    });
    console.groupEnd();

    if (!presignEndpoint) {
      const errorMsg = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  Environment Variable Not Configured
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VITE_RECEIPT_PRESIGN_URL is not set.

Quick Fix:
1. Check if .env file exists in project root
2. Verify it contains: VITE_RECEIPT_PRESIGN_URL=https://...
3. Restart your dev server (Ctrl+C, then: npm run dev)

For detailed help, see TROUBLESHOOTING.md

Current value: ${presignEndpoint || '(undefined)'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      console.error(errorMsg);
      alert('Receipt upload is not configured yet.\n\nPlease:\n1. Restart your dev server\n2. Check TROUBLESHOOTING.md for help\n3. Look at browser console for details');
      throw new Error('Missing VITE_RECEIPT_PRESIGN_URL');
    }

    setIsUploadingReceipt(true);
    try {
      const presignRes = await fetch(presignEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: formData.receiptFile.name,
          fileType: formData.receiptFile.type
        })
      });

      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const presignData = await presignRes.json();
      const uploadUrl = presignData.uploadUrl;
      const storageKey = presignData.key;

      if (!uploadUrl || !storageKey) {
        throw new Error('Presign response missing uploadUrl/key');
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': formData.receiptFile.type || 'application/octet-stream'
        },
        body: formData.receiptFile
      });

      if (!uploadRes.ok) throw new Error('Failed to upload receipt');

      setFormData((prev) => ({
        ...prev,
        receiptStorageKey: storageKey
      }));
    } finally {
      setIsUploadingReceipt(false);
    }
  };

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!termsModalOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setTermsModalOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [termsModalOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'nric') {
      // Format NRIC with dashes: XXXXXX-XX-XXXX
      let formattedValue = value.replace(/\D/g, ''); // Remove non-digits
      if (formattedValue.length <= 12) {
        if (formattedValue.length > 8) {
          formattedValue = formattedValue.slice(0, 6) + '-' + formattedValue.slice(6, 8) + '-' + formattedValue.slice(8);
        } else if (formattedValue.length > 6) {
          formattedValue = formattedValue.slice(0, 6) + '-' + formattedValue.slice(6);
        }
        setFormData(prev => ({
          ...prev,
          [name]: formattedValue
        }));
      }
    } else if (name === 'phone') {
      const maxDigits = formData.countryCode === '+60' ? 10 : 15;
      let cleanedValue = value.replace(/\D/g, '');
      cleanedValue = cleanedValue.replace(/^0+/, '');
      cleanedValue = cleanedValue.slice(0, maxDigits);
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }));
    } else if (name === 'countryCode') {
      setFormData(prev => {
        const maxDigits = value === '+60' ? 10 : 15;
        return {
          ...prev,
          countryCode: value,
          phone: (prev.phone || '').slice(0, maxDigits)
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.nric.trim()) newErrors.nric = 'NRIC is required';
        if (!formData.notBusinessOwner) {
          if (!formData.position.trim()) newErrors.position = 'Position is required';
          if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
          if (!formData.industry) newErrors.industry = 'Industry selection is required';
          if (formData.industry === 'other' && !formData.industryOther.trim()) {
            newErrors.industryOther = 'Please specify your industry';
          }
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }

        // Phone number validation for Malaysia
        if (formData.phone && formData.countryCode === '+60') {
          const cleanPhone = formData.phone.replace(/[\s-]/g, '');
          if (cleanPhone.startsWith('0')) {
            newErrors.phone = 'Malaysian phone numbers should not start with 0 when using country code';
          }
        }

        // NRIC validation - must be exactly 12 digits
        if (formData.nric) {
          const nricDigits = formData.nric.replace(/\D/g, '');
          if (nricDigits.length !== 12) {
            newErrors.nric = 'NRIC must contain exactly 12 digits';
          }
        }
        break;
      case 2:
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address line 1 is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.postcode.trim()) newErrors.postcode = 'Postcode is required';
        break;
      case 3:
        if (!formData.partnershipTier) newErrors.partnershipTier = 'Partnership tier is missing. Please go back and select a plan.';
        if (!formData.receiptFile) newErrors.receiptFile = 'Receipt upload is required';
        break;
      case 4:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept terms and conditions';
        if (signatureRef.current && signatureRef.current.isEmpty()) {
          newErrors.signature = 'Please sign in the box above';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (!validateStep(currentStep)) return;
    if (currentStep === 3) {
      try {
        await uploadReceiptIfNeeded();
      } catch {
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      if (formData.receiptFile && !formData.receiptStorageKey) {
        await uploadReceiptIfNeeded();
      }

      // Capture signature data
      const signatureData = signatureRef.current ? signatureRef.current.toDataURL() : '';

      const response = await fetch('https://s8uentbcpd.execute-api.ap-southeast-1.amazonaws.com/dev/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          position: formData.position,
          email: formData.email,
          countryCode: formData.countryCode,
          phone: formData.phone,
          nric: formData.nric,
          companyName: formData.companyName,
          industry: formData.industry === 'other' ? formData.industryOther : formData.industry,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          partnershipTier: formData.partnershipTier,
          totalPayable: totalPayable,
          receiptStorageKey: formData.receiptStorageKey,
          receiptFileName: formData.receiptFileName,
          termsAccepted: formData.termsAccepted,
          signatureData: signatureData
        })
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }
      
      const result = await response.json();
      if (onComplete) onComplete(result);
      
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    'Your Contact Details',
    'Delivery Address',
    'Payment & Receipt',
    'Review & Submit'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">

            <h3 className="text-lg sm:text-xl font-semibold text-black">Personal Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <EnhancedInput
                label="First Name"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                icon={User}
                required
              />
              <EnhancedInput
                label="Last Name"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                icon={User}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <EnhancedInput
                label="Email Address"
                name="email"
                type="email"
                placeholder="contact@company.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={Mail}
                required
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black">
                  Phone Number <span style={{color: '#6b7280'}}>*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-32 px-3 py-3 text-sm text-black border border-gray-300 rounded-md focus:outline-none focus:ring-1"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#6b7280';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '0 0 0 1px rgba(218, 171, 45, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                      e.target.style.backgroundColor = 'white';
                      e.target.style.boxShadow = '';
                    }}
                  >
                    <optgroup label="Popular">
                      {popularCountryCodes.map((country) => (
                        <option
                          key={`popular-${country.code}`}
                          value={country.code}
                          style={{backgroundColor: 'white', color: 'black'}}
                        >
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="All Countries">
                      {countryCodes.map((country) => (
                        <option
                          key={`${country.code}-${country.country}`}
                          value={country.code}
                          style={{backgroundColor: 'white', color: 'black'}}
                        >
                          {country.flag} {country.code} ({country.country})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder={formData.countryCode === '+60' ? '12-345-6789' : '123-456-7890'}
                      value={formData.phone}
                      maxLength={formData.countryCode === '+60' ? 10 : 15}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 text-sm text-black placeholder-gray-400 focus:outline-none transition-all duration-200 rounded-md border ${
                        errors.phone
                          ? 'border-red-500 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                          : 'border-gray-300 hover:border-gray-400 focus:ring-1'
                      }`}
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        backgroundColor: errors.phone ? '' : 'white'
                      }}
                      onFocus={(e) => {
                        if (!errors.phone) {
                          e.target.style.borderColor = '#6b7280';
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '0 0 0 1px rgba(218, 171, 45, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.phone) {
                          e.target.style.borderColor = '';
                          e.target.style.backgroundColor = 'white';
                          e.target.style.boxShadow = '';
                        }
                      }}
                      required
                    />
                  </div>
                </div>
                {errors.phone && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <EnhancedInput
              label="NRIC"
              name="nric"
              placeholder="123456-12-1234"
              value={formData.nric}
              onChange={handleChange}
              error={errors.nric}
              icon={CreditCard}
              required
              maxLength={14}
            />

            <div className="px-1">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="notBusinessOwner"
                  checked={formData.notBusinessOwner}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      notBusinessOwner: checked,
                      ...(checked
                        ? {
                            position: '',
                            companyName: '',
                            industry: '',
                            industryOther: ''
                          }
                        : {})
                    }));
                    if (checked) {
                      setErrors((prev) => ({
                        ...prev,
                        position: '',
                        companyName: '',
                        industry: '',
                        industryOther: ''
                      }));
                    }
                  }}
                  className="w-5 h-5 mt-0.5 border-gray-600 rounded focus:ring-2 cursor-pointer"
                  style={{ accentColor: '#DAAB2D' }}
                  onFocus={(ev) => ev.target.style.boxShadow = '0 0 0 2px rgba(218, 171, 45, 0.3)'}
                  onBlur={(ev) => ev.target.style.boxShadow = ''}
                />
                <span className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                  Tick here if you are not a business owner
                </span>
              </label>
            </div>

            {!formData.notBusinessOwner && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold text-black pt-6">Business Information</h3>

                <EnhancedInput
                  label="Company Name"
                  name="companyName"
                  placeholder="Your company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                  icon={Building}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <EnhancedInput
                    label="Position/Title"
                    name="position"
                    placeholder="Job title"
                    value={formData.position}
                    onChange={handleChange}
                    error={errors.position}
                    icon={Award}
                    required
                  />
                  <EnhancedSelect
                    label="Business Nature"
                    name="industry"
                    placeholder="Select your industry"
                    value={formData.industry}
                    onChange={handleChange}
                    error={errors.industry}
                    icon={Trophy}
                    required
                    options={[
                      { value: 'technology', label: 'Technology' },
                      { value: 'finance', label: 'Finance & Banking' },
                      { value: 'healthcare', label: 'Healthcare' },
                      { value: 'manufacturing', label: 'Manufacturing' },
                      { value: 'retail', label: 'Retail & E-commerce' },
                      { value: 'consulting', label: 'Consulting' },
                      { value: 'education', label: 'Education' },
                      { value: 'government', label: 'Government' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                </div>

                {formData.industry === 'other' && (
                  <EnhancedInput
                    label="Please specify your industry"
                    name="industryOther"
                    placeholder="Enter your industry"
                    value={formData.industryOther}
                    onChange={handleChange}
                    error={errors.industryOther}
                    icon={Building}
                    required
                  />
                )}
              </>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <EnhancedInput
              label="Address Line 1"
              name="addressLine1"
              placeholder="Street address"
              value={formData.addressLine1}
              onChange={handleChange}
              error={errors.addressLine1}
              icon={Building}
              required
            />

            <EnhancedInput
              label="Address Line 2"
              name="addressLine2"
              placeholder="Unit / Building / Floor (optional)"
              value={formData.addressLine2}
              onChange={handleChange}
              error={errors.addressLine2}
              icon={Building}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <EnhancedInput
                label="City"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                error={errors.city}
                icon={Building}
                required
              />
              <EnhancedSelect
                label="State"
                name="state"
                placeholder="Select state"
                value={formData.state}
                onChange={handleChange}
                error={errors.state}
                icon={Building}
                required
                options={[
                  { value: 'Johor', label: 'Johor' },
                  { value: 'Kedah', label: 'Kedah' },
                  { value: 'Kelantan', label: 'Kelantan' },
                  { value: 'Kuala Lumpur', label: 'Kuala Lumpur' },
                  { value: 'Labuan', label: 'Labuan' },
                  { value: 'Melaka', label: 'Melaka' },
                  { value: 'Negeri Sembilan', label: 'Negeri Sembilan' },
                  { value: 'Pahang', label: 'Pahang' },
                  { value: 'Penang', label: 'Penang' },
                  { value: 'Perak', label: 'Perak' },
                  { value: 'Perlis', label: 'Perlis' },
                  { value: 'Putrajaya', label: 'Putrajaya' },
                  { value: 'Sabah', label: 'Sabah' },
                  { value: 'Sarawak', label: 'Sarawak' },
                  { value: 'Selangor', label: 'Selangor' },
                  { value: 'Terengganu', label: 'Terengganu' }
                ]}
              />
            </div>

            <EnhancedInput
              label="Postcode"
              name="postcode"
              placeholder="Postcode"
              value={formData.postcode}
              onChange={handleChange}
              error={errors.postcode}
              icon={Building}
              required
              maxLength={10}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            {errors.partnershipTier && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errors.partnershipTier}</span>
              </div>
            )}
            <div className="space-y-4 sm:space-y-6">
              <div className="rounded-lg p-4 sm:p-5 border" style={{
                backgroundColor: 'rgba(218, 171, 45, 0.05)',
                borderColor: 'rgba(218, 171, 45, 0.2)'
              }}>
                <h3 className="text-base sm:text-lg font-semibold text-black mb-1">Bank Transfer Details</h3>
                <p className="text-xs sm:text-sm text-gray-700 mb-4">Please transfer the amount below to complete your partnership application</p>
                <div className="mt-3 space-y-2.5 text-sm text-gray-900">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600 font-medium">Bank</span>
                    <span className="font-semibold text-black">CIMB BANK</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600 font-medium">Account Name</span>
                    <span className="font-semibold text-black">CONFETTI GLITZ SDN BHD</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-600 font-medium">Account No.</span>
                    <span className="font-semibold text-black tracking-wide">8011406875</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-600 font-medium">Reference</span>
                    <span className="font-semibold text-black text-right break-words">{formData.companyName || 'Company Name'} - IBPP</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm sm:text-base font-medium text-black">
                  Upload Payment Receipt <span style={{color: '#6b7280'}}>*</span>
                </label>
                <p className="text-xs sm:text-sm text-gray-700 mb-2">
                  Upload a clear screenshot or PDF of your bank transfer confirmation
                </p>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFormData((prev) => ({
                      ...prev,
                      receiptFile: file,
                      receiptFileName: file ? file.name : '',
                      receiptStorageKey: ''
                    }));
                  }}
                  className={`block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:text-black file:cursor-pointer file:transition-all hover:file:scale-105 rounded-md border ${
                    errors.receiptFile ? 'border-red-500' : 'border-gray-300'
                  }`}
                  style={{
                    backgroundColor: 'white',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                />
                {errors.receiptFile && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.receiptFile}</span>
                  </div>
                )}
                {formData.receiptFileName && !errors.receiptFile && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-800 bg-gray-200 rounded-md px-3 py-2 mt-2">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{color: '#DAAB2D'}} />
                    <span className="truncate">{formData.receiptFileName}</span>
                  </div>
                )}
                {formData.receiptStorageKey && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium mt-2 px-3 py-2 rounded-md text-black" style={{backgroundColor: 'rgba(218, 171, 45, 0.15)'}}>
                    <CheckCircle className="w-4 h-4 flex-shrink-0" style={{color: '#DAAB2D'}} />
                    <span>Receipt uploaded successfully</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Instruction Card */}
            <div className="rounded-lg p-4 sm:p-5 border" style={{
              backgroundColor: 'rgba(218, 171, 45, 0.05)',
              borderColor: 'rgba(218, 171, 45, 0.2)'
            }}>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#DAAB2D'}} />
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-black mb-1.5">Almost Done!</h4>
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                    Please review your information below and confirm that everything is correct before submitting your partnership application.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-4 sm:p-6 space-y-5 text-sm border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                borderColor: 'rgba(218, 171, 45, 0.25)'
              }}
            >
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-4 uppercase tracking-wide flex items-center gap-2" style={{color: '#A57A03'}}>
                  <User className="w-4 h-4" />
                  Contact Information
                </h4>
                <div className="text-gray-900 space-y-2.5 pl-0 sm:pl-2">
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">Full Name</span> <span className="font-semibold text-black text-sm sm:text-base">{formData.firstName} {formData.lastName}</span></p>
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">Email Address</span> <span className="font-semibold text-black text-sm sm:text-base break-all">{formData.email}</span></p>
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">Phone Number</span> <span className="font-semibold text-black text-sm sm:text-base">{formData.countryCode} {formData.phone}</span></p>
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">NRIC</span> <span className="font-semibold text-black text-sm sm:text-base">{formData.nric}</span></p>
                </div>
              </div>

              <div className="border-t pt-5" style={{borderColor: 'rgba(218, 171, 45, 0.2)'}}>
                <h4 className="text-sm sm:text-base font-semibold mb-4 uppercase tracking-wide flex items-center gap-2" style={{color: '#A57A03'}}>
                  <Building className="w-4 h-4" />
                  Delivery Address
                </h4>
                <div className="text-gray-900 space-y-2.5 pl-0 sm:pl-2">
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">Address Line 1</span> <span className="font-semibold text-black text-sm sm:text-base">{formData.addressLine1}</span></p>
                  {formData.addressLine2 && (
                    <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">Address Line 2</span> <span className="font-semibold text-black text-sm sm:text-base">{formData.addressLine2}</span></p>
                  )}
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">City</span> <span className="font-semibold text-black text-sm sm:text-base">{formData.city}</span></p>
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">State</span> <span className="font-semibold text-black text-sm sm:text-base">{formData.state}</span></p>
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">Postcode</span> <span className="font-semibold text-black text-sm sm:text-base">{formData.postcode}</span></p>
                </div>
              </div>

              <div className="border-t pt-5" style={{borderColor: 'rgba(218, 171, 45, 0.2)'}}>
                <h4 className="text-sm sm:text-base font-semibold mb-4 uppercase tracking-wide flex items-center gap-2" style={{color: '#A57A03'}}>
                  <Award className="w-4 h-4" />
                  Partnership Details
                </h4>
                <div className="text-gray-900 space-y-2.5 pl-0 sm:pl-2">
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">Selected Tier</span> <span className="font-semibold text-black text-sm sm:text-base capitalize">{formData.partnershipTier}</span></p>
                </div>
              </div>

              <div className="border-t pt-5" style={{borderColor: 'rgba(218, 171, 45, 0.2)'}}>
                <h4 className="text-sm sm:text-base font-semibold mb-4 uppercase tracking-wide flex items-center gap-2" style={{color: '#A57A03'}}>
                  <CreditCard className="w-4 h-4" />
                  Payment Information
                </h4>
                <div className="text-gray-900 space-y-2.5 pl-0 sm:pl-2">
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">Total Amount</span> <span className="font-bold text-black text-base sm:text-lg">{formatRM(totalPayable)}</span></p>
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">Receipt Status</span> <span className="font-semibold text-sm sm:text-base" style={{color: formData.receiptFileName ? '#16a34a' : '#dc2626'}}>{formData.receiptFileName ? '✓ Uploaded' : 'Not uploaded'}</span></p>
                  {formData.receiptFileName && (
                    <p className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4"><span className="text-gray-600 text-xs sm:text-sm font-medium">File Name</span> <span className="font-medium text-black text-xs sm:text-sm truncate max-w-xs">{formData.receiptFileName}</span></p>
                  )}
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm sm:text-base font-medium text-black">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4" />
                    <span>Your Signature <span style={{color: '#6b7280'}}>*</span></span>
                  </div>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (signatureRef.current) {
                      signatureRef.current.clear();
                      if (errors.signature) {
                        setErrors(prev => ({ ...prev, signature: '' }));
                      }
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              </div>
              <p className="text-xs sm:text-sm text-gray-700">
                Please sign using your mouse or touchscreen in the box below
              </p>
              <div className={`border-2 rounded-lg overflow-hidden ${errors.signature ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`} style={{ height: '200px' }}>
                <SignatureCanvas ref={signatureRef} />
              </div>
              {errors.signature && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>{errors.signature}</span>
                </div>
              )}
            </div>

            <div className="border rounded-lg p-4 sm:p-5" style={{
              borderColor: errors.termsAccepted ? '#ef4444' : 'rgba(107, 114, 128, 0.5)',
              backgroundColor: errors.termsAccepted ? 'rgba(239, 68, 68, 0.05)' : 'rgba(255, 255, 255, 0.5)'
            }}>
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="w-5 h-5 mt-0.5 border-gray-600 rounded focus:ring-2 cursor-pointer"
                  style={{ accentColor: '#DAAB2D' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(218, 171, 45, 0.3)'}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                />
                <span className="text-sm sm:text-base text-gray-900 leading-relaxed">
                  I agree to the <button type="button" style={{color: '#A57A03'}} className="font-semibold hover:underline transition-all" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTermsModalOpen(true);
                  }}>Terms & Conditions</button> and authorize Confetti KL to contact me regarding this partnership application.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-xs sm:text-sm text-red-600 mt-3 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {errors.termsAccepted}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl lg:max-w-2xl mx-auto">
      {/* Redesigned Header - Step Title Left, Circle Right */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between">
          {/* Left: Step Title */}
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-black mb-1" style={{fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em'}}>
              {stepTitles[currentStep - 1]}
            </h2>
            <p className="text-sm sm:text-base text-gray-700 mt-1">
              Complete the form below to continue
            </p>
          </div>

          {/* Right: Step Circle */}
          <div className="flex-shrink-0 ml-4">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-3 transition-all duration-300 shadow-lg"
              style={{
                backgroundColor: 'rgba(218, 171, 45, 0.1)',
                borderColor: '#DAAB2D',
                borderWidth: '3px',
                boxShadow: '0 0 20px rgba(218, 171, 45, 0.3)'
              }}
            >
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold" style={{color: '#DAAB2D'}}>
                  {currentStep}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 font-medium">
                  of 4
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full h-1.5 rounded-full overflow-hidden" style={{backgroundColor: 'rgba(75, 85, 99, 0.3)'}}>
          <div
            className="h-full transition-all duration-500 ease-out rounded-full"
            style={{
              backgroundColor: '#DAAB2D',
              width: `${(currentStep / 4) * 100}%`,
              boxShadow: '0 0 10px rgba(218, 171, 45, 0.5)'
            }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-xl p-4 sm:p-6 lg:p-8 border"
        style={{
          backgroundColor: '#ffffffff',
          borderColor: 'rgba(83, 83, 83, 0.2)'
        }}
      >
        {renderStep()}
        
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t" style={{borderColor: 'rgba(218, 171, 45, 0.1)'}}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide transition-all duration-300 border-2 rounded-lg ${
              currentStep === 1
                ? 'text-gray-500 cursor-not-allowed opacity-50'
                : 'text-gray-300 hover:text-white hover:shadow-md'
            }`}
            style={{
              backgroundColor: currentStep === 1 ? 'rgba(46, 46, 49, 0.2)' : 'rgba(46, 46, 49, 0.4)',
              borderColor: currentStep === 1 ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.5)'
            }}
            onMouseEnter={(e) => {
              if (currentStep !== 1) {
                e.currentTarget.style.borderColor = '#9ca3af'; // gray-400
                e.currentTarget.style.backgroundColor = 'rgba(75, 85, 99, 0.3)'; // slightly darker gray
                e.currentTarget.style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (currentStep !== 1) {
                e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.5)';
                e.currentTarget.style.backgroundColor = 'rgba(46, 46, 49, 0.4)';
                e.currentTarget.style.color = '#d1d5db'; // gray-300
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Go Back</span>
            <span className="sm:hidden">Back</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={isUploadingReceipt}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 text-black text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-300 rounded-lg transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #DAAB2D, #A57A03)',
                boxShadow: '0 4px 14px rgba(218, 171, 45, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(218, 171, 45, 0.4), 0 10px 10px -5px rgba(218, 171, 45, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 14px rgba(218, 171, 45, 0.3)'}
            >
              <span>{currentStep === 3 && isUploadingReceipt ? 'Uploading Receipt...' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-3 px-6 sm:px-10 py-3.5 text-black text-sm sm:text-base font-bold uppercase tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transform hover:scale-105 disabled:transform-none shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #DAAB2D, #A57A03)',
                boxShadow: '0 4px 14px rgba(218, 171, 45, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(218, 171, 45, 0.4), 0 10px 10px -5px rgba(218, 171, 45, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(218, 171, 45, 0.3)';
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {termsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onMouseDown={() => setTermsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-2xl rounded-xl shadow-xl border"
            style={{ backgroundColor: '#ffffff', borderColor: 'rgba(83, 83, 83, 0.2)' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(83, 83, 83, 0.2)' }}>
              <h3 className="text-base sm:text-lg font-semibold text-black">Terms & Conditions</h3>
              <button
                type="button"
                className="px-3 py-1 text-sm font-semibold rounded-md border"
                style={{ borderColor: 'rgba(83, 83, 83, 0.2)', color: '#111827' }}
                onClick={() => setTermsModalOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
              <ol className="list-decimal pl-5 space-y-3 text-sm sm:text-base text-gray-900 leading-relaxed">
                <li>The initial payment made towards this program is strictly non-refundable under any circumstances.</li>
                <li>The balance of the total fees must be fully paid within five (5) days from the date of the initial payment.</li>
                <li>Failure to settle the balance within the stipulated time frame will result in the forfeiture of the initial payment, and the participant shall no longer be entitled to any benefits, points, or privileges associated with the program.</li>
                <li>The participant shall execute any subsequent agreement / documentation as provided by Confetti Glitz Sdn Bhd which shall contain the regulation and terms & conditions of this programme. The non-execution of said agreement / documentation shall not nullify the validity of this Booking Form.</li>
                <li>The IBPP acknowledges and accepts that the payment hereto shall be deemed as a deposit whereby no invoice nor receipt will be issued to the IBPP Partner.</li>
                <li>Confetti Glitz Sdn Bhd reserves the right to alter, change, amend, add to, or abrogate any provision of the Terms and Conditions of the programme at any time. This includes, but is not limited to, modifications or termination of all or any of this programme, changes to the fees, points, pricing, and related provisions, which will all immediately take effect upon the posting of the latest amended Terms and Conditions. Confetti Glitz Sdn Bhd will notify the IBPP of such amendments and ensure access to the latest version of the Terms and Conditions through the designated partner portal or other accessible means.</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateFormSteps;