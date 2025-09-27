'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import blumotivLogo from 'figma:asset/c8af9e0c9bde92809a43c8512d804b783ac0ee07.png';

interface NavigationProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function Navigation({ currentPage = 'home', onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Home', id: 'home', active: currentPage === 'home' },
    { name: 'About', id: 'about', active: currentPage === 'about' },
    { name: 'Solutions', id: 'solutions', active: currentPage === 'solutions' },
    { name: 'Products', id: 'products', active: currentPage === 'products' },
    { name: 'Insights', id: 'research', active: currentPage === 'research' },
    { name: 'News', id: 'news', active: currentPage === 'news' },
    { name: 'Career', id: 'career', active: currentPage === 'career' },
  ];

  // Auto-close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  const handleMenuClick = (pageId: string) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Navigation Bar */}
      <motion.nav 
        className="fixed top-3 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-md"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Glassmorphism Navigation Bar */}
        <motion.div 
          className="bg-black/20 backdrop-blur-md border border-[#F0F8FE]/10 rounded-full px-4 sm:px-6 py-3 flex items-center justify-between w-full"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Logo */}
          <motion.button
            onClick={() => onNavigate && onNavigate('home')}
            className="text-[#F0F8FE] font-medium cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <img 
              src={blumotivLogo} 
              alt="BluMotiv Logo" 
              className="h-6 sm:h-8 w-auto"
            />
          </motion.button>
          
          {/* Hamburger Menu */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-[#F0F8FE] hover:text-[#247FFF] transition-colors p-2 touch-target min-w-[44px] min-h-[44px] flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={20} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={20} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.nav>

      {/* Expanding Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-md border-b border-[#F0F8FE]/10"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {/* Spacer for the fixed navigation */}
            <div className="h-20"></div>
            
            {/* Menu Items */}
            <motion.div 
              className="px-6 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="max-w-sm mx-auto space-y-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => handleMenuClick(item.id)}
                    className={`block w-full text-left px-6 py-5 rounded-lg transition-all text-xl min-h-[60px] touch-target ${
                      item.active
                        ? 'text-[#F0F8FE] border-2 border-[#247FFF] bg-[#247FFF]/5'
                        : 'text-[#F0F8FE] hover:text-[#247FFF] hover:bg-[#F0F8FE]/5 border-2 border-transparent'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}