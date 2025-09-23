import React from 'react';
import ProfessionalRecommendations from './components/insights/ProfessionalRecommendations';
import RepaymentPlanDisplay from './components/insights/RepaymentPlanDisplay';
import RiskAssessmentCard from './components/insights/RiskAssessmentCard';
import EnhancedStrategyComparison from './components/insights/EnhancedStrategyComparison';
import { ProfessionalRecommendation, RepaymentPlan, StrategyComparison } from './types/ai-insights';

// Mock data for testing enhanced components
const mockRecommendations: ProfessionalRecommendation[] = [
  {
    id: '1',
    recommendation_type: 'emergency_fund',
    title: 'Establish Emergency Fund Foundation',
    description: 'Build a $3,000 emergency fund before aggressive debt payoff to prevent accumulating new debt during unexpected expenses. This creates a financial buffer that protects your debt repayment progress.',
    potential_savings: 15000,
    priority_score: 9,
    action_steps: [
      'Open a high-yield savings account specifically for emergencies',
      'Set up automatic transfers of $300/month until you reach $3,000',
      'Keep this fund separate from your checking account to avoid temptation',
      'Only use for true emergencies (medical, job loss, major repairs)'
    ],
    timeline: '6-12 months to build',
    risk_factors: [
      'Without emergency fund, unexpected expenses may force new debt',
      'Could delay debt payoff by 2-3 months initially but prevents setbacks'
    ],
    benefits: [
      'Prevents new debt accumulation during emergencies',
      'Provides peace of mind and reduces financial stress',
      'Creates foundation for long-term financial stability'
    ],
    ideal_for: ['debt-prone individuals', 'variable income', 'high-stress situations'],
    implementation_difficulty: 'easy',
    professional_reasoning: 'Based on Dave Ramsey\'s Baby Steps methodology, emergency funds are crucial before debt elimination to prevent the debt cycle from repeating.'
  },
  {
    id: '2',
    recommendation_type: 'avalanche',
    title: 'High-Interest Debt Priority Attack',
    description: 'Focus extra payments on your 24.99% credit card debt first. This mathematically optimal approach will save you approximately $8,500 in interest payments over the life of your debts.',
    potential_savings: 8500,
    priority_score: 8,
    action_steps: [
      'Pay minimums on all debts except highest interest rate debt',
      'Apply all extra payment capacity to the 24.99% credit card',
      'Once paid off, roll that payment to the next highest rate debt',
      'Track progress monthly to maintain motivation'
    ],
    timeline: '18-24 months',
    benefits: [
      'Minimizes total interest paid across all debts',
      'Fastest mathematical path to debt freedom',
      'Optimizes every dollar toward debt elimination'
    ],
    ideal_for: ['mathematically-minded individuals', 'stable income', 'high discipline'],
    implementation_difficulty: 'moderate',
    professional_reasoning: 'Suze Orman\'s approach emphasizes mathematical efficiency. Your debt structure with high-rate credit cards makes this strategy particularly effective.'
  }
];

const mockRepaymentPlan: RepaymentPlan = {
  strategy: 'avalanche',
  primary_strategy: {
    name: 'Professional Debt Avalanche Strategy',
    description: 'A mathematically optimized approach that prioritizes debts by interest rate, ensuring you pay the least amount of interest over time.',
    benefits: [
      'Minimizes total interest paid across all debts',
      'Fastest path to debt freedom from a mathematical perspective',
      'Optimizes every dollar of extra payment for maximum impact',
      'Reduces total time to debt freedom by 14-18 months'
    ],
    reasoning: 'Based on your debt profile with high-interest credit cards (24.99%) and lower-rate installment debt, the avalanche method will save you approximately $8,500 in interest payments compared to minimum payments only.',
    ideal_for: ['analytical personalities', 'stable income streams', 'high self-discipline', 'mathematical optimization preference']
  },
  alternative_strategies: [
    {
      name: 'Debt Snowball (Psychological Approach)',
      description: 'Focus on smallest balances first to build momentum and psychological wins',
      benefits: ['Quick early victories', 'Maintains motivation', 'Simplifies debt management'],
      reasoning: 'If you need psychological motivation or have struggled with debt consistency in the past',
      ideal_for: ['motivation-driven individuals', 'debt management struggles', 'quick win preference'],
      estimated_savings: 6200
    }
  ],
  monthly_payment_amount: 1200,
  time_to_debt_free: 28,
  total_interest_saved: 8500,
  expected_completion_date: '2026-12-15',
  key_insights: [
    'Your high credit card interest rate (24.99%) makes this debt the clear priority for extra payments',
    'By focusing on the highest rate debt first, you\'ll save $2,300 more than the snowball method',
    'Maintaining discipline with this strategy requires tracking progress and celebrating milestones',
    'Consider automating extra payments to ensure consistency and remove temptation to spend elsewhere'
  ],
  action_items: [
    'Set up automatic minimum payments on all debts to ensure no missed payments',
    'Redirect all extra payment capacity ($415/month) to the Chase Freedom credit card',
    'Track debt balances monthly and celebrate when each debt reaches $0',
    'Consider balance transfer options if 0% APR promotions become available',
    'Review and adjust strategy quarterly as financial situation changes'
  ],
  risk_factors: [
    'Requires sustained discipline over 28 months without psychological wins until first debt is eliminated',
    'If income becomes unstable, the large payment commitments could create cash flow stress',
    'Interest rate changes on variable-rate debts could affect timeline and savings projections'
  ]
};

const mockStrategyComparison: StrategyComparison = {
  avalanche: {
    name: 'Debt Avalanche',
    timeToDebtFree: 28,
    totalInterestPaid: 12500,
    totalInterestSaved: 8500,
    monthlyPayment: 1200,
    debtFreeDate: '2026-12-15',
    description: 'Mathematical optimization approach'
  },
  snowball: {
    name: 'Debt Snowball',
    timeToDebtFree: 32,
    totalInterestPaid: 14800,
    totalInterestSaved: 6200,
    monthlyPayment: 1200,
    debtFreeDate: '2027-04-15',
    description: 'Psychological momentum approach'
  },
  recommended: 'avalanche',
  differences: {
    timeDifference: 4,
    interestDifference: 2300,
    paymentDifference: 0
  }
};

const mockRiskAssessment = {
  level: 'moderate' as const,
  factors: [
    'High credit card interest rate (24.99%) represents significant ongoing cost',
    'Total debt-to-income ratio indicates moderate leverage requiring active management',
    'Multiple debt types require coordinated strategy to avoid confusion or missed payments'
  ],
  mitigation_strategies: [
    'Automate all minimum payments to prevent late fees and credit score damage',
    'Build small emergency fund ($1,000) before aggressive debt payoff to prevent new debt',
    'Track progress monthly and adjust strategy if income or expenses change significantly',
    'Consider debt consolidation if better rates become available (target sub-15% APR)'
  ]
};

export const TestEnhancedInsights: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Enhanced AI Insights Testing</h1>

      <ProfessionalRecommendations
        recommendations={mockRecommendations}
      />

      <EnhancedStrategyComparison
        comparison={mockStrategyComparison}
        professionalStrategies={{
          avalanche: mockRepaymentPlan.primary_strategy,
          snowball: mockRepaymentPlan.alternative_strategies[0]
        }}
      />

      <RepaymentPlanDisplay
        repaymentPlan={mockRepaymentPlan}
      />

      <RiskAssessmentCard
        riskAssessment={mockRiskAssessment}
      />
    </div>
  );
};

export default TestEnhancedInsights;