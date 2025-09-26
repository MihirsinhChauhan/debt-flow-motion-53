/**
 * Environment Configuration Management for DebtEase
 * Provides centralized configuration with easy environment switching
 */

export type Environment = 'development' | 'staging' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface AppConfig {
  env: Environment;
  apiBaseUrl: string;
  apiUrl: string;
  appName: string;
  debug: boolean;
  logLevel: LogLevel;
}

/**
 * Validate environment configuration
 */
const validateEnvironment = (env: string): Environment => {
  const validEnvironments: Environment[] = ['development', 'staging', 'production'];

  if (!validEnvironments.includes(env as Environment)) {
    console.warn(`Invalid VITE_APP_ENV: "${env}". Defaulting to "development"`);
    return 'development';
  }

  return env as Environment;
};

/**
 * Validate URL format
 */
const validateUrl = (url: string, name: string): string => {
  try {
    new URL(url);
    return url;
  } catch {
    console.error(`Invalid URL for ${name}: "${url}". Using default.`);
    return 'http://localhost:8000';
  }
};

/**
 * Get current environment configuration
 */
export const getConfig = (): AppConfig => {
  // Get environment from build-time variable or default to development
  const env = validateEnvironment(import.meta.env.VITE_APP_ENV || 'development');

  // Validate URLs
  const apiBaseUrl = validateUrl(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    'VITE_API_BASE_URL'
  );

  const apiUrl = validateUrl(
    import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    'VITE_API_URL'
  );

  const config = {
    env,
    apiBaseUrl,
    apiUrl,
    appName: import.meta.env.VITE_APP_NAME || 'DebtEase',
    debug: import.meta.env.VITE_DEBUG === 'true' || env === 'development',
    logLevel: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || (env === 'development' ? 'debug' : 'error'),
  };

  // Log configuration validation warnings in development
  if (config.debug) {
    if (apiBaseUrl.includes('localhost') && env === 'production') {
      console.warn('⚠️  Production environment is using localhost URLs!');
    }

    if (apiBaseUrl.includes('onrender.com') && env === 'development') {
      console.warn('⚠️  Development environment is using production URLs!');
    }
  }

  return config;
};

/**
 * Current application configuration
 */
export const config = getConfig();

/**
 * Environment-specific configurations
 */
export const environments = {
  development: {
    env: 'development' as Environment,
    apiBaseUrl: 'http://localhost:8000',
    apiUrl: 'http://localhost:8000/api',
    appName: 'DebtEase (Local)',
    debug: true,
    logLevel: 'debug' as LogLevel,
  },
  staging: {
    env: 'staging' as Environment,
    apiBaseUrl: 'https://debtease-server.onrender.com',
    apiUrl: 'https://debtease-server.onrender.com/api',
    appName: 'DebtEase (Staging)',
    debug: true,
    logLevel: 'info' as LogLevel,
  },
  production: {
    env: 'production' as Environment,
    apiBaseUrl: 'https://debtease-server.onrender.com',
    apiUrl: 'https://debtease-server.onrender.com/api',
    appName: 'DebtEase',
    debug: false,
    logLevel: 'error' as LogLevel,
  },
};

/**
 * Check if we're running in development mode
 */
export const isDevelopment = (): boolean => config.env === 'development';

/**
 * Check if we're running in production mode
 */
export const isProduction = (): boolean => config.env === 'production';

/**
 * Check if we're running in staging mode
 */
export const isStaging = (): boolean => config.env === 'staging';

/**
 * Enhanced console logging that respects log level and debug settings
 */
export const logger = {
  debug: (...args: any[]) => {
    if (config.debug && shouldLog('debug')) {
      console.debug(`[${config.env.toUpperCase()}] DEBUG:`, ...args);
    }
  },
  info: (...args: any[]) => {
    if (shouldLog('info')) {
      console.info(`[${config.env.toUpperCase()}] INFO:`, ...args);
    }
  },
  warn: (...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(`[${config.env.toUpperCase()}] WARN:`, ...args);
    }
  },
  error: (...args: any[]) => {
    if (shouldLog('error')) {
      console.error(`[${config.env.toUpperCase()}] ERROR:`, ...args);
    }
  },
};

/**
 * Determine if we should log at the given level
 */
const shouldLog = (level: LogLevel): boolean => {
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  return levels[level] >= levels[config.logLevel];
};

/**
 * Environment switching helper (for development/testing)
 */
export const switchEnvironment = (targetEnv: Environment): AppConfig => {
  if (config.debug) {
    logger.info(`Switching environment from ${config.env} to ${targetEnv}`);
    return environments[targetEnv];
  } else {
    logger.warn('Environment switching is only available in debug mode');
    return config;
  }
};

/**
 * Get environment display information
 */
export const getEnvironmentInfo = () => ({
  environment: config.env,
  apiBaseUrl: config.apiBaseUrl,
  apiUrl: config.apiUrl,
  debug: config.debug,
  logLevel: config.logLevel,
  appName: config.appName,
});

/**
 * Create environment indicator for development
 */
export const createEnvironmentIndicator = (): string => {
  if (!config.debug) return '';

  const indicator = `🔧 ${config.env.toUpperCase()} | ${config.apiBaseUrl}`;
  return indicator;
};

/**
 * Validate current configuration and warn about issues
 */
export const validateCurrentConfig = (): boolean => {
  let isValid = true;

  // Check for common misconfigurations
  if (config.env === 'development' && config.apiBaseUrl.includes('onrender.com')) {
    logger.warn('Development environment pointing to production server!');
    isValid = false;
  }

  if (config.env === 'production' && config.apiBaseUrl.includes('localhost')) {
    logger.error('Production environment pointing to localhost!');
    isValid = false;
  }

  // Check URL accessibility (basic validation)
  if (!config.apiBaseUrl || !config.apiUrl) {
    logger.error('Missing API URLs in configuration!');
    isValid = false;
  }

  return isValid;
};

// Log current configuration on startup (debug mode only)
if (config.debug) {
  logger.info('DebtEase Configuration:', getEnvironmentInfo());
  logger.info('Environment Indicator:', createEnvironmentIndicator());

  // Validate configuration
  if (!validateCurrentConfig()) {
    logger.warn('Configuration validation failed - check your environment variables');
  }
}