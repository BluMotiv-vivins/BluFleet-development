import { ImageWithFallback } from './figma/ImageWithFallback';
import { ExternalLink } from 'lucide-react';
import prdVideo from 'figma:asset/prd.mp4';

interface ProductsPageProps {
  onNavigate: (page: string) => void;
}

export default function ProductsPage({ }: ProductsPageProps) {
  // Microsoft Forms URL - Same form for both products
  const microsoftFormUrl = 'https://forms.office.com/Pages/ResponsePage.aspx?id=n50Y_y38lkesYw0081oC0YLuEpgeXVFPtnKTluv1gnhUNjYwNk8zS1M0UFhCSzJPTTdDTlJaOEtHSi4u';

  const products = [
    {
      id: 'forklift',
      title: '3T Forklift',
      subtitle: 'Electric Forklift Solution',
      status: 'Coming Soon',
      description: 'Advanced 3-ton electric forklift with intelligent battery management and precision control systems for optimal warehouse operations.',
      image: '/src/assets/3ftforklift.png',
      features: [
        'Electric drivetrain conversion',
        'Smart battery management',
        'Precision lifting controls',
        'Energy efficient operation'
      ]
    },
    {
      id: 'loader',
      title: '30T Loader', 
      subtitle: 'Heavy-Duty Mining Loader',
      status: 'Coming Soon',
      description: 'Next-generation 30-ton electric mining loader designed for sustainable heavy-duty operations in mining and construction.',
      image: '/src/assets/30tloader.png',
      features: [
        'Electric mining operations',
        'Heavy-duty performance',
        'Sustainable mining solutions',
        'Advanced control systems'
      ]
    }
  ];

  const handleProductInquiry = () => {
    // Open Microsoft Form in a new tab
    window.open(microsoftFormUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Video Section */}
      <section className="w-full">
        <div>
          <div className="relative w-full h-[484px] overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={prdVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-center text-[#F0F8FE] px-6 max-w-4xl leading-tight">
                Power, Precision, and Endurance Engineered to Conquer Mining's Harshest Frontiers.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Title Section */}
      <section className="w-full py-16 px-6 border-b border-gray-700/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-6xl max-w-4xl mx-auto" style={{ color: '#F0F8FE' }}>
              Our Products
            </h1>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="w-full py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Products Grid - Two Equal Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {products.map((product, index) => (
              <div key={product.id} className="group">
                <div className="backdrop-blur-sm border border-gray-700/20 overflow-hidden hover:border-gray-600/30 transition-all duration-300 hover:scale-105 hover:opacity-90" style={{ backgroundColor: '#304461' }}>
                  {/* Image */}
                  <div className="relative h-80 overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.title}
                      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                        product.status === 'Coming Soon' ? 'filter grayscale' : ''
                      }`}
                    />
                    <div className="absolute top-4 left-4">
                      <span 
                        className="backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: product.status === 'Available' ? '#247FFF80' : '#6B728080',
                          color: '#F0F8FE'
                        }}
                      >
                        {product.subtitle}
                      </span>
                    </div>
                    
                    {/* Coming Soon Tag for the loader */}
                    {product.status === 'Coming Soon' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 backdrop-blur-sm px-6 py-3 rounded-lg">
                          <span className="text-white text-lg font-bold">Coming Soon</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-green-400 flex-shrink-0"></div>
                      <div className="h-px bg-green-400/30 flex-1"></div>
                      <span className="text-green-400 text-sm font-medium">
                        {index === 0 ? 'Q1 2026' : 'Q2 2026'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-medium" style={{ color: '#F0F8FE' }}>
                      {product.title}
                    </h3>
                    
                    <p className="text-base leading-relaxed" style={{ color: 'rgba(240, 248, 254, 0.8)' }}>
                      {product.description}
                    </p>

                    <button
                      onClick={handleProductInquiry}
                      className="w-full px-6 py-3 rounded-full transition-all duration-300 hover:opacity-90 hover:scale-105 mt-4 flex items-center justify-center gap-2"
                      style={{ 
                        backgroundColor: '#3B82F6',
                        color: '#FFFFFF'
                      }}
                    >
                      Express Interest
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
