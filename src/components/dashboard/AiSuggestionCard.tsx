
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, TrendingUp, Zap, Banknote } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  savingsAmount: number;
  type: string;
}

interface AiSuggestionCardProps {
  suggestion: AiSuggestion;
}

const AiSuggestionCard = ({ suggestion }: AiSuggestionCardProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'high_interest':
        return <TrendingUp className="h-5 w-5 text-finance-blue" />;
      case 'consolidation':
        return <Banknote className="h-5 w-5 text-finance-green" />;
      case 'automation':
        return <Zap className="h-5 w-5 text-finance-yellow" />;
      default:
        return <Sparkles className="h-5 w-5 text-finance-blue" />;
    }
  };

  return (
    <Card className="border-l-4 border-l-finance-blue shadow-sm hover:shadow-md transition-shadow duration-300 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-blue-100 p-2 rounded-full">
            {getIcon(suggestion.type)}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
              <div className="bg-green-50 text-green-700 text-xs font-medium px-2 py-1 rounded">
                Save {formatCurrency(suggestion.savingsAmount)}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AiSuggestionCard;
