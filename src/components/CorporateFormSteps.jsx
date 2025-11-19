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
  Sparkles,
  Crown,
  Check,
  Loader2,
  Award,
  ChevronDown
} from 'lucide-react';

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
        {label} {required && <span className="text-yellow-400">*</span>}
      </label>
      
      <div className={`relative transition-all duration-200 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-4 w-4 transition-colors duration-200`} style={{color: error ? '#ef4444' : isFocused ? '#F4C430' : '#6b7280'}} />
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
              ? 'border-yellow-400 bg-gray-800/60 shadow-md shadow-yellow-400/10 focus:ring-1 focus:ring-yellow-400'
              : 'border-gray-600 bg-gray-800/40 hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}
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
        {label} {required && <span className="text-yellow-400">*</span>}
      </label>
      
      <div className={`relative transition-all duration-200 ${isFocused ? 'transform scale-[1.01]' : ''}`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <Icon className={`h-4 w-4 transition-colors duration-200`} style={{color: error ? '#ef4444' : isFocused ? '#F4C430' : '#6b7280'}} />
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
              ? 'border-yellow-400 bg-gray-800/60 shadow-md shadow-yellow-400/10 focus:ring-1 focus:ring-yellow-400'
              : 'border-gray-600 bg-gray-800/40 hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}
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
const CorporateFormSteps = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Contact Person
    contactName: '',
    position: '',
    email: '',
    countryCode: '+60',
    phone: '',
    nric: '',

    // Step 2: Company Information
    companyName: '',
    industry: '',
    industryOther: '',
    companySize: '',

    // Step 3: Partnership Preferences
    partnershipTier: '',
    eventTypes: [],
    expectedEvents: '',

    // Step 4: Terms
    termsAccepted: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'eventTypes') {
      const currentArray = formData[name] || [];
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...currentArray, value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: currentArray.filter(item => item !== value)
        }));
      }
    } else if (type === 'checkbox') {
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
      // Remove any non-digit characters except + and -
      const cleanedValue = value.replace(/[^\d-\s]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }));
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
        if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
        if (!formData.position.trim()) newErrors.position = 'Position is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.nric.trim()) newErrors.nric = 'NRIC is required';
        
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        
        // Phone number validation for Malaysia
        if (formData.phone && formData.countryCode === '+60') {
          const cleanPhone = formData.phone.replace(/[\s\-]/g, '');
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
        if (!formData.companySize) newErrors.companySize = 'Company size is required';
        break;
      case 3:
        if (!formData.partnershipTier) newErrors.partnershipTier = 'Partnership tier selection is required';
        if (!formData.expectedEvents) newErrors.expectedEvents = 'Expected events per year is required';
        break;
      case 4:
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept terms and conditions';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://s8uentbcpd.execute-api.ap-southeast-1.amazonaws.com/dev/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactName: formData.contactName,
          position: formData.position,
          email: formData.email,
          countryCode: formData.countryCode,
          phone: formData.phone,
          nric: formData.nric,
          companyName: formData.companyName,
          industry: formData.industry === 'other' ? formData.industryOther : formData.industry,
          companySize: formData.companySize,
          partnershipTier: formData.partnershipTier,
          eventTypes: formData.eventTypes,
          expectedEvents: formData.expectedEvents,
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
    'Partnership Preferences',
    'Review & Terms'
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Contact Information
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">Primary contact person details</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <EnhancedInput
                label="Full Name"
                name="contactName"
                placeholder="Contact person name"
                value={formData.contactName}
                onChange={handleChange}
                error={errors.contactName}
                icon={User}
                required
              />
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
                <label className="block text-sm font-medium text-gray-100">
                  Phone Number <span className="text-yellow-400">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="w-24 px-3 py-3 text-sm text-white bg-gray-800/40 border border-gray-600 rounded-md focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400"
                    style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}
                  >
                    <option value="+60" style={{backgroundColor: '#1f2937'}}>🇲🇾 +60</option>
                    <option value="+65" style={{backgroundColor: '#1f2937'}}>🇸🇬 +65</option>
                    <option value="+66" style={{backgroundColor: '#1f2937'}}>🇹🇭 +66</option>
                    <option value="+62" style={{backgroundColor: '#1f2937'}}>🇮🇩 +62</option>
                    <option value="+1" style={{backgroundColor: '#1f2937'}}>🇺🇸 +1</option>
                    <option value="+44" style={{backgroundColor: '#1f2937'}}>🇬🇧 +44</option>
                    <option value="+86" style={{backgroundColor: '#1f2937'}}>🇨🇳 +86</option>
                    <option value="+91" style={{backgroundColor: '#1f2937'}}>🇮🇳 +91</option>
                  </select>
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder={formData.countryCode === '+60' ? '12-345-6789' : '123-456-7890'}
                      value={formData.phone}
                      onChange={handleChange}
                      className={`block w-full pl-10 pr-3 py-3 text-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 rounded-md border ${
                        errors.phone 
                          ? 'border-red-500 bg-red-900/20 focus:border-red-400 focus:ring-1 focus:ring-red-400' 
                          : 'border-gray-600 bg-gray-800/40 hover:border-gray-500 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                      }`}
                      style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}
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
              helpText="Malaysian NRIC format: 6 digits + 2 digits + 4 digits"
              maxLength={14}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Company Information
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">Tell us about your organization</p>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
              <EnhancedSelect
                label="Company Size"
                name="companySize"
                placeholder="Number of employees"
                value={formData.companySize}
                onChange={handleChange}
                error={errors.companySize}
                icon={Users}
                required
                options={[
                  { value: '1-10', label: '1-10 employees' },
                  { value: '11-50', label: '11-50 employees' },
                  { value: '51-200', label: '51-200 employees' },
                  { value: '201-500', label: '201-500 employees' },
                  { value: '500+', label: '500+ employees' }
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
          </div>
        );

      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Partnership Preferences
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">Choose your preferred partnership tier and event types</p>
            </div>
            
            <EnhancedSelect
              label="Partnership Tier"
              name="partnershipTier"
              placeholder="Select partnership tier"
              value={formData.partnershipTier}
              onChange={handleChange}
              error={errors.partnershipTier}
              icon={Crown}
              required
              options={[
                { value: 'gold', label: 'Gold Partner - RM 50,000' },
                { value: 'platinum', label: 'Platinum Partner - RM 100,000' },
                { value: 'diamond', label: 'Diamond Partner - RM 200,000' }
              ]}
            />
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-100">
                Event Types <span className="text-gray-400">(Select all that apply)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {[
                  'Corporate Meetings',
                  'Product Launches', 
                  'Team Building',
                  'Training Sessions',
                  'Conferences',
                  'Networking Events',
                  'Award Ceremonies',
                  'Holiday Parties'
                ].map(type => (
                  <label key={type} className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-800/30 transition-colors duration-200 border border-transparent hover:border-gray-700">
                    <input
                      type="checkbox"
                      name="eventTypes"
                      value={type}
                      checked={formData.eventTypes.includes(type)}
                      onChange={handleChange}
                      className="w-4 h-4 border-gray-600 rounded focus:ring-2 focus:ring-yellow-400"
                      style={{
                        accentColor: '#F4C430',
                        backgroundColor: '#1f2937'
                      }}
                    />
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                      {type}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <EnhancedSelect
              label="Expected Events Per Year"
              name="expectedEvents"
              placeholder="How many events do you plan?"
              value={formData.expectedEvents}
              onChange={handleChange}
              error={errors.expectedEvents}
              icon={Calendar}
              required
              options={[
                { value: '1-5', label: '1-5 events' },
                { value: '6-10', label: '6-10 events' },
                { value: '11-20', label: '11-20 events' },
                { value: '21+', label: '21+ events' }
              ]}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Review & Confirm
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">Please review your details before submitting</p>
            </div>
            
            <div className="bg-gray-800/40 rounded-lg p-4 sm:p-6 space-y-4 text-sm border border-gray-700/50">
              <div>
                <h4 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">Contact Information</h4>
                <div className="text-gray-300 space-y-2 pl-2">
                  <p className="flex justify-between"><span className="text-gray-400">Name:</span> <span className="font-medium text-white">{formData.contactName}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Position:</span> <span className="font-medium text-white">{formData.position}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Email:</span> <span className="font-medium text-white">{formData.email}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Phone:</span> <span className="font-medium text-white">{formData.countryCode} {formData.phone}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">NRIC:</span> <span className="font-medium text-white">{formData.nric}</span></p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">Company Information</h4>
                <div className="text-gray-300 space-y-2 pl-2">
                  <p className="flex justify-between"><span className="text-gray-400">Company:</span> <span className="font-medium text-white">{formData.companyName}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Industry:</span> <span className="font-medium text-white">{
                    formData.industry === 'other' && formData.industryOther
                      ? formData.industryOther
                      : formData.industry
                  }</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Size:</span> <span className="font-medium text-white">{formData.companySize}</span></p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-sm font-semibold text-yellow-400 mb-3 uppercase tracking-wide">Partnership Preferences</h4>
                <div className="text-gray-300 space-y-2 pl-2">
                  <p className="flex justify-between"><span className="text-gray-400">Tier:</span> <span className="font-medium text-white capitalize">{formData.partnershipTier}</span></p>
                  <p className="flex flex-col sm:flex-row sm:justify-between gap-1"><span className="text-gray-400">Events:</span> <span className="font-medium text-white">{formData.eventTypes.join(', ') || 'None selected'}</span></p>
                  <p className="flex justify-between"><span className="text-gray-400">Expected Events:</span> <span className="font-medium text-white">{formData.expectedEvents || 'Not specified'}</span></p>
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
                  className="w-4 h-4 mt-0.5 border-gray-600 rounded focus:ring-2 focus:ring-yellow-400"
                  style={{ accentColor: '#F4C430' }}
                />
                <span className="text-sm text-gray-300 leading-relaxed">
                  I agree to the <button type="button" className="text-yellow-400 hover:underline">Terms & Conditions</button> and authorize Confetti KL to contact me regarding this partnership application.
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
                    backgroundColor: currentStep >= step ? '#F4C430' : currentStep === step ? 'rgba(244, 196, 48, 0.1)' : 'transparent',
                    borderColor: currentStep >= step ? '#F4C430' : currentStep === step ? '#F4C430' : '#4b5563',
                    color: currentStep >= step ? 'black' : currentStep === step ? '#F4C430' : '#6b7280',
                    boxShadow: currentStep === step ? '0 0 20px rgba(244, 196, 48, 0.4)' : 'none',
                    transform: currentStep === step ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  {currentStep > step ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                <div className={`hidden sm:block mt-2 text-xs font-medium transition-colors duration-300`}
                  style={{
                    color: currentStep >= step ? '#F4C430' : '#6b7280'
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
                      backgroundColor: '#F4C430',
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
          backgroundColor: '#1a1a1a',
          borderColor: 'rgba(244, 196, 48, 0.2)'
        }}
      >
        {renderStep()}
        
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center justify-center gap-2 px-5 sm:px-7 py-3.5 text-sm font-semibold uppercase transition-all duration-300 border-2 rounded-lg ${
              currentStep === 1
                ? 'text-gray-500 cursor-not-allowed border-gray-700 bg-gray-800/20 opacity-50'
                : 'text-gray-300 hover:text-white border-gray-600 hover:border-yellow-400 bg-gray-800/40 hover:bg-gray-800/60 hover:shadow-md'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Back</span>
          </button>

          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center justify-center gap-2 px-5 sm:px-7 py-3.5 text-black text-sm font-semibold uppercase transition-all duration-300 rounded-lg hover:shadow-xl hover:shadow-yellow-400/30 transform hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #F4C430, #FFD700)'
              }}
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 sm:px-10 py-3.5 text-black text-sm font-semibold uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:shadow-xl hover:shadow-yellow-400/30 transform hover:scale-105 disabled:transform-none"
              style={{
                background: 'linear-gradient(135deg, #F4C430, #FFD700)'
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