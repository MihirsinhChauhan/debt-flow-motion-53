import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChartDataPoint {
  value: number;
  date: string;
}

interface Metric {
  label: string;
  value: string;
}

interface FlowData {
  incoming: number;
  outgoing: number;
  invested: number;
  left: number;
}

interface SpendingData {
  category: string;
  amount: number;
}

interface WidgetCardProps {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  value?: string;
  label?: string;
  hasChart?: boolean;
  hasAreaChart?: boolean;
  chartData?: ChartDataPoint[];
  metrics?: Metric[];
  flowData?: FlowData;
  spendingData?: SpendingData[];
  className?: string;
  onClick?: () => void;
}

const WidgetCard = ({ 
  title,
  subtitle, 
  icon, 
  value,
  label,
  hasChart,
  hasAreaChart,
  chartData,
  metrics,
  flowData,
  spendingData,
  className = "",
  onClick
}: WidgetCardProps) => {
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const SimpleLineChart = ({ data }: { data: ChartDataPoint[] }) => (
    <div className="h-12 flex items-end gap-1">
      {data.map((point, index) => (
        <div
          key={index}
          className="bg-success-light flex-1 rounded-sm"
          style={{ height: `${Math.random() * 100}%` }}
        />
      ))}
    </div>
  );

  const SimpleAreaChart = ({ data }: { data: ChartDataPoint[] }) => (
    <div className="h-16 bg-gradient-to-t from-success-light/20 to-transparent rounded-lg relative">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M0,80 Q25,60 50,70 T100,50 L100,100 L0,100 Z"
          fill="url(#areaGradient)"
          className="opacity-60"
        />
        <path
          d="M0,80 Q25,60 50,70 T100,50"
          stroke="hsl(var(--success))"
          strokeWidth="2"
          fill="none"
        />
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity="0"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  return (
    <Card 
      className={`bg-white border border-fold-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-fold-gray-100">
              {icon}
            </div>
            <div>
              <h3 className="font-medium text-fold-gray-900">{title}</h3>
              {subtitle && (
                <p className="text-xs text-fold-gray-500 uppercase tracking-wide">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-fold-gray-100">
            <MoreHorizontal className="h-4 w-4 text-fold-gray-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Simple value display */}
          {value && !flowData && !spendingData && (
            <div>
              <div className="text-2xl font-bold text-fold-gray-900">{value}</div>
              {label && (
                <div className="text-sm text-fold-gray-500">{label}</div>
              )}
            </div>
          )}

          {/* Chart display */}
          {hasChart && chartData && (
            <SimpleLineChart data={chartData} />
          )}

          {/* Area chart display */}
          {hasAreaChart && chartData && (
            <SimpleAreaChart data={chartData} />
          )}

          {/* Metrics grid */}
          {metrics && (
            <div className="grid grid-cols-2 gap-4 text-xs">
              {metrics.map((metric, index) => (
                <div key={index}>
                  <div className="text-fold-gray-500 uppercase tracking-wide">
                    {metric.label}
                  </div>
                  <div className="font-semibold text-fold-gray-900">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cash Flow display */}
          {flowData && (
            <div className="space-y-3">
              <div>
                <div className="text-sm text-fold-gray-500 mb-1">Incoming</div>
                <div className="text-xl font-bold text-fold-gray-900">
                  +{formatCurrency(flowData.incoming)}
                </div>
              </div>
              <div>
                <div className="text-sm text-fold-gray-500 mb-1">Outgoing</div>
                <div className="text-xl font-bold text-fold-gray-900">
                  {formatCurrency(flowData.outgoing)}
                </div>
              </div>
              <div>
                <div className="text-sm text-fold-gray-500 mb-1">Invested</div>
                <div className="text-xl font-bold text-fold-gray-900">
                  {formatCurrency(flowData.invested)}
                </div>
              </div>
              <div>
                <div className="text-sm text-fold-gray-500 mb-1">Left</div>
                <div className="text-xl font-bold text-fold-gray-900">
                  {formatCurrency(flowData.left)}
                </div>
              </div>
            </div>
          )}

          {/* Spending Summary display */}
          {spendingData && (
            <div className="space-y-2">
              {spendingData.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-fold-gray-300"></div>
                    <span className="text-sm text-fold-gray-700">{item.category}</span>
                  </div>
                  <span className="text-sm font-medium text-fold-gray-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WidgetCard;