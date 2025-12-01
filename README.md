# Game4U - Gamification Dashboard

A comprehensive Angular-based gamification dashboard for tracking KPIs, player progress, and company performance metrics integrated with the Funifier API.

## 🎯 Features

- **KPI Tracking**: Monitor key performance indicators with circular progress displays
- **Player Management**: Track player progress, points, and seasonal achievements
- **Company Analytics**: View company performance metrics and detailed analytics
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG 2.1 AA compliant with comprehensive accessibility features
- **Performance Optimized**: Lazy loading, virtual scrolling, and performance monitoring
- **Multi-language Support**: Portuguese (pt-BR) and English (en-US)

## 📋 Prerequisites

- Node.js (version 16 or higher)
- npm (version 8 or higher)
- Angular CLI (version 16 or higher)

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd game4u-front
```

2. Install dependencies:
```bash
npm install
```

3. Install Angular CLI globally (if not already installed):
```bash
npm install -g @angular/cli
```

## ⚙️ Configuration

### Environment Setup

Configure the Funifier API settings in the environment files:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://your-dev-api-endpoint.com',
  apiKey: 'your-dev-api-key'
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-prod-api-endpoint.com',
  apiKey: 'your-prod-api-key'
};
```

## 💻 Development

### Start Development Server
```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you make changes.

### Build for Production
```bash
npm run build
# or
ng build --configuration=production
```

The build artifacts will be stored in the `dist/` directory.

## 🧪 Testing

### Unit Tests
```bash
npm test
# or
ng test
```

### Property-Based Tests
```bash
npm run test:pbt
```

### Accessibility Tests
```bash
npm run test:accessibility
```

### Performance Tests
```bash
npm run test:performance
```

### Code Coverage
```bash
ng test --code-coverage
```

Coverage reports will be generated in the `coverage/` directory.

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components (c4u-* prefix)
│   │   ├── c4u-card/
│   │   ├── c4u-modal/
│   │   ├── c4u-company-table/
│   │   └── ...
│   ├── modals/             # Modal dialog components
│   │   ├── modal-company-detail/
│   │   └── ...
│   ├── pages/              # Page components
│   │   └── dashboard/
│   ├── services/           # Business logic services
│   │   ├── funifier-api.service.ts
│   │   ├── kpi.service.ts
│   │   └── ...
│   ├── model/              # Data models and interfaces
│   ├── providers/          # Interceptors, auth, session
│   ├── utils/              # Constants and helpers
│   ├── testing/            # Test utilities and fixtures
│   └── shared.module.ts    # Shared module
├── styles/                 # Global styles and themes
│   ├── variables.scss
│   ├── mixins.scss
│   └── animations.scss
├── assets/                 # Static assets
│   └── i18n/              # Translation files
└── environments/           # Environment configurations
```

## 🎨 Key Components

- **Gamification Dashboard**: Main dashboard page with KPI overview
- **Company Table**: Sortable and filterable company data display
- **Process Accordion**: Expandable process tracking interface
- **Modal Components**: Detailed views for companies and processes
- **Progress Components**: Various progress indicators and visualizations

## 🔧 Code Conventions

### Components
- Use `c4u-*` prefix for all custom components
- Follow folder structure: `c4u-name/` → `c4u-name.component.{ts,html,scss,spec.ts}`

### Services
- Singleton pattern with `providedIn: 'root'`
- Comprehensive error handling via NotificationService
- Use RxJS operators for data transformation

### Models
- Interfaces only, suffix `.model.ts`
- Strong typing, avoid `any` unless justified

### Unsubscribe Pattern
```typescript
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe();
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## 🌐 Internationalization

Translation keys are stored in:
- `assets/i18n/pt-BR.json` (Portuguese - Default)
- `assets/i18n/en-US.json` (English)

## ⚡ Performance Features

- Lazy loading for modal components
- Virtual scrolling for large datasets
- Performance monitoring service
- OnPush change detection strategy
- Efficient data caching

## ♿ Accessibility Features

- ARIA labels and descriptions
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- WCAG 2.1 AA compliant

## 🌍 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t game4u-front .
```

### Run Container
```bash
docker run -d -p 80:80 --name game4u-front game4u-front
```

### Using Docker Compose
```bash
docker-compose up -d
```

## 📚 Additional Documentation

- [API Integration Guide](docs/API_INTEGRATION.md)
- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Performance Optimizations](docs/PERFORMANCE_OPTIMIZATIONS.md)
- [Final Integration Test Results](docs/FINAL_INTEGRATION_TEST_RESULTS.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure quality (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Angular Documentation](https://angular.io/docs)
- [Funifier API Documentation](https://funifier.com/docs)
- [Project Specifications](.kiro/specs/gamification-dashboard/)
