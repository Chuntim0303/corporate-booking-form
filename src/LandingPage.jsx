import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';

const LandingPage = ({ onJoinNetwork }) => {
  const plans = [
    {
      key: 'silver',
      name: 'Silver',
      amount: 'RM 30,000',
      yearlyIncentive: '1,800',
      fbPoints: '3,000',
      tenureYears: '2',
      popular: false
    },
    {
      key: 'gold',
      name: 'Gold',
      amount: 'RM 50,000',
      yearlyIncentive: '4,000',
      fbPoints: '5,000',
      tenureYears: '2',
      popular: false
    },
    {
      key: 'platinum',
      name: 'Platinum',
      amount: 'RM 100,000',
      yearlyIncentive: '10,000',
      fbPoints: '10,000',
      tenureYears: '2',
      popular: false
    },
    {
      key: 'diamond',
      name: 'Diamond',
      amount: 'RM 200,000',
      yearlyIncentive: '30,000',
      fbPoints: '20,000',
      tenureYears: '2',
      popular: true
    }
  ];

  return (
    <div>
      <section className="min-h-[72vh] lg:min-h-[620px] flex items-start" style={{backgroundColor: '#040B11'}}>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-10 sm:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold mb-4" style={{backgroundColor: 'rgba(218, 171, 45, 0.12)', color: '#DAAB2D', border: '1px solid rgba(218, 171, 45, 0.25)'}}>
                Incentive Beneficiary Partner Program (IBPP)
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl font-light text-white mb-6 sm:mb-6 leading-tight tracking-tight">
                THE ENTREPRENEUR'S
                <span className="block mt-2 font-medium" style={{color: '#DAAB2D'}}>
                  3RD SPACE
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-base text-gray-200 mb-6 sm:mb-8 max-w-3xl lg:max-w-none leading-relaxed">
                Confetti builds a 3rd Space for entrepreneurs — a commercial environment that drives client, team, and market conversions.
                <br />
                Through design and brand-led operations, we transform spaces into sustainable, refined venues for better business success.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start items-center">
                <button
                  onClick={() => {
                    const el = document.getElementById('plan-selection');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
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

            <div className="hidden md:block relative overflow-hidden rounded-2xl border" style={{borderColor: 'rgba(218, 171, 45, 0.18)', backgroundColor: 'rgba(255, 255, 255, 0.02)'}}>
              <div className="absolute inset-0 z-10" style={{background: `linear-gradient(135deg, rgba(0, 0, 0, 0.25) 0%, rgba(11, 15, 20, 0.10) 50%, rgba(0, 0, 0, 0.20) 100%)`}}></div>
              <img
                src="/main04.jpg"
                alt="Confetti KL event venue"
                className="w-full h-[260px] sm:h-[340px] lg:h-[420px] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="plan-selection" style={{backgroundColor: '#F5F6FA'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight">Choose your partnership tier</h2>
            <p className="mt-3 text-base sm:text-lg text-gray-600">Select a plan that matches your goals. You can apply right away.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-2xl border bg-white overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl ${plan.popular ? 'shadow-xl' : 'shadow-sm'}`}
                style={{
                  borderColor: plan.popular ? 'rgba(99, 102, 241, 0.6)' : 'rgba(209, 213, 219, 1)'
                }}
              >
                {plan.popular && (
                  <div className="bg-indigo-500 text-white text-xs font-semibold tracking-wider text-center py-2">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{plan.name}</div>
                      <div className="mt-1 text-sm text-gray-600">Partnership plan</div>
                    </div>
                    {plan.popular && (
                      <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#4F46E5'}}>
                        Recommended
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="text-3xl font-semibold text-gray-900">{plan.amount}</div>
                    <div className="mt-1 text-sm text-gray-600">Investment</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      onJoinNetwork(plan.key);
                    }}
                    className={`mt-6 w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${plan.popular ? 'bg-gray-900 text-white hover:bg-black' : 'bg-white text-gray-900 border hover:bg-gray-50'}`}
                    style={{borderColor: plan.popular ? 'transparent' : 'rgba(17, 24, 39, 0.2)'}}
                  >
                    Choose plan
                  </button>

                  <div className="mt-6 border-t pt-5" style={{borderTopColor: 'rgba(229, 231, 235, 1)'}}>
                    <div className="text-sm font-semibold text-gray-900 mb-3">Includes</div>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5" style={{color: '#22c55e'}} />
                        <span>Yearly incentive: {plan.yearlyIncentive}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5" style={{color: '#22c55e'}} />
                        <span>F&amp;B points: {plan.fbPoints}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 mt-0.5" style={{color: '#22c55e'}} />
                        <span>Tenure: {plan.tenureYears} years</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
