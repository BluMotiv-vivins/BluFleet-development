/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      '4xl': '2560px',
    },
    extend: {
      colors: {
        // BluMotiv Brand Colors (retained)
        'blu-white': '#F0F8FE',
        'blu-blue': '#247FFF',
        'blu-dark': '#0E2794',
        'blu-navy': '#304461',
        'blu-gray': '#1F2937',
        
        // Primary palette based on BluMotiv
        primary: {
          50: '#F0F8FE',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#247FFF',
          600: '#0284C7',
          700: '#0369A1',
          800: '#0E2794',
          900: '#0C4A6E',
        },
        
        // Secondary colors
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        
        // Success colors (green for sustainability)
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        
        // Warning colors
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        
        // Danger colors
        danger: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D',
        },
        
        // Background colors
        background: {
          primary: '#0F172A',
          secondary: '#1E293B',
          tertiary: '#334155',
        },
        
        // Text colors
        text: {
          primary: '#F0F8FE',
          secondary: 'rgba(240, 248, 254, 0.8)',
          tertiary: 'rgba(240, 248, 254, 0.6)',
          muted: 'rgba(240, 248, 254, 0.4)',
        },
      },
      
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.025em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '6xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        '7xl': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
        '8xl': ['6rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      },
      
      spacing: {
        '0.5': '0.125rem',    // 2px
        '1.5': '0.375rem',    // 6px  
        '2.5': '0.625rem',    // 10px
        '3.5': '0.875rem',    // 14px
        '4.5': '1.125rem',    // 18px (Samsung standard)
        '5.5': '1.375rem',    // 22px
        '6.5': '1.625rem',    // 26px
        '7.5': '1.875rem',    // 30px
        '8.5': '2.125rem',    // 34px
        '9.5': '2.375rem',    // 38px
        '18': '4.5rem',       // 72px
        '20': '5rem',         // 80px
        '22': '5.5rem',       // 88px
        '24': '6rem',         // 96px
        '26': '6.5rem',       // 104px
        '28': '7rem',         // 112px
        '30': '7.5rem',       // 120px
        '32': '8rem',         // 128px
        '36': '9rem',         // 144px
        '40': '10rem',        // 160px
        '44': '11rem',        // 176px
        '48': '12rem',        // 192px
        '52': '13rem',        // 208px
        '56': '14rem',        // 224px
        '60': '15rem',        // 240px
        '64': '16rem',        // 256px
        '72': '18rem',        // 288px
        '80': '20rem',        // 320px
        '88': '22rem',        // 352px
        '96': '24rem',        // 384px
        '104': '26rem',       // 416px
        '112': '28rem',       // 448px
        '120': '30rem',       // 480px
        '128': '32rem',       // 512px
        '144': '36rem',       // 576px
        '160': '40rem',       // 640px
        '176': '44rem',       // 704px
        '192': '48rem',       // 768px
      },
      
      borderRadius: {
        'none': '0',
        'xs': '0.0625rem',    // 1px
        'sm': '0.125rem',     // 2px
        DEFAULT: '0.375rem',  // 6px
        'md': '0.5rem',       // 8px
        'lg': '0.75rem',      // 12px
        'xl': '1rem',         // 16px
        '2xl': '1.5rem',      // 24px (Samsung standard)
        '3xl': '2rem',        // 32px
        '4xl': '2.5rem',      // 40px
        'full': '9999px',
      },
      
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'btn': '0 4px 14px 0 rgba(36, 127, 255, 0.25)',
        'btn-hover': '0 6px 20px rgba(36, 127, 255, 0.4)',
        
        // Samsung-inspired shadows
        'samsung-xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'samsung-sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'samsung': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'samsung-md': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'samsung-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'samsung-xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'samsung-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'samsung-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        
        // Elevated Samsung-style shadows
        'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.04)',
        'elevation-2': '0 4px 8px rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 8px 16px rgba(0, 0, 0, 0.08)',
        'elevation-4': '0 16px 32px rgba(0, 0, 0, 0.12)',
        'elevation-5': '0 32px 64px rgba(0, 0, 0, 0.16)',
        
        // Interactive shadows
        'glow-blue': '0 0 20px rgba(36, 127, 255, 0.3)',
        'glow-blue-lg': '0 0 40px rgba(36, 127, 255, 0.4)',
      },
      
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      
      animation: {
        // Existing animations
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        
        // Samsung-inspired smooth animations
        'smooth-enter': 'smoothEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth-exit': 'smoothExit 0.3s cubic-bezier(0.4, 0, 1, 1)',
        'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-up': 'slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-down': 'slideInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in-down': 'fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'zoom-in': 'zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'zoom-out': 'zoomOut 0.3s cubic-bezier(0.4, 0, 1, 1)',
        'scale-up': 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-down': 'scaleDown 0.2s cubic-bezier(0.4, 0, 1, 1)',
        'bounce-subtle': 'bounceSubtle 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'gradient-shift': 'gradientShift 3s ease-in-out infinite',
        
        // Page transitions
        'page-enter': 'pageEnter 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'page-exit': 'pageExit 0.3s cubic-bezier(0.4, 0, 1, 1)',
        
        // Loading animations  
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      keyframes: {
        // Existing keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        
        // Samsung-inspired smooth keyframes
        smoothEnter: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px) scale(0.95)',
            filter: 'blur(4px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)'
          },
        },
        smoothExit: {
          '0%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)'
          },
          '100%': { 
            opacity: '0', 
            transform: 'translateY(-20px) scale(0.95)',
            filter: 'blur(4px)'
          },
        },
        slideInRight: {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(30px)',
            filter: 'blur(2px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0)',
            filter: 'blur(0px)'
          },
        },
        slideInLeft: {
          '0%': { 
            opacity: '0', 
            transform: 'translateX(-30px)',
            filter: 'blur(2px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateX(0)',
            filter: 'blur(0px)'
          },
        },
        slideInUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px)',
            filter: 'blur(2px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)',
            filter: 'blur(0px)'
          },
        },
        slideInDown: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(-30px)',
            filter: 'blur(2px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)',
            filter: 'blur(0px)'
          },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(40px)',
            filter: 'blur(3px)'
          },
          '60%': { 
            opacity: '0.8', 
            transform: 'translateY(10px)',
            filter: 'blur(1px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)',
            filter: 'blur(0px)'
          },
        },
        fadeInDown: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(-40px)',
            filter: 'blur(3px)'
          },
          '60%': { 
            opacity: '0.8', 
            transform: 'translateY(-10px)',
            filter: 'blur(1px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)',
            filter: 'blur(0px)'
          },
        },
        zoomIn: {
          '0%': { 
            opacity: '0', 
            transform: 'scale(0.8)',
            filter: 'blur(4px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'scale(1)',
            filter: 'blur(0px)'
          },
        },
        zoomOut: {
          '0%': { 
            opacity: '1', 
            transform: 'scale(1)',
            filter: 'blur(0px)'
          },
          '100%': { 
            opacity: '0', 
            transform: 'scale(0.8)',
            filter: 'blur(4px)'
          },
        },
        scaleUp: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(30px) scale(0.9)' 
          },
          '50%': { 
            opacity: '0.8', 
            transform: 'translateY(-5px) scale(1.02)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)' 
          },
        },
        glowPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(36, 127, 255, 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(36, 127, 255, 0.6)' 
          },
        },
        shimmer: {
          '0%': { 
            backgroundPosition: '-200% 0' 
          },
          '100%': { 
            backgroundPosition: '200% 0' 
          },
        },
        gradientShift: {
          '0%': { 
            backgroundPosition: '0% 50%' 
          },
          '50%': { 
            backgroundPosition: '100% 50%' 
          },
          '100%': { 
            backgroundPosition: '0% 50%' 
          },
        },
        pageEnter: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px) scale(0.98)',
            filter: 'blur(3px)'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)'
          },
        },
        pageExit: {
          '0%': { 
            opacity: '1', 
            transform: 'translateY(0) scale(1)',
            filter: 'blur(0px)'
          },
          '100%': { 
            opacity: '0', 
            transform: 'translateY(-20px) scale(0.98)',
            filter: 'blur(3px)'
          },
        },
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        
        // Samsung-inspired gradients
        'gradient-samsung': 'linear-gradient(135deg, #247FFF 0%, #0E2794 100%)',
        'gradient-samsung-subtle': 'linear-gradient(135deg, rgba(36, 127, 255, 0.1) 0%, rgba(14, 39, 148, 0.05) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        'gradient-dark-blue': 'linear-gradient(135deg, #0E2794 0%, #1E293B 100%)',
        'gradient-shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, rgba(36, 127, 255, 0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(14, 39, 148, 0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(36, 127, 255, 0.1) 0px, transparent 50%)',
      },
      
      // Samsung-inspired transition durations
      transitionDuration: {
        '50': '50ms',
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '450': '450ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
        '1200': '1200ms',
        '1500': '1500ms',
      },
      
      // Samsung-inspired transition timing functions
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'smooth-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'smooth-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-subtle': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      },
      
      // Enhanced z-index scale
      zIndex: {
        '1': '1',
        '2': '2',
        '3': '3',
        '4': '4',
        '5': '5',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'auto': 'auto',
      },
    },
  },
  plugins: [],
};