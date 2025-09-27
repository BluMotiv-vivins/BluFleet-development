# FleetVolt Pro Testing Documentation

## Overview

This document outlines the comprehensive testing strategy implemented for FleetVolt Pro, including unit tests, integration tests, E2E tests, performance tests, and component documentation.

## Test Structure

### Unit Tests
- **Location**: `src/**/__tests__/*.test.{ts,tsx}`
- **Framework**: Vitest + React Testing Library
- **Coverage**: Components, hooks, utilities, and services
- **Run Command**: `npm run test:unit`

### Integration Tests
- **Location**: `src/__tests__/integration/*.test.tsx`
- **Purpose**: Test component interactions and data flow
- **Run Command**: `npm run test:integration`

### Performance Tests
- **Location**: `src/__tests__/performance/*.test.tsx`
- **Purpose**: Validate rendering performance and memory usage
- **Run Command**: `npm run test:performance`

### E2E Tests
- **Location**: `e2e/*.spec.ts`
- **Framework**: Playwright
- **Purpose**: Test complete user workflows
- **Run Command**: `npm run test:e2e`

### Component Documentation
- **Location**: `src/**/*.stories.tsx`
- **Framework**: Storybook
- **Purpose**: Visual component documentation and testing
- **Run Command**: `npm run storybook`

## Test Coverage

### Components Tested
- ✅ UI Components (Button, KPICard, Modal, etc.)
- ✅ Dashboard Components (KPICards, BatteryPanel, etc.)
- ✅ Compliance Components (ComplianceDashboard, etc.)
- ✅ Layout Components (Header, Sidebar, etc.)
- ✅ Error Handling Components

### Hooks Tested
- ✅ useWebSocket
- ✅ useComplianceData
- ✅ useKPIData
- ✅ useBatteryData
- ✅ useMapData
- ✅ useDriverData
- ✅ useAlerts

### Utilities Tested
- ✅ Battery Calculations
- ✅ KPI Calculations
- ✅ Compliance Calculations
- ✅ Driver Calculations
- ✅ Alert Generation

### Services Tested
- ✅ WebSocket Service
- ✅ Mock WebSocket Server

## Test Configuration

### Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.storybook', '**/*.stories.*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/*.stories.*',
      ],
    },
  },
});
```

### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Test Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage --run",
    "test:unit": "vitest --run src/**/*.test.{ts,tsx}",
    "test:integration": "vitest --run src/**/*integration*.test.{ts,tsx}",
    "test:performance": "vitest --run src/**/*performance*.test.{ts,tsx}",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:storybook": "npx vitest --project=storybook",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:performance && npm run test:e2e"
  }
}
```

## CI/CD Integration

### GitHub Actions Workflow
- **File**: `.github/workflows/ci.yml`
- **Triggers**: Push to main/develop, Pull requests
- **Jobs**: 
  - Test Suite (Unit, Integration, Performance)
  - E2E Tests
  - Storybook Tests
  - Build
  - Deploy (Staging/Production)
  - Security Scan

### Test Stages
1. **Linting**: ESLint + Prettier
2. **Unit Tests**: Component and utility testing
3. **Integration Tests**: Cross-component functionality
4. **Performance Tests**: Rendering and memory validation
5. **E2E Tests**: Complete user workflows
6. **Coverage Report**: Code coverage analysis

## Performance Testing

### Metrics Tracked
- Component render times
- Memory usage
- Bundle size
- Real-time update performance
- Large dataset handling

### Performance Thresholds
- Component render: < 100ms
- Memory usage: < 50MB increase
- Bundle size: Monitored for increases
- Update frequency: Handles 1000+ items

## Accessibility Testing

### Tools Used
- @testing-library/jest-dom
- Storybook a11y addon
- Manual keyboard navigation testing

### Standards
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios

## Mock Data and Services

### Mock WebSocket Server
- **File**: `src/services/mockWebSocketServer.ts`
- **Purpose**: Simulate real-time updates in tests
- **Features**: Connection simulation, message broadcasting

### Mock Data Generators
- Vehicle data generation
- Charging station simulation
- Driver performance data
- Alert generation

## Test Utilities

### Custom Render Functions
```typescript
const renderWithProviders = (component, store) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};
```

### Test Store Creation
```typescript
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      fleet: fleetSlice.reducer,
      dashboard: dashboardSlice.reducer,
      alerts: alertSlice.reducer,
      ui: uiSlice.reducer,
    },
    preloadedState: initialState,
  });
};
```

## Documentation

### API Documentation
- **File**: `docs/API.md`
- **Content**: REST API endpoints, WebSocket API, data models
- **Purpose**: Integration reference for developers

### Deployment Guide
- **File**: `docs/DEPLOYMENT.md`
- **Content**: Environment setup, build process, deployment strategies
- **Purpose**: Production deployment reference

### Storybook Stories
- **Location**: `src/**/*.stories.tsx`
- **Purpose**: Visual component documentation
- **Features**: Interactive examples, accessibility testing

## Known Issues and Limitations

### Memory Usage
- Large test suites may encounter memory limits
- Recommendation: Run tests in smaller batches
- Consider increasing Node.js memory limit: `--max-old-space-size=4096`

### Test Flakiness
- Some WebSocket tests may be timing-dependent
- E2E tests may need retry logic for network-dependent operations
- Performance tests may vary based on system resources

## Best Practices

### Writing Tests
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Test user interactions, not implementation details
5. Include accessibility testing

### Maintaining Tests
1. Update tests when requirements change
2. Remove obsolete tests
3. Keep test data realistic but minimal
4. Regular test performance review

## Future Improvements

### Planned Enhancements
1. Visual regression testing
2. Cross-browser compatibility testing
3. Mobile device testing
4. Load testing for real-time features
5. Automated accessibility scanning

### Test Coverage Goals
- Maintain >80% code coverage
- 100% critical path coverage
- All user workflows covered by E2E tests
- Performance benchmarks for all major components

## Running Tests Locally

### Prerequisites
```bash
npm install
```

### Quick Test Run
```bash
npm test -- --run
```

### Full Test Suite
```bash
npm run test:all
```

### Coverage Report
```bash
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
```

### Storybook
```bash
npm run storybook
```

## Troubleshooting

### Common Issues
1. **Memory errors**: Increase Node.js memory limit
2. **Timeout errors**: Increase test timeout values
3. **Mock issues**: Verify mock implementations match real APIs
4. **E2E failures**: Check if development server is running

### Debug Commands
```bash
# Run tests in debug mode
npm test -- --inspect-brk

# Run specific test file
npm test -- src/components/ui/__tests__/Button.test.tsx

# Run tests with UI
npm run test:ui
```