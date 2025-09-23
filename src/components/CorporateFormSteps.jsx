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
    <div className="space-y-3">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-100 tracking-wide" style={{fontFamily: 'Montserrat, sans-serif'}}>
        {label} {required && <span style={{color: '#F4C430'}}>*</span>}
      </label>
      
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'transform scale-[1.02]' : ''
      }`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon className={`h-5 w-5 transition-colors duration-200`} style={{color: error ? '#ef4444' : isFocused ? '#F4C430' : '#9ca3af'}} />
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
          className={`block w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 text-base text-white placeholder-gray-400 focus:outline-none transition-all duration-300 font-light tracking-wide rounded-lg border-2 ${
            error 
              ? 'border-red-500 bg-red-900/10 focus:border-red-400' 
              : isFocused
              ? 'border-yellow-400 bg-gray-800/70 shadow-lg shadow-yellow-400/20'
              : 'border-gray-600 bg-gray-800/40 hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            fontFamily: 'Montserrat, sans-serif'
          }}
        />
      </div>
      
      {helpText && !error && (
        <p className="text-sm text-gray-400 tracking-wide" style={{fontFamily: 'Montserrat, sans-serif'}}>{helpText}</p>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>{error}</span>
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
    <div className="space-y-3">
      <label htmlFor={id} className="block text-sm font-semibold text-gray-100 tracking-wide" style={{fontFamily: 'Montserrat, sans-serif'}}>
        {label} {required && <span style={{color: '#F4C430'}}>*</span>}
      </label>
      
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'transform scale-[1.02]' : ''
      }`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon className={`h-5 w-5 transition-colors duration-200`} style={{color: error ? '#ef4444' : isFocused ? '#F4C430' : '#9ca3af'}} />
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
          className={`block w-full ${Icon ? 'pl-12' : 'pl-4'} pr-12 py-4 text-base text-white focus:outline-none appearance-none transition-all duration-300 font-light tracking-wide rounded-lg border-2 ${
            error 
              ? 'border-red-500 bg-red-900/10 focus:border-red-400' 
              : isFocused
              ? 'border-yellow-400 bg-gray-800/70 shadow-lg shadow-yellow-400/20'
              : 'border-gray-600 bg-gray-800/40 hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          <option value="" style={{backgroundColor: '#1f2937', color: '#9ca3af'}}>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} style={{backgroundColor: '#1f2937', color: 'white'}}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>{error}</span>
        </div>
      )}
    </div>
  );
};

// Corporate Form Steps Component
const CorporateFormSteps = ({ onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    companyRegistration: '',
    industry: '',
    companySize: '',
    website: '',
    address: '',
    
    // Step 2: Contact Person
    contactName: '',
    position: '',
    email: '',
    phone: '',
    
    // Step 3: Partnership Preferences
    partnershipTier: '',
    eventTypes: [],
    expectedEvents: '',
    preferredSeasons: [],
    
    // Step 4: Additional Information
    experience: '',
    budget: '',
    specialRequirements: '',
    marketing: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
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
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.companyRegistration.trim()) newErrors.companyRegistration = 'Registration number is required';
        if (!formData.industry) newErrors.industry = 'Industry selection is required';
        if (!formData.companySize) newErrors.companySize = 'Company size is required';
        break;
      case 2:
        if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
        if (!formData.position.trim()) newErrors.position = 'Position is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;
      case 3:
        if (!formData.partnershipTier) newErrors.partnershipTier = 'Partnership tier selection is required';
        if (!formData.expectedEvents) newErrors.expectedEvents = 'Expected events per year is required';
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    onComplete();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-light text-white mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Company Information
              </h3>
              <p className="text-gray-400 text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Tell us about your organization</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <EnhancedInput
                label="Registration Number"
                name="companyRegistration"
                placeholder="Company registration number"
                value={formData.companyRegistration}
                onChange={handleChange}
                error={errors.companyRegistration}
                icon={CreditCard}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            
            <EnhancedInput
              label="Website"
              name="website"
              placeholder="www.yourcompany.com"
              value={formData.website}
              onChange={handleChange}
              error={errors.website}
              icon={Sparkles}
            />
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-100 tracking-wide" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Company Address
              </label>
              <textarea 
                name="address"
                rows={3}
                placeholder="Full company address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-4 text-base text-white placeholder-gray-400 focus:outline-none transition-all duration-300 font-light tracking-wide rounded-lg border-2 border-gray-600 bg-gray-800/40 hover:border-gray-500 focus:border-yellow-400 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-yellow-400/20 resize-none"
                style={{fontFamily: 'Montserrat, sans-serif'}}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-light text-white mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Contact Information
              </h3>
              <p className="text-gray-400 text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Primary contact person details</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
              <EnhancedInput
                label="Phone Number"
                name="phone"
                placeholder="+60 12-345-6789"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                icon={Phone}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-light text-white mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Partnership Preferences
              </h3>
              <p className="text-gray-400 text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Choose your preferred partnership tier and event types</p>
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
            
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-100 tracking-wide" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Event Types (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-4">
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
                  <label key={type} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-800/30 transition-colors duration-200">
                    <input
                      type="checkbox"
                      name="eventTypes"
                      value={type}
                      checked={formData.eventTypes.includes(type)}
                      onChange={handleChange}
                      className="w-5 h-5 border-gray-600 rounded focus:ring-2"
                      style={{
                        accentColor: '#F4C430',
                        backgroundColor: '#1f2937'
                      }}
                    />
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors" style={{fontFamily: 'Montserrat, sans-serif'}}>
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
            
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-100 tracking-wide" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Preferred Event Seasons
              </label>
              <div className="grid grid-cols-2 gap-4">
                {['Spring', 'Summer', 'Autumn', 'Winter'].map(season => (
                  <label key={season} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-gray-800/30 transition-colors duration-200">
                    <input
                      type="checkbox"
                      name="preferredSeasons"
                      value={season}
                      checked={formData.preferredSeasons.includes(season)}
                      onChange={handleChange}
                      className="w-5 h-5 border-gray-600 rounded focus:ring-2"
                      style={{
                        accentColor: '#F4C430',
                        backgroundColor: '#1f2937'
                      }}
                    />
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors" style={{fontFamily: 'Montserrat, sans-serif'}}>
                      {season}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl sm:text-2xl font-light text-white mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Additional Information
              </h3>
              <p className="text-gray-400 text-sm" style={{fontFamily: 'Montserrat, sans-serif'}}>Help us understand your event planning needs</p>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-100 tracking-wide" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Previous Event Experience
              </label>
              <textarea 
                name="experience"
                rows={4}
                placeholder="Tell us about your previous corporate event experiences..."
                value={formData.experience}
                onChange={handleChange}
                className="w-full px-4 py-4 text-base text-white placeholder-gray-400 focus:outline-none transition-all duration-300 font-light tracking-wide rounded-lg border-2 border-gray-600 bg-gray-800/40 hover:border-gray-500 focus:border-yellow-400 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-yellow-400/20 resize-none"
                style={{fontFamily: 'Montserrat, sans-serif'}}
              />
            </div>
            
            <EnhancedSelect
              label="Annual Event Budget Range"
              name="budget"
              placeholder="Select your budget range"
              value={formData.budget}
              onChange={handleChange}
              icon={CreditCard}
              options={[
                { value: 'under-50k', label: 'Under RM 50,000' },
                { value: '50k-100k', label: 'RM 50,000 - RM 100,000' },
                { value: '100k-250k', label: 'RM 100,000 - RM 250,000' },
                { value: '250k-500k', label: 'RM 250,000 - RM 500,000' },
                { value: 'over-500k', label: 'Over RM 500,000' }
              ]}
            />
            
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-100 tracking-wide" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Special Requirements
              </label>
              <textarea 
                name="specialRequirements"
                rows={4}
                placeholder="Any special requirements for your events (AV equipment, catering preferences, accessibility needs, etc.)"
                value={formData.specialRequirements}
                onChange={handleChange}
                className="w-full px-4 py-4 text-base text-white placeholder-gray-400 focus:outline-none transition-all duration-300 font-light tracking-wide rounded-lg border-2 border-gray-600 bg-gray-800/40 hover:border-gray-500 focus:border-yellow-400 focus:bg-gray-800/70 focus:shadow-lg focus:shadow-yellow-400/20 resize-none"
                style={{fontFamily: 'Montserrat, sans-serif'}}
              />
            </div>
            
            <EnhancedSelect
              label="How did you hear about us?"
              name="marketing"
              placeholder="Select marketing channel"
              value={formData.marketing}
              onChange={handleChange}
              icon={Sparkles}
              options={[
                { value: 'website', label: 'Website/Google Search' },
                { value: 'social-media', label: 'Social Media' },
                { value: 'referral', label: 'Referral from partner' },
                { value: 'event', label: 'Industry Event' },
                { value: 'advertisement', label: 'Advertisement' },
                { value: 'other', label: 'Other' }
              ]}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((step) => (
            <div 
              key={step} 
              className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300`}
                style={{
                  backgroundColor: currentStep >= step ? '#F4C430' : 'transparent',
                  borderColor: currentStep >= step ? '#F4C430' : '#4b5563',
                  color: currentStep >= step ? 'black' : '#9ca3af'
                }}
              >
                {currentStep > step ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>{step}</span>
                )}
              </div>
              {step < 4 && (
                <div className={`h-px flex-1 mx-4 transition-all duration-300`}
                  style={{backgroundColor: currentStep > step ? '#F4C430' : '#4b5563'}}
                ></div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-400 tracking-widest uppercase mb-2" style={{fontFamily: 'Montserrat, sans-serif'}}>
            Step {currentStep} of 4
          </div>
          <div className="text-xs text-gray-500" style={{fontFamily: 'Montserrat, sans-serif'}}>
            {currentStep === 1 && 'Company Information'}
            {currentStep === 2 && 'Contact Information'}
            {currentStep === 3 && 'Partnership Preferences'}
            {currentStep === 4 && 'Additional Information'}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-2xl p-8 lg:p-12 border-2"
        style={{
          backgroundColor: '#1a1a1a',
          borderColor: 'rgba(244, 196, 48, 0.2)'
        }}
      >
        {renderStep()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-12 pt-8 border-t border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-light tracking-widest uppercase transition-all duration-300 border-2 rounded-lg ${
              currentStep === 1
                ? 'text-gray-500 cursor-not-allowed border-gray-600'
                : 'text-gray-300 hover:text-yellow-400 border-gray-600 hover:border-yellow-400'
            }`}
            style={{fontFamily: 'Montserrat, sans-serif'}}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 text-black text-sm font-semibold tracking-widest uppercase transition-all duration-300 rounded-lg hover:shadow-lg hover:shadow-yellow-400/30"
              style={{
                background: '#F4C430',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 text-black text-sm font-semibold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:shadow-lg hover:shadow-yellow-400/30"
              style={{
                background: '#F4C430',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Application
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