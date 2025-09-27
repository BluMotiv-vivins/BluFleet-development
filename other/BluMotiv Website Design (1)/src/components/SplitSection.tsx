import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import evChargingImage from 'figma:asset/fe0c50f4319ff9403d37846467d2320c8b66a3b1.png';
import agriculturalImage from 'figma:asset/c51e5da69312e51e320cc131f51355b6e3ac580d.png';

interface SplitSectionProps {
  onNavigate?: (page: string) => void;
}

export default function SplitSection({ onNavigate }: SplitSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { title: 'AI/ML', subtitle: 'Predictive Capabilities' },
    { title: 'ZERO', subtitle: 'Prototyping Framework' },
    { title: '100%', subtitle: 'Digital-First Validation' },
  ];

  return (
    <section ref={ref} className="grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: 'calc(100vh - 300px)' }}>
      {/* Left Section */}
      <motion.div 
        className="relative bg-gray-800 flex flex-col justify-center p-6 sm:p-8 lg:p-16 min-h-[500px] sm:min-h-[600px]"
        initial={{ x: -100, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : { x: -100, opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-gray-800 to-gray-900">
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
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="bg-black/30 border border-[#F0F8FE]/10 rounded-lg p-6 sm:p-8 text-center backdrop-blur-sm min-h-[120px] flex flex-col justify-center"
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={isInView ? { y: 0, opacity: 1, scale: 1 } : { y: 50, opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, delay: 0.3 + (index * 0.2), ease: "easeOut" }}
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderColor: "rgba(36, 127, 255, 0.3)"
                }}
              >
                <motion.div 
                  className="text-3xl sm:text-4xl lg:text-5xl text-[#F0F8FE] mb-2"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + (index * 0.2), type: "spring" }}
                >
                  {stat.title}
                </motion.div>
                <motion.div 
                  className="text-base sm:text-lg text-[#F0F8FE]/70"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + (index * 0.2) }}
                >
                  {stat.subtitle}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Section Content */}
          <motion.div 
            className="space-y-6 sm:space-y-8"
            initial={{ y: 30, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <motion.h2 
              className="text-2xl sm:text-3xl lg:text-4xl text-[#F0F8FE]"
              initial={{ x: -20, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Accelerating EV Adoption
            </motion.h2>
            <motion.p 
              className="text-base sm:text-lg text-[#F0F8FE]/80 leading-relaxed"
              initial={{ x: -20, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
            >
              BluMotiv develops AI-driven, sustainable electrified transport solutions that accelerate 
              EV adoption through connected Electrofit technology and zero-prototyping innovation.
            </motion.p>
            <motion.button 
              onClick={() => onNavigate && onNavigate('solutions')}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-medium rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-base sm:text-lg min-h-[48px] touch-target"
              style={{ 
                backgroundColor: '#247FFF',
                color: '#F0F8FE'
              }}
              initial={{ x: -20, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 15px 40px rgba(36, 127, 255, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              Explore Solutions
              <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section */}
      <motion.div 
        className="relative bg-green-900 flex flex-col justify-center p-6 sm:p-8 lg:p-16 min-h-[500px] sm:min-h-[600px]"
        initial={{ x: 100, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : { x: 100, opacity: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-900 to-gray-900">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="https://videos.pexels.com/video-files/16648081/16648081-uhd_3840_2160_30fps.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <motion.div 
          className="relative z-10 space-y-6 sm:space-y-8"
          initial={{ y: 30, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 30, opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.h2 
            className="text-2xl sm:text-3xl lg:text-4xl text-[#F0F8FE]"
            initial={{ x: 20, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            Who We Are
          </motion.h2>
          <motion.p 
            className="text-base sm:text-lg text-[#F0F8FE]/80 leading-relaxed"
            initial={{ x: 20, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            BluMotiv is a deep-tech mobility company pioneering smart, scalable, and sustainable 
            electrified transport. By integrating AI, cloud computing, and advanced simulations, 
            we develop cleaner, more efficient, and accessible electric mobility solutions with 
            a key focus on India and global markets.
          </motion.p>
          <motion.button 
            onClick={() => onNavigate && onNavigate('about')}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 font-medium rounded-full transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-base sm:text-lg min-h-[48px] touch-target"
            style={{ 
              backgroundColor: '#247FFF',
              color: '#F0F8FE'
            }}
            initial={{ x: 20, opacity: 0 }}
            animate={isInView ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 15px 40px rgba(36, 127, 255, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            Learn More
            <ChevronRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}