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
 * Get current environment configuration
 */
export const getConfig = (): AppConfig => {
  // Get environment from build-time variable or default to development
  const env = (import.meta.env.VITE_APP_ENV as Environment) || 'development';

  return {
    env,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    appName: import.meta.env.VITE_APP_NAME || 'DebtEase',
    debug: import.meta.env.VITE_DEBUG === 'true' || env === 'development',
    logLevel: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || (env === 'development' ? 'debug' : 'error'),
  };
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
  apiUrl: config.apiUrl,
  debug: config.debug,
  logLevel: config.logLevel,
  appName: config.appName,
});

// Log current configuration on startup (debug mode only)
if (config.debug) {
  logger.info('DebtEase Configuration:', getEnvironmentInfo());
}