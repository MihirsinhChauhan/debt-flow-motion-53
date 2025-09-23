import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OnboardingCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  title,
  description,
  children,
  className,
  contentClassName
}) => {
  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
        {description && (
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={cn("px-6 pb-6", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
};







