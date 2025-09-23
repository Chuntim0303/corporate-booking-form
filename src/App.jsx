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
  ChevronDown
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

// Main App Component
function App() {
  const [showCorporateForm, setShowCorporateForm] = useState(false);

  const handleJoinNetwork = () => {
    setShowCorporateForm(true);
  };

  const handleFormComplete = () => {
    setShowCorporateForm(false);
    alert('Thank you for your application! Our team will review your submission and contact you within 48 hours to discuss the next steps.');
  };

  const handleCloseForm = () => {
    setShowCorporateForm(false);
  };

  return (
    <div className="min-h-screen" style={{background: `linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #1a1a1a 100%)`}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700&display=swap');
        
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
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .hover-lift:hover {
          transform: translateY(-8px);
        }
        
        .glow-border {
          box-shadow: 0 0 0 1px rgba(244, 196, 48, 0.2);
        }
        
        .glow-border:hover {
          box-shadow: 0 0 0 2px rgba(244, 196, 48, 0.4), 0 8px 32px rgba(244, 196, 48, 0.15);
        }
      `}</style>

      {/* Header */}
      <header className="backdrop-blur-xl border-b sticky top-0 z-50"
        style={{
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          borderBottomColor: 'rgba(244, 196, 48, 0.1)'
        }}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="flex items-center space-x-4">
                <img 
                  src="/black_logo.png" 
                  alt="Confetti KL Logo" 
                  className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <span 
                  className="text-2xl lg:text-3xl font-light text-white tracking-wider transition-colors duration-300 group-hover:text-yellow-400" 
                  style={{fontFamily: 'Montserrat, sans-serif'}}
                >
                  CONFETTI <span style={{color: '#F4C430'}}>KL</span>
                </span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <HomePage onJoinNetwork={handleJoinNetwork} />
      </main>

      {/* Footer */}
      <footer className="border-t mt-32"
        style={{
          backgroundColor: '#0a0a0a',
          borderTopColor: 'rgba(244, 196, 48, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-8">
                <span className="text-xl lg:text-2xl font-light text-white tracking-wider" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  CONFETTI <span style={{color: '#F4C430'}}>KL</span>
                </span>
              </div>
              <p className="text-gray-400 text-lg font-light leading-relaxed max-w-md mb-8" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Malaysia's premier corporate event venue offering exclusive partnership programs for businesses seeking memorable event experiences.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-6 tracking-wider text-sm uppercase" style={{fontFamily: 'Montserrat, sans-serif'}}>Partnership Tiers</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-400 font-light transition-colors duration-300 hover:text-yellow-400" style={{fontFamily: 'Montserrat, sans-serif'}}>Gold Partner</a></li>
                <li><a href="#" className="text-gray-400 font-light transition-colors duration-300 hover:text-yellow-400" style={{fontFamily: 'Montserrat, sans-serif'}}>Platinum Partner</a></li>
                <li><a href="#" className="text-gray-400 font-light transition-colors duration-300 hover:text-yellow-400" style={{fontFamily: 'Montserrat, sans-serif'}}>Diamond Partner</a></li>
                <li><a href="#" className="text-gray-400 font-light transition-colors duration-300 hover:text-yellow-400" style={{fontFamily: 'Montserrat, sans-serif'}}>Event Packages</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-6 tracking-wider text-sm uppercase" style={{fontFamily: 'Montserrat, sans-serif'}}>Contact</h3>
              <ul className="space-y-4 text-gray-400 font-light">
                <li className="flex items-center gap-3" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  <MapPin className="w-5 h-5 text-yellow-400" />
                  <span>Kuala Lumpur, Malaysia</span>
                </li>
                <li className="flex items-center gap-3" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  <Phone className="w-5 h-5 text-yellow-400" />
                  <span>+60 3-1234-5678</span>
                </li>
                <li className="flex items-center gap-3" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  <Mail className="w-5 h-5 text-yellow-400" />
                  <span>partners@confettikl.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 mt-12" style={{borderColor: 'rgba(244, 196, 48, 0.1)'}}>
            <p className="text-center text-gray-500 text-sm font-light tracking-wider uppercase" style={{fontFamily: 'Montserrat, sans-serif'}}>
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
          <div className="border-2 shadow-2xl w-full max-w-6xl relative overflow-hidden max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              backgroundColor: '#0a0a0a',
              borderColor: 'rgba(244, 196, 48, 0.3)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(244, 196, 48, 0.1)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl" style={{background: `linear-gradient(to right, #F4C430, #FFD700)`}}></div>
            
            <button 
              onClick={handleCloseForm}
              className="absolute top-6 right-6 text-gray-400 hover:text-yellow-400 transition-colors z-10 p-2 rounded-full hover:bg-gray-800/50"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="p-6 lg:p-12">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm mb-8 glow-border"
                  style={{
                    backgroundColor: 'rgba(244, 196, 48, 0.1)',
                    border: '1px solid rgba(244, 196, 48, 0.2)'
                  }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm font-semibold tracking-wider uppercase text-yellow-400" style={{fontFamily: 'Montserrat, sans-serif'}}>Class Partner Application</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-light text-white mb-6 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Join Confetti KL
                  <span className="block mt-2 text-yellow-400">Class Partners</span>
                </h2>
                <div className="w-24 h-1 mx-auto mb-6 rounded-full" style={{background: 'linear-gradient(90deg, #F4C430, #FFD700)'}}></div>
                <p className="text-lg text-gray-300 max-w-3xl mx-auto font-light leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  Become a premium partner and unlock exclusive benefits for your corporate events
                </p>
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
          <div className="absolute inset-0 z-10" style={{background: `linear-gradient(135deg, rgba(26, 26, 26, 0.7) 0%, rgba(10, 10, 10, 0.7) 50%, rgba(26, 26, 26, 0.9) 100%)`}}></div>
          <img 
            src="/cf_125.jpg" 
            alt="Confetti KL event venue" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center px-6 lg:px-8 max-w-6xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-white mb-12 lg:mb-16 leading-tight tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>
            ELEVATE YOUR
            <span className="block font-normal mt-4 text-yellow-400">
              CORPORATE EVENTS
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-200 mb-16 lg:mb-20 max-w-4xl mx-auto leading-relaxed font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>
            Join Confetti KL's exclusive Class Partner program and unlock premium benefits for your corporate events. From product launches to team building - create memorable experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 lg:gap-8 justify-center items-center">
            <button 
              onClick={onJoinNetwork}
              className="group relative px-12 lg:px-16 py-5 lg:py-6 text-black font-semibold tracking-wider text-sm lg:text-base uppercase overflow-hidden transition-all duration-500 hover-lift w-full sm:w-auto"
              style={{
                backgroundColor: "#F4C430",
                fontFamily: "Montserrat, sans-serif"
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5 lg:w-6 lg:h-6" />
                Apply for Partnership
              </span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 lg:bottom-16 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center text-gray-400">
            <div className="w-px h-20 lg:h-24 animate-pulse" style={{background: `linear-gradient(to bottom, rgba(244, 196, 48, 0.6), transparent)`}}></div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 lg:py-32 relative" style={{backgroundColor: '#1a1a1a'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm mb-8 glow-border"
              style={{
                backgroundColor: 'rgba(244, 196, 48, 0.1)',
                border: '1px solid rgba(244, 196, 48, 0.2)'
              }}
            >
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold tracking-wider uppercase text-yellow-400" style={{fontFamily: 'Montserrat, sans-serif'}}>Why Choose Us</span>
            </div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-light text-white mb-8 lg:mb-12 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Premium Benefits
              <span className="block text-yellow-400">Await You</span>
            </h2>
            <div className="w-24 h-1 mx-auto mb-8 rounded-full" style={{background: 'linear-gradient(90deg, #F4C430, #FFD700)'}}></div>
            <p className="text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Experience unparalleled advantages designed exclusively for our Class Partners
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group text-center hover-lift"
              >
                <div className="relative mb-8 lg:mb-12">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto flex items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110"
                    style={{backgroundColor: '#F4C430', boxShadow: '0 8px 32px rgba(244, 196, 48, 0.3)'}}
                  >
                    <feature.icon className="w-10 h-10 lg:w-12 lg:h-12 text-black" />
                  </div>
                </div>
                <h3 className="text-xl lg:text-2xl font-light text-white mb-6 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-base lg:text-lg font-light leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section className="py-24 lg:py-32" style={{backgroundColor: '#0a0a0a'}}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm mb-8 glow-border"
              style={{
                backgroundColor: 'rgba(244, 196, 48, 0.1)',
                border: '1px solid rgba(244, 196, 48, 0.2)'
              }}
            >
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-semibold tracking-wider uppercase text-yellow-400" style={{fontFamily: 'Montserrat, sans-serif'}}>Pricing Plans</span>
            </div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-light text-white mb-8 lg:mb-12 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Choose Your
              <span className="block text-yellow-400">Partnership Level</span>
            </h2>
            <div className="w-24 h-1 mx-auto mb-8 rounded-full" style={{background: 'linear-gradient(90deg, #F4C430, #FFD700)'}}></div>
            <p className="text-lg lg:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed" style={{fontFamily: 'Montserrat, sans-serif'}}>
              Select the partnership tier that best fits your corporate event needs and budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-12">
            {/* Gold Tier */}
            <div className="border-2 rounded-2xl p-8 lg:p-12 text-center group transition-all duration-500 hover-lift glow-border"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderColor: 'rgba(255, 215, 0, 0.3)'
              }}
            >
              <div className="mb-8 lg:mb-12">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 lg:mb-8 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{backgroundColor: 'rgba(255, 215, 0, 0.1)', border: '2px solid rgba(255, 215, 0, 0.3)'}}
                >
                  <Award className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-500" />
                </div>
                <h3 className="text-xl lg:text-2xl font-light text-white mb-6 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>Gold Partner</h3>
                <div className="mb-6 lg:mb-8">
                  <div className="text-2xl lg:text-3xl xl:text-4xl font-light text-yellow-500 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>RM 50,000</div>
                  <div className="text-gray-400 font-light text-sm tracking-wider uppercase mt-2" style={{fontFamily: 'Montserrat, sans-serif'}}>Partnership Investment</div>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 lg:mb-12 text-left">
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Points Value:</span>
                  <span className="text-yellow-500 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>150,000</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Birthday Points:</span>
                  <span className="text-yellow-500 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>RM 5,000 x 2Y</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Referral Fee:</span>
                  <span className="text-yellow-500 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>6%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Yearly Buyback:</span>
                  <span className="text-yellow-500 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>RM 3,000 x 2Y</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Validity:</span>
                  <span className="text-yellow-500 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>3 Months</span>
                </div>
              </div>
              
              <button 
                onClick={onJoinNetwork}
                className="w-full py-4 lg:py-5 border-2 border-yellow-500 text-yellow-500 font-semibold tracking-wider text-sm lg:text-base uppercase transition-all duration-300 hover:bg-yellow-500 hover:text-black hover:shadow-lg hover:shadow-yellow-500/30"
                style={{fontFamily: 'Montserrat, sans-serif'}}
              >
                Apply for Gold
              </button>
            </div>
            
            {/* Platinum Tier - Featured */}
            <div className="border-2 rounded-2xl p-8 lg:p-12 text-center relative group transition-all duration-500 hover-lift md:col-span-2 xl:col-span-1"
              style={{
                background: 'linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)',
                borderColor: 'rgba(192, 192, 192, 0.5)',
                boxShadow: '0 16px 64px rgba(244, 196, 48, 0.2)'
              }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="px-6 py-2 rounded-full text-xs font-bold tracking-wider uppercase" 
                  style={{background: 'linear-gradient(90deg, #F4C430, #FFD700)', color: '#1a1a1a', fontFamily: 'Montserrat, sans-serif'}}>
                  Most Popular
                </div>
              </div>
              
              <div className="mb-8 lg:mb-12">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 lg:mb-8 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{background: 'linear-gradient(135deg, #F4C430, #FFD700)'}}
                >
                  <Crown className="w-8 h-8 lg:w-10 lg:h-10 text-black" />
                </div>
                <h3 className="text-xl lg:text-2xl font-light text-white mb-6 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>Platinum Partner</h3>
                <div className="mb-6 lg:mb-8">
                  <div className="text-2xl lg:text-3xl xl:text-4xl font-light text-white tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>RM 100,000</div>
                  <div className="text-gray-400 font-light text-sm tracking-wider uppercase mt-2" style={{fontFamily: 'Montserrat, sans-serif'}}>Partnership Investment</div>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 lg:mb-12 text-left">
                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Points Value:</span>
                  <span className="text-white font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>350,000</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Birthday Points:</span>
                  <span className="text-white font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>RM 10,000 x 5Y</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Referral Fee:</span>
                  <span className="text-white font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>10%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-600">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Yearly Buyback:</span>
                  <span className="text-white font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>RM 10,000 x 2Y</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Validity:</span>
                  <span className="text-white font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>1 Month</span>
                </div>
              </div>
              
              <button 
                onClick={onJoinNetwork}
                className="w-full py-4 lg:py-5 text-black font-semibold tracking-wider text-sm lg:text-base uppercase transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/40"
                style={{
                  background: 'linear-gradient(135deg, #F4C430, #FFD700)',
                  fontFamily: 'Montserrat, sans-serif'
                }}
              >
                Apply for Platinum
              </button>
            </div>
            
            {/* Diamond Tier */}
            <div className="border-2 rounded-2xl p-8 lg:p-12 text-center group transition-all duration-500 hover-lift glow-border"
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
                borderColor: 'rgba(0, 255, 255, 0.3)'
              }}
            >
              <div className="mb-8 lg:mb-12">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-6 lg:mb-8 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{backgroundColor: 'rgba(0, 255, 255, 0.1)', border: '2px solid rgba(0, 255, 255, 0.3)'}}
                >
                  <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-cyan-400" />
                </div>
                <h3 className="text-xl lg:text-2xl font-light text-white mb-6 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>Diamond Partner</h3>
                <div className="mb-6 lg:mb-8">
                  <div className="text-2xl lg:text-3xl xl:text-4xl font-light text-cyan-400 tracking-tight" style={{fontFamily: 'Montserrat, sans-serif'}}>RM 200,000</div>
                  <div className="text-gray-400 font-light text-sm tracking-wider uppercase mt-2" style={{fontFamily: 'Montserrat, sans-serif'}}>Partnership Investment</div>
                </div>
              </div>
              
              <div className="space-y-4 mb-8 lg:mb-12 text-left">
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Points Value:</span>
                  <span className="text-cyan-400 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>800,000</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Birthday Points:</span>
                  <span className="text-cyan-400 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>RM 30,000 x 8Y</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Referral Fee:</span>
                  <span className="text-cyan-400 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>15%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Yearly Buyback:</span>
                  <span className="text-cyan-400 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>RM 30,000 x 2Y</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-300 font-light" style={{fontFamily: 'Montserrat, sans-serif'}}>Validity:</span>
                  <span className="text-cyan-400 font-semibold" style={{fontFamily: 'Montserrat, sans-serif'}}>Immediately</span>
                </div>
              </div>
              
              <button 
                onClick={onJoinNetwork}
                className="w-full py-4 lg:py-5 border-2 border-cyan-400 text-cyan-400 font-semibold tracking-wider text-sm lg:text-base uppercase transition-all duration-300 hover:bg-cyan-400 hover:text-black hover:shadow-lg hover:shadow-cyan-400/30"
                style={{fontFamily: 'Montserrat, sans-serif'}}
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