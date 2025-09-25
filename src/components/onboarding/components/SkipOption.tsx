import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SkipForward, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkipOptionProps {
  onSkip: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  isLoading?: boolean;
  className?: string;
}

export const SkipOption: React.FC<SkipOptionProps> = ({
  onSkip,
  title = "Skip this step",
  description = "You can always add this information later from your dashboard settings.",
  buttonText = "Skip for now",
  isLoading = false,
  className
}) => {
  return (
    <Card className={cn("border-dashed border-muted-foreground/30 bg-muted/10", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">{title}</h4>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
            disabled={isLoading}
            className="flex items-center gap-1.5 ml-3 flex-shrink-0"
          >
            <SkipForward className="h-3 w-3" />
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
















