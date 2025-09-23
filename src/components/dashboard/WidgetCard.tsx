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
      className={`bg-card border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground">
              {icon}
            </div>
            <div>
              <h3 className="text-base font-medium text-foreground">{title}</h3>
              {subtitle && (
                <p className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Simple value display */}
          {value && !flowData && !spendingData && (
            <div className="mb-4">
              {label && (
                <div className="text-sm text-muted-foreground mb-1">{label}</div>
              )}
              <div className="text-3xl font-semibold text-foreground">{value}</div>
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
                  <div className="text-muted-foreground uppercase tracking-wide">
                    {metric.label}
                  </div>
                  <div className="font-semibold text-foreground">
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
                <div className="text-sm text-muted-foreground mb-1">Incoming</div>
                <div className="text-xl font-semibold text-foreground">
                  +{formatCurrency(flowData.incoming)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Outgoing</div>
                <div className="text-xl font-semibold text-foreground">
                  {formatCurrency(flowData.outgoing)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Invested</div>
                <div className="text-xl font-semibold text-foreground">
                  {formatCurrency(flowData.invested)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Left</div>
                <div className="text-xl font-semibold text-foreground">
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
                    <div className="w-3 h-3 rounded-full bg-muted"></div>
                    <span className="text-sm text-muted-foreground">{item.category}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
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