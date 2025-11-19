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
            backgroundColor: isFocused ? 'rgba(2, 11, 19, 0.4)' : 'rgba(38, 38, 38, 0.3)',
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
            backgroundColor: isFocused ? 'rgba(2, 11, 19, 0.4)' : 'rgba(38, 38, 38, 0.3)',
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
    <div className="min-h-screen" style={{background: `linear-gradient(135deg, #262626 0%, #020B13 50%, #262626 100%)`}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * {
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        body {
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        h1, h2, h3, h4, h5, h6 {
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        p {
          line-height: 1.7;
        }

        ::selection {
          background-color: #DAAB2D;
          color: #020B13;
        }
        ::-moz-selection {
          background-color: #DAAB2D;
          color: #020B13;
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
          box-shadow: 0 0 0 1px rgba(218, 171, 45, 0.3), 0 4px 20px rgba(218, 171, 45, 0.1);
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
          backgroundColor: 'rgba(38, 38, 38, 0.95)',
          borderBottomColor: 'rgba(218, 171, 45, 0.1)'
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
                <span className="text-lg sm:text-xl lg:text-2xl font-medium text-white tracking-tight transition-colors duration-300" style={{'--hover-color': '#DAAB2D'}}>
                  CONFETTI <span style={{color: '#DAAB2D'}}>KL</span>
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
          backgroundColor: '#020B13',
          borderTopColor: 'rgba(218, 171, 45, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="sm:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-xl font-medium text-white tracking-tight">
                  CONFETTI <span style={{color: '#DAAB2D'}}>KL</span>
                </span>
              </div>
              <p className="text-gray-400 text-base leading-relaxed max-w-md mb-6">
                Malaysia's premier corporate event venue offering exclusive partnership programs for businesses seeking memorable event experiences.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Partnership Tiers</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 text-sm transition-colors duration-300" style={{'--hover-color': '#DAAB2D'}} onMouseEnter={(e) => e.target.style.color = '#DAAB2D'} onMouseLeave={(e) => e.target.style.color = ''}>Gold Partner</a></li>
                <li><a href="#" className="text-gray-400 text-sm transition-colors duration-300" style={{'--hover-color': '#DAAB2D'}} onMouseEnter={(e) => e.target.style.color = '#DAAB2D'} onMouseLeave={(e) => e.target.style.color = ''}>Platinum Partner</a></li>
                <li><a href="#" className="text-gray-400 text-sm transition-colors duration-300" style={{'--hover-color': '#DAAB2D'}} onMouseEnter={(e) => e.target.style.color = '#DAAB2D'} onMouseLeave={(e) => e.target.style.color = ''}>Diamond Partner</a></li>
                <li><a href="#" className="text-gray-400 text-sm transition-colors duration-300" style={{'--hover-color': '#DAAB2D'}} onMouseEnter={(e) => e.target.style.color = '#DAAB2D'} onMouseLeave={(e) => e.target.style.color = ''}>Event Packages</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{color: '#DAAB2D'}} />
                  <span>Kuala Lumpur, Malaysia</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" style={{color: '#DAAB2D'}} />
                  <span>+60 3-1234-5678</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0" style={{color: '#DAAB2D'}} />
                  <span>partners@confettikl.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-6 mt-8" style={{borderColor: 'rgba(218, 171, 45, 0.1)'}}>
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
              backgroundColor: '#020B13',
              borderColor: 'rgba(218, 171, 45, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-0.5" style={{background: `linear-gradient(to right, #DAAB2D, #A57A03)`}}></div>
            
            <button
              onClick={handleCloseForm}
              className="absolute top-4 right-4 text-gray-400 transition-colors z-10 p-2 rounded-full hover:bg-gray-800/50"
              onMouseEnter={(e) => e.currentTarget.querySelector('svg').style.color = '#DAAB2D'}
              onMouseLeave={(e) => e.currentTarget.querySelector('svg').style.color = ''}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-6 sm:p-8 lg:p-12">


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
          <div className="absolute inset-0 z-10" style={{background: `linear-gradient(135deg, rgba(38, 38, 38, 0.8) 0%, rgba(2, 11, 19, 0.8) 50%, rgba(38, 38, 38, 0.9) 100%)`}}></div>
          <img 
            src="/main02.jpeg" 
            alt="Confetti KL event venue" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl font-light text-white mb-6 sm:mb-8 leading-tight tracking-tight">
            ELEVATE YOUR
            <span className="block mt-2 font-medium" style={{color: '#DAAB2D'}}>
              CORPORATE EVENTS
            </span>
          </h1>

          <p className="text-base sm:text-base lg:text-lg text-gray-200 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Join Confetti KL's exclusive Class Partner program and unlock premium benefits for your corporate events. From product launches to team building - create memorable experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button
              onClick={onJoinNetwork}
              className="group relative px-8 sm:px-12 py-3 sm:py-4 text-black font-semibold text-sm sm:text-base uppercase overflow-hidden transition-all duration-300 hover-lift w-full sm:w-auto rounded-md"
              style={{backgroundColor: "#DAAB2D"}}
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
            <div className="w-px h-16 sm:h-20 animate-pulse" style={{background: `linear-gradient(to bottom, rgba(218, 171, 45, 0.6), transparent)`}}></div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default App;