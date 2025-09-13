
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
  type: 'needs' | 'wants' | 'savings';
}

interface BudgetOverviewProps {
  categories: BudgetCategory[];
  monthlyIncome: number;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ categories, monthlyIncome }) => {
  // Calculate 50/30/20 rule allocations
  const idealNeeds = monthlyIncome * 0.5;
  const idealWants = monthlyIncome * 0.3;
  const idealSavings = monthlyIncome * 0.2;

  // Group categories by type
  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = { allocated: 0, spent: 0 };
    }
    acc[category.type].allocated += category.allocated;
    acc[category.type].spent += category.spent;
    return acc;
  }, {} as Record<string, { allocated: number; spent: number }>);

  const chartData = [
    {
      name: 'Needs',
      value: groupedCategories.needs?.spent || 0,
      allocated: idealNeeds,
      color: '#3B82F6'
    },
    {
      name: 'Wants',
      value: groupedCategories.wants?.spent || 0,
      allocated: idealWants,
      color: '#F59E0B'
    },
    {
      name: 'Savings/Debt',
      value: groupedCategories.savings?.spent || 0,
      allocated: idealSavings,
      color: '#10B981'
    }
  ];

  const getBudgetStatus = (spent: number, allocated: number) => {
    const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
    if (percentage <= 80) return { status: 'good', color: 'green' };
    if (percentage <= 100) return { status: 'warning', color: 'yellow' };
    return { status: 'over', color: 'red' };
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-lg">Budget Overview (50/30/20 Rule)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Budget Breakdown */}
          <div className="space-y-4">
            {chartData.map((category, index) => {
              const status = getBudgetStatus(category.value, category.allocated);
              const percentage = category.allocated > 0 ? (category.value / category.allocated) * 100 : 0;

              return (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className={`text-sm font-bold text-${status.color}-600`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full`}
                        style={{ backgroundColor: category.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formatCurrency(category.value)} spent</span>
                      <span>{formatCurrency(category.allocated)} allocated</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Monthly Income</p>
            <p className="font-bold text-lg">{formatCurrency(monthlyIncome)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Total Spent</p>
            <p className="font-bold text-lg">
              {formatCurrency(chartData.reduce((sum, cat) => sum + cat.value, 0))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Remaining</p>
            <p className="font-bold text-lg text-green-600">
              {formatCurrency(monthlyIncome - chartData.reduce((sum, cat) => sum + cat.value, 0))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
