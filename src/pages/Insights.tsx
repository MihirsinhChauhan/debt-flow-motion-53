
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, TrendingUp, PiggyBank, DollarSign } from 'lucide-react';
import { mockDebts, aiSuggestions } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const Insights = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground mt-1">
          Personalized recommendations to optimize your debt repayment
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-finance-blue to-finance-lightBlue text-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Debt Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">6.5%</div>
            <p className="text-sm opacity-90">Average Interest Rate</p>
            <div className="mt-6 flex justify-between items-end">
              <div className="text-xs opacity-75">Based on 5 active debts</div>
              <TrendingUp size={24} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Potential Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-finance-green">$490</div>
            <p className="text-sm text-gray-500">If you follow all recommendations</p>
            <div className="mt-6 flex justify-between items-end">
              <div className="text-xs text-gray-400">Annual interest savings</div>
              <PiggyBank size={24} className="text-finance-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Debt Freedom</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.8 years</div>
            <p className="text-sm text-gray-500">Estimated time to debt-free</p>
            <div className="mt-6 flex justify-between items-end">
              <div className="text-xs text-gray-400">With current payment strategy</div>
              <DollarSign size={24} className="text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Optimized Repayment Plan</h2>
          <p className="text-gray-600">Our AI recommends this payment schedule to minimize interest</p>
        </div>
        
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h3 className="font-medium mb-4">Step 1: Focus on High Interest Debt</h3>
            <div className="relative pl-6 ml-4 border-l-2 border-gray-200">
              <div className="absolute w-4 h-4 bg-finance-blue rounded-full -left-[11px] top-1"></div>
              <p className="font-semibold">Credit Card ($3,200 remaining)</p>
              <p className="text-gray-600 text-sm mt-1">
                Pay $350/month (additional $200 to minimum) to eliminate this debt in 10 months and save $320 in interest.
              </p>
            </div>
          </div>
          
          <div className="border-b pb-4">
            <h3 className="font-medium mb-4">Step 2: Pay off Personal Loans</h3>
            <div className="relative pl-6 ml-4 border-l-2 border-gray-200">
              <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[11px] top-1"></div>
              <p className="font-semibold">Family Loan ($1,200 remaining)</p>
              <p className="text-gray-600 text-sm mt-1">
                Maintain $500/month payments to clear this debt in just over 2 months.
              </p>
            </div>
            <div className="relative pl-6 ml-4 border-l-2 border-gray-200 mt-4">
              <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[11px] top-1"></div>
              <p className="font-semibold">Car Loan ($10,500 remaining)</p>
              <p className="text-gray-600 text-sm mt-1">
                After Credit Card is paid off, add $200/month to your car payment to pay it off faster.
              </p>
            </div>
          </div>
          
          <div className="pb-4">
            <h3 className="font-medium mb-4">Step 3: Target Long-term Debts</h3>
            <div className="relative pl-6 ml-4 border-l-2 border-gray-200">
              <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[11px] top-1"></div>
              <p className="font-semibold">Student Loan ($12,000 remaining)</p>
              <p className="text-gray-600 text-sm mt-1">
                Consider refinancing to lower your rate, then allocate additional funds after previous debts are paid.
              </p>
            </div>
            <div className="relative pl-6 ml-4 mt-4">
              <div className="absolute w-4 h-4 bg-gray-300 rounded-full -left-[11px] top-1"></div>
              <p className="font-semibold">Home Mortgage ($320,000 remaining)</p>
              <p className="text-gray-600 text-sm mt-1">
                Continue regular payments while focusing on higher-interest debts.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" className="gap-1.5">
              Generate Custom Plan <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="border rounded-xl bg-white p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Recommended Actions</h2>
        <div className="space-y-3">
          {aiSuggestions.map((suggestion, index) => (
            <div key={suggestion.id} className="flex p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="mr-4 bg-blue-100 text-blue-800 h-6 w-6 flex items-center justify-center rounded-full font-semibold text-sm">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{suggestion.description}</p>
              </div>
              <Button variant="ghost" size="sm" className="self-center">
                Apply
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Insights;
