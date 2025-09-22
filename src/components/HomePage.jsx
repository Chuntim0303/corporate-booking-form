import React from 'react';

const HomePage = ({ onJoinNetwork, onRequestInfo }) => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Executive Connections',
      description: 'Access to C-level executives and industry pioneers across various sectors.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4M8 7h8M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2M4 15h16" />
        </svg>
      ),
      title: 'Exclusive Events',
      description: 'Private invitations to high-profile corporate events and executive retreats.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Strategic Partnerships',
      description: 'Forge meaningful partnerships that drive business growth and innovation.',
    },
  ];

  const testimonials = [
    {
      quote: "NexusConnect has been instrumental in helping me forge partnerships that expanded our market reach by 40% in just one fiscal year.",
      name: "Sarah Johnson",
      title: "CEO, TechInnovate",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b5c5?auto=format&fit=crop&w=100&q=80"
    },
    {
      quote: "The quality of connections and conversations at NexusConnect events is unparalleled. I've met partners I wouldn't have accessed through any other network.",
      name: "Michael Chen",
      title: "Managing Director, Visionary Group",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
    },
    {
      quote: "Being part of NexusConnect's Chairman Circle has opened doors to investment opportunities that transformed our company's trajectory.",
      name: "Elena Rodriguez",
      title: "Founder & CEO, Global Ventures",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80"
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Professional networking" 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-5">
          <div className="absolute top-20 left-10 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-40 left-20 w-2 h-2 bg-purple-600 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-20 right-10 w-4 h-4 bg-purple-300 rounded-full animate-pulse delay-1000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Elite Corporate
            <span className="block bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Networking
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Connect with industry leaders and decision-makers in our exclusive professional community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onJoinNetwork}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg"
            >
              Join Our Network
            </button>
            <button 
              onClick={onRequestInfo}
              className="px-8 py-4 border border-gray-300 text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-all duration-300 text-lg"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center text-gray-400">
            <span className="text-sm mb-2">Scroll to explore</span>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose NexusConnect?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the difference of premium corporate networking
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-800/70 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl"
              >
                <div className="text-purple-500 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/20 to-purple-800/20 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-gray-400">Executive Members</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">50+</div>
              <div className="text-gray-400">Industry Sectors</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">200+</div>
              <div className="text-gray-400">Annual Events</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-400 mb-2">$2B+</div>
              <div className="text-gray-400">Deals Facilitated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Executive Testimonials
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Hear from industry leaders who have transformed their business connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:bg-gray-800/70 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="flex items-center mb-6">
                  <div className="flex text-purple-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 mb-6 italic leading-relaxed">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full border-2 border-purple-500 mr-4"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Tiers Preview */}
      <section id="membership" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Membership Tiers
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the level that matches your executive networking ambitions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-800/70 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-2">Executive</h3>
              <div className="text-3xl font-bold text-purple-400 mb-4">$2,500<span className="text-sm text-gray-400">/year</span></div>
              <p className="text-gray-400 mb-6">Perfect for emerging executives looking to expand their network</p>
              <button 
                onClick={onJoinNetwork}
                className="w-full px-6 py-3 border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-300"
              >
                Learn More
              </button>
            </div>
            
            <div className="bg-gradient-to-b from-purple-900/20 to-purple-800/20 border-2 border-purple-500 rounded-2xl p-8 text-center relative hover:scale-105 transition-all duration-300">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-purple-700 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Premium Executive</h3>
              <div className="text-3xl font-bold text-purple-400 mb-4">$5,000<span className="text-sm text-gray-400">/year</span></div>
              <p className="text-gray-400 mb-6">For established leaders seeking premium connections and opportunities</p>
              <button 
                onClick={onJoinNetwork}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center hover:bg-gray-800/70 transition-all duration-300">
              <h3 className="text-xl font-semibold text-white mb-2">Chairman Circle</h3>
              <div className="text-3xl font-bold text-purple-400 mb-4">$10,000<span className="text-sm text-gray-400">/year</span></div>
              <p className="text-gray-400 mb-6">Elite tier for C-suite executives and board members</p>
              <button 
                onClick={onJoinNetwork}
                className="w-full px-6 py-3 border border-purple-500 text-purple-400 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-300"
              >
                Apply Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-purple-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Elevate Your Network?
          </h2>
          <p className="text-xl text-purple-100 mb-8 leading-relaxed">
            Join hundreds of executives who have transformed their business relationships through NexusConnect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onJoinNetwork}
              className="px-8 py-4 bg-white text-purple-800 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg"
            >
              Start Your Application
            </button>
            <button 
              onClick={onRequestInfo}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-800 transition-all duration-300 text-lg"
            >
              Schedule a Call
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;