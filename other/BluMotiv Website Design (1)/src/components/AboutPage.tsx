import { useState } from 'react';
import { X, Linkedin, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const [showAshishModal, setShowAshishModal] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<any>(null);

  const ashishProfile = {
    name: 'Ashish Naidu',
    designation: 'Founder & CEO',
    teaser: 'Formerly with Ford, US & UK | M.S. Automotive (BCU), UK | MBA (ISB). Visionary leader driving BluMotiv\'s mission to transform sustainable mobility through cutting-edge technology.',
    image: '/src/assets/ashish.jpg',
    fullProfile: {
      biography: 'Ashish is the Founder and CEO of BluMotiv, bringing extensive experience from his tenure at Ford in the US and UK. He holds a Master\'s degree in Automotive from Birmingham City University (BCU), UK, and an MBA from Indian School of Business (ISB). His vision drives BluMotiv\'s mission to revolutionize sustainable mobility through innovative technology solutions.',
      achievements: [
        'Founded BluMotiv to revolutionize sustainable mobility',
        'Former automotive engineer at Ford Motor Company',
        'Expert in automotive technology and business strategy',
        'Leading innovation in EV retrofit solutions',
        'Driving the transition to clean, intelligent mobility'
      ],
      expertise: ['Automotive Engineering', 'Business Strategy', 'EV Technology', 'Leadership', 'Sustainable Mobility'],
      education: 'M.S. Automotive (BCU), UK | MBA (ISB)',
      experience: 'Formerly with Ford, US & UK'
    },
    social: {
      linkedin: 'https://www.linkedin.com/in/ashishknaidu/'
    }
  };

  const openAshishModal = () => {
    setShowAshishModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeAshishModal = () => {
    setShowAshishModal(false);
    document.body.style.overflow = 'unset';
  };

  const advisors = [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
      id: 4,
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

  const openAdvisorModal = (advisor: any) => {
    setSelectedAdvisor(advisor);
    document.body.style.overflow = 'hidden';
  };

  const closeAdvisorModal = () => {
    setSelectedAdvisor(null);
    document.body.style.overflow = 'unset';
  };

  const pillars = [
    {
      title: "AI-Driven Innovation",
      description: "Harnessing machine learning and digital twins to enable smarter electrification and predictive insights."
    },
    {
      title: "Zero-Prototyping",
      description: "A virtual development framework that accelerates EV innovation and reduces time-to-market."
    },
    {
      title: "Cloud-Connected",
      description: "Advanced cloud and energy management systems for scalable, always-connected mobility."
    },
    {
      title: "Reliability First",
      description: "Ensuring safety, performance, and trust through digital-first validation and testing."
    }
  ];

  return (
    <div className="w-full">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(240, 248, 254, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(36, 127, 255, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(36, 127, 255, 0.7);
        }
      `}</style>
      {/* Hero Section with Image */}
      <section className="w-full">
        <div>
          <div className="relative w-full h-[484px] overflow-hidden rounded-lg">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="https://videos.pexels.com/video-files/16648081/16648081-uhd_3840_2160_30fps.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-center text-[#F0F8FE] px-6 max-w-4xl leading-tight">
                Driving the Future of Smart & Sustainable Mobility
              </h2>
            </div>
          </div>
        </div>
        

      </section>

      {/* About BluMotiv Section */}
      <section className="w-full py-20 px-6" style={{ backgroundColor: '#0E2794' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl mb-8" style={{ color: '#F0F8FE' }}>
              About BluMotiv
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                BluMotiv is a deep-tech mobility startup driving the future of smart, scalable, and sustainable electrified transport. By combining AI, cloud computing, and advanced simulations, we create cleaner, more efficient, and accessible electric mobility solutions — with a strong focus on India and global markets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section - Split Layout */}
      <section className="w-full py-20 px-6" style={{ backgroundColor: '#25344B' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl mb-8" style={{ color: '#F0F8FE' }}>
              Leadership
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
              From strategy to execution – roadmap to pilot launch
            </p>
          </div>

          {/* Split Layout: Ashish Profile (Left) + Founder's Note (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Side - Ashish Naidu Profile */}
            <div className="flex justify-center lg:justify-end">
              <div 
                onClick={openAshishModal}
                className="group cursor-pointer p-8 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-gray-700/30 hover:shadow-xl max-w-md w-full rounded-lg"
                style={{ backgroundColor: '#304461' }}>
                
                {/* Profile Image */}
                <div className="mb-6 flex justify-center">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden ring-2 ring-gray-600/30 group-hover:ring-blue-400/50 transition-all duration-300">
                    <ImageWithFallback
                      src={ashishProfile.image}
                      alt={ashishProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Profile Info */}
                <div className="text-center">
                  <h3 className="text-xl mb-2 group-hover:text-blue-400 transition-colors duration-300" style={{ color: '#F0F8FE' }}>
                    {ashishProfile.name}
                  </h3>
                  <p className="text-base mb-4" style={{ color: '#247FFF' }}>
                    {ashishProfile.designation}
                  </p>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                    {ashishProfile.teaser}
                  </p>
                  
                  {/* View Profile Indicator */}
                  <div className="mt-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm inline-flex items-center gap-1" style={{ color: '#247FFF' }}>
                      View Profile <ExternalLink size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Founder's Note */}
            <div className="lg:pl-8">
              <div className="mb-8">
                <h3 className="text-xl lg:text-2xl mb-4" style={{ color: '#F0F8FE' }}>
                  Founder's Note
                </h3>
                <h4 className="text-lg lg:text-xl mb-6" style={{ color: '#247FFF' }}>
                  Leading the Transition to Clean, Intelligent Mobility
                </h4>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  At BluMotiv, our vision is rooted in challenging conventional wisdom to accelerate the transition to sustainable mobility. While many race to build new electric vehicles, inspired by the philosophy of Aikido, we turn legacy inefficiencies into opportunity.
                </p>
                
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  Our Elektrofit<sup>TM</sup> platform - an AI-powered, connected ecosystem- transforms existing industrial fleets and deliver immediate emissions reductions and operational savings. By leveraging rapid retrofits and advanced software, we empower fleet operators to maximize existing assets and transition to clean mobility in a simple, fast, and profitable way.
                </p>
                
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  Our asset-light model leverages micro-factories, cutting-edge software, and strategic partnerships, enabling rapid, efficient scale. We focus on brown-to-green fleets overlooked by most: off-highway equipment, logistics, and industrial operators.
                </p>
                
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  Central to this transformation is BluFleet, our AI-driven intelligent fleet management system. BluFleet harnesses real-time data to drive actionable insights: optimizing routes and range, enabling predictive maintenance, and simplifying charging and energy management.
                </p>
                
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  BluMotiv is much more than hardware; we are building a data-driven ecosystem that empowers customers with insight, transparency, and improved financial performance. Every vehicle's operational data becomes trust capital—helping insurers, financiers, and corporates unlock new value streams.
                </p>
                
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  Our commitment is to impact NOW, delivering measurable environmental and economic results from day one. By combining Elektrofit and BluFleet with an asset-light micro-factory network, we rapidly scale multiple revenue streams, including SaaS, data monetization, carbon credits, and battery second-life.
                </p>
                
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  BluMotiv stands as a sustainability-first mobility platform, devoted to profit with purpose, measurable change, and leading the way to a cleaner, circular future. With world-class talent and the right partners, we are transforming under-served segments into blue ocean growth opportunities - for the planet and future generations.
                </p>
                
                <div className="text-right mt-6 pt-4 border-t border-gray-600/30">
                  <p className="text-sm font-medium" style={{ color: '#247FFF' }}>
                    Ashish Naidu, BluMotiv<sup style={{ fontSize: '0.7em', top: '-0.5em', position: 'relative' }}>TM</sup>
                  </p>
                </div>
              </div>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advisors.map((advisor) => (
              <div
                key={advisor.id}
                onClick={() => openAdvisorModal(advisor)}
                className="group cursor-pointer p-4 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-gray-700/30 hover:shadow-xl h-full flex flex-col rounded-lg"
                style={{ backgroundColor: '#304461' }}
              >
                {/* Advisor Image */}
                <div className="mb-4 flex justify-center">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-600/30 group-hover:ring-blue-400/50 transition-all duration-300">
                    <ImageWithFallback
                      src={advisor.image}
                      alt={advisor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Advisor Info */}
                <div className="text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm mb-1 group-hover:text-blue-400 transition-colors duration-300" style={{ color: '#F0F8FE' }}>
                      {advisor.name}
                    </h3>
                    <p className="text-xs mb-2" style={{ color: '#247FFF' }}>
                      {advisor.designation}
                    </p>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                      {advisor.teaser}
                    </p>
                  </div>

                  {/* View Profile Indicator */}
                  <div className="mt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

      {/* Our Pillars Section */}
      <section className="w-full py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl lg:text-3xl mb-8" style={{ color: '#F0F8FE' }}>
              Our Pillars
            </h2>
          </div>

          {/* Pillars Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className="rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-gray-700/30"
                style={{ backgroundColor: '#304461' }}
              >
                {/* Pillar Icon/Accent */}
                <div className="mb-6">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>

                {/* Pillar Title */}
                <h3 className="text-lg mb-4" style={{ color: '#F0F8FE' }}>
                  {pillar.title}
                </h3>

                {/* Pillar Description */}
                <p className="leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ashish Profile Modal */}
      {showAshishModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={closeAshishModal}
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
              onClick={closeAshishModal}
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
                      src={ashishProfile.image}
                      alt={ashishProfile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h2 className="text-2xl lg:text-3xl mb-2" style={{ color: '#F0F8FE' }}>
                    {ashishProfile.name}
                  </h2>
                  <p className="text-lg mb-4" style={{ color: '#247FFF' }}>
                    {ashishProfile.designation}
                  </p>
                  <div className="flex gap-4">
                    <a
                      href={ashishProfile.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: 'rgba(240, 248, 254, 0.1)' }}
                    >
                      <Linkedin size={20} style={{ color: '#247FFF' }} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="mb-8">
                <h3 className="text-lg mb-4" style={{ color: '#F0F8FE' }}>Biography</h3>
                <p className="leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  {ashishProfile.fullProfile.biography}
                </p>
              </div>

              {/* Education & Experience */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg mb-3" style={{ color: '#F0F8FE' }}>Education</h3>
                  <p style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                    {ashishProfile.fullProfile.education}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg mb-3" style={{ color: '#F0F8FE' }}>Experience</h3>
                  <p style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                    {ashishProfile.fullProfile.experience}
                  </p>
                </div>
              </div>

              {/* Expertise */}
              <div className="mb-8">
                <h3 className="text-lg mb-4" style={{ color: '#F0F8FE' }}>Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {ashishProfile.fullProfile.expertise.map((skill, index) => (
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
                  {ashishProfile.fullProfile.achievements.map((achievement, index) => (
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

      {/* Advisor Profile Modal */}
      {selectedAdvisor && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={closeAdvisorModal}
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
              onClick={closeAdvisorModal}
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
                      src={selectedAdvisor.image}
                      alt={selectedAdvisor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h2 className="text-2xl lg:text-3xl mb-2" style={{ color: '#F0F8FE' }}>
                    {selectedAdvisor.name}
                  </h2>
                  <p className="text-lg mb-4" style={{ color: '#247FFF' }}>
                    {selectedAdvisor.designation}
                  </p>
                  <div className="flex gap-4">
                    <a
                      href={selectedAdvisor.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: 'rgba(240, 248, 254, 0.1)' }}
                    >
                      <Linkedin size={20} style={{ color: '#247FFF' }} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Biography */}
              <div className="mb-8">
                <h3 className="text-lg mb-4" style={{ color: '#F0F8FE' }}>Biography</h3>
                <p className="leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  {selectedAdvisor.fullProfile.biography}
                </p>
              </div>

              {/* Education & Experience */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg mb-3" style={{ color: '#F0F8FE' }}>Education</h3>
                  <p style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                    {selectedAdvisor.fullProfile.education}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg mb-3" style={{ color: '#F0F8FE' }}>Experience</h3>
                  <p style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                    {selectedAdvisor.fullProfile.experience}
                  </p>
                </div>
              </div>

              {/* Expertise */}
              <div className="mb-8">
                <h3 className="text-lg mb-4" style={{ color: '#F0F8FE' }}>Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAdvisor.fullProfile.expertise.map((skill: string, index: number) => (
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
                  {selectedAdvisor.fullProfile.achievements.map((achievement: string, index: number) => (
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

    </div>
  );
}