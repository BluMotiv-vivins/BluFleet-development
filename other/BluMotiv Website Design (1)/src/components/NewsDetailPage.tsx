import { X, ArrowLeft, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NewsDetailPageProps {
  onClose: () => void;
  fromPage: 'home' | 'news';
  onNavigate: (page: string) => void;
}

export default function NewsDetailPage({ onClose, fromPage, onNavigate }: NewsDetailPageProps) {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-700/30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center space-x-2 transition-colors duration-300"
            style={{ color: 'rgba(240, 248, 254, 0.7)' }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to {fromPage === 'home' ? 'Homepage' : 'News'}</span>
          </button>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/30 transition-colors duration-300"
            style={{ color: 'rgba(240, 248, 254, 0.7)' }}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-2.5">
        {/* Title */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl lg:text-5xl" style={{ color: '#F0F8FE' }}>
            Dassault Systèmes and BluMotiv Partner to Shape the Future of Clean Mobility with AI-Powered EV Solutions
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-green-400 mx-auto"></div>
          <p className="text-lg" style={{ color: 'rgba(240, 248, 254, 0.6)' }}>March 07, 2025</p>
        </header>

        {/* Featured Image */}
        <section className="space-y-6">
          <div className="h-64 lg:h-80 overflow-hidden border border-gray-700/30 backdrop-blur-sm" style={{ backgroundColor: '#304461' }}>
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1591453214154-c95db71dbd83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBwYXJ0bmVyc2hpcCUyMHRlY2hub2xvZ3klMjBjb2xsYWJvcmF0aW9ufGVufDF8fHx8MTc1NjI4MDMwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Professional business handshake representing the strategic technology partnership and collaboration between Dassault Systèmes and BluMotiv in AI-powered EV solutions"
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
            />
          </div>
        </section>

        {/* Key Highlights */}
        <section className="backdrop-blur-md border border-gray-700/30 p-8 space-y-4" style={{ backgroundColor: '#304461' }}>
          <h2 className="text-2xl" style={{ color: '#F0F8FE' }}>Key Highlights</h2>
          <ul className="space-y-3" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 mt-2 flex-shrink-0"></div>
              <span>Research partnership via Dassault Systèmes' BIOVIA Contract Research program aims to advance EV development with virtual twin technology.</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 mt-2 flex-shrink-0"></div>
              <span>Collaboration will focus on enhancing vehicle performance through AI-driven predictive models and advanced simulations.</span>
            </li>
            <li className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 mt-2 flex-shrink-0"></div>
              <span>Accurate metrics and robust range predictions can accelerate EV development and reduce time-to-market.</span>
            </li>
          </ul>
        </section>

        {/* Main Content */}
        <section className="space-y-2.5">
          <div className="backdrop-blur-sm border border-gray-700/20 p-6 space-y-4" style={{ backgroundColor: '#304461' }}>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
              <a 
                href="https://www.3ds.com/newsroom/press-releases/india/dassault-systemes-and-blumotiv-partner-shape-future-clean-mobility-ai-powered-ev-solutions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-300 inline-flex items-center gap-1"
              >
                Dassault Systèmes
                <ExternalLink className="w-4 h-4" />
              </a> (Euronext Paris: FR0014003TT8, DSY.PA) today announced a collaboration with BluMotiv, a deep-tech mobility company pioneering smart, scalable, and sustainable electrified transport.
            </p>
          </div>

          <div className="backdrop-blur-sm border border-gray-700/20 p-6 space-y-4" style={{ backgroundColor: '#304461' }}>
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
              The partnership, enabled by Dassault Systèmes' 3DEXPERIENCE platform and its BIOVIA Contract Research program, will advance EV powertrain development by leveraging BIOVIA battery chemistry modelling. This will enable more precise range predictions, optimized charging strategies, and improved battery longevity, directly addressing range anxiety and performance reliability concerns. The use of virtual twin technology is expected to cut development costs by 60% and boost energy efficiency by 20%.
            </p>
          </div>
        </section>

        {/* Impact Statistics */}
        <section className="bg-gradient-to-br from-blue-500/10 to-green-400/10 backdrop-blur-sm border border-blue-500/20 p-8">
          <h3 className="text-xl mb-6" style={{ color: '#F0F8FE' }}>Expected Impact</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-blue-400">60%</div>
              <p style={{ color: 'rgba(240, 248, 254, 0.8)' }}>Reduction in Development Costs</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-green-400">20%</div>
              <p style={{ color: 'rgba(240, 248, 254, 0.8)' }}>Boost in Energy Efficiency</p>
            </div>
          </div>
        </section>

        {/* CEO Quote */}
        <section className="backdrop-blur-md border border-gray-700/30 p-8 space-y-4" style={{ backgroundColor: '#304461' }}>
          <h3 className="text-xl" style={{ color: '#F0F8FE' }}>BluMotiv CEO Statement</h3>
          <blockquote className="text-lg leading-relaxed italic border-l-4 border-green-400 pl-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
            "Our collaboration with Dassault Systèmes represents a breakthrough in accelerating EV adoption. By combining BluMotiv's expertise in AI-powered connected powertrain technology with Dassault Systèmes' cutting-edge simulation and AI capabilities, we are revolutionising the way electrified mobility solutions are designed, tested and deployed. This partnership allows us to eliminate traditional barriers in EV development - reducing costs, accelerating innovation cycles, and ensuring unparalleled efficiency and scalability. Together, we are not just enhancing electric mobility but setting new industry benchmarks for accessibility, reliability, and sustainability. With sustainability at the core of our mission, BluMotiv is committed to shaping a cleaner, smarter, and more electrified future - one that is not only visionary but achievable today."
          </blockquote>
          <p className="text-right" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
            — Ashish Naidu, Founder & CEO BluMotiv
          </p>
        </section>

        {/* Dassault Quote */}
        <section className="backdrop-blur-sm border border-gray-700/20 p-6 space-y-4" style={{ backgroundColor: '#304461' }}>
          <h3 className="text-xl" style={{ color: '#F0F8FE' }}>Dassault Systèmes Statement</h3>
          <blockquote className="text-lg leading-relaxed italic border-l-4 border-blue-400 pl-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
            "We are delighted to partner with BluMotiv. This collaboration will enable us to provide the electric vehicle sector with cutting-edge technologies that promote sustainable transportation and a greener future."
          </blockquote>
          <p className="text-right" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
            — Deepak NG, Managing Director, India, Dassault Systèmes
          </p>
        </section>

        {/* Conclusion */}
        <section className="backdrop-blur-md border border-gray-700/30 p-8 space-y-4" style={{ backgroundColor: '#304461' }}>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
            By combining BluMotiv's AI-driven electrification expertise with Dassault Systèmes' virtual twin and battery chemistry modeling technologies, the partnership is set to drive the future of clean, efficient, and accessible electric mobility.
          </p>
        </section>

        {/* Navigation Buttons */}
        <section className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center justify-center px-8 py-3 font-medium border-2 rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:bg-[#247FFF]/10"
            style={{ 
              borderColor: '#247FFF',
              color: '#247FFF',
              backgroundColor: 'transparent'
            }}
          >
            Back to Home
          </button>
        </section>
      </div>
    </div>
  );
}