import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NewsPageProps {
  onNavigate: (page: string) => void;
  onOpenDetail: () => void;
}

export default function NewsPage({ onNavigate, onOpenDetail }: NewsPageProps) {
  const newsArticles = [
    {
      id: 1,
      title: "BluMotiv and Dassault Systèmes Partner to Shape the Future of Clean Mobility",
      summary: "BluMotiv collaborates with Dassault Systèmes to accelerate AI-powered EV retrofitting using virtual twin technology.",
      image: "https://images.unsplash.com/photo-1591453214154-c95db71dbd83?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHBhcnRuZXJzaGlwJTIwaGFuZHNoYWtlJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTYyNzk2NTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      date: "March 07, 2025",
      category: "Partnership",
      featured: true
    },
    {
      id: 2,
      title: "BluMotiv Secures Major Funding Round to Scale EV Retrofit Operations",
      summary: "Series A funding will accelerate the development of BluMotiv's proprietary retrofit technology platform and expand manufacturing capabilities to meet growing demand for sustainable vehicle conversion solutions.",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      date: "March 15, 2024",
      category: "Funding"
    },
    {
      id: 3,
      title: "Revolutionary AI Diagnostics Platform Transforms Vehicle Assessment Process",
      summary: "BluMotiv launches breakthrough AI-powered diagnostic system that evaluates vehicle retrofit compatibility in real-time, reducing assessment time by 80% while providing unprecedented accuracy in conversion planning.",
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      date: "January 22, 2024",
      category: "Technology"
    },
    {
      id: 4,
      title: "BluMotiv Opens State-of-the-Art Research and Development Center",
      summary: "New 75,000 square foot facility in Detroit will serve as the company's flagship R&D hub, featuring advanced testing laboratories and accelerated prototyping capabilities for next-generation EV retrofit systems.",
      image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
      date: "November 8, 2023",
      category: "Expansion"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors = {
      'Partnership': '#247FFF',
      'Technology': '#10B981', 
      'Funding': '#8B5CF6',
      'Expansion': '#06B6D4'
    };
    return colors[category as keyof typeof colors] || '#247FFF';
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="w-full py-16 px-6 border-b border-gray-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-6xl max-w-4xl mx-auto" style={{ color: '#F0F8FE' }}>
              Latest News & Updates
            </h1>
            


            {/* News Sticker */}

          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="w-full py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Featured News - Large Card */}
          {newsArticles.filter(article => article.featured).map((article, index) => (
            <div key={article.id} className="mb-16">
              <div className="backdrop-blur-md border border-gray-700/30 rounded-2xl overflow-hidden shadow-2xl" style={{ backgroundColor: '#304461' }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  {/* Image */}
                  <div className="relative h-96 lg:h-auto overflow-hidden">
                    <ImageWithFallback
                      src={article.image}
                      alt="Professional business handshake representing the strategic partnership between Dassault Systèmes and BluMotiv in AI-powered EV solutions and sustainable mobility technology"
                      className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span 
                        className="backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${getCategoryColor(article.category)}80`,
                          color: '#F0F8FE'
                        }}
                      >
                        {article.category}
                      </span>
                    </div>

                  </div>

                  {/* Content */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-green-400 flex-shrink-0"></div>
                        <div className="h-px bg-green-400/30 flex-1"></div>
                        <span className="text-green-400 text-sm font-medium">{article.date}</span>
                      </div>

                      <h2 className="text-2xl lg:text-3xl" style={{ color: '#F0F8FE' }}>
                        {article.title}
                      </h2>
                      
                      <p className="text-lg leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                        {article.summary}
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={onOpenDetail}
                        className="px-8 py-3 rounded-full transition-all duration-300 hover:opacity-90 hover:scale-105"
                        style={{ 
                          backgroundColor: '#247FFF',
                          color: '#F0F8FE'
                        }}
                      >
                        Read Full Article
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* News Grid - Smaller Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsArticles.filter(article => !article.featured).map((article, index) => (
              <div key={article.id} className="group">
                <div className="backdrop-blur-sm border border-gray-700/20 rounded-xl overflow-hidden hover:border-gray-600/30 transition-all duration-300 hover:scale-105 hover:opacity-90" style={{ backgroundColor: '#304461' }}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span 
                        className="backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${getCategoryColor(article.category)}80`,
                          color: '#F0F8FE'
                        }}
                      >
                        {article.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div className="text-xs" style={{ color: 'rgba(240, 248, 254, 0.6)' }}>
                      {article.date}
                    </div>

                    <h3 className="text-lg leading-tight" style={{ color: '#F0F8FE' }}>
                      {article.title}
                    </h3>
                    
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.7)' }}>
                      {article.summary}
                    </p>

                    <button
                      className="flex items-center space-x-2 text-sm transition-colors duration-300 hover:opacity-80"
                      style={{ color: '#247FFF' }}
                    >
                      <span>Read More</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}