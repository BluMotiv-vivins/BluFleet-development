import { ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import partnershipImage from 'figma:asset/eb9cfc5cf1a14858102dcd4daa6bb9b5d106a8f6.png';

interface PartnershipSectionProps {
  onNavigate?: (page: string) => void;
  onOpenDetail?: () => void;
}

export default function PartnershipSection({ onNavigate, onOpenDetail }: PartnershipSectionProps) {
  return (
    <section className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Partnership Card */}
        <div className="bg-[#304461] overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Image */}
            <div className="relative h-80 md:h-auto bg-gray-600/30">
              {/* Research Sticker */}
              <div className="absolute top-6 z-20" style={{ left: '20px' }}>
                <div 
                  className="px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm border border-white/10"
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

            {/* Right Side - Content */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              {/* Timeline Marker */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-green-400 flex-shrink-0"></div>
                <div className="h-px bg-green-400/30 flex-1"></div>
                <span className="text-green-400 text-sm font-medium">March 07, 2025</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl text-[#F0F8FE] mb-4 leading-tight">
                Dassault Systèmes and BluMotiv Partner to Shape the Future of Clean Mobility
              </h2>

              {/* Description */}
              <p className="text-[#F0F8FE]/80 leading-relaxed mb-6">
                BluMotiv collaborates with Dassault Systèmes to accelerate AI-powered EV retrofitting 
                using virtual twin technology.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Secondary CTA - More News */}
                <button
                  onClick={() => onNavigate?.('news')}
                  className="inline-flex items-center justify-center px-8 py-3 font-medium border-2 rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:bg-[#247FFF]/10"
                  style={{ 
                    borderColor: '#247FFF',
                    color: '#247FFF',
                    backgroundColor: 'transparent'
                  }}
                >
                  More News
                </button>

                {/* Primary CTA - Learn More */}
                <button 
                  onClick={onOpenDetail}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 font-medium rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
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
        </div>
      </div>
    </section>
  );
}