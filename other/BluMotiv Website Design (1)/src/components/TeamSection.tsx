import { useState } from 'react';
import { X, Linkedin, Twitter, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  teaser: string;
  image: string;
  fullProfile: {
    biography: string;
    achievements: string[];
    expertise: string[];
    education?: string;
    experience?: string;
  };
  social: {
    linkedin?: string;
    twitter?: string;
  };
}

interface TeamSectionProps {
  onNavigate: (page: string) => void;
}

export default function TeamSection({ onNavigate }: TeamSectionProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Leadership Team - Only Ashish
  const leadershipTeam: TeamMember[] = [
    {
      id: '1',
      name: 'Ashish',
      designation: 'Founder & CEO',
      teaser: 'Formerly with Ford, US & UK | UK | M.S. Automotive (BCU), UK| MBA (ISB). Visionary leader driving BluMotiv\'s mission to transform sustainable mobility through cutting-edge technology.',
      image: '/src/assets/ashish.jpg',
      fullProfile: {
        biography: 'Ashish is the Founder and CEO of BluMotiv, bringing extensive experience from his tenure at Ford in the US and UK. He holds a Master\'s degree in Automotive from Birmingham City University (BCU), UK, and an MBA from Indian School of Business (ISB).',
        achievements: [
          'Founded BluMotiv to revolutionize sustainable mobility',
          'Former automotive engineer at Ford Motor Company',
          'Expert in automotive technology and business strategy',
          'Leading innovation in EV retrofit solutions'
        ],
        expertise: ['Automotive Engineering', 'Business Strategy', 'EV Technology', 'Leadership'],
        education: 'M.S. Automotive (BCU), UK | MBA (ISB)',
        experience: 'Formerly with Ford, US & UK'
      },
      social: {
        linkedin: 'https://www.linkedin.com/in/ashishknaidu/'
      }
    }
  ];

  // Advisors Team
  const advisorsTeam: TeamMember[] = [
    {
      id: '2',
      name: 'Satyajeet Kelkar',
      designation: 'Advisor & Mentor',
      teaser: 'Strategic leader with deep expertise in business development and revenue growth. Driving BluMotiv\'s market expansion and strategic partnerships.',
      image: '/src/assets/satyajeet.png',
      fullProfile: {
        biography: 'Satyajeet Kelkar serves as an Advisor & Mentor to BluMotiv, bringing extensive experience in strategic planning and revenue optimization. He plays a crucial role in guiding the company\'s growth and market positioning.',
        achievements: [
          'Leading strategic initiatives for market expansion',
          'Expert in revenue growth and business development',
          'Driving strategic partnerships and alliances',
          'Spearheading go-to-market strategies'
        ],
        expertise: ['Strategic Planning', 'Revenue Growth', 'Business Development', 'Market Analysis'],
        education: 'Business Administration and Strategic Management',
        experience: 'Senior roles in strategy and revenue management'
      },
      social: {
        linkedin: 'https://www.linkedin.com/in/satyajeet-kelkar-81791025/'
      }
    },
    {
      id: '3',
      name: 'Vipender Mann',
      designation: 'Advisor & Mentor',
      teaser: 'Lawyer | Co-Founder | M&M & Partners. Legal expert and business advisor providing strategic guidance on corporate governance and business development.',
      image: '/src/assets/vipender.jpeg',
      fullProfile: {
        biography: 'Vipender Mann is a distinguished lawyer and Co-Founder of M&M & Partners. He serves as an Advisor & Mentor to BluMotiv, providing invaluable legal expertise and strategic business guidance.',
        achievements: [
          'Co-Founder of M&M & Partners law firm',
          'Expert in corporate law and business advisory',
          'Mentor to multiple technology startups',
          'Strategic advisor for business development'
        ],
        expertise: ['Corporate Law', 'Business Advisory', 'Strategic Planning', 'Mentorship'],
        education: 'Law Degree with specialization in Corporate Law',
        experience: 'Lawyer | Co-Founder | M&M & Partners'
      },
      social: {
        linkedin: 'https://www.linkedin.com/in/vipender/'
      }
    },
    {
      id: '4',
      name: 'Prof. Ravi Jain',
      designation: 'Advisor & Mentor',
      teaser: 'Visiting Faculty in Finance. Academic expert providing financial strategy and educational guidance to drive BluMotiv\'s growth and development.',
      image: '/src/assets/ravi.jpg',
      fullProfile: {
        biography: 'Prof. Ravi Jain is a distinguished academic serving as Visiting Faculty in Finance. He brings deep expertise in financial strategy and serves as an Advisor & Mentor to BluMotiv.',
        achievements: [
          'Visiting Faculty in Finance at leading institutions',
          'Expert in financial strategy and planning',
          'Academic researcher in finance and economics',
          'Advisor to multiple technology companies'
        ],
        expertise: ['Financial Strategy', 'Academic Research', 'Investment Planning', 'Economic Analysis'],
        education: 'Advanced degrees in Finance and Economics',
        experience: 'Visiting Faculty in Finance'
      },
      social: {
        linkedin: 'https://www.linkedin.com/in/ravi-jain-financeprof/'
      }
    },
    {
      id: '5',
      name: 'Prof. Sumeet Kumar',
      designation: 'Advisor & Mentor',
      teaser: 'Asst. Professor Data Analytics. Academic expert in data science and analytics, providing technical guidance and research insights for BluMotiv\'s AI initiatives.',
      image: '/src/assets/sumeet1.jpg',
      fullProfile: {
        biography: 'Prof. Sumeet Kumar is an Assistant Professor specializing in Data Analytics. He serves as an Advisor & Mentor to BluMotiv, bringing cutting-edge expertise in data science and analytics.',
        achievements: [
          'Assistant Professor in Data Analytics',
          'Research expert in machine learning and AI',
          'Published researcher in data science',
          'Technical advisor for AI implementations'
        ],
        expertise: ['Data Analytics', 'Machine Learning', 'AI Research', 'Technical Strategy'],
        education: 'Advanced degrees in Data Science and Analytics',
        experience: 'Asst. Professor Data Analytics'
      },
      social: {
        linkedin: 'https://www.linkedin.com/in/sumeet-kumar-3349321b/'
      }
    }
  ];

  const openModal = (member: TeamMember) => {
    setSelectedMember(member);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    setSelectedMember(null);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  return (
    <>
      {/* Leadership Section */}
      <section className="w-full py-20 px-6" style={{ backgroundColor: '#25344B' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl mb-8" style={{ color: '#F0F8FE' }}>
              Leadership
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
              From strategy to execution – roadmap to pilot launch
            </p>
          </div>

          {/* Leadership Grid - Center single member */}
          <div className="flex justify-center">
            {leadershipTeam.map((member) => (
              <div
                key={member.id}
                onClick={() => openModal(member)}
                className="group cursor-pointer p-6 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-gray-700/30 hover:shadow-xl max-w-sm"
                style={{ backgroundColor: '#304461' }}
              >
                {/* Member Image */}
                <div className="mb-6 flex justify-center">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden ring-2 ring-gray-600/30 group-hover:ring-blue-400/50 transition-all duration-300">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Member Info */}
                <div className="text-center">
                  <h3 className="text-lg mb-2 group-hover:text-blue-400 transition-colors duration-300" style={{ color: '#F0F8FE' }}>
                    {member.name}
                  </h3>
                  <p className="text-sm mb-4" style={{ color: '#F0F8FE' }}>
                    {member.designation}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                    {member.teaser}
                  </p>
                </div>

                {/* Hover Indicator */}
                <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-xs inline-flex items-center gap-1" style={{ color: '#247FFF' }}>
                    View Profile <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisors Section */}
      <section className="w-full py-20 px-6" style={{ backgroundColor: '#1F2937' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl mb-8" style={{ color: '#F0F8FE' }}>
              Advisors
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
              Expert guidance from industry leaders and mentors
            </p>
          </div>

          {/* Advisors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advisorsTeam.map((member) => (
              <div
                key={member.id}
                onClick={() => openModal(member)}
                className="group cursor-pointer p-6 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-gray-700/30 hover:shadow-xl h-full flex flex-col"
                style={{ backgroundColor: '#304461' }}
              >
                {/* Member Image */}
                <div className="mb-6 flex justify-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-gray-600/30 group-hover:ring-blue-400/50 transition-all duration-300">
                    <ImageWithFallback
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Member Info */}
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base mb-2 group-hover:text-blue-400 transition-colors duration-300" style={{ color: '#F0F8FE' }}>
                      {member.name}
                    </h3>
                    <p className="text-xs mb-3" style={{ color: '#F0F8FE' }}>
                      {member.designation}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                      {member.teaser}
                    </p>
                  </div>

                  {/* Hover Indicator */}
                  <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-xs inline-flex items-center gap-1" style={{ color: '#247FFF' }}>
                      View Profile <ExternalLink size={10} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal Overlay */}
      {selectedMember && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg backdrop-blur-md border border-gray-700/30"
            style={{ 
              backgroundColor: 'rgba(48, 68, 97, 0.95)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full transition-all duration-300 hover:scale-110 z-10"
              style={{ backgroundColor: 'rgba(240, 248, 254, 0.1)' }}
              aria-label="Close profile"
            >
              <X size={20} style={{ color: '#F0F8FE' }} />
            </button>

            <div className="p-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-lg overflow-hidden ring-2 ring-gray-600/30">
                    <ImageWithFallback
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h2 className="text-2xl lg:text-3xl mb-2" style={{ color: '#F0F8FE' }}>
                    {selectedMember.name}
                  </h2>
                  <p className="text-lg mb-4" style={{ color: '#247FFF' }}>
                    {selectedMember.designation}
                  </p>
                  <div className="flex gap-4">
                    {selectedMember.social.linkedin && (
                      <a
                        href={selectedMember.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                        style={{ backgroundColor: 'rgba(240, 248, 254, 0.1)' }}
                      >
                        <Linkedin size={20} style={{ color: '#247FFF' }} />
                      </a>
                    )}
                    {selectedMember.social.twitter && (
                      <a
                        href={selectedMember.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                        style={{ backgroundColor: 'rgba(240, 248, 254, 0.1)' }}
                      >
                        <Twitter size={20} style={{ color: '#247FFF' }} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="mb-8">
                <h3 className="text-lg mb-4" style={{ color: '#F0F8FE' }}>Biography</h3>
                <p className="leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  {selectedMember.fullProfile.biography}
                </p>
              </div>

              {/* Education & Experience */}
              {(selectedMember.fullProfile.education || selectedMember.fullProfile.experience) && (
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {selectedMember.fullProfile.education && (
                    <div>
                      <h3 className="text-lg mb-3" style={{ color: '#F0F8FE' }}>Education</h3>
                      <p style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                        {selectedMember.fullProfile.education}
                      </p>
                    </div>
                  )}
                  {selectedMember.fullProfile.experience && (
                    <div>
                      <h3 className="text-lg mb-3" style={{ color: '#F0F8FE' }}>Experience</h3>
                      <p style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                        {selectedMember.fullProfile.experience}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Expertise */}
              <div className="mb-8">
                <h3 className="text-lg mb-4" style={{ color: '#F0F8FE' }}>Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMember.fullProfile.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm border border-gray-600/30"
                      style={{ 
                        backgroundColor: 'rgba(36, 127, 255, 0.1)',
                        color: '#247FFF'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-lg mb-4" style={{ color: '#F0F8FE' }}>Key Achievements</h3>
                <ul className="space-y-2">
                  {selectedMember.fullProfile.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span style={{ color: 'rgba(240, 248, 254, 0.9)' }}>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}