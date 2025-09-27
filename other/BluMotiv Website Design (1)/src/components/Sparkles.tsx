import { motion, useInView, AnimatePresence } from 'motion/react';
import { useRef, useEffect, useState, useCallback } from 'react';

interface SparkleProps {
  children: React.ReactNode;
  density?: 'low' | 'medium' | 'high';
  trigger?: 'idle' | 'hover' | 'click';
  className?: string;
}

interface Sparkle {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  opacity: number;
}

const sparkleShapes = ['●', '✦', '◆', '★', '✧'];

export default function Sparkles({ 
  children, 
  density = 'low', 
  trigger = 'idle',
  className = ''
}: SparkleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: "-100px" });
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getDensityCount = useCallback(() => {
    const baseCounts = { low: 12, medium: 16, high: 18 };
    const count = baseCounts[density];
    return isMobile ? Math.floor(count * 0.6) : count;
  }, [density, isMobile]);

  const generateSparkle = useCallback((bounds: DOMRect): Sparkle => {
    const padding = 20;
    return {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (bounds.width - padding * 2) + padding,
      y: Math.random() * (bounds.height - padding * 2) + padding,
      size: Math.random() * 4 + 2, // 2-6px
      delay: Math.random() * 5000, // 0-5s staggered start
      duration: Math.random() * 2000 + 5000, // 5-7s duration
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.3 + 0.3 // 30-60%
    };
  }, []);

  const generateBurstSparkles = useCallback((x: number, y: number, count: number, tight = false): Sparkle[] => {
    const radius = tight ? 30 : 50;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = Math.random() * radius + 10;
      return {
        id: Math.random().toString(36).substr(2, 9),
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        size: Math.random() * 3 + 2,
        delay: 0,
        duration: tight ? 250 : 400,
        rotation: Math.random() * 360,
        opacity: Math.random() * 0.4 + 0.4
      };
    });
  }, []);

  // Generate idle sparkles
  useEffect(() => {
    if (prefersReducedMotion || !isInView || trigger !== 'idle') return;

    const generateIdleSparkles = () => {
      if (!containerRef.current) return;
      
      const bounds = containerRef.current.getBoundingClientRect();
      const count = getDensityCount();
      
      const newSparkles = Array.from({ length: count }, () => generateSparkle(bounds));
      setSparkles(newSparkles);
    };

    generateIdleSparkles();
    const interval = setInterval(generateIdleSparkles, 6000); // Refresh every 6s

    return () => clearInterval(interval);
  }, [isInView, trigger, prefersReducedMotion, generateSparkle, getDensityCount]);

  const handleHover = useCallback(() => {
    if (prefersReducedMotion || trigger !== 'hover') return;
    
    if (containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      const burstSparkles = generateBurstSparkles(centerX, centerY, 8);
      
      setSparkles(prev => [...prev, ...burstSparkles]);
      
      // Clean up burst sparkles after animation
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => !burstSparkles.includes(s)));
      }, 500);
    }
  }, [prefersReducedMotion, trigger, generateBurstSparkles]);

  const handleClick = useCallback(() => {
    if (prefersReducedMotion || trigger !== 'click') return;
    
    if (containerRef.current) {
      const bounds = containerRef.current.getBoundingClientRect();
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;
      const burstSparkles = generateBurstSparkles(centerX, centerY, 10, true);
      
      setSparkles(prev => [...prev, ...burstSparkles]);
      
      // Clean up burst sparkles after animation
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => !burstSparkles.includes(s)));
      }, 300);
    }
  }, [prefersReducedMotion, trigger, generateBurstSparkles]);

  // Static fallback for reduced motion
  if (prefersReducedMotion) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        {children}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-[#F0F8FE]/20"
              style={{
                left: `${20 + i * 20}%`,
                top: `${15 + i * 15}%`,
                fontSize: '8px'
              }}
            >
              ✦
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={`relative ${className}`}
      onMouseEnter={handleHover}
      onClick={handleClick}
    >
      {children}
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
        <AnimatePresence>
          {sparkles.map((sparkle) => (
            <motion.div
              key={sparkle.id}
              className="absolute text-[#F0F8FE]"
              style={{
                left: sparkle.x,
                top: sparkle.y,
                fontSize: `${sparkle.size}px`,
                filter: 'blur(0.5px)',
              }}
              initial={{ 
                opacity: 0, 
                scale: 0,
                rotate: sparkle.rotation
              }}
              animate={{ 
                opacity: sparkle.opacity,
                scale: [0, 1, 1, 0],
                rotate: sparkle.rotation + 180,
                x: [0, Math.random() * 20 - 10],
                y: [0, Math.random() * 20 - 10]
              }}
              exit={{ 
                opacity: 0, 
                scale: 0 
              }}
              transition={{
                duration: sparkle.duration / 1000,
                delay: sparkle.delay / 1000,
                ease: "easeInOut",
                repeat: trigger === 'idle' ? Infinity : 0,
                repeatType: "loop"
              }}
            >
              {sparkleShapes[Math.floor(Math.random() * sparkleShapes.length)]}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}