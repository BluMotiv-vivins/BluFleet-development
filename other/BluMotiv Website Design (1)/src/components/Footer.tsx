import { Mail, Linkedin, Twitter, Github } from 'lucide-react';
import blumotivLogo from 'figma:asset/c8af9e0c9bde92809a43c8512d804b783ac0ee07.png';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Solutions', id: 'solutions' },
    { name: 'News', id: 'news' },
    { name: 'Career', id: 'career' }
  ];

  const handleLinkClick = (pageId: string) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  return (
    <footer className="bg-gray-950 border-t border-[#F0F8FE]/10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center mb-6">
              <img 
                src={blumotivLogo} 
                alt="BluMotiv Logo" 
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            <p className="text-base sm:text-lg text-[#F0F8FE]/80 mb-6 max-w-md">
              Leading the future of sustainable mobility through innovative fleet management 
              solutions and intelligent powertrain systems. Transforming transportation 
              for a cleaner, more efficient world.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-3 sm:space-x-4">
              <a 
                href="https://www.linkedin.com/company/blumotiv/posts/?feedView=all" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#F0F8FE]/10 backdrop-blur-sm border border-[#F0F8FE]/20 rounded-lg p-3 sm:p-4 text-[#F0F8FE] hover:bg-green-500/20 hover:border-green-400/40 transition-all duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center touch-target"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a 
                href="#" 
                className="bg-[#F0F8FE]/10 backdrop-blur-sm border border-[#F0F8FE]/20 rounded-lg p-3 sm:p-4 text-[#F0F8FE] hover:bg-green-500/20 hover:border-green-400/40 transition-all duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center touch-target"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="bg-[#F0F8FE]/10 backdrop-blur-sm border border-[#F0F8FE]/20 rounded-lg p-3 sm:p-4 text-[#F0F8FE] hover:bg-green-500/20 hover:border-green-400/40 transition-all duration-300 min-w-[48px] min-h-[48px] flex items-center justify-center touch-target"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg sm:text-xl text-[#F0F8FE] mb-6">Quick Links</h4>
            <ul className="space-y-3 sm:space-y-4">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => handleLinkClick(link.id)}
                    className="text-base sm:text-lg text-[#F0F8FE]/70 hover:text-green-400 transition-colors duration-300 text-left w-full py-2 touch-target"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="text-lg sm:text-xl text-[#F0F8FE] mb-6">Contact Us</h4>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 mb-4">
                <span className="text-xl mt-1 flex-shrink-0">🇬🇧</span>
                <div>
                  <p className="text-base sm:text-lg text-[#F0F8FE]/80">
                    1-C, Bourne Court, Southend Road,<br />
                    South Woodford, IG8 8HD,<br />
                    London, UK
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-xl mt-1 flex-shrink-0">🇮🇳</span>
                <div>
                  <p className="text-base sm:text-lg text-[#F0F8FE]/80">
                    T-Hub, Raidurgam,<br />
                    Hyderabad, Telangana 500081,<br />
                    India
                  </p>
                </div>
              </div>
              

              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-green-400 flex-shrink-0" />
                <a 
                  href="mailto:connect@blumotiv.com" 
                  className="text-base sm:text-lg text-[#F0F8FE]/80 hover:text-green-400 transition-colors duration-300 py-2 touch-target"
                >
                  connect@blumotiv.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#F0F8FE]/10 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 text-center sm:text-left">
            {/* Copyright */}
            <p className="text-base sm:text-lg text-[#F0F8FE]/60">
              © {currentYear} BluMotiv. All rights reserved.
            </p>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
              <a 
                href="#" 
                className="text-base sm:text-lg text-[#F0F8FE]/60 hover:text-green-400 transition-colors duration-300 py-2 touch-target"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className="text-base sm:text-lg text-[#F0F8FE]/60 hover:text-green-400 transition-colors duration-300 py-2 touch-target"
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className="text-base sm:text-lg text-[#F0F8FE]/60 hover:text-green-400 transition-colors duration-300 py-2 touch-target"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}