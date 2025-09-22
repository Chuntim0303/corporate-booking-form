import React, { useState, useId } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
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
  Star,
  Check,
  Loader2,
  X
} from 'lucide-react';
import CorporateFormSteps from './components/CorporateFormSteps';

// Enhanced Input Component for Modal
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
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 tracking-wide">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>
      
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'transform scale-[1.01]' : ''
      }`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon className={`h-5 w-5 transition-colors duration-200 ${
              error ? 'text-red-400' : isFocused ? 'text-amber-400' : 'text-gray-400'
            }`} />
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
          className={`block w-full ${Icon ? 'pl-12' : 'pl-4'} pr-4 py-4 bg-gray-800/50 backdrop-blur-sm border-0 border-b-2 text-white placeholder-gray-400 focus:outline-none transition-all duration-300 font-light tracking-wide ${
            error 
              ? 'border-red-500 bg-red-900/10' 
              : isFocused
              ? 'border-amber-400 bg-gray-700/50'
              : 'border-gray-600 hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-lg border border-amber-400/30 pointer-events-none"></div>
        )}
      </div>
      
      {helpText && !error && (
        <p className="text-xs text-gray-400 tracking-wide">{helpText}</p>
      )}
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-light">{error}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Select Component for Modal
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
      <label htmlFor={id} className="block text-sm font-medium text-gray-200 tracking-wide">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>
      
      <div className={`relative transition-all duration-300 ${
        isFocused ? 'transform scale-[1.01]' : ''
      }`}>
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Icon className={`h-5 w-5 transition-colors duration-200 ${
              error ? 'text-red-400' : isFocused ? 'text-amber-400' : 'text-gray-400'
            }`} />
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
          className={`block w-full ${Icon ? 'pl-12' : 'pl-4'} pr-12 py-4 bg-gray-800/50 backdrop-blur-sm border-0 border-b-2 text-white focus:outline-none appearance-none transition-all duration-300 font-light tracking-wide ${
            error 
              ? 'border-red-500 bg-red-900/10' 
              : isFocused
              ? 'border-amber-400 bg-gray-700/50'
              : 'border-gray-600 hover:border-gray-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="" className="bg-gray-800 text-gray-400">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800 text-white">
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {isFocused && !error && (
          <div className="absolute inset-0 rounded-lg border border-amber-400/30 pointer-events-none"></div>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-light">{error}</span>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [showModal, setShowModal] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleJoinNetwork = () => {
    setShowMembershipForm(true);
  };

  const handleFormComplete = () => {
    setShowMembershipForm(false);
  };

  const handleBackToHome = () => {
    setShowMembershipForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer group" onClick={handleBackToHome}>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <Crown className="w-6 h-6 text-black" />
                </div>
                <span className="text-2xl font-light text-white tracking-[0.2em]" style={{fontFamily: 'serif'}}>
                  CONFETTI <span className="text-amber-400">KL</span>
                </span>
              </div>
            </div>

            <button 
              onClick={openModal}
              className="group relative px-8 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-medium tracking-wider text-sm uppercase overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
            >
              <span className="relative z-10">Private Inquiry</span>
              <div className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </div>
        </nav>
      </header>

      <main>
        {showMembershipForm ? (
          <div className="py-20 px-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-400/10 border border-amber-400/20 backdrop-blur-sm mb-8">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Membership Application</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-light text-white mb-8 tracking-wider" style={{fontFamily: 'serif'}}>
                  Join the 
                  <span className="block text-amber-400 mt-2">Elite Network</span>
                </h1>
                <div className="w-24 h-px bg-amber-400 mx-auto mb-8"></div>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
                  Complete your application to become part of the world's most influential business network
                </p>
              </div>

              <CorporateFormSteps onComplete={handleFormComplete} />

              <div className="text-center mt-12">
                <button 
                  onClick={handleBackToHome}
                  className="px-8 py-3 border border-gray-600 text-gray-300 font-light tracking-widest text-sm uppercase hover:border-amber-400 hover:text-amber-400 transition-all duration-500"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <HomePage onJoinNetwork={handleJoinNetwork} onRequestInfo={openModal} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 mt-32">
        <div className="max-w-7xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-black" />
                </div>
                <span className="text-2xl font-light text-white tracking-[0.2em]" style={{fontFamily: 'serif'}}>
                  CONFETTI <span className="text-amber-400">KL</span>
                </span>
              </div>
              <p className="text-gray-400 font-light leading-relaxed tracking-wide max-w-md mb-8">
                An exclusive network of visionary leaders, industry pioneers, and influential decision-makers shaping the future of business.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-6 tracking-widest text-sm uppercase">Exclusive Access</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 hover:text-amber-400 transition-colors font-light tracking-wide">Executive Membership</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-400 transition-colors font-light tracking-wide">Private Events</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-400 transition-colors font-light tracking-wide">Strategic Partnerships</a></li>
                <li><a href="#" className="text-gray-400 hover:text-amber-400 transition-colors font-light tracking-wide">Leadership Council</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-6 tracking-widest text-sm uppercase">Connect</h3>
              <ul className="space-y-4 text-gray-400 font-light">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span className="tracking-wide text-sm">Global Headquarters</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span className="tracking-wide text-sm">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400" />
                  <span className="tracking-wide text-sm">connect@confettikl.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-16">
            <p className="text-center text-gray-500 text-sm font-light tracking-widest uppercase">
              © 2025 NexusConnect. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8">
          <div className="bg-gray-900 border border-gray-700 shadow-2xl w-full max-w-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
            
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-12">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 mx-auto mb-6 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-black" />
                </div>
                <h2 className="text-3xl font-light text-white mb-4 tracking-wider" style={{fontFamily: 'serif'}}>
                  Executive Consultation
                </h2>
                <div className="w-16 h-px bg-amber-400 mx-auto mb-6"></div>
                <p className="text-gray-300 font-light leading-relaxed tracking-wide">
                  Request a private consultation with our membership committee to discuss your professional networking objectives.
                </p>
              </div>
              
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <EnhancedInput
                    label="Full Name"
                    name="fullName"
                    placeholder="Your full name"
                    icon={User}
                    required
                  />
                  <EnhancedInput
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="professional@company.com"
                    icon={Mail}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <EnhancedInput
                    label="Company"
                    name="company"
                    placeholder="Organization name"
                    icon={Building}
                    required
                  />
                  <EnhancedInput
                    label="Position"
                    name="position"
                    placeholder="Your title"
                    icon={Trophy}
                    required
                  />
                </div>
                
                <EnhancedSelect
                  label="Area of Interest"
                  name="interest"
                  placeholder="Select primary interest"
                  icon={Sparkles}
                  required
                  options={[
                    { value: 'executive-membership', label: 'Executive Membership' },
                    { value: 'strategic-partnerships', label: 'Strategic Partnerships' },
                    { value: 'private-events', label: 'Private Events' },
                    { value: 'board-advisory', label: 'Board Advisory' },
                    { value: 'investment-opportunities', label: 'Investment Opportunities' }
                  ]}
                />
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-200 tracking-wide">Message</label>
                  <textarea 
                    rows={4}
                    placeholder="Tell us about your networking objectives and how we can assist you..."
                    className="w-full px-4 py-4 bg-gray-800/50 backdrop-blur-sm border-0 border-b-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition-all duration-300 font-light tracking-wide resize-none"
                  />
                </div>
                
                <button 
                  className="group relative w-full py-5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-medium tracking-widest text-sm uppercase overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
                  onClick={() => {
                    alert('Thank you for your inquiry. Our executive team will contact you within 24 hours to schedule your private consultation.');
                    closeModal();
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    <Crown className="w-5 h-5" />
                    Submit Consultation Request
                  </span>
                  <div className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// HomePage Component
const HomePage = ({ onJoinNetwork, onRequestInfo }) => {
  const features = [
    {
      icon: Users,
      title: 'Elite Network Access',
      description: 'Connect with C-suite executives, industry titans, and visionary leaders across global markets.',
    },
    {
      icon: Calendar,
      title: 'Exclusive Events',
      description: 'Access invitation-only gatherings, private dinners, and strategic forums in world-class venues.',
    },
    {
      icon: Trophy,
      title: 'Strategic Partnerships',
      description: 'Forge high-value alliances that drive exponential business growth and market expansion.',
    },
  ];

  const testimonials = [
    {
      quote: "Confetti KL has transformed how I approach strategic partnerships. The caliber of connections and opportunities is unmatched in the industry.",
      name: "Victoria Sterling",
      title: "CEO, Sterling Enterprises",
    },
    {
      quote: "Through Confetti KL, I've accessed investment opportunities and board positions that have redefined my career trajectory completely.",
      name: "Marcus Chen",
      title: "Managing Director, Chen Capital",
    },
    {
      quote: "The network's exclusive events provide unparalleled access to decision-makers who are actively shaping tomorrow's business landscape.",
      name: "Elena Rodriguez",
      title: "Founder, Rodriguez Ventures",
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Executive networking environment" 
            className="w-full h-full object-cover opacity-30"
          />
          
          {/* Animated particles */}
          <div className="absolute inset-0 z-5">
            <div className="absolute top-20 left-10 w-2 h-2 bg-amber-400/40 rounded-full animate-pulse"></div>
            <div className="absolute top-40 right-20 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-40 left-20 w-1 h-1 bg-amber-400/40 rounded-full animate-pulse delay-700"></div>
            <div className="absolute bottom-20 right-10 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>

        <div className="relative z-20 text-center px-8 max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-400/10 border border-amber-400/20 backdrop-blur-sm mb-8">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Exclusive Membership</span>
            </div>
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-light text-white mb-16 leading-none tracking-wider" style={{fontFamily: 'serif'}}>
            ELEVATE YOUR
            <span className="block text-amber-400 font-normal mt-4">
              INFLUENCE
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-300 mb-20 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            Join an exclusive confederation of visionary leaders, industry pioneers, and global decision-makers shaping the future of business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <button 
              onClick={onJoinNetwork}
              className="group relative px-16 py-6 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-medium tracking-widest text-sm uppercase overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/25"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Crown className="w-5 h-5" />
                Apply for Membership
              </span>
              <div className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
            <button 
              onClick={onRequestInfo}
              className="px-16 py-6 border border-gray-600 text-gray-300 font-light tracking-widest text-sm uppercase hover:border-amber-400 hover:text-amber-400 transition-all duration-500"
            >
              Private Consultation
            </button>
          </div>
        </div>

        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center text-gray-400">
            <div className="w-px h-24 bg-gradient-to-b from-amber-400/60 via-gray-600 to-transparent animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-48 bg-gray-900 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-50"></div>
        
        <div className="relative max-w-7xl mx-auto px-8">
          <div className="text-center mb-32">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-400/10 border border-amber-400/20 backdrop-blur-sm mb-8">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Why Choose NexusConnect</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-light text-white mb-12 tracking-wider" style={{fontFamily: 'serif'}}>
              Power Through
              <span className="block text-amber-400">Connection</span>
            </h2>
            <div className="w-24 h-px bg-amber-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
              Experience networking elevated beyond convention through our meticulously curated community
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group text-center"
              >
                <div className="relative mb-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <feature.icon className="w-10 h-10 text-black" />
                  </div>
                  <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                </div>
                <h3 className="text-2xl font-light text-white mb-8 tracking-wide" style={{fontFamily: 'serif'}}>
                  {feature.title}
                </h3>
                <p className="text-gray-400 font-light leading-relaxed tracking-wide">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-16 text-center">
            <div className="group">
              <div className="text-5xl font-light text-amber-400 mb-6 tracking-wider group-hover:scale-110 transition-transform duration-300" style={{fontFamily: 'serif'}}>500+</div>
              <div className="text-gray-400 font-light tracking-widest text-sm uppercase">Global Leaders</div>
            </div>
            <div className="group">
              <div className="text-5xl font-light text-amber-400 mb-6 tracking-wider group-hover:scale-110 transition-transform duration-300" style={{fontFamily: 'serif'}}>50+</div>
              <div className="text-gray-400 font-light tracking-widest text-sm uppercase">Industry Sectors</div>
            </div>
            <div className="group">
              <div className="text-5xl font-light text-amber-400 mb-6 tracking-wider group-hover:scale-110 transition-transform duration-300" style={{fontFamily: 'serif'}}>200+</div>
              <div className="text-gray-400 font-light tracking-widest text-sm uppercase">Exclusive Events</div>
            </div>
            <div className="group">
              <div className="text-5xl font-light text-amber-400 mb-6 tracking-wider group-hover:scale-110 transition-transform duration-300" style={{fontFamily: 'serif'}}>$5B+</div>
              <div className="text-gray-400 font-light tracking-widest text-sm uppercase">Value Created</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-48 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-32">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-400/10 border border-amber-400/20 backdrop-blur-sm mb-8">
              <Users className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Member Testimonials</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-light text-white mb-12 tracking-wider" style={{fontFamily: 'serif'}}>
              Leaders Speak
            </h2>
            <div className="w-24 h-px bg-amber-400 mx-auto"></div>
          </div>

          <div className="space-y-24">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="text-center max-w-5xl mx-auto group"
              >
                <div className="relative mb-12">
                  <div className="absolute -top-4 -left-4 text-6xl text-amber-400/20 font-serif">"</div>
                  <p className="text-2xl lg:text-3xl text-white mb-12 font-light leading-loose tracking-wide italic" style={{fontFamily: 'serif'}}>
                    {testimonial.quote}
                  </p>
                  <div className="absolute -bottom-4 -right-4 text-6xl text-amber-400/20 font-serif rotate-180">"</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-px bg-amber-400 mb-6"></div>
                  <h4 className="text-white font-light text-xl tracking-wide mb-2" style={{fontFamily: 'serif'}}>{testimonial.name}</h4>
                  <p className="text-gray-400 font-light text-sm tracking-widest uppercase">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers Section */}
      <section className="py-48 bg-gray-900">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-32">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-400/10 border border-amber-400/20 backdrop-blur-sm mb-8">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Membership Tiers</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-light text-white mb-12 tracking-wider" style={{fontFamily: 'serif'}}>
              Choose Your
              <span className="block text-amber-400">Level</span>
            </h2>
            <div className="w-24 h-px bg-amber-400 mx-auto mb-8"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
              Select the membership tier that aligns with your professional aspirations and influence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Executive Tier */}
            <div className="bg-gray-800/50 border border-gray-700 p-12 text-center group hover:bg-gray-800/70 hover:border-gray-600 transition-all duration-500">
              <div className="mb-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-6 group-hover:text-amber-400 transition-colors duration-300" />
                <h3 className="text-2xl font-light text-white mb-8 tracking-wide" style={{fontFamily: 'serif'}}>Executive</h3>
                <div className="mb-6">
                  <div className="text-4xl font-light text-white tracking-wider" style={{fontFamily: 'serif'}}>$2,500</div>
                  <div className="text-gray-400 font-light text-sm tracking-widest uppercase mt-2">Annually</div>
                </div>
              </div>
              
              <p className="text-gray-300 mb-12 font-light leading-relaxed tracking-wide">
                For rising executives seeking strategic connections and industry insights
              </p>
              
              <button 
                onClick={onJoinNetwork}
                className="w-full py-4 border border-gray-600 text-gray-300 font-light tracking-widest text-sm uppercase hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/5 transition-all duration-500"
              >
                Apply Now
              </button>
            </div>
            
            {/* Premier Tier - Featured */}
            <div className="bg-gradient-to-br from-amber-400/10 via-gray-800/50 to-amber-600/10 border-2 border-amber-400/50 p-12 text-center relative transform lg:scale-105 group hover:scale-110 transition-all duration-500">
              <div className="absolute -top-px left-1/2 transform -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
              
              <div className="mb-8">
                <Crown className="w-12 h-12 text-amber-400 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-light text-white mb-8 tracking-wide" style={{fontFamily: 'serif'}}>Premier Executive</h3>
                <div className="mb-6">
                  <div className="text-4xl font-light text-amber-400 tracking-wider" style={{fontFamily: 'serif'}}>$5,000</div>
                  <div className="text-gray-300 font-light text-sm tracking-widest uppercase mt-2">Annually</div>
                </div>
              </div>
              
              <p className="text-gray-200 mb-12 font-light leading-relaxed tracking-wide">
                For established leaders ready to shape industry standards and global markets
              </p>
              
              <button 
                onClick={onJoinNetwork}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-medium tracking-widest text-sm uppercase hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-500"
              >
                Join Premier
              </button>
            </div>
            
            {/* Chairman Tier */}
            <div className="bg-gray-800/50 border border-gray-700 p-12 text-center group hover:bg-gray-800/70 hover:border-gray-600 transition-all duration-500">
              <div className="mb-8">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-6 group-hover:text-amber-400 transition-colors duration-300" />
                <h3 className="text-2xl font-light text-white mb-8 tracking-wide" style={{fontFamily: 'serif'}}>Chairman Circle</h3>
                <div className="mb-6">
                  <div className="text-4xl font-light text-white tracking-wider" style={{fontFamily: 'serif'}}>$10,000</div>
                  <div className="text-gray-400 font-light text-sm tracking-widest uppercase mt-2">Annually</div>
                </div>
              </div>
              
              <p className="text-gray-300 mb-12 font-light leading-relaxed tracking-wide">
                For visionary leaders defining the future of business and society
              </p>
              
              <button 
                onClick={onJoinNetwork}
                className="w-full py-4 border border-gray-600 text-gray-300 font-light tracking-widest text-sm uppercase hover:border-amber-400 hover:text-amber-400 hover:bg-amber-400/5 transition-all duration-500"
              >
                Request Invitation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-48 bg-gradient-to-br from-black via-gray-900 to-black relative">
        <div className="absolute inset-0 opacity-5">
          <img 
            src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Professional networking" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-5xl mx-auto text-center px-8">
          <div className="mb-12">
            <div className="w-px h-20 bg-gradient-to-b from-transparent via-amber-400 to-transparent mx-auto mb-8"></div>
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-light text-white mb-16 leading-tight tracking-wider" style={{fontFamily: 'serif'}}>
            Transform Your
            <span className="block text-amber-400 mt-4">Network Today</span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-20 max-w-3xl mx-auto font-light leading-relaxed tracking-wide">
            Join the most influential business network in the world. Connect with industry titans, access exclusive opportunities, and shape the future of commerce.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <button 
              onClick={onJoinNetwork}
              className="group relative px-20 py-6 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-medium tracking-widest text-sm uppercase overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/25"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Crown className="w-5 h-5" />
                Begin Your Journey
              </span>
              <div className="absolute inset-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </button>
            <button 
              onClick={onRequestInfo}
              className="px-20 py-6 border border-gray-600 text-gray-300 font-light tracking-widest text-sm uppercase hover:border-amber-400 hover:text-amber-400 transition-all duration-500"
            >
              Schedule Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;