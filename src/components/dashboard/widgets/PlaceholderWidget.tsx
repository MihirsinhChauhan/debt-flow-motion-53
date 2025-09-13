import React from 'react';
import WidgetCard from '../WidgetCard';

interface PlaceholderWidgetProps {
  title: string;
  icon: React.ReactNode;
  value: string;
  subtext: string;
  trend?: string;
  trendUp?: boolean;
}

const PlaceholderWidget = ({ 
  title, 
  icon, 
  value, 
  subtext, 
  trend, 
  trendUp 
}: PlaceholderWidgetProps) => {
  const content = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{subtext}</p>
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            trendUp 
              ? 'text-green-600 bg-green-50' 
              : 'text-red-600 bg-red-50'
          }`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <WidgetCard
      title={title}
      icon={icon}
    >
      {content}
    </WidgetCard>
  );
};

export default PlaceholderWidget;