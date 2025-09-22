import React, { useState } from 'react';
import HomePage from './components/HomePage';
import CorporateFormSteps from './components/CorporateFormSteps';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'form'
  const [showModal, setShowModal] = useState(false);

  const navigateToForm = () => {
    setCurrentView('form');
  };

  const navigateToHome = () => {
    setCurrentView('home');
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={navigateToHome}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">NexusConnect</span>
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={navigateToHome}
                className={`text-sm font-medium transition-colors ${
                  currentView === 'home' ? 'text-purple-400' : 'text-gray-300 hover:text-purple-400'
                }`}
              >
                Home
              </button>
              <a href="#about" className="text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors">
                About
              </a>
              <a href="#services" className="text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors">
                Services
              </a>
              <a href="#members" className="text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors">
                Members
              </a>
              <a href="#events" className="text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors">
                Events
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors">
                Contact
              </a>
            </div>

            <button 
              onClick={openModal}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Request Info
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {currentView === 'home' ? (
          <HomePage onJoinNetwork={navigateToForm} onRequestInfo={openModal} />
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <button 
                onClick={navigateToHome}
                className="text-purple-400 hover:text-purple-300 mb-4 flex items-center mx-auto transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Join Our Elite Network
              </h1>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Complete your executive membership application and gain access to our exclusive community of industry leaders.
              </p>
            </div>
            
            <CorporateFormSteps onComplete={navigateToHome} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">NexusConnect</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Elevating professional networking to an art form. Creating meaningful connections for executives and industry leaders.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.740-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Executive Membership</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Upcoming Events</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Partnership Opportunities</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Leadership Summit</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Executive Coaching</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Strategic Partnerships</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Industry Reports</a></li>
                <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Board Advisory</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  500 Executive Blvd, Suite 200
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  (555) 123-4567
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@nexusconnect.com
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8">
            <p className="text-center text-gray-400 text-sm">
              &copy; 2025 NexusConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md relative">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold text-white mb-2">Executive Enquiry</h2>
            <p className="text-gray-400 mb-6">Complete the form below and our team will contact you within 24 hours.</p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Interest</label>
                <select className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Select an option</option>
                  <option value="membership">Executive Membership</option>
                  <option value="partnership">Partnership Opportunities</option>
                  <option value="events">Event Registration</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Message</label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="How can we assist you?"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Thank you for your enquiry! Our executive team will contact you within 24 hours.');
                  closeModal();
                }}
              >
                Submit Enquiry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;