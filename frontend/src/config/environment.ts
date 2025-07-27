// src/config/environment.ts
export const environment = {
  production: import.meta.env.PROD,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000'),
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  
  // Configuraciones específicas por entorno
  get isDevelopment() {
    return this.appEnv === 'development'
  },
  
  get isProduction() {
    return this.production
  }
}