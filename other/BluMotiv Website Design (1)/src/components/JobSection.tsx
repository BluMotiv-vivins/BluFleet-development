import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface JobSectionProps {
  onNavigate: (page: string) => void;
}

export default function JobSection({ onNavigate }: JobSectionProps) {
  const jobData = {
    title: "Part-Time Software Consultant (Blu-Connected Platform)",
    description: "We're looking for a skilled Software Consultant to join our Engineering team. This role offers an exciting opportunity to work with cutting-edge technology in the sustainable mobility space."
  };

  return (
    <section className="py-16 px-8" style={{ backgroundColor: '#0E2794' }}>
      <div className="max-w-4xl mx-auto text-center">
        {/* Section Title */}
        <h2 className="text-3xl text-[#F0F8FE] mb-6">
          Current Opening with Us
        </h2>
        
        {/* Job Card */}
        <div className="rounded-lg p-8 backdrop-blur-sm max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300" style={{ backgroundColor: '#000DCD' }}>
          <h3 className="text-xl text-[#F0F8FE] mb-4">
            {jobData.title}
          </h3>
          <p className="text-[#F0F8FE]/80 mb-6">
            {jobData.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('career')}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 font-medium rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: '#247FFF',
                color: '#F0F8FE'
              }}
            >
              View Details
              <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}