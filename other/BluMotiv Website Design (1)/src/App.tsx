import { useState, useRef } from 'react';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import SplitSection from './components/SplitSection';
import InfoSection from './components/InfoSection';
import ResearchNewsSection from './components/ResearchNewsSection';
import BenefitsSection from './components/BenefitsSection';
import JobSection from './components/JobSection';
import AboutPage from './components/AboutPage';
import CareerPage from './components/CareerPage';
import JobApplicationPage from './components/JobApplicationPage';
import ResearchPage from './components/ResearchPage';
import NewsPage from './components/NewsPage';
import SolutionsPage from './components/SolutionsPage';
import ProductsPage from './components/ProductsPage';
import ResearchDetailPage from './components/ResearchDetailPage';
import NewsDetailPage from './components/NewsDetailPage';
import WhitePaperPage from './components/WhitePaperPage';
import Footer from './components/Footer';

export default function App() {
  // Set all detail modals to false by default so homepage is shown
  const [currentPage, setCurrentPage] = useState('home');
  const [showResearchDetail, setShowResearchDetail] = useState(false);
  const [showNewsDetail, setShowNewsDetail] = useState(false);
  const [showWhitePaper, setShowWhitePaper] = useState(false);
  const [researchDetailFromPage, setResearchDetailFromPage] = useState<'home' | 'research'>('home');
  const [newsDetailFromPage, setNewsDetailFromPage] = useState<'home' | 'news'>('home');
  const [whitePaperFromPage, setWhitePaperFromPage] = useState<'home' | 'research'>('home');
  const splitSectionRef = useRef<HTMLDivElement>(null);

  // Credits data for images and videos used throughout the site
  const credits = [
    {
      type: 'photo' as const,
      author: 'Walls.io',
      authorUrl: 'https://unsplash.com/@walls_io?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash',
      source: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/a-sticky-note-pinned-to-a-wall-with-the-words-how-to-written-on-it-exHWZWIFXtk?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash'
    },
    {
      type: 'video' as const,
      author: 'Kindel Media',
      source: 'Pexels',
      sourceUrl: 'https://www.pexels.com/video/close-up-shot-of-a-car-charging-9790000/',
      description: 'EV charging station video'
    },
    {
      type: 'video' as const,
      author: 'Jozef Papp',
      source: 'Pexels',
      sourceUrl: 'https://www.pexels.com/video/aerial-view-of-a-tractor-spraying-a-field-16648081/',
      description: 'Aerial agricultural field video'
    },
    {
      type: 'video' as const,
      author: 'Gemini Veo 3',
      source: 'Google AI',
      sourceUrl: 'https://deepmind.google/technologies/veo/',
      description: 'AI-generated video content for product demonstration'
    }
  ];

  const navigateTo = (page: string) => {
    setCurrentPage(page);
    setShowResearchDetail(false);
    setShowNewsDetail(false);
    setShowWhitePaper(false);
  };

  const scrollToSplitSection = () => {
    splitSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const openResearchDetail = (fromPage: 'home' | 'research' = 'home') => {
    setResearchDetailFromPage(fromPage);
    setShowResearchDetail(true);
  };

  const closeResearchDetail = () => {
    setShowResearchDetail(false);
  };

  const openNewsDetail = (fromPage: 'home' | 'news' = 'news') => {
    setNewsDetailFromPage(fromPage);
    setShowNewsDetail(true);
  };

  const closeNewsDetail = () => {
    setShowNewsDetail(false);
  };

  const openWhitePaper = (fromPage: 'home' | 'research' = 'research') => {
    setWhitePaperFromPage(fromPage);
    setShowWhitePaper(true);
  };

  const closeWhitePaper = () => {
    setShowWhitePaper(false);
  };

  // White Paper Page
  if (showWhitePaper) {
    return (
      <WhitePaperPage 
        onClose={closeWhitePaper}
        fromPage={whitePaperFromPage}
        onNavigate={navigateTo}
      />
    );
  }

  // Research Detail Page
  if (showResearchDetail) {
    return (
      <ResearchDetailPage 
        onClose={closeResearchDetail}
        fromPage={researchDetailFromPage}
        onNavigate={navigateTo}
      />
    );
  }

  // News Detail Page
  if (showNewsDetail) {
    return (
      <NewsDetailPage 
        onClose={closeNewsDetail}
        fromPage={newsDetailFromPage}
        onNavigate={navigateTo}
      />
    );
  }

  // About Page
  if (currentPage === 'about') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation currentPage={currentPage} onNavigate={navigateTo} />
        <AboutPage onNavigate={navigateTo} />
        <Footer onNavigate={navigateTo} />
      </div>
    );
  }

  // Job Application Page
  if (currentPage === 'job-application') {
    const selectedJob = JSON.parse(sessionStorage.getItem('selectedJob') || 'null');
    return (
      <JobApplicationPage 
        job={selectedJob}
        onBack={() => navigateTo('career')}
      />
    );
  }

  // Career Page
  if (currentPage === 'career') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation currentPage={currentPage} onNavigate={navigateTo} />
        <CareerPage onNavigate={navigateTo} />
        <Footer onNavigate={navigateTo} />
      </div>
    );
  }

  // Research Page
  if (currentPage === 'research') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation currentPage={currentPage} onNavigate={navigateTo} />
        <ResearchPage 
          onNavigate={navigateTo} 
          onOpenDetail={() => openResearchDetail('research')}
          onOpenWhitePaper={() => openWhitePaper('research')}
        />
        <Footer onNavigate={navigateTo} />
      </div>
    );
  }

  // News Page
  if (currentPage === 'news') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation currentPage={currentPage} onNavigate={navigateTo} />
        <NewsPage 
          onNavigate={navigateTo} 
          onOpenDetail={() => openNewsDetail('news')}
        />
        <Footer onNavigate={navigateTo} />
      </div>
    );
  }

  // Solutions Page
  if (currentPage === 'solutions') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation currentPage={currentPage} onNavigate={navigateTo} />
        <SolutionsPage onNavigate={navigateTo} />
        <Footer onNavigate={navigateTo} />
      </div>
    );
  }

  // Products Page
  if (currentPage === 'products') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navigation currentPage={currentPage} onNavigate={navigateTo} />
        <ProductsPage onNavigate={navigateTo} />
        <Footer onNavigate={navigateTo} />
      </div>
    );
  }

  // Homepage
  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation currentPage={currentPage} onNavigate={navigateTo} />
      <HeroSection onScrollToExplore={scrollToSplitSection} credits={credits} />
      <div ref={splitSectionRef}>
        <SplitSection onNavigate={navigateTo} />
      </div>
      <InfoSection />
      <ResearchNewsSection 
        onNavigate={navigateTo}
        onOpenResearchDetail={() => openResearchDetail('home')}
        onOpenNewsDetail={() => openNewsDetail('home')}
      />
      <BenefitsSection />
      <JobSection onNavigate={navigateTo} />
      <Footer onNavigate={navigateTo} />
    </div>
  );
}