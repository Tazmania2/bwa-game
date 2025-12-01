export const environment = {
  production: true,
  client_id: process.env['CLIENT_ID'] || '',
  backend_url_base: process.env['BACKEND_URL_BASE'] || '',
  
  // Funifier API Configuration
  funifier_api_url: process.env['FUNIFIER_BASE_URL'] || 'https://service2.funifier.com',
  funifier_api_key: process.env['FUNIFIER_API_KEY'] || '',
  funifier_base_url: process.env['FUNIFIER_BASE_URL'] || 'https://service2.funifier.com',
  funifier_basic_token: process.env['FUNIFIER_BASIC_TOKEN'] || '',
  
  // Cache Configuration
  cacheTimeout: 300000, // 5 minutes in milliseconds
  
  // Feature Flags
  enableAnalytics: true
};
