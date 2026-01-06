import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Menu,
  ArrowRight
} from 'lucide-react';
import CorporateFormSteps from './components/CorporateFormSteps';
import LandingPage from './LandingPage';

// Main App Component
function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleJoinNetwork = (tier) => {
    navigate('/partnership/apply', {
      state: tier ? { partnershipTier: tier } : undefined
    });
  };

  const handleFormComplete = () => {
    setSuccessModalOpen(true);
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    navigate('/');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen" style={{background: `linear-gradient(135deg, #2E2E31 0%, #1E1E21 50%, #2E2E31 100%)`}}>
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
                color: #1E1E21;
              }
              ::-moz-selection {
                background-color: #DAAB2D;
                color: #1E1E21;
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
                backgroundColor: '#040B11',
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
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-md transition-transform duration-300 group-hover:scale-110"
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
              <LandingPage onJoinNetwork={handleJoinNetwork} />
            </main>

            {/* Footer */}
            <footer className="border-t"
              style={{
                backgroundColor: '#1E1E21',
                borderTopColor: 'rgba(218, 171, 45, 0.1)'
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
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
                    <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contact</h3>
                    <ul className="space-y-3 text-gray-400 text-sm">
                      <li className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" style={{color: '#DAAB2D'}} />
                        <span>Ground floor Retail Block, Pusat Perdagangan Mines, 2, Jalan Mines 2, Mines Wellness City, 43300 Seri Kembangan, Selangor</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Phone className="w-4 h-4 flex-shrink-0" style={{color: '#DAAB2D'}} />
                        <span>+60 11-3513 4195</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Mail className="w-4 h-4 flex-shrink-0" style={{color: '#DAAB2D'}} />
                        <span>sales@confetti.com.my</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t pt-6 mt-8" style={{borderColor: 'rgba(218, 171, 45, 0.1)'}}>
                  <p className="text-center text-gray-500 text-xs uppercase tracking-wider">
                    2025 Confetti KL. All Rights Reserved.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        }
      />
      <Route
        path="/partnership/apply"
        element={
          <div className="min-h-screen" style={{backgroundColor: '#F2F2F2'}}>
            <header className="backdrop-blur-xl border-b sticky top-0 z-50"
              style={{
                backgroundColor: '#040B11',
                borderBottomColor: 'rgba(218, 171, 45, 0.1)'
              }}
            >
              <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    Back
                  </button>
                  <div className="flex items-center space-x-3">
                    <img 
                      src="/black_logo.png" 
                      alt="Confetti KL Logo" 
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-md"
                    />
                    <span className="text-lg sm:text-xl lg:text-2xl font-medium text-white tracking-tight">
                      CONFETTI <span style={{color: '#DAAB2D'}}>KL</span>
                    </span>
                  </div>
                  <div className="w-16" />
                </div>
              </nav>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
              <div className="w-full max-w-4xl mx-auto">
                <CorporateFormSteps
                  initialTier={location?.state?.partnershipTier}
                  onComplete={() => {
                    handleFormComplete();
                  }}
                />
              </div>
            </main>

            {successModalOpen && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full relative overflow-hidden">
                  <button
                    onClick={handleCloseSuccessModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    aria-label="Close"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex justify-center mb-6 pt-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full" style={{backgroundColor: '#DAAB2D'}}>
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>

                  <div className="text-center pb-2">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted</h2>
                    <p className="text-gray-600 text-sm">We have received your application. Our team will get back to you shortly.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      />
    </Routes>
  );
}

export default App;