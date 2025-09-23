
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, ResponsiveContainer, Cell, Legend, Tooltip } from 'recharts';
import { Debt } from '@/types/debt';

interface DebtProgressChartProps {
  debts: Debt[];
}

const DebtProgressChart = ({ debts }: DebtProgressChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const COLORS = ['#1A73E8', '#4285F4', '#34A853', '#FBBC05', '#EA4335'];
  
  useEffect(() => {
    const data = debts.map((debt, index) => ({
      name: debt.name,
      value: debt.remainingAmount,
      color: COLORS[index % COLORS.length]
    }));
    setChartData(data);
  }, [debts]);

  return (
    <Card className="h-full min-h-[300px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Debt Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              animationDuration={750}
              animationBegin={0}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Remaining']}
              contentStyle={{ 
                borderRadius: '0.5rem',
                border: '1px solid #f1f1f1',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DebtProgressChart;
