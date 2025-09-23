import React, { useState, useId } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  CreditCard, 
  AlertCircle,
  Users,
  Trophy,
  Sparkles,
  Crown,
  Star,
  X,
  Gift,
  Percent,
  RefreshCw,
  Award,
  ChevronDown,
  Menu,
  ArrowRight,
  Check
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

// Main App Component
function App() {
  const [showCorporateForm, setShowCorporateForm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleJoinNetwork = () => {
    setShowCorporateForm(true);
  };

  const handleFormComplete = () => {
    setShowCorporateForm(false);
    alert('We have received your application! Our team will get back to you shortly.');
  };

  const handleCloseForm = () => {
    setShowCorporateForm(false);
  };

  return (
    <div className="min-h-screen" style={{background: `linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 50%, #1a1a1a 100%)`}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        ::selection {
          background-color: #F4C430;
          color: #1a1a1a;
        }
        ::-moz-selection {
          background-color: #F4C430;
          color: #1a1a1a;
        }
        
        .smooth-scroll {
          scroll-behavior: smooth;
        }
        
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
        }
        
        .glow-border:hover {
          box-shadow: 0 0 0 1px rgba(244, 196, 48, 0.3), 0 4px 20px rgba(244, 196, 48, 0.1);
        }
        
        @media (max-width: 640px) {
          .hover-lift:hover {
            transform: none;
          }
        }
      `}</style>

      {/* Header */}
      <header className="backdrop-blur-xl border-b sticky top-0 z-50"
        style={{
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          borderBottomColor: 'rgba(244, 196, 48, 0.1)'
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div 
              className="cursor-pointer group flex items-center"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="flex items-center space-x-3">
                <img 
                  src="/black_logo.png" 
                  alt="Confetti KL Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-lg sm:text-xl lg:text-2xl font-medium text-white tracking-tight transition-colors duration-300 group-hover:text-yellow-400">
                  CONFETTI <span className="text-yellow-400">KL</span>
                </span>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      <main>
        <HomePage onJoinNetwork={handleJoinNetwork} />
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 sm:mt-24"
        style={{
          backgroundColor: '#0f0f0f',
          borderTopColor: 'rgba(244, 196, 48, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-xl font-medium text-white tracking-tight">
                  CONFETTI <span className="text-yellow-400">KL</span>
                </span>
              </div>
              <p className="text-gray-400 text-base leading-relaxed max-w-md mb-6">
                Malaysia's premier corporate event venue offering exclusive partnership programs for businesses seeking memorable event experiences.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Partnership Tiers</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 text-sm transition-colors duration-300 hover:text-yellow-400">Gold Partner</a></li>
                <li><a href="#" className="text-gray-400 text-sm transition-colors duration-300 hover:text-yellow-400">Platinum Partner</a></li>
                <li><a href="#" className="text-gray-400 text-sm transition-colors duration-300 hover:text-yellow-400">Diamond Partner</a></li>
                <li><a href="#" className="text-gray-400 text-sm transition-colors duration-300 hover:text-yellow-400">Event Packages</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>Kuala Lumpur, Malaysia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>+60 3-1234-5678</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <span>partners@confettikl.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-6 mt-8" style={{borderColor: 'rgba(244, 196, 48, 0.1)'}}>
            <p className="text-center text-gray-500 text-xs uppercase tracking-wider">
              © 2025 Confetti KL. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Corporate Form Popup */}
      {showCorporateForm && (
        <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{backgroundColor: 'rgba(0, 0, 0, 0.85)'}}
        >
          <div className="border shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] overflow-y-auto rounded-xl"
            style={{
              backgroundColor: '#0f0f0f',
              borderColor: 'rgba(244, 196, 48, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-0.5" style={{background: `linear-gradient(to right, #F4C430, #FFD700)`}}></div>
            
            <button 
              onClick={handleCloseForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 transition-colors z-10 p-2 rounded-full hover:bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 sm:p-8 lg:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                  style={{
                    backgroundColor: 'rgba(244, 196, 48, 0.1)',
                    border: '1px solid rgba(244, 196, 48, 0.2)'
                  }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-medium uppercase text-yellow-400 tracking-wide">Partner Application</span>
                </div>
              </div>

              <CorporateFormSteps 
                onClose={handleCloseForm}
                onComplete={handleFormComplete} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// HomePage Component
const HomePage = ({ onJoinNetwork }) => {
  const features = [
    {
      icon: Gift,
      title: 'Points & Birthday Benefits',
      description: 'Earn valuable points with every event booking and receive special birthday point bonuses annually.',
    },
    {
      icon: Percent,
      title: 'Referral Rewards',
      description: 'Earn 6%-15% referral fees when you bring new partners to our network.',
    },
    {
      icon: RefreshCw,
      title: 'Guaranteed Buyback',
      description: 'Full buyback options available after 2 years with annual buyback opportunities.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10" style={{background: `linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(15, 15, 15, 0.8) 50%, rgba(26, 26, 26, 0.9) 100%)`}}></div>
          <img 
            src="/cf_125.jpg" 
            alt="Confetti KL event venue" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 sm:mb-8 leading-tight tracking-tight">
            ELEVATE YOUR
            <span className="block mt-2 font-medium text-yellow-400">
              CORPORATE EVENTS
            </span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Join Confetti KL's exclusive Class Partner program and unlock premium benefits for your corporate events. From product launches to team building - create memorable experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button 
              onClick={onJoinNetwork}
              className="group relative px-8 sm:px-12 py-3 sm:py-4 text-black font-semibold text-sm sm:text-base uppercase overflow-hidden transition-all duration-300 hover-lift w-full sm:w-auto rounded-md"
              style={{backgroundColor: "#F4C430"}}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                Apply for Partnership
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 sm:bottom-12 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center text-gray-400">
            <div className="w-px h-16 sm:h-20 animate-pulse" style={{background: `linear-gradient(to bottom, rgba(244, 196, 48, 0.6), transparent)`}}></div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-16 sm:py-20 lg:py-24 relative" style={{backgroundColor: '#1a1a1a'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                backgroundColor: 'rgba(244, 196, 48, 0.1)',
                border: '1px solid rgba(244, 196, 48, 0.2)'
              }}
            >
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium uppercase text-yellow-400 tracking-wide">Why Choose Us</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white mb-4 sm:mb-6 tracking-tight">
              Premium Benefits
              <span className="block text-yellow-400">Await You</span>
            </h2>
            <div className="w-16 h-0.5 mx-auto mb-4 sm:mb-6" style={{background: 'linear-gradient(90deg, #F4C430, #FFD700)'}}></div>
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Experience unparalleled advantages designed exclusively for our Class Partners
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group text-center hover-lift"
              >
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                    style={{backgroundColor: '#F4C430', boxShadow: '0 4px 20px rgba(244, 196, 48, 0.3)'}}
                  >
                    <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-white mb-4 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-16 sm:py-20 lg:py-24" style={{backgroundColor: '#0f0f0f'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{
                backgroundColor: 'rgba(244, 196, 48, 0.1)',
                border: '1px solid rgba(244, 196, 48, 0.2)'
              }}
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-medium uppercase text-yellow-400 tracking-wide">Pricing Plans</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white mb-4 sm:mb-6 tracking-tight">
              Choose Your
              <span className="block text-yellow-400">Partnership Level</span>
            </h2>
            <div className="w-16 h-0.5 mx-auto mb-4 sm:mb-6" style={{background: 'linear-gradient(90deg, #F4C430, #FFD700)'}}></div>
            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Select the partnership tier that best fits your corporate event needs and budget
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Gold Tier */}
            <div className="border rounded-xl p-6 sm:p-8 text-center group transition-all duration-300 hover-lift glow-border"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderColor: 'rgba(255, 215, 0, 0.3)'
              }}
            >
              <div className="mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{backgroundColor: 'rgba(255, 215, 0, 0.1)', border: '2px solid rgba(255, 215, 0, 0.3)'}}
                >
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-white mb-4 tracking-tight">Gold Partner</h3>
                <div className="mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-3xl font-light text-yellow-500 tracking-tight">RM 50,000</div>
                  <div className="text-gray-400 text-xs sm:text-sm uppercase mt-1 tracking-wide">Partnership Investment</div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6 sm:mb-8 text-left">
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 text-sm">Points Value:</span>
                  <span className="text-yellow-500 font-semibold text-sm">150,000</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 text-sm">Birthday Points:</span>
                  <span className="text-yellow-500 font-semibold text-sm">RM 5,000 x 2Y</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 text-sm">Referral Fee:</span>
                  <span className="text-yellow-500 font-semibold text-sm">6%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 text-sm">Yearly Buyback:</span>
                  <span className="text-yellow-500 font-semibold text-sm">RM 3,000 x 2Y</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-300 text-sm">Validity:</span>
                  <span className="text-yellow-500 font-semibold text-sm">3 Months</span>
                </div>
              </div>
              
              <button 
                onClick={onJoinNetwork}
                className="w-full py-3 sm:py-4 border-2 border-yellow-500 text-yellow-500 font-medium text-sm uppercase transition-all duration-300 hover:bg-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-500/20 rounded-md"
              >
                Apply for Gold
              </button>
            </div>
            
            {/* Platinum Tier - Featured */}
            <div className="border rounded-xl p-6 sm:p-8 text-center relative group transition-all duration-300 hover-lift lg:scale-105"
              style={{
                background: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
                borderColor: 'rgba(244, 196, 48, 0.5)',
                boxShadow: '0 8px 40px rgba(244, 196, 48, 0.2)'
              }}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="px-4 py-1 rounded-full text-xs font-bold uppercase" 
                  style={{background: 'linear-gradient(90deg, #F4C430, #FFD700)', color: '#1a1a1a'}}>
                  Most Popular
                </div>
              </div>
              
              <div className="mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{background: 'linear-gradient(135deg, #F4C430, #FFD700)'}}
                >
                  <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-white mb-4 tracking-tight">Platinum Partner</h3>
                <div className="mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-3xl font-light text-white tracking-tight">RM 100,000</div>
                  <div className="text-gray-400 text-xs sm:text-sm uppercase mt-1 tracking-wide">Partnership Investment</div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6 sm:mb-8 text-left">
                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-300 text-sm">Points Value:</span>
                  <span className="text-white font-semibold text-sm">350,000</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-300 text-sm">Birthday Points:</span>
                  <span className="text-white font-semibold text-sm">RM 10,000 x 5Y</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-300 text-sm">Referral Fee:</span>
                  <span className="text-white font-semibold text-sm">10%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-300 text-sm">Yearly Buyback:</span>
                  <span className="text-white font-semibold text-sm">RM 10,000 x 2Y</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-300 text-sm">Validity:</span>
                  <span className="text-white font-semibold text-sm">1 Month</span>
                </div>
              </div>
              
              <button 
                onClick={onJoinNetwork}
                className="w-full py-3 sm:py-4 text-black font-medium text-sm uppercase transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/30 rounded-md"
                style={{
                  background: 'linear-gradient(135deg, #F4C430, #FFD700)'
                }}
              >
                Apply for Platinum
              </button>
            </div>
            
            {/* Diamond Tier */}
            <div className="border rounded-xl p-6 sm:p-8 text-center group transition-all duration-300 hover-lift glow-border"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderColor: 'rgba(0, 255, 255, 0.3)'
              }}
            >
              <div className="mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{backgroundColor: 'rgba(0, 255, 255, 0.1)', border: '2px solid rgba(0, 255, 255, 0.3)'}}
                >
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-white mb-4 tracking-tight">Diamond Partner</h3>
                <div className="mb-4 sm:mb-6">
                  <div className="text-2xl sm:text-3xl font-light text-cyan-400 tracking-tight">RM 200,000</div>
                  <div className="text-gray-400 text-xs sm:text-sm uppercase mt-1 tracking-wide">Partnership Investment</div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6 sm:mb-8 text-left">
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 text-sm">Points Value:</span>
                  <span className="text-cyan-400 font-semibold text-sm">800,000</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 text-sm">Birthday Points:</span>
                  <span className="text-cyan-400 font-semibold text-sm">RM 30,000 x 8Y</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 text-sm">Referral Fee:</span>
                  <span className="text-cyan-400 font-semibold text-sm">15%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 text-sm">Yearly Buyback:</span>
                  <span className="text-cyan-400 font-semibold text-sm">RM 30,000 x 2Y</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-300 text-sm">Validity:</span>
                  <span className="text-cyan-400 font-semibold text-sm">Immediately</span>
                </div>
              </div>
              
              <button 
                onClick={onJoinNetwork}
                className="w-full py-3 sm:py-4 border-2 border-cyan-400 text-cyan-400 font-medium text-sm uppercase transition-all duration-300 hover:bg-cyan-400 hover:text-black hover:shadow-lg hover:shadow-cyan-400/20 rounded-md"
              >
                Apply for Diamond
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;