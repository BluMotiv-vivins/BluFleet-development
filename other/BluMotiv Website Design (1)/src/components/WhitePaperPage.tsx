import bluMotivLogo from '../assets/bumotivlogol.png';
import { useState } from 'react';
import { ArrowLeft, Share2, Printer, Download, X, Calendar, Clock, User } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface WhitePaperPageProps {
  onClose: () => void;
  fromPage: 'home' | 'research';
  onNavigate: (page: string) => void;
}

interface Author {
  id: string;
  name: string;
  designation: string;
  image: string;
}

export default function WhitePaperPage({ onClose, fromPage, onNavigate }: WhitePaperPageProps) {
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'share' | 'print' | 'download' | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  const authors = [
    {
      name: 'Ashish Naidu',
      designation: 'Founder & CEO',
      image: '/src/assets/ashish.jpg',
      teaser: "Formerly with Ford, US & UK | M.S. Automotive (BCU), UK | MBA (ISB). Visionary leader driving BluMotiv's mission to transform sustainable mobility through cutting-edge technology."
    },
    {
      name: 'Satyajeet Kelkar',
      designation: 'Advisor & Mentor',
      image: '/src/assets/satyajeet.png',
      teaser: "Strategic leader with deep expertise in business development and revenue growth. Driving BluMotiv's market expansion and strategic partnerships."
    }
  ];

  const handleActionClick = (type: 'share' | 'print' | 'download') => {
    setActionType(type);
    setShowActionModal(true);
  };

  const handleProceed = () => {
    // Here you would save to database
    console.log('Saving to database:', formData);

    // Perform action based on type
    switch (actionType) {
      case 'download':
        // Trigger PDF download
        console.log('Downloading white paper PDF...');
        break;
      case 'share':
        // Open share options
        console.log('Sharing white paper...');
        break;
      case 'print':
        // Trigger print
        window.print();
        break;
    }

    setShowActionModal(false);
    setFormData({ name: '', email: '' });
    setActionType(null);
  };

  const handleBack = () => {
    if (fromPage === 'research') {
      onNavigate('research');
    } else {
      onClose();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navigation Header */}
      <header className="w-full py-4 border-b border-gray-200 bg-white px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 ml-10">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg transition-all duration-300 hover:bg-gray-100"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <img
                src={bluMotivLogo}
                alt="BluMotiv Logo"
                className="h-12 w-auto ml-4"
                style={{ opacity: 1, filter: 'none' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleActionClick('share')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Share2 size={16} className="text-gray-600" />
              <span className="text-gray-700">Share</span>
            </button>
            <button
              onClick={() => handleActionClick('download')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              <span>Download</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-16 px-6" style={{ backgroundColor: '#1a365d' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:ml-32">
            <div className="flex items-center gap-2 text-sm text-white">
              <Calendar size={16} className="text-white" />
              <span className="text-white">November 15, 2024</span>
              <span className="text-white">|</span>
              <span className="text-white">Research Report</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              BluMotiv White Paper: Unlocking Carbon Credit Potential with Connected Elektrofit Solutions
            </h1>

            <p className="text-lg text-white leading-relaxed">
              A Transformative Approach to Sustainable Mobility in India
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 text-white">
                <User size={16} className="text-white" />
                <span className="text-sm text-white">By BluMotiv Research Team</span>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <ImageWithFallback
                src="/src/assets/a1cc.png"
                alt="BluMotiv Carbon Credit and Elektrofit Solutions"
                className="w-full max-w-md h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Article Metadata */}
      <section className="w-full py-8 px-6 border-b border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>12 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>November 15, 2024</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleActionClick('print')}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Printer size={16} className="text-gray-600" />
              </button>
              <button
                onClick={() => handleActionClick('share')}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Share2 size={16} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Article Content */}
  <article className="w-full pt-12 pb-2 px-6" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-4xl mx-auto">
          {/* Article Introduction */}
          <div className="mb-12">
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              India stands at a crossroads. Its rapidly growing economy and urbanization have led to a surge in vehicular traffic, exacerbating air pollution and contributing significantly to greenhouse gas emissions. The data paints a stark picture: In 2019, air pollution caused a staggering 1.67 million deaths in India, and projections indicate that air pollution could cause 1.75 to 2.39 million deaths annually by 2030, representing 15%-25% of total deaths.
            </p>

            <p className="text-lg leading-relaxed text-gray-700">
              Without intervention, CO₂ emissions from Indian roads are projected to reach a massive 1,212 million tonnes by 2035. These statistics underscore the urgent need for a transformative solution to mitigate the devastating health, environmental, and economic impacts of vehicular emissions.
            </p>
          </div>

          {/* Section: The Untapped Potential of Elektrofit Conversions */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              The Untapped Potential of Elektrofit Conversions
            </h2>

            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              Converting existing ICE vehicles to EVs offers a compelling value proposition with significant emission reductions, cost-effectiveness, and resource efficiency. However, realizing the full potential requires overcoming challenges in standardization, financing, and carbon credit monetization.
            </p>

            <div className="bg-gray-50 border-l-4 border-blue-500 p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Significant Emission Reductions</h3>
              <p className="text-gray-700 leading-relaxed">
                Elektrofit conversions can eliminate direct tailpipe emissions, significantly reducing urban air pollution and mitigating climate change. The total annual CO₂e emissions from India's vehicle fleet amount to approximately 443 million tonnes, creating a massive opportunity for carbon credits through conversion.
              </p>
            </div>

            <div className="bg-gray-50 border-l-4 border-green-500 p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cost-Effectiveness & Resource Efficiency</h3>
              <p className="text-gray-700 leading-relaxed">
                Elektrofitting can be a more cost-effective alternative to purchasing new EVs, making electric mobility more accessible to a broader population. By extending the life of existing vehicles, elektrofitting reduces the demand for new vehicle production, conserving resources and reducing environmental impact.
              </p>
            </div>
          </section>

          {/* Section: BluMotiv's Connected Elektrofit Solution */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              BluMotiv's Connected Elektrofit Solution: A Holistic Approach
            </h2>

            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              BluMotiv offers a comprehensive and connected elektrofit solution designed to address conversion challenges and accelerate the adoption of electric mobility in India. Our solution, Elektrofit, is an AI-powered platform that provides a scalable and affordable way to upgrade ICE-based fleets to EVs.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Elektrofit: More Than Just Conversion
              </h3>

              <p className="text-gray-700 leading-relaxed mb-6">
                Elektrofit is more than just a conversion; it's a complete upgrade to a scalable clean mobility solution, offering a faster return on investment with break-even times approximately half of that of new EVs.
              </p>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="BluMotiv's Connected Elektrofit Solution"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <p className="text-sm text-gray-600 italic">
                  Exhibit 1: BluMotiv's Connected Elektrofit Platform Architecture
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-gray-900">Elektrofit's Connected Features:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Extended EV range
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Battery analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Driver behaviour analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Smart charging
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Fleet uptime planning and scheduling
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              Our connected platform enables real-time monitoring of vehicle performance, energy consumption, and emission reductions. This data is crucial for optimizing vehicle performance through over-the-air updates, predictive maintenance, and energy efficiency optimization, while also facilitating carbon credit generation through accurate emission reduction verification.
            </p>
          </section>

          {/* Carbon Credit Opportunity Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Unlocking the Carbon Credit Opportunity
            </h2>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Baseline Emissions from ICE Vehicles in India</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-yellow-300">
                      <th className="text-left py-2 font-semibold">Vehicle Type</th>
                      <th className="text-right py-2 font-semibold">Total CO₂e (Mt/year)</th>
                      <th className="text-right py-2 font-semibold">CO₂e per Vehicle (tons/year)</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-700">
                    <tr className="border-b border-yellow-200">
                      <td className="py-2">Two-Wheelers</td>
                      <td className="text-right py-2">108</td>
                      <td className="text-right py-2">0.4</td>
                    </tr>
                    <tr className="border-b border-yellow-200">
                      <td className="py-2">Passenger Cars</td>
                      <td className="text-right py-2">102</td>
                      <td className="text-right py-2">2.55</td>
                    </tr>
                    <tr className="border-b border-yellow-200">
                      <td className="py-2">Three-Wheelers</td>
                      <td className="text-right py-2">7.992</td>
                      <td className="text-right py-2">1.08</td>
                    </tr>
                    <tr className="border-b border-yellow-200">
                      <td className="py-2">Commercial Vehicles</td>
                      <td className="text-right py-2">151.2</td>
                      <td className="text-right py-2">7.56</td>
                    </tr>
                    <tr className="border-b border-yellow-200">
                      <td className="py-2">Buses</td>
                      <td className="text-right py-2">21.6</td>
                      <td className="text-right py-2">10.8</td>
                    </tr>
                    <tr className="border-b border-yellow-200">
                      <td className="py-2">Other Transport</td>
                      <td className="text-right py-2">52.2</td>
                      <td className="text-right py-2">1.8</td>
                    </tr>
                    <tr className="font-semibold">
                      <td className="py-2">Total</td>
                      <td className="text-right py-2">443</td>
                      <td className="text-right py-2">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Total Addressable Market (TAM)</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Total Addressable Market for carbon credits from electrifying India's current ICE vehicle fleet is substantial:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">•</span>
                  <span><strong>Indian Market:</strong> $0.44B - $4.43B annually (compliance), $0.89B - $2.21B (voluntary)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">•</span>
                  <span><strong>EU Market:</strong> $28.8B - $35.4B annually (compliance), $0.89B - $8.86B (voluntary)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">•</span>
                  <span><strong>US Market:</strong> $6.6B - $22.1B annually (compliance), $0.89B - $3.1B (voluntary)</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Key Messages Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              The Urgent Need for Transformative Action
            </h2>

            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              The data on air pollution in India underscores the critical need for a transformative solution like widespread vehicle electrification. The convergence of significant carbon credit potential and the urgent need to address India's air pollution crisis creates a compelling case for investing in scalable solutions like BluMotiv's connected elektrofit technology.
            </p>

            <div className="space-y-6">
              <div className="border-l-4 border-red-500 pl-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Massive Health Impact</h4>
                <p className="text-gray-700">
                  In 2019, air pollution caused 1.67 million deaths in India and is the leading cause of Years of Life Lost in major states. Projections indicate this could worsen, potentially causing 1.75 to 2.39 million deaths annually by 2030, representing 15%-25% of total deaths. The death rate ranges from 124 to 169 deaths per 100,000 people.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Economic Burden</h4>
                <p className="text-gray-700">
                  Economic losses due to premature deaths and health issues caused by air pollution are substantial, estimated at $36.8 billion. Without intervention, CO₂ emissions from Indian roads are projected to reach 1,212 million tonnes by 2035, further exacerbating both air pollution and climate change.
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">BluMotiv's Solution Advantage</h4>
                <p className="text-gray-700">
                  By offering not only TCO benefits but also a substantial alternative revenue stream through carbon credits, BluMotiv can incentivize the widespread conversion of polluting ICE vehicles to cleaner EVs. Our connected platform provides accurate emission reduction measurement, streamlined verification, and enhanced revenue potential through access to high-value international carbon markets.
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="mb-12">
            <div className="bg-blue-600 text-white rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Call to Action: Partner with BluMotiv for a Sustainable Future</h2>
              <p className="text-lg leading-relaxed mb-6">
                BluMotiv is committed to driving the transition to sustainable mobility in India. Our connected elektrofit solutions offer a unique opportunity to reduce air pollution, combat climate change, generate economic value, and enhance energy security.
              </p>
              <p className="text-lg leading-relaxed">
                We invite vehicle owners, fleet operators, investors, and policymakers to partner with BluMotiv in this transformative journey. Together, we can create a cleaner, healthier, and more sustainable future for India.
              </p>
            </div>
          </section>
        </div>
      </article>

  {/* Authors Section removed as per request */}

  {/* Related Articles Section */}
  <section className="w-full py-4 px-6 border-t border-gray-200" style={{ backgroundColor: '#ffffff', marginTop: '-2rem' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="mb-4 overflow-hidden rounded-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="EV Retrofit Market Analysis"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-xs text-blue-600 font-semibold mb-2">ARTICLE • BLUMOTIV RESEARCH</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                EV Retrofit Market Analysis: Cost-Benefit Framework
              </h3>
            </div>

            <div className="group cursor-pointer">
              <div className="mb-4 overflow-hidden rounded-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="AI-Powered Predictive Maintenance"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-xs text-blue-600 font-semibold mb-2">RESEARCH PAPER</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                AI-Powered Predictive Maintenance for Fleet Operations
              </h3>
            </div>

            <div className="group cursor-pointer">
              <div className="mb-4 overflow-hidden rounded-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                  alt="Policy Impact Assessment"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="text-xs text-blue-600 font-semibold mb-2">POLICY ANALYSIS</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                Policy Impact Assessment: EV Transition Acceleration in India
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Download CTA Section */}
      <section className="w-full py-12 px-6 border-t border-gray-200" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Downloads</h3>
            <button
              onClick={() => handleActionClick('download')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              <span>Full White Paper (PDF 2.1 MB)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Action Modal */}
      {showActionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowActionModal(false)}
        >
          <div
            className="relative w-full max-w-md rounded-lg bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowActionModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {actionType === 'download' && 'Download Research Report'}
              {actionType === 'share' && 'Share Research Report'}
              {actionType === 'print' && 'Print Research Report'}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              onClick={handleProceed}
              disabled={!formData.name || !formData.email}
              className="w-full py-3 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Proceed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}