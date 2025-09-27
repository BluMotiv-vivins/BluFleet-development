# FleetVolt Pro

**Powering Sustainable Fleet Operations**

A professional, modern web-based fleet management software dashboard specifically designed for electric vehicle fleets. The interface is clean, data-driven, and optimized for fleet managers overseeing industrial operations.

## 🚀 Features

- **Real-time Fleet Monitoring**: Track vehicle locations, battery levels, and operational status
- **Interactive Mapping**: Mapbox integration for fleet visualization and route management
- **Battery Management**: Comprehensive charging station management and energy optimization
- **Driver Performance**: Safety scoring and eco-driving analytics
- **Alert System**: Proactive notifications for maintenance, safety, and operational issues
- **Responsive Design**: Desktop-first with mobile and tablet support
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux Toolkit with RTK Query
- **Testing**: Vitest + React Testing Library
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier
- **Maps**: Mapbox GL JS
- **Charts**: Recharts

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── ui/             # Reusable UI components
│   ├── dashboard/      # Dashboard-specific components
│   └── map/            # Map-related components
├── hooks/              # Custom React hooks
├── store/              # Redux store and slices
├── services/           # API services and utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and constants
└── test/               # Test setup and utilities
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fleetvolt-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🎨 Design System

### Colors

- **Primary Blue**: `#0066ff` - Buttons, links, active states
- **Success Green**: `#10b981` - Positive metrics, status indicators
- **Warning Orange**: `#f59e0b` - Alerts, cautions
- **Danger Red**: `#ef4444` - Critical alerts, errors
- **Dark Navy**: `#1a2332` - Sidebar, headers
- **Light Gray**: `#f8fafc` - Main content background

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components

- **Cards**: White background, 8px border radius, subtle shadows
- **Buttons**: Primary and secondary variants with hover states
- **Status Indicators**: Color-coded badges for different states

## 🧪 Testing

The project uses Vitest and React Testing Library for testing:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Code Quality

- **ESLint**: Configured with TypeScript and React rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict type checking enabled
- **Husky**: Git hooks for pre-commit checks (to be added)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
VITE_MAPBOX_TOKEN=your_mapbox_token
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

### Tailwind CSS

Custom design system configured in `tailwind.config.js` with:
- Extended color palette
- Custom spacing and typography
- Component utilities
- Responsive breakpoints

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Docker Support

```dockerfile
# Dockerfile example (to be created)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**FleetVolt Pro** - Built with ⚡ for sustainable fleet operations