import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordRequirement {
  label: string;
  met: boolean;
  icon: React.ReactNode;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className
}) => {
  const calculateStrength = (password: string): { score: number; requirements: PasswordRequirement[] } => {
    const requirements: PasswordRequirement[] = [
      {
        label: 'At least 8 characters',
        met: password.length >= 8,
        icon: password.length >= 8 ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />
      },
      {
        label: 'Contains uppercase letter',
        met: /[A-Z]/.test(password),
        icon: /[A-Z]/.test(password) ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />
      },
      {
        label: 'Contains lowercase letter',
        met: /[a-z]/.test(password),
        icon: /[a-z]/.test(password) ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />
      },
      {
        label: 'Contains number',
        met: /\d/.test(password),
        icon: /\d/.test(password) ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />
      },
      {
        label: 'Contains special character',
        met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        icon: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? <Check className="h-3 w-3 text-green-600" /> : <X className="h-3 w-3 text-red-500" />
      }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const score = Math.round((metRequirements / requirements.length) * 100);

    return { score, requirements };
  };

  const getStrengthLevel = (score: number): { level: string; color: string; textColor: string } => {
    if (score < 40) return { level: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' };
    if (score < 60) return { level: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (score < 80) return { level: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
    return { level: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  // Don't show anything if no password entered
  if (!password) return null;

  const { score, requirements } = calculateStrength(password);
  const { level, color, textColor } = getStrengthLevel(score);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Password strength</span>
          <span className={cn('text-sm font-medium', textColor)}>{level}</span>
        </div>
        <Progress
          value={score}
          className="h-2"
          // Custom progress bar styling based on strength
          style={{
            '--progress-foreground': score < 40 ? '#ef4444' :
                                   score < 60 ? '#eab308' :
                                   score < 80 ? '#3b82f6' : '#22c55e'
          } as React.CSSProperties}
        />
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-gray-700">Password requirements:</span>
        </div>
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2">
              {req.icon}
              <span className={cn(
                'text-sm',
                req.met ? 'text-green-700' : 'text-gray-500'
              )}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Tips */}
      {score < 80 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">Tips for a stronger password:</p>
              <ul className="text-xs space-y-0.5 list-disc list-inside">
                <li>Use a mix of uppercase and lowercase letters</li>
                <li>Include numbers and special characters</li>
                <li>Avoid common words or personal information</li>
                <li>Consider using a passphrase with random words</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;