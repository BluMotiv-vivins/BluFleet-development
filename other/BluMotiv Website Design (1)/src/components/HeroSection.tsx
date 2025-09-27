import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import Credits from './Credits';

interface HeroSectionProps {
  onScrollToExplore?: () => void;
  credits?: Array<{
    type: 'photo' | 'video';
    author: string;
    authorUrl?: string;
    source: string;
    sourceUrl: string;
    description?: string;
  }>;
}

export default function HeroSection({ onScrollToExplore, credits }: HeroSectionProps) {
  const partners = ['Matlab', 'Dassault Systemes', 'NVIDIA', 'AWS', 'Azure', 'Google Cloud'];

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://videos.pexels.com/video-files/2711276/2711276-uhd_3840_2160_24fps.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content Container */}
      <motion.div 
        className="relative z-10 flex flex-col justify-end items-center text-center px-4 sm:px-6 max-w-6xl mx-auto flex-1 pt-24 sm:pt-32 pb-12 sm:pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        {/* Main Title */}
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#F0F8FE] leading-tight font-bold"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        >
          <motion.span
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Pioneering Smart
          </motion.span>
          <br />
          <motion.span 
            className="text-green-400"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            Sustainable Mobility
          </motion.span>
        </motion.h1>

        {/* Spacer for responsive gap */}
        <div className="h-12 sm:h-16 lg:h-20"></div>

        {/* Trusted Partners */}
        <motion.div 
          className="w-full"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
        >
          <motion.p 
            className="text-[#F0F8FE]/60 text-base sm:text-lg mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 2 }}
          >
            Our Trusted Partners
          </motion.p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {partners.map((partner, index) => (
              <motion.span
                key={partner}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-[#F0F8FE]/10 border border-[#F0F8FE]/20 text-[#F0F8FE]/80 text-sm sm:text-base backdrop-blur-sm min-h-[36px] flex items-center justify-center touch-target"
                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 2.2 + (index * 0.1),
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.05, 
                  backgroundColor: "rgba(36, 127, 255, 0.1)",
                  borderColor: "rgba(36, 127, 255, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                {partner}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Spacer for responsive gap */}
        <div className="h-12 sm:h-16 lg:h-20"></div>

        {/* Scroll Indicator */}
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 3 }}
        >
          <motion.div
            className="flex flex-col items-center cursor-pointer group"
            onClick={onScrollToExplore}
            animate={{ 
              y: [0, -8, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#247FFF] flex items-center justify-center group-hover:bg-[#247FFF]/80 transition-colors touch-target"
              whileHover={{ 
                backgroundColor: "rgba(36, 127, 255, 0.8)",
                boxShadow: "0 0 20px rgba(36, 127, 255, 0.4)"
              }}
            >
              <ChevronDown 
                size={24} 
                className="text-[#F0F8FE] transition-colors" 
              />
            </motion.div>
            <motion.p 
              className="text-[#F0F8FE]/60 text-base sm:text-lg mt-3 group-hover:text-[#247FFF] transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 3.5 }}
            >
              Scroll to explore
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Credits Icon */}
      {credits && <Credits credits={credits} />}
    </section>
  );
}