/**
 * Environment Switcher Component
 * Allows switching between development/staging/production environments
 * Only visible in development mode for debugging
 */

import React, { useState } from 'react';
import { config, environments, logger, type Environment } from '@/lib/config';

interface EnvironmentSwitcherProps {
  className?: string;
}

export const EnvironmentSwitcher: React.FC<EnvironmentSwitcherProps> = ({ className }) => {
  const [currentEnv, setCurrentEnv] = useState<Environment>(config.env);
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show in development mode
  if (!config.debug) {
    return null;
  }

  const handleEnvironmentChange = (env: Environment) => {
    logger.info(`Environment switch requested: ${currentEnv} -> ${env}`);

    if (env !== currentEnv) {
      const newConfig = environments[env];

      // Show confirmation dialog for important environment switches
      const shouldSwitch = window.confirm(
        `Switch environment from ${currentEnv.toUpperCase()} to ${env.toUpperCase()}?\n\n` +
        `API URL: ${newConfig.apiUrl}\n` +
        `Debug: ${newConfig.debug ? 'ON' : 'OFF'}\n\n` +
        `This will reload the page.`
      );

      if (shouldSwitch) {
        // Store the selected environment
        localStorage.setItem('selected_environment', env);

        // Show instructions for manual environment switch
        alert(
          `To switch to ${env.toUpperCase()} environment:\n\n` +
          `1. Stop the development server (Ctrl+C)\n` +
          `2. Run: npm run dev:${env}\n` +
          `   or\n` +
          `   Update your .env file with:\n` +
          `   VITE_API_BASE_URL=${newConfig.apiBaseUrl}\n` +
          `   VITE_API_URL=${newConfig.apiUrl}\n\n` +
          `3. Restart the server`
        );

        logger.warn(`Environment switch requires server restart. Selected: ${env}`);
      }
    }

    setIsExpanded(false);
  };

  const getEnvironmentColor = (env: Environment): string => {
    switch (env) {
      case 'development':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'production':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (env: Environment): string => {
    switch (env) {
      case 'development':
        return '🛠️';
      case 'staging':
        return '🔄';
      case 'production':
        return '🚀';
      default:
        return '❓';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className || ''}`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[200px]">
        {/* Current Environment Display */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            px-3 py-2 rounded-t-lg cursor-pointer select-none flex items-center justify-between
            ${getEnvironmentColor(currentEnv)} hover:opacity-80 transition-opacity
          `}
          title="Click to switch environment (Development only)"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {getStatusIcon(currentEnv)} {currentEnv.toUpperCase()}
            </span>
          </div>
          <span className={`text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>

        {/* Environment Options */}
        {isExpanded && (
          <div className="border-t border-gray-200 bg-white rounded-b-lg">
            <div className="px-3 py-2 text-xs text-gray-600 border-b border-gray-100">
              Current: {config.apiUrl}
            </div>

            {(Object.keys(environments) as Environment[]).map((env) => (
              <button
                key={env}
                onClick={() => handleEnvironmentChange(env)}
                disabled={env === currentEnv}
                className={`
                  w-full px-3 py-2 text-left text-sm flex items-center justify-between
                  hover:bg-gray-50 transition-colors
                  ${env === currentEnv
                    ? 'bg-gray-50 text-gray-400 cursor-default'
                    : 'text-gray-700 cursor-pointer'
                  }
                `}
                title={`Switch to ${env} (${environments[env].apiUrl})`}
              >
                <div className="flex items-center space-x-2">
                  <span>{getStatusIcon(env)}</span>
                  <span>{env}</span>
                  {env === currentEnv && <span className="text-xs">(current)</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {environments[env].debug ? '🐛' : '🔒'}
                </div>
              </button>
            ))}

            {/* Environment Info */}
            <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <div className="text-xs text-gray-600 space-y-1">
                <div>Debug: {config.debug ? 'ON' : 'OFF'}</div>
                <div>Logs: {config.logLevel.toUpperCase()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook to get environment switching functionality
 */
export const useEnvironmentSwitcher = () => {
  const currentEnv = config.env;
  const isDebugMode = config.debug;

  const getEnvironmentStatus = () => ({
    current: currentEnv,
    apiUrl: config.apiUrl,
    debug: config.debug,
    logLevel: config.logLevel,
    available: Object.keys(environments) as Environment[],
  });

  const canSwitchEnvironment = () => isDebugMode;

  return {
    currentEnv,
    isDebugMode,
    getEnvironmentStatus,
    canSwitchEnvironment,
  };
};