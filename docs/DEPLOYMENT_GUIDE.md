# Deployment Guide

## Overview

This guide covers the deployment process for the Game4U Gamification Dashboard across different environments including staging and production.

## Prerequisites

- Node.js 16+ installed
- Angular CLI installed globally
- Docker installed (for containerized deployment)
- Access to target deployment environment
- API credentials configured

## Environment Setup

### 1. Environment Configuration Files

Create environment-specific configuration files:

#### Development (`src/environments/environment.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://dev-api.funifier.com',
  apiKey: 'dev-api-key',
  enableLogging: true,
  cacheTimeout: 300000,
  retryAttempts: 3
};
```

#### Staging (`src/environments/environment.staging.ts`)
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.funifier.com',
  apiKey: 'staging-api-key',
  enableLogging: true,
  cacheTimeout: 600000,
  retryAttempts: 5
};
```

#### Production (`src/environments/environment.prod.ts`)
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.funifier.com',
  apiKey: 'prod-api-key',
  enableLogging: false,
  cacheTimeout: 900000,
  retryAttempts: 5
};
```

### 2. Build Configurations

Update `angular.json` with environment-specific build configurations:

```json
{
  "projects": {
    "game4u-front": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": false,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true,
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "2mb",
                  "maximumError": "5mb"
                }
              ]
            },
            "staging": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.staging.ts"
                }
              ],
              "optimization": true,
              "outputHashing": "all",
              "sourceMap": true,
              "namedChunks": false,
              "extractLicenses": true,
              "vendorChunk": false,
              "buildOptimizer": true
            }
          }
        }
      }
    }
  }
}
```

## Build Process

### 1. Development Build
```bash
ng build
```

### 2. Staging Build
```bash
ng build --configuration=staging
```

### 3. Production Build
```bash
ng build --configuration=production
```

### 4. Build Verification
```bash
# Check build output
ls -la dist/

# Verify file sizes
du -sh dist/*

# Test build locally
npx http-server dist/game4u-front -p 8080
```

## Docker Deployment

### 1. Build Docker Image
```bash
docker build -t game4u-front:latest .
```

### 2. Run Container
```bash
docker run -d -p 80:80 --name game4u-front game4u-front:latest
```

### 3. Using Docker Compose
```bash
docker-compose up -d
```

### 4. Verify Container
```bash
# Check container status
docker ps

# View logs
docker logs game4u-front

# Access container shell
docker exec -it game4u-front sh
```

## CI/CD Pipeline

### GitHub Actions Workflow

The project includes automated CI/CD pipelines in `.github/workflows/`:

- **ci-cd.yml**: Main pipeline for testing, building, and deploying
- **security.yml**: Security scanning and vulnerability checks

### Pipeline Stages

1. **Quality Check**
   - Linting
   - Type checking
   - Unit tests
   - Property-based tests
   - Code coverage

2. **Security Scan**
   - npm audit
   - Dependency vulnerability scanning
   - CodeQL analysis

3. **Build**
   - Build for staging and production
   - Bundle size analysis
   - Artifact upload

4. **Docker Build**
   - Multi-platform image build
   - Container registry push
   - Vulnerability scanning

5. **Deploy**
   - Staging deployment
   - Production deployment
   - Smoke tests

## Cloud Deployment

### AWS S3 + CloudFront

1. **Build the application**:
```bash
ng build --configuration=production
```

2. **Upload to S3**:
```bash
aws s3 sync dist/game4u-front s3://your-bucket-name --delete
```

3. **Invalidate CloudFront cache**:
```bash
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Azure Static Web Apps

1. **Create Azure Static Web App**
2. **Configure build settings**:
```yaml
app_location: "/"
api_location: ""
output_location: "dist/game4u-front"
```

### Netlify

1. **Create `netlify.toml`**:
```toml
[build]
  publish = "dist/game4u-front"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Kubernetes Deployment

### Staging Environment

Deploy to staging using:
```bash
kubectl apply -f k8s/staging/deployment.yml
```

### Production Environment

Deploy to production using:
```bash
kubectl apply -f k8s/production/deployment.yml
```

### Verify Deployment
```bash
# Check pod status
kubectl get pods -n production

# View logs
kubectl logs -f deployment/game4u-front-production -n production

# Check service
kubectl get svc -n production
```

## Environment Variables

### Production Environment Variables
```bash
# API Configuration
API_URL=https://api.funifier.com
API_KEY=your-production-api-key

# Application Settings
ENABLE_LOGGING=false
CACHE_TIMEOUT=900000
RETRY_ATTEMPTS=5

# Security
CSP_POLICY="default-src 'self'; script-src 'self' 'unsafe-inline'"
```

## Health Checks and Monitoring

### Health Check Endpoint

The application includes a `/health` endpoint for monitoring:

```nginx
location /health {
  access_log off;
  return 200 "healthy\n";
  add_header Content-Type text/plain;
}
```

### Monitoring Setup

1. **Application Performance Monitoring**:
   - Integrate with New Relic, DataDog, or Application Insights
   - Monitor page load times, API response times, and error rates

2. **Log Aggregation**:
   - Set up centralized logging with ELK stack or cloud logging services
   - Monitor application errors and performance metrics

3. **Alerting**:
   - Configure alerts for error rates
   - Set up uptime monitoring
   - Monitor resource usage

## Rollback Strategy

### Quick Rollback

1. **Docker**: Switch to previous image tag
```bash
docker pull game4u-front:previous-tag
docker stop game4u-front
docker run -d -p 80:80 --name game4u-front game4u-front:previous-tag
```

2. **Kubernetes**: Rollback deployment
```bash
kubectl rollout undo deployment/game4u-front-production -n production
```

3. **Cloud Storage**: Restore previous build
```bash
aws s3 sync s3://backup-bucket/previous-build s3://your-bucket-name --delete
```

## Security Considerations

### HTTPS Configuration
- Always use HTTPS in production
- Configure proper SSL certificates
- Implement HSTS headers

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

### API Security
- Use environment variables for API keys
- Implement proper CORS policies
- Use token-based authentication
- Rotate credentials regularly

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

2. **Runtime Errors**:
   - Check browser console for JavaScript errors
   - Verify API endpoints are accessible
   - Check network connectivity

3. **Performance Issues**:
   - Analyze bundle sizes
   - Check for memory leaks
   - Monitor API response times

### Debug Commands

```bash
# Check build output
ng build --configuration=production --verbose

# Analyze bundle size
npx webpack-bundle-analyzer dist/game4u-front/main.*.js

# Test production build locally
npx http-server dist/game4u-front -p 8080
```

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] All routes are accessible
- [ ] API integration is working
- [ ] Authentication is functioning
- [ ] Performance metrics are acceptable
- [ ] Error monitoring is active
- [ ] SSL certificate is valid
- [ ] Security headers are configured
- [ ] Backup procedures are in place
- [ ] Monitoring alerts are configured
- [ ] Documentation is updated
- [ ] Team is notified of deployment

## Maintenance

### Regular Tasks

1. **Weekly**:
   - Review error logs
   - Check performance metrics
   - Monitor resource usage

2. **Monthly**:
   - Update dependencies
   - Review security vulnerabilities
   - Optimize bundle sizes

3. **Quarterly**:
   - Review and update documentation
   - Conduct security audit
   - Performance optimization review

## Support

For deployment issues or questions:
- Check the [API Integration Guide](API_INTEGRATION.md)
- Review [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md)
- Contact the development team
