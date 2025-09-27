import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface SolutionsPageProps {
  onNavigate: (page: string) => void;
}

export default function SolutionsPage({ onNavigate }: SolutionsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    contactNumber: '',
    preferredDate: '',
    preferredTime: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      contactNumber: '',
      preferredDate: '',
      preferredTime: ''
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      contactNumber: '',
      preferredDate: '',
      preferredTime: ''
    });
  };
  const solutions = [
    {
      title: "Connected Electrofit Solution",
      description: "Our flagship AI/ML-driven predictive platform that accelerates EV adoption for fleets and individuals.",
      features: ["AI-driven Optimization", "Predictive Analytics", "Fleet Management", "Individual Solutions"],
      image: "https://images.unsplash.com/photo-1690149611859-bfba66e26f0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBmbGVldCUyMG1hbmFnZW1lbnR8ZW58MXx8fHwxNzU2Mjk4MjcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      title: "AI-Driven Powertrain Optimization",
      description: "Advanced powertrain solutions optimized through artificial intelligence for maximum efficiency.",
      features: ["Smart Powertrain Design", "Performance Optimization", "Energy Efficiency", "Real-time Monitoring"],
      image: "https://images.unsplash.com/photo-1684369586188-bad829e7c51f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBSSUyMHBvd2VydHJhaW4lMjBvcHRpbWl6YXRpb258ZW58MXx8fHwxNzU2Mjk4MjcxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      title: "Cloud-Based Energy Management",
      description: "Scalable cloud solutions for comprehensive energy management and optimization.",
      features: ["Cloud Integration", "Energy Analytics", "Remote Monitoring", "Scalable Infrastructure"],
      image: "https://images.unsplash.com/photo-1720156922667-a23399d91446?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbG91ZCUyMGVuZXJneSUyMG1hbmFnZW1lbnR8ZW58MXx8fHwxNzU2Mjk4MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      title: "Virtual Twinning & Simulation",
      description: "Zero-prototyping framework using virtual twins and advanced simulations for rapid development.",
      features: ["Digital Twins", "Advanced Simulations", "Virtual Testing", "Rapid Prototyping"],
      image: "https://images.unsplash.com/photo-1590030535521-e69873a44ee0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHdpbiUyMHNpbXVsYXRpb258ZW58MXx8fHwxNzU2Mjk4MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      title: "Electric Vehicle Solutions",
      description: "Comprehensive EV solutions designed for modern transportation needs and sustainability goals.",
      features: ["EV Development", "Battery Management", "Charging Solutions", "Sustainability Focus"],
      image: "https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHZlaGljbGUlMjBjaGFyZ2luZ3xlbnwxfHx8fDE3NTYyOTgyNzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      title: "Digital-First Validation",
      description: "Ensuring reliability and safety through comprehensive digital validation processes.",
      features: ["Safety Testing", "Performance Validation", "Quality Assurance", "Compliance Standards"],
      image: "https://images.unsplash.com/photo-1691934286085-c88039d93dae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdmFsaWRhdGlvbiUyMHRlc3Rpbmd8ZW58MXx8fHwxNzU2Mjk4MjcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full py-20 px-6 relative overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        >
          <source src="https://videos.pexels.com/video-files/9790000/9790000-hd_1920_1080_30fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="relative z-10 max-w-6xl mx-auto text-center mt-20">
          <h1 className="text-3xl lg:text-4xl mb-8" style={{ color: '#F0F8FE' }}>
            Our Solutions
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              Comprehensive deep-tech mobility solutions designed to accelerate electric vehicle adoption and deliver smarter, cleaner transportation at scale.
            </p>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="w-full py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm border border-gray-700/30"
                style={{ backgroundColor: '#304461' }}
              >
                {/* Solution Image */}
                <div className="w-full h-48 overflow-hidden">
                  <ImageWithFallback
                    src={solution.image}
                    alt={solution.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Solution Content */}
                <div className="p-6">
                  {/* Solution Title */}
                  <h3 className="text-lg mb-4" style={{ color: '#F0F8FE' }}>
                    {solution.title}
                  </h3>

                  {/* Solution Description */}
                  <p className="leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                    {solution.description}
                  </p>

                  {/* Solution Features */}
                  <div className="space-y-2">
                    {solution.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 mr-3 flex-shrink-0"></div>
                        <span className="text-sm" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-6" style={{ backgroundColor: '#0E2794' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl mb-6" style={{ color: '#F0F8FE' }}>
            Ready to Transform Your Mobility Solutions?
          </h2>
          <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
            Discover how BluMotiv's deep-tech solutions can accelerate your electric vehicle initiatives and drive sustainable mobility transformation.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 rounded-full border-2 transition-all duration-300 hover:scale-105"
            style={{ borderColor: '#fff', backgroundColor: 'transparent', color: '#fff' }}
          >
            Request a demo
          </button>
        </div>
      </section>

      {/* Request Callback Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="mx-auto p-0 border-0 rounded-lg shadow-2xl [&>button]:text-[#F0F8FE] [&>button>svg]:stroke-[#F0F8FE]" style={{ backgroundColor: '#304461', width: '872px', maxWidth: 'calc(100vw - 2rem)' }}>
          <DialogHeader className="p-8 pb-6">
            <DialogTitle className="text-2xl mb-2" style={{ color: '#F0F8FE' }}>
              Request a Callback
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
              Please share your details. Our team may take up to 48 hours to connect with you.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <Label htmlFor="name" className="block mb-2" style={{ color: '#F0F8FE' }}>
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="w-full border-gray-600 focus:border-blue-400"
                  style={{ 
                    backgroundColor: 'rgba(240, 248, 254, 0.1)', 
                    color: '#F0F8FE',
                    borderColor: 'rgba(240, 248, 254, 0.3)'
                  }}
                />
              </div>

              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="block mb-2" style={{ color: '#F0F8FE' }}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full border-gray-600 focus:border-blue-400"
                  style={{ 
                    backgroundColor: 'rgba(240, 248, 254, 0.1)', 
                    color: '#F0F8FE',
                    borderColor: 'rgba(240, 248, 254, 0.3)'
                  }}
                />
              </div>

              {/* Company Field */}
              <div>
                <Label htmlFor="company" className="block mb-2" style={{ color: '#F0F8FE' }}>
                  Company
                </Label>
                <Input
                  id="company"
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  required
                  className="w-full border-gray-600 focus:border-blue-400"
                  style={{ 
                    backgroundColor: 'rgba(240, 248, 254, 0.1)', 
                    color: '#F0F8FE',
                    borderColor: 'rgba(240, 248, 254, 0.3)'
                  }}
                />
              </div>

              {/* Contact Number Field */}
              <div>
                <Label htmlFor="contactNumber" className="block mb-2" style={{ color: '#F0F8FE' }}>
                  Contact Number
                </Label>
                <Input
                  id="contactNumber"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  required
                  className="w-full border-gray-600 focus:border-blue-400"
                  style={{ 
                    backgroundColor: 'rgba(240, 248, 254, 0.1)', 
                    color: '#F0F8FE',
                    borderColor: 'rgba(240, 248, 254, 0.3)'
                  }}
                />
              </div>

              {/* Preferred Date Field */}
              <div>
                <Label htmlFor="preferredDate" className="block mb-2" style={{ color: '#F0F8FE' }}>
                  Preferred Date
                </Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                  required
                  className="w-full border-gray-600 focus:border-blue-400"
                  style={{ 
                    backgroundColor: 'rgba(240, 248, 254, 0.1)', 
                    color: '#F0F8FE',
                    borderColor: 'rgba(240, 248, 254, 0.3)'
                  }}
                />
              </div>

              {/* Preferred Time Field */}
              <div>
                <Label htmlFor="preferredTime" className="block mb-2" style={{ color: '#F0F8FE' }}>
                  Preferred Time
                </Label>
                <Input
                  id="preferredTime"
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                  required
                  className="w-full border-gray-600 focus:border-blue-400"
                  style={{ 
                    backgroundColor: 'rgba(240, 248, 254, 0.1)', 
                    color: '#F0F8FE',
                    borderColor: 'rgba(240, 248, 254, 0.3)'
                  }}
                />
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#247FFF', color: '#F0F8FE' }}
              >
                Submit
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border rounded-full transition-all duration-300 hover:scale-105"
                style={{ 
                  borderColor: 'rgba(240, 248, 254, 0.3)', 
                  backgroundColor: 'transparent', 
                  color: 'rgba(240, 248, 254, 0.7)' 
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}