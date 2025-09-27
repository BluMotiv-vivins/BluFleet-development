import React, { useState } from 'react';
import { X, ArrowLeft, Share2, Download, Bookmark, Printer } from 'lucide-react';

interface ResearchDetailPageProps {
  onClose: () => void;
  fromPage: 'home' | 'research';
  onNavigate: (page: string) => void;
}

export default function ResearchDetailPage({ onClose, fromPage, onNavigate }: ResearchDetailPageProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadForm, setDownloadForm] = useState({
    name: '',
    email: ''
  });

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  const handleDownloadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (downloadForm.name && downloadForm.email) {
      // Here you would typically trigger the actual download
      console.log('Downloading article for:', downloadForm);
      
      // Create a mock download - in real implementation, you'd download the actual PDF
      const link = document.createElement('a');
      link.href = '#'; // Replace with actual PDF URL
      link.download = 'AI-Driven-EV-Transformation-BluMotiv.pdf';
      link.click();
      
      // Reset form and close modal
      setDownloadForm({ name: '', email: '' });
      setShowDownloadModal(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDownloadForm({
      ...downloadForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f1419' }}>
      {/* Full Screen Hero Section - McKinsey Style */}
      <div className="relative min-h-screen flex">
        {/* Left Side - Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with Logo */}
          <div className="absolute top-0 left-0 right-0 z-50 p-6">
            <div className="flex items-center justify-between">
              {/* BluMotiv Logo */}
              <div className="flex items-center">
                <img 
                  src="/src/assets/c8af9e0c9bde92809a43c8512d804b783ac0ee07.png" 
                  alt="BluMotiv" 
                  className="h-8"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-1">
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-300" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
                  <Share2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-300" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
                  <Printer className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleDownloadClick}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-300" 
                  style={{ color: 'rgba(240, 248, 254, 0.7)' }}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-300" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
                  <Bookmark className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors duration-300 ml-2"
                  style={{ color: 'rgba(240, 248, 254, 0.7)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex items-center">
            <div className="max-w-2xl px-6 ml-8">
              {/* Title */}
              <h1 className="text-5xl md:text-7xl font-light leading-tight mb-8" style={{ color: '#F0F8FE' }}>
                AI-Driven EV Transformation: A comprehensive view on the changing electric mobility landscape and how companies can succeed
              </h1>
              
              {/* Date and Category */}
              <div className="flex items-center space-x-4 mb-6 text-lg" style={{ color: 'rgba(240, 248, 254, 0.6)' }}>
                <span>November 2024</span>
                <span>|</span>
                <span>Report</span>
              </div>
            </div>
          </div>

          {/* Authors and Action Buttons at Bottom */}
          <div className="px-6 pb-12 ml-8">
            {/* Authors */}
            <div className="flex items-center space-x-4 mb-8 text-base" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
              <span>By</span>
              <span className="font-medium">Ravi Kumar Singh</span>
              <span>,</span>
              <span className="font-medium">Ashish Sinha</span>
              <span>,</span>
              <span className="font-medium">Sumeet Kumar</span>
              <span>,</span>
              <span className="font-medium">Satyajeet Mohanty</span>
              <span>, and</span>
              <span className="font-medium">Vipender Phogat</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 rounded-full border transition-colors duration-300 hover:opacity-80" style={{ borderColor: '#247FFF', color: '#247FFF' }}>
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 rounded-full border transition-colors duration-300 hover:opacity-80" style={{ borderColor: '#247FFF', color: '#247FFF' }}>
                <Printer className="w-4 h-4" />
                <span className="text-sm">Print</span>
              </button>
              <button 
                onClick={handleDownloadClick}
                className="flex items-center space-x-2 px-6 py-3 rounded-full transition-colors duration-300 hover:opacity-90" 
                style={{ backgroundColor: '#247FFF', color: '#F0F8FE' }}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </button>
              <button 
                onClick={onClose}
                className="flex items-center space-x-2 px-6 py-3 rounded-full border transition-colors duration-300 hover:opacity-80" 
                style={{ borderColor: 'rgba(240, 248, 254, 0.3)', color: 'rgba(240, 248, 254, 0.8)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to {fromPage === 'home' ? 'Homepage' : 'Insights'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Hero Image */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4/5 h-3/5 bg-gradient-to-br from-blue-900/20 to-blue-600/20 rounded-3xl flex items-center justify-center border" style={{ borderColor: 'rgba(36, 127, 255, 0.3)' }}>
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-300/20 flex items-center justify-center border" style={{ borderColor: '#247FFF' }}>
                  <div className="text-4xl" style={{ color: '#247FFF' }}>⚡</div>
                </div>
                <p className="text-lg font-medium" style={{ color: '#F0F8FE' }}>AI-Driven Electric Vehicle</p>
                <p className="text-sm" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>Transformation Framework</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - McKinsey Style */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border" style={{ borderColor: 'rgba(240, 248, 254, 0.2)' }}>
            <div className="flex items-center space-x-3">
              <Share2 className="w-4 h-4" style={{ color: 'rgba(240, 248, 254, 0.7)' }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>Sidebar</span>
            </div>
            <div className="mt-2 text-xs" style={{ color: 'rgba(240, 248, 254, 0.6)' }}>
              Overview of today's AI-EV landscape
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="px-6 py-16 border-t" style={{ borderColor: 'rgba(240, 248, 254, 0.1)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="border-l-4 pl-6 mb-12" style={{ borderColor: '#247FFF' }}>
            <p className="text-xl leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              New research on the potential developments of AI-driven electric vehicle transformation suggests the shifts that are coming—and companies should start preparing for them now.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Downloads Section - McKinsey Style */}
        <div className="mb-12">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#247FFF' }}>
            Downloads
          </h3>
          <div className="space-y-2">
            <button 
              onClick={handleDownloadClick}
              className="block text-left hover:underline transition-colors duration-300" 
              style={{ color: '#247FFF' }}
            >
              Full Report (PDF-1.2 MB)
            </button>
          </div>
        </div>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          
          {/* Introduction */}
          <div className="mb-12">
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              Looking back not even a decade, the automotive industry was largely comprised of traditional internal combustion engines and limited electric options. Today, there is a revolutionary transformation as the industry—prompted by technological advancement, environmental concerns, and government mandates—pushes toward AI-driven electric mobility solutions.
            </p>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              As artificial intelligence integrates with electric vehicle technology, the automotive landscape is becoming more intelligent, efficient, and autonomous. This convergence is creating unprecedented opportunities for innovation and market disruption.
            </p>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              Due to these developments, which are both driven by and affecting OEMs—and are taking place at a pace that not many would have foreseen a few years ago—companies and new entrants alike are taking a comprehensive view on the changing AI-EV landscape. Based on extensive proprietary research and analyses, we developed this report: AI-Driven EV Transformation. This article aims to provide perspective on three questions that are a top priority for all sector players:
            </p>
            <ul className="list-disc pl-6 mb-8 space-y-2" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              <li>Why, to what extent, where, and by when will there be significant changes in the AI-EV market?</li>
              <li>What are the most important changes in the AI-EV market regarding its main components and systems?</li>
              <li>How will the changes affect current automotive value chains, and how can companies successfully respond?</li>
            </ul>
          </div>

          {/* Main Sections */}
          <section className="mb-16">
            <h2 className="text-3xl font-light mb-8" style={{ color: '#F0F8FE' }}>
              Perspective on the AI-driven electric vehicle market
            </h2>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              To understand the market, we'll examine different AI integration patterns, electrification scenarios, and technological convergence points.
            </p>

            <h3 className="text-2xl font-light mb-6 mt-12" style={{ color: '#F0F8FE' }}>
              Entering the intelligence game: A technology-neutral assessment of different AI-EV architectures
            </h3>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              A broad mix of AI-enhanced electric vehicle technologies is currently evolving as the industry pushes toward more intelligent, efficient, and autonomous transportation solutions. The integration of artificial intelligence with electric powertrains is creating a new paradigm of smart mobility.
            </p>
          </section>

          <section className="mb-16">
            <h3 className="text-2xl font-light mb-6" style={{ color: '#F0F8FE' }}>
              AI-EV scenarios: Various forces that determine the speed of adoption
            </h3>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              Over the next decade, four key factors will determine the speed of adoption of AI-driven electric vehicles. The penetration of intelligent EVs will vary strongly by region and market segment.
            </p>

            {/* Subsection - Regulation */}
            <h4 className="text-xl font-medium mb-4 mt-8" style={{ color: '#247FFF' }}>
              Regulation
            </h4>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              AI-enhanced vehicle regulations in all major regions are becoming more sophisticated, thereby accelerating the shift from traditional vehicles to intelligent EVs. Governments are implementing standards for autonomous driving capabilities, data privacy, and AI safety protocols.
            </p>

            {/* Subsection - Technology */}
            <h4 className="text-xl font-medium mb-4 mt-8" style={{ color: '#247FFF' }}>
              Technology
            </h4>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              Innovation in AI processing, battery technology, and integrated systems have made intelligent EVs increasingly competitive. Advanced neural networks, edge computing, and machine learning algorithms are revolutionizing vehicle performance, predictive maintenance, and user experience.
            </p>

            {/* Subsection - Infrastructure */}
            <h4 className="text-xl font-medium mb-4 mt-8" style={{ color: '#247FFF' }}>
              Infrastructure
            </h4>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              We estimate a cumulative investment of approximately $75 billion will be needed in smart charging infrastructure and connected vehicle networks by 2030. This includes AI-powered grid management, vehicle-to-grid communication systems, and autonomous charging stations.
            </p>

            {/* Subsection - Consumer Preferences */}
            <h4 className="text-xl font-medium mb-4 mt-8" style={{ color: '#247FFF' }}>
              Consumer preferences
            </h4>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              With technological forces, regulatory support, and infrastructure development all favoring intelligent EVs, consumer adoption rates are accelerating. Based on our proprietary research, more than 65 percent of consumers in key markets are considering AI-enhanced electric vehicles for their next purchase.
            </p>
          </section>

          {/* Growth Outlook Section */}
          <section className="mb-16">
            <h3 className="text-2xl font-light mb-6" style={{ color: '#F0F8FE' }}>
              Dynamic growth outlook: AI-EV components will significantly outgrow the traditional vehicle market
            </h3>
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              Based on overall vehicle production growth and the shift toward AI-integrated electric powertrains, we built a detailed model simulating the market development of intelligent vehicle components. Our projections show the AI-EV market will grow at 23% annually through 2030.
            </p>
            
            {/* Key Statistics */}
            <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 rounded-lg p-6 mb-8 border" style={{ borderColor: 'rgba(36, 127, 255, 0.3)' }}>
              <h4 className="text-lg font-medium mb-4" style={{ color: '#247FFF' }}>Key Market Projections</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold mb-2" style={{ color: '#F0F8FE' }}>$850B</div>
                  <div className="text-sm" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>AI-EV Market by 2030</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2" style={{ color: '#F0F8FE' }}>23%</div>
                  <div className="text-sm" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>Annual Growth Rate</div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-2" style={{ color: '#F0F8FE' }}>45%</div>
                  <div className="text-sm" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>Market Share by 2030</div>
                </div>
              </div>
            </div>
          </section>

          {/* Strategic Recommendations */}
          <section className="mb-16">
            <h2 className="text-3xl font-light mb-8" style={{ color: '#F0F8FE' }}>
              How to start navigating the changing AI-EV landscape
            </h2>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              Today, many companies are refining their AI-EV strategies. The optimal approach will vary based on existing competencies, target markets, and technological capabilities. A four-step framework can guide organizations through this transformation.
            </p>
            
            <div className="space-y-8">
              <div className="border-l-4 pl-6" style={{ borderColor: '#247FFF' }}>
                <h4 className="text-xl font-medium mb-3" style={{ color: '#247FFF' }}>
                  • Develop a comprehensive AI-EV vision and strategy
                </h4>
                <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  A clear, communicated strategy is essential for managing the AI-EV transition. Organizations must develop robust portfolios that perform well under different technological and regulatory scenarios.
                </p>
              </div>
              
              <div className="border-l-4 pl-6" style={{ borderColor: '#247FFF' }}>
                <h4 className="text-xl font-medium mb-3" style={{ color: '#247FFF' }}>
                  • Assess AI and electrification capabilities granularly
                </h4>
                <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  Successful transformation depends on rigorous assessment of AI capabilities, electric powertrain expertise, and software integration competencies to identify areas of competitive advantage.
                </p>
              </div>
              
              <div className="border-l-4 pl-6" style={{ borderColor: '#247FFF' }}>
                <h4 className="text-xl font-medium mb-3" style={{ color: '#247FFF' }}>
                  • Allocate resources strategically across traditional and emerging technologies
                </h4>
                <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  Resources should be strategically allocated to AI-EV development within defined budgets, while traditional automotive investments follow optimized cash-generation strategies.
                </p>
              </div>
              
              <div className="border-l-4 pl-6" style={{ borderColor: '#247FFF' }}>
                <h4 className="text-xl font-medium mb-3" style={{ color: '#247FFF' }}>
                  • Build an innovation-driven culture
                </h4>
                <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
                  Organizations must identify and develop the cultural prerequisites for successful AI-EV transformation, led by strong performance management and clear strategic accountability.
                </p>
              </div>
            </div>
          </section>

          {/* Conclusion */}
          <section className="mb-16">
            <p className="text-lg leading-relaxed mb-6" style={{ color: 'rgba(240, 248, 254, 0.9)' }}>
              The road ahead is challenging but full of opportunity. New technological possibilities and evolving market demands are reshaping the automotive industry. By leveraging existing strengths, forming strategic partnerships, and working proactively, companies can successfully navigate the AI-EV transformation and secure competitive positions in the intelligent mobility future.
            </p>
            
            <div className="mt-8 p-6 rounded-lg border" style={{ backgroundColor: 'rgba(36, 127, 255, 0.1)', borderColor: 'rgba(36, 127, 255, 0.3)' }}>
              <p className="text-lg font-medium mb-4" style={{ color: '#247FFF' }}>
                Download the full report
              </p>
              <button 
                onClick={handleDownloadClick}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors duration-300 hover:opacity-90" 
                style={{ backgroundColor: '#247FFF', color: '#F0F8FE' }}
              >
                <Download className="w-4 h-4" />
                <span>AI-Driven EV Transformation: Full Report (PDF–1.2MB)</span>
              </button>
            </div>
          </section>

        {/* Author Bio - McKinsey Style */}
        <div className="border-t pt-12 mt-16" style={{ borderColor: 'rgba(240, 248, 254, 0.1)' }}>
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-6" style={{ color: '#247FFF' }}>
            About the Author(s)
          </h3>
          <div className="prose prose-lg max-w-none">
            <p style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
              <strong style={{ color: '#F0F8FE' }}>Ravi Kumar Singh</strong> and <strong style={{ color: '#F0F8FE' }}>Ashish Sinha</strong> are senior partners at BluMotiv, where <strong style={{ color: '#F0F8FE' }}>Sumeet Kumar</strong> is an associate partner. <strong style={{ color: '#F0F8FE' }}>Satyajeet Mohanty</strong> is a senior partner specializing in AI integration, where <strong style={{ color: '#F0F8FE' }}>Vipender Phogat</strong> leads the electric mobility practice. The BluMotiv Research Team combines expertise in AI, automotive engineering, and strategic consulting to deliver insights that drive sustainable mobility transformation.
            </p>
          </div>
        </div>

        {/* Article Rating - McKinsey Style */}
        <div className="border-t pt-12 mt-12" style={{ borderColor: 'rgba(240, 248, 254, 0.1)' }}>
          <h4 className="text-lg font-medium mb-6" style={{ color: '#F0F8FE' }}>
            How relevant and useful is this article for you?
          </h4>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className="w-10 h-10 rounded-full border-2 hover:border-[#247FFF] transition-colors duration-300 flex items-center justify-center"
                style={{ borderColor: 'rgba(240, 248, 254, 0.3)', color: 'rgba(240, 248, 254, 0.7)' }}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-20">
          <button
            onClick={() => onNavigate('research')}
            className="inline-flex items-center justify-center px-8 py-3 font-medium border rounded-full transition-all duration-300 hover:opacity-90"
            style={{ 
              borderColor: '#247FFF',
              color: '#247FFF',
              backgroundColor: 'transparent'
            }}
          >
            More Insights
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center justify-center px-8 py-3 font-medium rounded-full transition-all duration-300 hover:opacity-90"
            style={{ 
              backgroundColor: '#247FFF',
              color: '#F0F8FE'
            }}
          >
            Back to Home
          </button>
        </div>
        
        {/* Bottom Spacer */}
        <div className="pb-12"></div>
        </article>
      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
          <div className="rounded-xl shadow-xl max-w-md w-full mx-4 p-8 border" style={{ backgroundColor: '#1a2332', borderColor: 'rgba(240, 248, 254, 0.1)' }}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-semibold" style={{ color: '#F0F8FE' }}>Download Article</h3>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                style={{ color: 'rgba(240, 248, 254, 0.7)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleDownloadSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#F0F8FE' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={downloadForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#247FFF] focus:border-[#247FFF]"
                  style={{ 
                    backgroundColor: '#0f1419', 
                    borderColor: 'rgba(240, 248, 254, 0.2)', 
                    color: '#F0F8FE' 
                  }}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#F0F8FE' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={downloadForm.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#247FFF] focus:border-[#247FFF]"
                  style={{ 
                    backgroundColor: '#0f1419', 
                    borderColor: 'rgba(240, 248, 254, 0.2)', 
                    color: '#F0F8FE' 
                  }}
                  placeholder="Enter your email address"
                />
              </div>
              
              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1 px-6 py-3 font-medium border rounded-lg transition-all duration-300 hover:opacity-80"
                  style={{ 
                    borderColor: 'rgba(240, 248, 254, 0.3)', 
                    color: 'rgba(240, 248, 254, 0.8)',
                    backgroundColor: 'transparent'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 font-medium rounded-lg transition-all duration-300 hover:opacity-90"
                  style={{ 
                    backgroundColor: '#247FFF',
                    color: '#F0F8FE'
                  }}
                >
                  Download
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
