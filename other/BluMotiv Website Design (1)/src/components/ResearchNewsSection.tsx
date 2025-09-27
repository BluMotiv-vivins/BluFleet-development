import { ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import partnershipImage from 'figma:asset/eb9cfc5cf1a14858102dcd4daa6bb9b5d106a8f6.png';

interface ResearchNewsSectionProps {
  onNavigate: (page: string) => void;
  onOpenResearchDetail: () => void;
  onOpenNewsDetail: () => void;
}

export default function ResearchNewsSection({ 
  onNavigate, 
  onOpenResearchDetail, 
  onOpenNewsDetail 
}: ResearchNewsSectionProps) {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6" style={{ backgroundColor: '#25344B' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          
          {/* Research Card */}
          <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/30 overflow-hidden flex flex-col h-full">
            {/* Research Image - Full Width Top */}
            <div className="relative h-60 sm:h-72 lg:h-80 overflow-hidden flex-shrink-0">
              {/* Research Sticker */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                <div 
                  className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium shadow-lg backdrop-blur-sm border border-white/10"
                  style={{ backgroundColor: '#F87C57', color: '#F0F8FE' }}
                >
                  Research
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-400/20"></div>
              
              {/* Overlay with AI visualization elements */}
              <div className="absolute inset-0" style={{ backgroundColor: '#304461' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1617049037028-d4746ed5e6bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZGF0YSUyMHZpc3VhbGl6YXRpb258ZW58MXx8fHwxNzU2MjE5NTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Technology data visualization"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-6 left-6">
                <div className="w-3 h-3 bg-green-400 animate-pulse"></div>
              </div>
              <div className="absolute bottom-6 right-6">
                <div className="w-2 h-2 bg-blue-400 animate-pulse delay-300"></div>
              </div>
            </div>

            {/* Research Content - Below Image */}
            <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-lg flex-grow flex flex-col" style={{ backgroundColor: '#304461' }}>
              {/* Date Stamp */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 flex-shrink-0"></div>
                <div className="h-px bg-green-400/30 flex-1"></div>
                <span className="text-green-400 text-sm font-medium">Aug 26, 2025</span>
              </div>
              
              {/* Title */}
              <h3 className="text-lg sm:text-xl lg:text-2xl" style={{ color: '#F0F8FE' }}>
                AI-Driven Strategy Paper for EV Transformation
              </h3>
              
              {/* Teaser Copy */}
              <p className="text-base sm:text-lg leading-relaxed flex-grow" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                Discover how BluMotiv integrates qualitative insights with quantitative data to create actionable strategies for the EV and retrofit ecosystem.
              </p>

              {/* Research CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-auto">
                <button
                  onClick={() => onNavigate('research')}
                  className="inline-flex items-center justify-center px-6 py-3 font-medium border-2 rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:bg-[#247FFF]/10 text-sm min-h-[44px] touch-target"
                  style={{ 
                    borderColor: '#247FFF',
                    color: '#247FFF',
                    backgroundColor: 'transparent'
                  }}
                >
                  More Research
                </button>

                <button
                  onClick={onOpenResearchDetail}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-4 font-medium rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-base sm:text-lg min-h-[48px] touch-target"
                  style={{ 
                    backgroundColor: '#247FFF',
                    color: '#F0F8FE'
                  }}
                >
                  Read
                  <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>

          {/* News Card */}
          <div className="bg-[#304461] overflow-hidden flex flex-col h-full">
            {/* News Image - Full Width Top */}
            <div className="relative h-60 sm:h-72 lg:h-80 bg-gray-600/30 flex-shrink-0">
              {/* News Sticker */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
                <div 
                  className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium shadow-lg backdrop-blur-sm border border-white/10"
                  style={{ backgroundColor: '#F87C57', color: '#F0F8FE' }}
                >
                  News
                </div>
              </div>
              
              <ImageWithFallback
                src={partnershipImage}
                alt="Partnership collaboration - digital handshake and global connectivity"
                className="w-full h-full object-cover"
                style={{ backgroundColor: '#304461' }}
              />
            </div>

            {/* News Content - Below Image */}
            <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 flex-grow flex flex-col">
              {/* Date Stamp */}
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 flex-shrink-0"></div>
                <div className="h-px bg-green-400/30 flex-1"></div>
                <span className="text-green-400 text-sm font-medium">March 07, 2025</span>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl lg:text-2xl text-[#F0F8FE] leading-tight">
                Dassault Systèmes and BluMotiv Partner to Shape the Future of Clean Mobility
              </h2>

              {/* Teaser Copy */}
              <p className="text-[#F0F8FE]/80 leading-relaxed flex-grow">
                BluMotiv collaborates with Dassault Systèmes to accelerate AI-powered EV retrofitting 
                using virtual twin technology.
              </p>

              {/* News CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 mt-auto">
                <button
                  onClick={() => onNavigate('news')}
                  className="inline-flex items-center justify-center px-6 py-2 font-medium border-2 rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:bg-[#247FFF]/10"
                  style={{ 
                    borderColor: '#247FFF',
                    color: '#247FFF',
                    backgroundColor: 'transparent'
                  }}
                >
                  More News
                </button>

                <button 
                  onClick={onOpenNewsDetail}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2 font-medium rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                  style={{ 
                    backgroundColor: '#247FFF',
                    color: '#F0F8FE'
                  }}
                >
                  Read
                  <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}