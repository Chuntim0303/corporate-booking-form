import React, { useState, useId } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { popularCountryCodes, countryCodes } from '../data/countryCodes';

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
      <label htmlFor={id} className="block text-sm font-medium text-gray-100" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
        {label} {required && <span style={{color: '#DAAB2D'}}>*</span>}
      </label>
      
      <div className={`relative transition-all duration-200 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-4 w-4 transition-colors duration-200`} style={{color: error ? '#ef4444' : isFocused ? '#DAAB2D' : '#6b7280'}} />
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
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-3 text-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 rounded-md border ${
            error
              ? 'border-red-500 bg-red-900/20 focus:border-red-400 focus:ring-1 focus:ring-red-400'
              : isFocused
              ? 'focus:ring-1'
              : 'border-gray-600 hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: isFocused ? 'rgba(30, 30, 33, 0.4)' : 'rgba(46, 46, 49, 0.3)',
            ...(isFocused && !error ? {
              borderColor: '#DAAB2D',
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
      <label htmlFor={id} className="block text-sm font-medium text-gray-100" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
        {label} {required && <span style={{color: '#DAAB2D'}}>*</span>}
      </label>
      
      <div className={`relative transition-all duration-200 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-4 w-4 transition-colors duration-200`} style={{color: error ? '#ef4444' : isFocused ? '#DAAB2D' : '#6b7280'}} />
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
          className={`block w-full ${Icon ? 'pl-10' : 'pl-3'} pr-10 py-3 text-sm text-white focus:outline-none appearance-none transition-all duration-200 rounded-md border ${
            error
              ? 'border-red-500 bg-red-900/20 focus:border-red-400 focus:ring-1 focus:ring-red-400'
              : isFocused
              ? 'focus:ring-1'
              : 'border-gray-600 hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: isFocused ? 'rgba(30, 30, 33, 0.4)' : 'rgba(46, 46, 49, 0.3)',
            ...(isFocused && !error ? {
              borderColor: '#DAAB2D',
              boxShadow: '0 0 0 1px rgba(218, 171, 45, 0.1), 0 4px 6px -1px rgba(218, 171, 45, 0.1)'
            } : {})
          }}
        >
          <option value="" style={{backgroundColor: '#1f2937', color: '#9ca3af'}}>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} style={{backgroundColor: '#1f2937', color: 'white'}}>
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
    companyName: '',
    industry: '',
    industryOther: '',

    // Step 3: Payment
    partnershipTier: initialTier || '',
    receiptFile: null,
    receiptFileName: '',
    receiptStorageKey: '',

    // Step 4: Terms
    termsAccepted: false
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
    if (!presignEndpoint) {
      alert('Receipt upload is not configured yet. Please set VITE_RECEIPT_PRESIGN_URL.');
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
        if (!formData.position.trim()) newErrors.position = 'Position is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.nric.trim()) newErrors.nric = 'NRIC is required';

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
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.industry) newErrors.industry = 'Industry selection is required';
        if (formData.industry === 'other' && !formData.industryOther.trim()) {
          newErrors.industryOther = 'Please specify your industry';
        }
        break;
      case 3:
        if (!formData.partnershipTier) newErrors.partnershipTier = 'Partnership tier is missing. Please go back and select a plan.';
        if (!formData.receiptFile) newErrors.receiptFile = 'Receipt upload is required';
        break;
      case 4:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept terms and conditions';
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
          partnershipTier: formData.partnershipTier,
          totalPayable: totalPayable,
          receiptStorageKey: formData.receiptStorageKey,
          receiptFileName: formData.receiptFileName,
          termsAccepted: formData.termsAccepted
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
    'Contact Information',
    'Company Information', 
    'Payment',
    'Review & Terms'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
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
                <label className="block text-sm font-medium text-gray-100">
                  Phone Number <span style={{color: '#DAAB2D'}}>*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-32 px-3 py-3 text-sm text-white border border-gray-600 rounded-md focus:outline-none focus:ring-1"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      backgroundColor: 'rgba(46, 46, 49, 0.3)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#DAAB2D';
                      e.target.style.backgroundColor = 'rgba(30, 30, 33, 0.4)';
                      e.target.style.boxShadow = '0 0 0 1px rgba(218, 171, 45, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '';
                      e.target.style.backgroundColor = 'rgba(46, 46, 49, 0.3)';
                      e.target.style.boxShadow = '';
                    }}
                  >
                    <optgroup label="Popular">
                      {popularCountryCodes.map((country) => (
                        <option
                          key={`popular-${country.code}`}
                          value={country.code}
                          style={{backgroundColor: '#1f2937'}}
                        >
                          {country.flag} {country.code}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="All Countries">
                      {countryCodes.map((country) => (
                        <option
                          key={country.code}
                          value={country.code}
                          style={{backgroundColor: '#1f2937'}}
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
                      className={`block w-full pl-10 pr-3 py-3 text-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 rounded-md border ${
                        errors.phone
                          ? 'border-red-500 bg-red-900/20 focus:border-red-400 focus:ring-1 focus:ring-red-400'
                          : 'border-gray-600 hover:border-gray-500 focus:ring-1'
                      }`}
                      style={{
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        backgroundColor: errors.phone ? '' : 'rgba(46, 46, 49, 0.3)'
                      }}
                      onFocus={(e) => {
                        if (!errors.phone) {
                          e.target.style.borderColor = '#DAAB2D';
                          e.target.style.backgroundColor = 'rgba(30, 30, 33, 0.4)';
                          e.target.style.boxShadow = '0 0 0 1px rgba(218, 171, 45, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.phone) {
                          e.target.style.borderColor = '';
                          e.target.style.backgroundColor = 'rgba(46, 46, 49, 0.3)';
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
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            {/* Info Card */}
            <div className="rounded-lg p-4 border" style={{
              backgroundColor: 'rgba(218, 171, 45, 0.05)',
              borderColor: 'rgba(218, 171, 45, 0.2)'
            }}>
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 mt-0.5" style={{color: '#DAAB2D'}} />
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Company Details</h4>
                  <p className="text-xs text-gray-400">
                    Help us understand your business better. This information will be used to tailor partnership opportunities to your needs.
                  </p>
                </div>
              </div>
            </div>

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

            <EnhancedSelect
              label="Industry"
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
          </div>
        );

      case 3:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'rgba(218, 171, 45, 0.05)',
                borderColor: 'rgba(218, 171, 45, 0.2)'
              }}>
                <h3 className="text-base font-semibold text-white">Bank Transfer Details</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-300">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400">Bank</span>
                    <span className="font-medium text-white">Maybank</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400">Account Name</span>
                    <span className="font-medium text-white">Confetti KL Sdn Bhd</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-gray-400">Account No.</span>
                    <span className="font-medium text-white">1234567890</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-gray-400">Reference</span>
                    <span className="font-medium text-white text-right">{formData.companyName || 'Company Name'} - IBPP</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-100">
                  Upload Receipt <span style={{color: '#DAAB2D'}}>*</span>
                </label>
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
                  className={`block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:text-black file:cursor-pointer rounded-md border ${
                    errors.receiptFile ? 'border-red-500' : 'border-gray-600'
                  }`}
                  style={{
                    backgroundColor: 'rgba(46, 46, 49, 0.3)'
                  }}
                />
                {errors.receiptFile && (
                  <div className="flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.receiptFile}</span>
                  </div>
                )}
                {formData.receiptFileName && !errors.receiptFile && (
                  <div className="text-xs text-gray-400">Selected: {formData.receiptFileName}</div>
                )}
                {formData.receiptStorageKey && (
                  <div className="text-xs" style={{color: '#DAAB2D'}}>Receipt uploaded</div>
                )}
              </div>

              <div className="rounded-lg p-4 border" style={{
                backgroundColor: 'rgba(30, 30, 33, 0.6)',
                borderColor: 'rgba(218, 171, 45, 0.15)'
              }}>
                <div className="text-sm text-gray-300">
                  Please upload a clear screenshot / PDF of your bank transfer receipt.
                </div>
              </div>
            </div>

            <div className="rounded-lg p-5 border" style={{
              backgroundColor: 'rgba(30, 30, 33, 0.6)',
              borderColor: 'rgba(218, 171, 45, 0.15)'
            }}>
              <div className="text-sm font-semibold" style={{color: '#DAAB2D'}}>Total Payable</div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-400">Tier</div>
                  <div className="text-sm font-medium text-white capitalize">{tierPricing[formData.partnershipTier]?.label || formData.partnershipTier || '-'}</div>
                </div>
                <div className="text-2xl font-bold text-white">{formatRM(totalPayable)}</div>
              </div>

              <div className="mt-4 border-t pt-4" style={{borderColor: 'rgba(218, 171, 45, 0.1)'}}>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-medium text-white">{formatRM(totalPayable)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-300 mt-2">
                  <span className="text-gray-400">Tax</span>
                  <span className="font-medium text-white">RM 0</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-300 mt-2">
                  <span className="text-gray-400">Total</span>
                  <span className="font-semibold text-white">{formatRM(totalPayable)}</span>
                </div>
              </div>

              {errors.partnershipTier && (
                <div className="flex items-center gap-2 text-xs text-red-400 mt-4">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{errors.partnershipTier}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">

            
            <div className="rounded-lg p-4 sm:p-6 space-y-4 text-sm border"
              style={{
                backgroundColor: 'rgba(30, 30, 33, 0.6)',
                borderColor: 'rgba(218, 171, 45, 0.15)'
              }}
            >
              <div>
                <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{color: '#DAAB2D'}}>Contact Information</h4>
                <div className="text-gray-300 space-y-2 pl-2">
                  <p className="flex justify-between"><span className="text-gray-400">First Name:</span> <span className="font-medium text-white">{formData.firstName}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Last Name:</span> <span className="font-medium text-white">{formData.lastName}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Position:</span> <span className="font-medium text-white">{formData.position}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Email:</span> <span className="font-medium text-white">{formData.email}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Phone:</span> <span className="font-medium text-white">{formData.countryCode} {formData.phone}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">NRIC:</span> <span className="font-medium text-white">{formData.nric}</span></p>
                </div>
              </div>

              <div className="border-t pt-4" style={{borderColor: 'rgba(218, 171, 45, 0.1)'}}>
                <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{color: '#DAAB2D'}}>Company Information</h4>
                <div className="text-gray-300 space-y-2 pl-2">
                  <p className="flex justify-between"><span className="text-gray-400">Company:</span> <span className="font-medium text-white">{formData.companyName}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Industry:</span> <span className="font-medium text-white">{
                    formData.industry === 'other' && formData.industryOther
                      ? formData.industryOther
                      : formData.industry
                  }</span></p>
                </div>
              </div>

              <div className="border-t pt-4" style={{borderColor: 'rgba(218, 171, 45, 0.1)'}}>
                <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{color: '#DAAB2D'}}>Partnership Preferences</h4>
                <div className="text-gray-300 space-y-2 pl-2">
                  <p className="flex justify-between"><span className="text-gray-400">Tier:</span> <span className="font-medium text-white capitalize">{formData.partnershipTier}</span></p>
                </div>
              </div>

              <div className="border-t pt-4" style={{borderColor: 'rgba(218, 171, 45, 0.1)'}}>
                <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{color: '#DAAB2D'}}>Payment</h4>
                <div className="text-gray-300 space-y-2 pl-2">
                  <p className="flex justify-between"><span className="text-gray-400">Total Payable:</span> <span className="font-medium text-white">{formatRM(totalPayable)}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Receipt:</span> <span className="font-medium text-white">{formData.receiptFileName || 'Not uploaded'}</span></p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4" style={{borderColor: errors.termsAccepted ? '#ef4444' : 'rgba(107, 114, 128, 0.5)'}}>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="termsAccepted" 
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 border-gray-600 rounded focus:ring-2"
                  style={{ accentColor: '#DAAB2D' }}
                  onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px rgba(218, 171, 45, 0.3)'}
                  onBlur={(e) => e.target.style.boxShadow = ''}
                />
                <span className="text-sm text-gray-300 leading-relaxed">
                  I agree to the <button type="button" style={{color: '#DAAB2D'}} className="hover:underline">Terms & Conditions</button> and authorize Confetti KL to contact me regarding this partnership application.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
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
    <div className="max-w-4xl mx-auto">
      {/* Enhanced Progress Bar */}
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 text-sm font-semibold shadow-lg`}
                  style={{
                    backgroundColor: currentStep >= step ? '#DAAB2D' : currentStep === step ? 'rgba(218, 171, 45, 0.1)' : 'transparent',
                    borderColor: currentStep >= step ? '#DAAB2D' : currentStep === step ? '#DAAB2D' : '#4b5563',
                    color: currentStep >= step ? 'black' : currentStep === step ? '#DAAB2D' : '#6b7280',
                    boxShadow: currentStep === step ? '0 0 20px rgba(218, 171, 45, 0.4)' : 'none',
                    transform: currentStep === step ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {currentStep > step ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                <div className={`hidden sm:block mt-2 text-xs font-medium transition-colors duration-300`}
                  style={{
                    color: currentStep >= step ? '#DAAB2D' : '#6b7280'
                  }}
                >
                  {stepTitles[step - 1].split(' ')[0]}
                </div>
              </div>
              {step < 4 && (
                <div className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-all duration-300 relative`}
                  style={{
                    backgroundColor: '#374151'
                  }}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      backgroundColor: '#DAAB2D',
                      width: currentStep > step ? '100%' : '0%'
                    }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="text-sm sm:text-base font-medium text-white mb-1">
            {stepTitles[currentStep - 1]}
          </div>
          <div className="text-xs text-gray-400">
            Step {currentStep} of 4
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-xl p-4 sm:p-6 lg:p-8 border"
        style={{
          backgroundColor: '#F2F2F2',
          borderColor: 'rgba(218, 171, 45, 0.2)'
        }}
      >
        {renderStep()}
        
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t" style={{borderColor: 'rgba(218, 171, 45, 0.1)'}}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center justify-center gap-2 px-5 sm:px-7 py-3.5 text-sm font-semibold uppercase transition-all duration-300 border-2 rounded-lg ${
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
                e.currentTarget.style.borderColor = '#DAAB2D';
                e.currentTarget.style.backgroundColor = 'rgba(30, 30, 33, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (currentStep !== 1) {
                e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.5)';
                e.currentTarget.style.backgroundColor = 'rgba(46, 46, 49, 0.4)';
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={isUploadingReceipt}
              className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3.5 text-black text-sm font-semibold uppercase transition-all duration-300 rounded-lg transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                background: 'linear-gradient(135deg, #DAAB2D, #A57A03)',
                boxShadow: '0 0 0 0 rgba(218, 171, 45, 0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(218, 171, 45, 0.3), 0 10px 10px -5px rgba(218, 171, 45, 0.04)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 0 0 0 rgba(218, 171, 45, 0.3)'}
            >
              <span>{currentStep === 3 && isUploadingReceipt ? 'Uploading...' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 sm:px-10 py-3.5 text-black text-sm font-semibold uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transform hover:scale-105 disabled:transform-none"
              style={{
                background: 'linear-gradient(135deg, #DAAB2D, #A57A03)',
                boxShadow: '0 0 0 0 rgba(218, 171, 45, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(218, 171, 45, 0.3), 0 10px 10px -5px rgba(218, 171, 45, 0.04)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.boxShadow = '0 0 0 0 rgba(218, 171, 45, 0.3)';
                }
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
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
    </div>
  );
};

export default CorporateFormSteps;