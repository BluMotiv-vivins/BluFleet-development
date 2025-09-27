import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import strategyImage from 'figma:asset/1a3007c44b4adb2729499153a5660c787475818e.png';

interface ResearchPageProps {
  onNavigate: (page: string) => void;
  onOpenDetail?: () => void;
  onOpenWhitePaper?: () => void;
}

export default function ResearchPage({ onNavigate, onOpenDetail, onOpenWhitePaper }: ResearchPageProps) {
  const researchPapers = [
    {
      id: 1,
      title: "BluMotiv White Paper: Unlocking Carbon Credit Potential with Connected Elektrofit Solutions",
      summary: "BluMotiv's AI-driven approach integrates qualitative insights with quantitative data to create actionable strategies for the EV and retrofit ecosystem.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      featured: true
    },
    {
      id: 2,
      title: "Strategy Paper Template: Qualitative + Quantitative Integration",
      summary: "This strategy paper blends structured quantitative analysis (market sizing, ROI, cost-benefit) with deep qualitative insights (stakeholder interviews, competitive mapping) to deliver strategic clarity for BluMotiv's EV journey.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      title: "EV Retrofit Market Analysis: Cost-Benefit Framework",
      summary: "Comprehensive analysis of the electric vehicle retrofit market, examining total cost of ownership models, adoption barriers, and strategic positioning opportunities for BluMotiv's technology platform.",
      image: "https://images.unsplash.com/photo-1593941707882-a5bac6861d75?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      title: "Stakeholder Ecosystem Mapping for Sustainable Mobility",
      summary: "In-depth stakeholder analysis covering OEMs, fleet operators, policy makers, and end consumers to identify collaboration opportunities and market entry strategies in the sustainable mobility ecosystem.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 5,
      title: "AI-Powered Predictive Maintenance for Fleet Operations",
      summary: "Research into machine learning applications for predictive maintenance in electric and hybrid vehicle fleets, focusing on cost reduction and operational efficiency improvements.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 6,
      title: "Policy Impact Assessment: EV Transition Acceleration",
      summary: "Analysis of regulatory frameworks and policy instruments that can accelerate electric vehicle adoption, with specific focus on retrofit incentives and infrastructure development strategies.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Research Sticker */}
      <div className="fixed top-24 left-10 z-40">

      </div>

      {/* Hero Section */}
      <section className="w-full pb-20 pt-24 px-6 border-b border-gray-700/30">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-4xl lg:text-6xl" style={{ color: '#F0F8FE' }}>
                Strategic Insights for EV Transformation
              </h1>
              <p className="text-lg max-w-lg mx-auto lg:mx-0" style={{ color: '#F0F8FE', opacity: 0.8 }}>
                Our comprehensive research methodology drives innovative solutions for sustainable mobility, combining data-driven insights with strategic planning.
              </p>
            </div>

            {/* Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img 
                  src={strategyImage}
                  alt="Strategic planning with HOW-TO methodology on planning board"
                  className="w-full max-w-md h-auto rounded-lg shadow-2xl"
                  style={{
                    filter: 'brightness(0.9) contrast(1.1)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                  }}
                />
                {/* Glassmorphism overlay effect */}
                <div 
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    background: 'linear-gradient(45deg, rgba(36, 127, 255, 0.1), rgba(74, 222, 128, 0.1))',
                    backdropFilter: 'blur(1px)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Grid */}
      <section className="w-full py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Featured Research - Large Card */}
          {researchPapers.filter(paper => paper.featured).map((paper, index) => (
            <div key={paper.id} className="mb-16">
              <div className="backdrop-blur-md border border-gray-700/30 rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#304461' }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="relative h-96 lg:h-auto overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-400/20"></div>
                    <ImageWithFallback
                      src={paper.image}
                      alt={paper.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-blue-500/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm" style={{ color: '#F0F8FE' }}>
                        Featured
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl lg:text-3xl" style={{ color: '#F0F8FE' }}>
                        {paper.title}
                      </h2>
                      
                      <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                        {paper.summary}
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={onOpenWhitePaper}
                        className="px-8 py-3 rounded-lg transition-all duration-300 hover:opacity-90 hover:scale-105"
                        style={{ 
                          backgroundColor: '#247FFF',
                          color: '#F0F8FE'
                        }}
                      >
                        Read Full Paper
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Research Grid - Smaller Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {researchPapers.filter(paper => !paper.featured).map((paper, index) => (
              <div key={paper.id} className="group">
                <div className="backdrop-blur-sm border border-gray-700/20 rounded-xl overflow-hidden hover:border-gray-600/30 transition-all duration-300 hover:scale-105 hover:opacity-90" style={{ backgroundColor: '#304461' }}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={paper.image}
                      alt={paper.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-lg leading-tight" style={{ color: '#F0F8FE' }}>
                      {paper.title}
                    </h3>
                    
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
                      {paper.summary}
                    </p>

                    <button
                      onClick={onOpenDetail}
                      className="flex items-center space-x-2 text-sm transition-colors duration-300 hover:opacity-80"
                      style={{ color: '#247FFF' }}
                    >
                      <span>Read Full Paper</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}