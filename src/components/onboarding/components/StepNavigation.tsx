import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepNavigationProps {
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  backLabel?: string;
  skipLabel?: string;
  canGoBack?: boolean;
  canGoNext?: boolean;
  isLastStep?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onNext,
  onBack,
  onSkip,
  nextLabel,
  backLabel = "Back",
  skipLabel = "Skip for now",
  canGoBack = true,
  canGoNext = true,
  isLastStep = false,
  isLoading = false,
  className
}) => {
  return (
    <div className={cn("flex items-center justify-between mt-8", className)}>
      <div className="flex items-center gap-3">
        {onBack && canGoBack && (
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBack();
            }}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        )}

        {onSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSkip();
            }}
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            {skipLabel}
          </Button>
        )}
      </div>

      {onNext && (
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onNext();
          }}
          disabled={!canGoNext || isLoading}
          className="flex items-center gap-2 min-w-[120px]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {isLastStep ? 'Complete Setup' : nextLabel || 'Next'}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

