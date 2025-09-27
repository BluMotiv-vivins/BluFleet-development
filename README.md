# BluFleet - Electric Vehicle Fleet Management System

**A comprehensive, production-ready fleet management platform for electric vehicles with real-time monitoring, predictive analytics, and intelligent automation.**

## 🚀 Features

### Core Fleet Management
- **Real-time Vehicle Tracking** - GPS monitoring with geofencing and route optimization
- **Battery Management** - SOC/SOH monitoring, charging optimization, and energy analytics
- **Driver Management** - Performance scoring, safety analytics, and behavior monitoring
- **Trip Management** - Route planning, efficiency tracking, and automated reporting

### Advanced Analytics
- **Predictive Maintenance** - AI-powered failure prediction and maintenance scheduling
- **Energy Optimization** - Smart charging, V2G integration, and cost optimization
- **Fleet KPIs** - Comprehensive dashboards with real-time metrics
- **Sustainability Tracking** - CO₂ savings, renewable energy integration

### Enterprise Features
- **Multi-tenant Architecture** - Organization-based data isolation
- **Role-based Access Control** - Granular permissions and security
- **API-first Design** - RESTful APIs with comprehensive documentation
- **Real-time Updates** - WebSocket-based live data streaming

## 🏗️ Architecture

### Microservices Backend
- **API Gateway** (Port 3000) - Authentication, routing, rate limiting
- **Fleet Monitoring** (Port 3001) - Vehicle tracking, geofencing, telemetry
- **Energy & Charging** (Port 3002) - Battery management, charging optimization
- **Maintenance** (Port 3003) - Predictive maintenance, scheduling
- **Safety & Compliance** (Port 3004) - Incident management, regulatory compliance
- **Analytics** (Port 3005) - KPIs, reporting, business intelligence
- **Insurance & Finance** (Port 3006) - Claims processing, cost optimization
- **Integration & IoT** (Port 3007) - Third-party APIs, device management
- **Security & Access** (Port 3008) - Authentication, authorization, audit

### Frontend Application
- **React 18** with TypeScript for type safety
- **Redux Toolkit** for state management
- **Tailwind CSS** for responsive design
- **Mapbox** for interactive mapping
- **Real-time WebSocket** connections

### Database Layer
- **PostgreSQL** - Primary database with ACID compliance
- **Redis** - Caching and session management
- **Time-series data** support for telemetry

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js with comprehensive middleware
- **Database**: PostgreSQL with proper indexing and constraints
- **Cache**: Redis for performance optimization
- **Authentication**: JWT with refresh tokens
- **Validation**: Joi for input validation
- **Logging**: Winston with structured logging
- **Testing**: Jest with comprehensive test coverage

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for fast development and builds
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Docker Compose for development
- **Database**: PostgreSQL 15 with proper migrations
- **Reverse Proxy**: Nginx for production deployment
- **Environment**: Comprehensive environment configuration

## 🚦 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git** for version control

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blufleet
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose**
   ```bash
   # Start all services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

4. **Manual Setup (Alternative)**
   ```bash
   # Backend services
   cd backend
   npm install
   npm run migrate  # Run database migrations
   npm run seed     # Insert sample data
   npm run dev      # Start all microservices
   
   # Frontend (in new terminal)
   cd frontend
   npm install
   npm run dev      # Start development server
   ```

### Access Points
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs
- **Database**: localhost:5432 (blufleet/blufleet_dev_password)

## 📊 API Documentation

### Authentication
```bash
# Login
POST /api/auth/login
{
  "email": "admin@blufleet.com",
  "password": "password"
}

# Get current user
GET /api/auth/me
Authorization: Bearer <token>
```

### Fleet Management
```bash
# Get vehicles
GET /api/vehicles?page=1&limit=20&status=active

# Create vehicle
POST /api/vehicles
{
  "vin": "1HGBH41JXMN109186",
  "make": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "vehicleType": "sedan"
}

# Get real-time telemetry
GET /api/vehicles/{id}/telemetry?timeRange=24h
```

### Analytics
```bash
# Dashboard metrics
GET /api/analytics/dashboard?timeframe=24h

# Energy analytics
GET /api/analytics/energy?timeframe=7d

# Export data
GET /api/analytics/export?type=vehicles&format=csv
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:coverage     # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm run test              # Unit tests
npm run test:ui           # Interactive test UI
npm run test:e2e          # End-to-end tests
npm run test:coverage     # Coverage report
```

### API Testing
```bash
# Test complete system
./test-complete-system.sh

# Test individual services
curl http://localhost:3000/health
curl http://localhost:3001/health
```

## 🚀 Production Deployment

### Docker Production Build
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)
```bash
# Security
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
DATABASE_URL=<production-database-url>

# External Services
AWS_ACCESS_KEY_ID=<aws-key>
AWS_SECRET_ACCESS_KEY=<aws-secret>
MAPBOX_ACCESS_TOKEN=<mapbox-token>

# Monitoring
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=warn
```

### Database Migration
```bash
# Run migrations in production
npm run migrate:production

# Backup database
pg_dump $DATABASE_URL > backup.sql
```

## 📈 Performance & Monitoring

### Key Metrics
- **API Response Time**: < 200ms for 95th percentile
- **Database Queries**: Optimized with proper indexing
- **Memory Usage**: < 512MB per microservice
- **CPU Usage**: < 70% under normal load

### Monitoring Stack
- **Health Checks**: Built-in health endpoints for all services
- **Logging**: Structured JSON logs with Winston
- **Metrics**: Performance monitoring and alerting
- **Error Tracking**: Comprehensive error handling and reporting

### Performance Optimizations
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis caching for frequently accessed data
- **Code Splitting**: Lazy loading for frontend components
- **Bundle Optimization**: Minimized JavaScript bundles

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens** with secure refresh mechanism
- **Role-based Access Control** with granular permissions
- **API Rate Limiting** to prevent abuse
- **Input Validation** and sanitization

### Data Protection
- **Encryption at Rest** for sensitive data
- **TLS 1.3** for data in transit
- **SQL Injection Prevention** with parameterized queries
- **XSS Protection** with content security policies

### Compliance
- **GDPR Ready** with data privacy controls
- **Audit Logging** for all critical operations
- **Security Headers** for web application protection
- **Regular Security Updates** and vulnerability scanning

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper tests
4. Run linting and tests (`npm run lint && npm run test`)
5. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **TypeScript** for type safety
- **ESLint + Prettier** for code formatting
- **Conventional Commits** for commit messages
- **Test Coverage** > 80% for new features
- **Documentation** for all public APIs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Docs**: Available at `/docs` endpoint
- **Architecture Guide**: See `docs/ARCHITECTURE.md`
- **Deployment Guide**: See `docs/DEPLOYMENT.md`

### Getting Help
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

### Troubleshooting

#### Common Issues
1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL is running
   docker-compose ps postgres
   
   # Check connection
   psql postgresql://blufleet:blufleet_dev_password@localhost:5432/blufleet
   ```

2. **Frontend Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **API Authentication Issues**
   ```bash
   # Check JWT secret is set
   echo $JWT_SECRET
   
   # Verify token format
   curl -H "Authorization: Bearer <token>" http://localhost:3000/api/auth/me
   ```

---

**BluFleet** - Powering the future of electric vehicle fleet management with intelligent automation and real-time insights.