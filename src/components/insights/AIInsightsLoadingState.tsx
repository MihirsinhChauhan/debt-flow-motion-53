import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain,
  TrendingUp,
  BarChart3,
  DollarSign,
  Clock,
  Zap
} from 'lucide-react';

interface AIInsightsLoadingStateProps {
  className?: string;
}

const AIInsightsLoadingState: React.FC<AIInsightsLoadingStateProps> = ({ className }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Overview metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between items-center mt-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended strategy card */}
        <div className="lg:col-span-2">
          <Card className="relative">
            <div className="absolute top-0 right-0 bg-gray-200 animate-pulse rounded-bl-lg w-24 h-6" />
            <CardHeader className="pb-4">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metrics grid skeleton */}
              <div className="grid grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))}
              </div>

              {/* Payment breakdown skeleton */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress skeleton */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>

              {/* Benefits skeleton */}
              <div className="space-y-2">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>

              {/* Action buttons skeleton */}
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-10 flex-1 rounded-md" />
                <Skeleton className="h-10 w-12 rounded-md" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simulation controls skeleton */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Slider skeleton */}
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, index) => (
                    <Skeleton key={index} className="h-8 w-16 rounded-md" />
                  ))}
                </div>
              </div>

              {/* Strategy selector skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-3 w-full" />
              </div>

              {/* Extra payment skeleton */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-3 w-full" />
              </div>

              {/* Impact preview skeleton */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-3 rounded-full animate-spin" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                      <Skeleton className="h-4 w-4 mx-auto mb-2" />
                      <Skeleton className="h-6 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action button skeleton */}
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Strategy comparison skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tabs skeleton */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-8 flex-1 rounded-md" />
            ))}
          </div>

          {/* Recommendation banner skeleton */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
          </div>

          {/* Comparison table skeleton */}
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-8">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons skeleton */}
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-md" />
            <Skeleton className="h-10 flex-1 rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline chart skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>

          {/* Chart controls skeleton */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-md" />
            </div>
            <div className="flex gap-2 ml-auto">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Chart tabs skeleton */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-8 flex-1 rounded-md" />
            ))}
          </div>

          {/* Chart area skeleton */}
          <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="animate-pulse">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              </div>
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-3 w-48 mx-auto" />
            </div>
          </div>

          {/* Chart summary skeleton */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-8 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alternative strategies skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="border-l-4 border-l-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex items-center gap-4 mt-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-3 w-18" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-20 rounded-md" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading indicators with AI theme */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-lg">
        <div className="animate-spin">
          <Brain className="h-4 w-4 text-finance-blue" />
        </div>
        <span className="text-sm text-gray-600">AI is analyzing your debt data...</span>
      </div>
    </div>
  );
};

export default AIInsightsLoadingState;