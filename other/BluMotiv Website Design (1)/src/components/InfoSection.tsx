import { motion, useInView } from 'motion/react';
import { useRef } from 'react';
import electricTruck from 'figma:asset/fdeb3ddba0107c7a2697ee64b6d82a63665fa05b.png';

export default function InfoSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    'Electric Vehicle Fleet Optimisation',
    'AI-based Route Planning', 
    'Urban Micro-Mobility Platforms',
    'Smart Infrastructure Integration',
  ];

  return (
    <section ref={ref} className="bg-gray-900 py-12 sm:py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Mission Row */}
        <motion.div 
          className="border border-[#F0F8FE]/20 p-6 sm:p-8 lg:p-12 bg-black/20"
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          whileHover={{ 
            borderColor: "rgba(34, 197, 94, 0.3)",
            backgroundColor: "rgba(0, 0, 0, 0.3)"
          }}
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            {/* Electric Truck Icon */}
            <div 
              className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] flex items-center justify-center flex-shrink-0"
            >
              <img 
                src={electricTruck} 
                alt="Electric Truck" 
                className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] object-contain"
              />
            </div>
            
            {/* Content */}
            <motion.div 
              className="space-y-4 sm:space-y-6 text-center md:text-left"
              initial={{ x: 30, opacity: 0 }}
              animate={isInView ? { x: 0, opacity: 1 } : { x: 30, opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.h2 
                className="text-xl sm:text-2xl lg:text-3xl text-[#F0F8FE]"
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Driving the Future of Sustainable Mobility
              </motion.h2>
              <motion.h3 
                className="text-base sm:text-lg lg:text-xl text-green-400"
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                At BluMotiv, we envision a cleaner, smarter world powered by intelligent, 
                sustainable mobility solutions.
              </motion.h3>
              <motion.p 
                className="text-base sm:text-lg text-[#F0F8FE]/70 leading-relaxed"
                initial={{ y: 20, opacity: 0 }}
                animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                We are on a mission to revolutionise how people and goods move, by combining 
                cutting-edge AI with green technologies. Our goal is to build scalable, 
                human-centric mobility systems that reduce emissions, optimise operations, 
                and enable a sustainable future.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            return (
              <div
                key={index}
                className="border border-[#F0F8FE]/20 border-t-0 p-6 sm:p-8 bg-black/20 text-center min-h-[120px] flex items-center justify-center"
              >
                <h3 className="text-lg sm:text-xl lg:text-2xl text-[#F0F8FE] leading-tight">
                  {service}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}