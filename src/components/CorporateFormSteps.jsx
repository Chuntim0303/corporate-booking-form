import React, { useState } from 'react';

const CorporateFormSteps = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    company: '',
    linkedIn: '',
    
    // Address
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Plan Selection
    selectedPlan: '',
    
    // Additional preferences
    interests: [],
    referralSource: ''
  });

  const [errors, setErrors] = useState({});

  const steps = [
    { number: 1, title: 'Personal Info', icon: '👤' },
    { number: 2, title: 'Address', icon: '📍' },
    { number: 3, title: 'Select Plan', icon: '💎' },
    { number: 4, title: 'Review', icon: '✅' }
  ];

  const plans = [
    {
      id: 'executive',
      name: 'Executive',
      price: '$2,500',
      period: '/year',
      features: [
        'Access to all networking events',
        'Executive lounge access',
        'Monthly industry reports',
        'Priority event booking',
        '1-on-1 executive coaching session'
      ],
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Executive',
      price: '$5,000',
      period: '/year',
      features: [
        'Everything in Executive',
        'VIP event access',
        'Quarterly leadership retreats',
        'Personal brand consultation',
        'Direct CEO introductions',
        'Board advisory opportunities'
      ],
      popular: true
    },
    {
      id: 'chairman',
      name: 'Chairman Circle',
      price: '$10,000',
      period: '/year',
      features: [
        'Everything in Premium',
        'Exclusive chairman events',
        'Private jet networking trips',
        'Investment opportunities',
        'Global expansion consulting',
        'Legacy planning sessions'
      ],
      popular: false
    }
  ];

  const interestOptions = [
    'Technology & Innovation',
    'Finance & Investment',
    'Healthcare & Biotech',
    'Real Estate',
    'Manufacturing',
    'Energy & Sustainability',
    'Media & Entertainment',
    'Professional Services'
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
      if (!formData.company.trim()) newErrors.company = 'Company name is required';
    }

    if (step === 2) {
      if (!formData.street.trim()) newErrors.street = 'Street address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    }

    if (step === 3) {
      if (!formData.selectedPlan) newErrors.selectedPlan = 'Please select a membership plan';
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

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      alert('Application submitted successfully! Our team will contact you within 24 hours.');
      console.log('Form submitted:', formData);
      // Navigate back to home page after successful submission
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    }
  };

  const handleInterestToggle = (interest) => {
    const currentInterests = formData.interests || [];
    const isSelected = currentInterests.includes(interest);
    
    if (isSelected) {
      updateFormData('interests', currentInterests.filter(i => i !== interest));
    } else {
      updateFormData('interests', [...currentInterests, interest]);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              currentStep >= step.number 
                ? 'bg-purple-600 border-purple-600 text-white' 
                : 'border-gray-600 text-gray-400'
            }`}>
              <span className="text-sm font-semibold">{step.number}</span>
            </div>
            <div className="ml-3 hidden sm:block">
              <p className={`text-sm font-medium ${
                currentStep >= step.number ? 'text-purple-400' : 'text-gray-400'
              }`}>
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-0.5 mx-4 ${
                currentStep > step.number ? 'bg-purple-600' : 'bg-gray-600'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => updateFormData('firstName', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
              errors.firstName ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => updateFormData('lastName', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
              errors.lastName ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData('email', e.target.value)}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
            errors.email ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Enter your email address"
        />
        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
              errors.phone ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => updateFormData('jobTitle', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
              errors.jobTitle ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="CEO, CTO, VP, etc."
          />
          {errors.jobTitle && <p className="text-red-400 text-sm mt-1">{errors.jobTitle}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Company Name *
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => updateFormData('company', e.target.value)}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
            errors.company ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="Enter your company name"
        />
        {errors.company && <p className="text-red-400 text-sm mt-1">{errors.company}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          LinkedIn Profile (Optional)
        </label>
        <input
          type="url"
          value={formData.linkedIn}
          onChange={(e) => updateFormData('linkedIn', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>
    </div>
  );

  const renderAddress = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Street Address *
        </label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => updateFormData('street', e.target.value)}
          className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
            errors.street ? 'border-red-500' : 'border-gray-600'
          }`}
          placeholder="123 Executive Boulevard"
        />
        {errors.street && <p className="text-red-400 text-sm mt-1">{errors.street}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            City *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => updateFormData('city', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
              errors.city ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="New York"
          />
          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            State *
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => updateFormData('state', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
              errors.state ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="NY"
          />
          {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ZIP Code *
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => updateFormData('zipCode', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
              errors.zipCode ? 'border-red-500' : 'border-gray-600'
            }`}
            placeholder="10001"
          />
          {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Country
          </label>
          <select
            value={formData.country}
            onChange={(e) => updateFormData('country', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          >
            <option value="United States">United States</option>
            <option value="Canada">Canada</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Australia">Australia</option>
            <option value="Germany">Germany</option>
            <option value="France">France</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPlanSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-white mb-2">Choose Your Membership Level</h3>
        <p className="text-gray-400">Select the plan that best fits your executive networking needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => updateFormData('selectedPlan', plan.id)}
            className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all duration-300 hover:scale-105 ${
              formData.selectedPlan === plan.id
                ? 'border-purple-500 bg-purple-900/20'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-4">
              <h4 className="text-lg font-semibold text-white mb-2">{plan.name}</h4>
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {plan.price}
                <span className="text-sm text-gray-400 font-normal">{plan.period}</span>
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-gray-300">
                  <svg className="w-4 h-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
                formData.selectedPlan === plan.id
                  ? 'bg-purple-500 border-purple-500'
                  : 'border-gray-400'
              }`}>
                {formData.selectedPlan === plan.id && (
                  <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {errors.selectedPlan && (
        <p className="text-red-400 text-sm text-center">{errors.selectedPlan}</p>
      )}

      <div className="mt-8">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Industry Interests (Select all that apply)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {interestOptions.map((interest) => (
            <label key={interest} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.interests?.includes(interest) || false}
                onChange={() => handleInterestToggle(interest)}
                className="sr-only"
              />
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                formData.interests?.includes(interest)
                  ? 'bg-purple-900/30 border-purple-500 text-purple-300'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  formData.interests?.includes(interest)
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-400'
                }`}>
                  {formData.interests?.includes(interest) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{interest}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          How did you hear about us?
        </label>
        <select
          value={formData.referralSource}
          onChange={(e) => updateFormData('referralSource', e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        >
          <option value="">Select an option</option>
          <option value="colleague">Colleague Referral</option>
          <option value="linkedin">LinkedIn</option>
          <option value="event">Industry Event</option>
          <option value="website">Company Website</option>
          <option value="search">Search Engine</option>
          <option value="other">Other</option>
        </select>
      </div>
    </div>
  );

  const renderReview = () => {
    const selectedPlan = plans.find(p => p.id === formData.selectedPlan);
    
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-white mb-2">Review Your Application</h3>
          <p className="text-gray-400">Please review your information before submitting</p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">👤</span> Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Name:</span>
                <p className="text-white">{formData.firstName} {formData.lastName}</p>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-white">{formData.email}</p>
              </div>
              <div>
                <span className="text-gray-400">Phone:</span>
                <p className="text-white">{formData.phone}</p>
              </div>
              <div>
                <span className="text-gray-400">Job Title:</span>
                <p className="text-white">{formData.jobTitle}</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-400">Company:</span>
                <p className="text-white">{formData.company}</p>
              </div>
              {formData.linkedIn && (
                <div className="sm:col-span-2">
                  <span className="text-gray-400">LinkedIn:</span>
                  <p className="text-white">{formData.linkedIn}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">📍</span> Address
            </h4>
            <div className="text-sm">
              <span className="text-gray-400">Address:</span>
              <p className="text-white">
                {formData.street}<br />
                {formData.city}, {formData.state} {formData.zipCode}<br />
                {formData.country}
              </p>
            </div>
          </div>

          {/* Selected Plan */}
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
              <span className="mr-2">💎</span> Membership Plan
            </h4>
            {selectedPlan && (
              <div className="border border-purple-500 rounded-lg p-4 bg-purple-900/20">
                <div className="flex justify-between items-start mb-3">
                  <h5 className="text-lg font-semibold text-white">{selectedPlan.name}</h5>
                  <div className="text-purple-400 font-bold">
                    {selectedPlan.price}<span className="text-sm text-gray-400">{selectedPlan.period}</span>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-gray-300">
                  {selectedPlan.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                  {selectedPlan.features.length > 3 && (
                    <li className="text-purple-400 text-xs">
                      +{selectedPlan.features.length - 3} more features
                    </li>
                  )}
                </ul>
              </div>
            )}

            {formData.interests && formData.interests.length > 0 && (
              <div className="mt-4">
                <span className="text-gray-400 text-sm">Selected Interests:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.interests.map((interest) => (
                    <span key={interest} className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.referralSource && (
              <div className="mt-4">
                <span className="text-gray-400 text-sm">Referral Source:</span>
                <p className="text-white text-sm">{formData.referralSource}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
          <p className="text-purple-300 text-sm">
            <strong>Next Steps:</strong> After submitting your application, our membership committee will review your details within 24-48 hours. You'll receive an email confirmation and may be contacted for a brief introductory call.
          </p>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderPersonalInfo();
      case 2:
        return renderAddress();
      case 3:
        return renderPlanSelection();
      case 4:
        return renderReview();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sm:p-8">
        {renderProgressBar()}
        
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              currentStep === 1
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Previous
          </button>

          <div className="text-center">
            <span className="text-gray-400 text-sm">
              Step {currentStep} of {steps.length}
            </span>
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CorporateFormSteps;