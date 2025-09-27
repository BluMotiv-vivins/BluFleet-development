import React, { useState, useEffect, useRef } from 'react';
import { X, Share2, Download, Bookmark, Printer, ArrowLeft } from 'lucide-react';

interface ResearchDetailPageProps {
  onClose: () => void;
  fromPage: 'home' | 'research';
  onNavigate: (page: string) => void;
}

export default function ResearchDetailPage({ onClose, fromPage, onNavigate }: ResearchDetailPageProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [downloadForm, setDownloadForm] = useState({ name: '', email: '' });
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mainContent = document.querySelector('.overflow-y-auto');
    
    const handleScroll = () => {
      if (mainContent) {
        setIsScrolled(mainContent.scrollTop > 50);
      }
    };

    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (mainContent) {
        mainContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleDownloadClick = () => setShowDownloadModal(true);

  const handleDownloadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (downloadForm.name && downloadForm.email) {
      console.log('Downloading article for:', downloadForm);
      const link = document.createElement('a');
      link.href = 'https://www.mckinsey.com/~/media/mckinsey/industries/automotive%20and%20assembly/our%20insights/reboost%20a%20comprehensive%20view%20on%20the%20changing%20powertrain%20component%20market%20and%20how%20suppliers%20can%20succeed/reboost-a-comprehensive-view.pdf';
      link.download = 'Reboost-a-comprehensive-view.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowDownloadModal(false);
      setDownloadForm({ name: '', email: '' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDownloadForm({ ...downloadForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto font-sans">
      {/* Sticky Header */}
      <header className={`sticky top-0 z-40 transition-shadow duration-300 ${isScrolled ? 'shadow-md' : ''}`} style={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <img 
                src="/src/assets/c8af9e0c9bde92809a43c8512d804b783ac0ee07.png" 
                alt="BluMotiv" 
                className="h-7"
              />
              <span className="text-sm font-semibold text-gray-500 hidden md:block">Automotive & Assembly</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
              <button className="text-sm font-semibold text-gray-700 hover:text-blue-600 hidden sm:block">Subscribe</button>
              <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main ref={contentRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-6">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="hover:text-blue-600">Home</a>
          <span className="mx-2">&gt;</span>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('research'); }} className="hover:text-blue-600">Our Insights</a>
        </div>

        {/* Article Header */}
        <div className="border-b pb-8 mb-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight mb-6">
            Reboost: A comprehensive view on the changing powertrain component market and how suppliers can succeed
          </h1>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              <span>November 8, 2019</span>
              <span className="mx-2">|</span>
              <span>Report</span>
            </div>
            <div className="flex items-center space-x-3">
              <button className="text-gray-500 hover:text-blue-600"><Share2 className="w-5 h-5"/></button>
              <button className="text-gray-500 hover:text-blue-600"><Printer className="w-5 h-5"/></button>
              <button onClick={handleDownloadClick} className="text-gray-500 hover:text-blue-600"><Download className="w-5 h-5"/></button>
              <button className="text-gray-500 hover:text-blue-600"><Bookmark className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            By <span className="font-semibold text-gray-800">Andreas Cornet</span>, <span className="font-semibold text-gray-800">Russell Hensley</span>, and others
          </div>
        </div>

        {/* Intro Paragraph */}
        <div className="my-12">
          <p className="text-xl text-gray-700 leading-relaxed border-l-4 border-blue-500 pl-6">
            New research on the potential developments of 28 powertrain component markets suggests the shifts that are coming—and suppliers should start preparing for them now.
          </p>
        </div>

        {/* Article Body */}
        <article className="prose prose-lg max-w-none text-gray-800">
          <p>Looking back not even a decade, the automotive industry was largely comprised of the same two powertrain types that had characterized the industry for over a century: gasoline and diesel. Today, there is a broad powertrain mix as the industry—prompted mostly by government mandates—pushes toward more environmentally friendly and efficient transportation.</p>
          
          <p>Due to these developments, which are both driven by and affecting OEMs—and are taking place at a pace that not many would have foreseen a few years ago—suppliers and new entrants alike are taking a comprehensive view on the changing powertrain component market. Based on extensive proprietary research and analyses, we developed a new report, Reboost. This article aims to provide a perspective on three questions that are a top priority for all sector players, especially suppliers:</p>
          
          <ul>
            <li>Why, to what extent, where, and by when will there be significant changes in the powertrain market?</li>
            <li>What are the most important changes in the powertrain market regarding its main components and systems?</li>
            <li>How will the changes affect the current powertrain value chains, and how can companies successfully respond?</li>
          </ul>

          <h2 className="font-light">Perspective on the automotive powertrain market</h2>
          <p>To understand the market, we’ll look at different architectures, electrification scenarios, and more.</p>

          <h3 className="font-light">Entering the portfolio game: A technology-neutral assessment of different powertrain architectures</h3>
          <p>A broad mix of powertrain technologies is currently evolving as the industry—mostly prompted by government mandates—pushes toward more environmentally friendly and efficient transportation.</p>

          <h3 className="font-light">Electrification scenarios: Various forces that determine the speed of adoption</h3>
          <p>Over the next decade, four key factors will determine the speed of adoption of alternative powertrains. In addition, the penetration of electric and HEVs, and later FCEVs, will vary strongly by region.</p>

          <h4 className="font-semibold text-gray-800">Regulation</h4>
          <p>CO2 regulations in all major regions but the US are becoming more rigorous, thereby accelerating the shift from ICEs to EVs. Europe is leading the way with an emission limit of 95 grams per kilometer (g/km) by 2020, and further reduction of 37.5 percent by 2030, resulting in a limit of 59 g/km.</p>

          <h4 className="font-semibold text-gray-800">Technology</h4>
          <p>Innovation in battery technology and production have made EVs competitive with conventional combustion-engine vehicles. Batteries constitute a major cost item in BEVs, and their cost has decreased significantly because of technology advancement, production-process optimization, and economies of scale.</p>

          <h4 className="font-semibold text-gray-800">Infrastructure</h4>
          <p>We estimate a cumulative investment of approximately $50 billion will be needed in charging infrastructure by 2030, not including necessary grid upgrades. The number of public and private charging stations needed by 2030 would be 15 million in Europe, 14 million in China, and 13 million in North America.</p>

          <h4 className="font-semibold text-gray-800">Consumer preferences</h4>
          <p>With regulatory forces, technology improvements, and infrastructure rollout all in favor of EVs, the question remains, how likely are consumers to adopt? Based on a preview of our proprietary McKinsey Global Electric Vehicle Survey, we anticipate an increase in EV-purchase consideration by consumers across core markets.</p>

        </article>

        {/* Author Bios */}
        <div className="border-t mt-16 pt-12">
          <h5 className="text-xs font-bold uppercase text-gray-500 mb-4">About the author(s)</h5>
          <p className="text-sm text-gray-600">
            <strong>Andreas Cornet</strong> and <strong>Andreas Tschiesner</strong> are senior partners in McKinsey’s Munich office, where <strong>Patrick Schaufuss</strong> is an associate partner; <strong>Carsten Hirschberg</strong> is a senior partner in the Berlin office, where <strong>Andreas Venus</strong> is a partner and <strong>Julia Werra</strong> is a consultant. <strong>Russell Hensley</strong> is a senior partner in the Detroit office.
          </p>
        </div>

        {/* Rating */}
        <div className="mt-12">
          <h5 className="text-base font-semibold text-gray-800 mb-4">How relevant and useful is this article for you?</h5>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button key={rating} className="w-10 h-10 rounded-full border-2 text-gray-600 border-gray-300 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center">{rating}</button>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mt-16">
            <button
                onClick={onClose}
                className="flex items-center space-x-2 px-6 py-3 rounded-full border border-gray-400 text-gray-700 transition-colors duration-300 hover:bg-gray-100"
            >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to {fromPage === 'home' ? 'Homepage' : 'Insights'}</span>
            </button>
        </div>

      </main>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light text-gray-900">Download Article</h3>
              <button onClick={() => setShowDownloadModal(false)} className="p-1 rounded-full text-gray-500 hover:bg-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleDownloadSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" id="name" name="name" value={downloadForm.name} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your full name" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" id="email" name="email" value={downloadForm.email} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email address" />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowDownloadModal(false)} className="px-6 py-2 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Download</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
