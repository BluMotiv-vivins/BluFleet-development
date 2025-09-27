import { ChevronRight } from 'lucide-react';
import { unsplash_tool } from '../tools/unsplash';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ResearchCardProps {
  onNavigate: (page: string) => void;
  onOpenDetail: () => void;
}

export default function ResearchCard({ onNavigate, onOpenDetail }: ResearchCardProps) {
  return (
    <section className="w-full py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Research Card */}
        <div className="bg-gray-800/30 backdrop-blur-md border border-gray-700/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Half - Image */}
            <div className="relative h-96 lg:h-auto overflow-hidden">
              {/* Research Sticker */}
              <div className="absolute top-6 left-6 z-20">
                <div 
                  className="px-4 py-2 text-sm font-medium shadow-lg backdrop-blur-sm border border-white/10"
                  style={{ backgroundColor: '#F87C57', color: '#F0F8FE' }}
                >
                  Research
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-green-400/20"></div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="AI-powered data visualization and analytics"
                className="w-full h-full object-cover p-5"
              />
              {/* Overlay with AI visualization elements */}
              <div className="absolute inset-0" style={{ backgroundColor: '#304461', borderRadius: '4px 0 0 4px' }}>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1617049037028-d4746ed5e6bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwZGF0YSUyMHZpc3VhbGl6YXRpb258ZW58MXx8fHwxNzU2MjE5NTA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Technology data visualization test"
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

            {/* Right Half - Content */}
            <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6 shadow-lg" style={{ backgroundColor: '#304461' }}>
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-green-400 flex-shrink-0"></div>
                  <div className="h-px bg-green-400/30 flex-1"></div>
                  <span className="text-green-400 text-sm font-medium">Aug 26, 2025</span>
                </div>
                
                <h3 className="text-2xl lg:text-3xl" style={{ color: '#F0F8FE' }}>
                  AI-Driven Strategy Paper for EV Transformation
                </h3>
                
                <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                  Discover how BluMotiv integrates qualitative insights with quantitative data to create actionable strategies for the EV and retrofit ecosystem.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* Secondary CTA - More Research */}
                <button
                  onClick={() => onNavigate('research')}
                  className="inline-flex items-center justify-center px-8 py-3 font-medium border-2 rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:bg-[#247FFF]/10"
                  style={{ 
                    borderColor: '#247FFF',
                    color: '#247FFF',
                    backgroundColor: 'transparent'
                  }}
                >
                  More Research
                </button>

                {/* Primary CTA - Read */}
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