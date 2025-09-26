// AI Goal Setting Interface - Intelligent goal creation and tracking system
// Uses AI to suggest realistic, personalized financial goals and track progress

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Lightbulb,
  Zap,
  AlertCircle,
  Trophy,
  Star,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Sparkles,
  PiggyBank,
  CreditCard,
  Home,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  category: 'debt_payoff' | 'emergency_fund' | 'savings' | 'investment' | 'credit_improvement' | 'custom';
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed' | 'paused' | 'failed';
  aiGenerated: boolean;
  aiConfidence: number;
  milestones: GoalMilestone[];
  strategies: string[];
  metrics: GoalMetrics;
  createdAt: Date;
  updatedAt: Date;
}

interface GoalMilestone {
  id: string;
  title: string;
  targetAmount: number;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
  reward?: string;
}

interface GoalMetrics {
  progressPercentage: number;
  monthlyRequired: number;
  daysRemaining: number;
  onTrack: boolean;
  averageMonthlyProgress: number;
  projectedCompletionDate: Date;
  riskLevel: 'low' | 'medium' | 'high';
}

interface AIGoalSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  recommendedTimeframe: number; // months
  reasoning: string;
  benefits: string[];
  strategies: string[];
  confidence: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  impact: 'high' | 'medium' | 'low';
}

interface AIGoalSettingInterfaceProps {
  userId: string;
  debtData?: any;
  currentIncome?: number;
  onGoalCreated?: (goal: FinancialGoal) => void;
  onGoalUpdated?: (goal: FinancialGoal) => void;
  className?: string;
}

const AIGoalSettingInterface: React.FC<AIGoalSettingInterfaceProps> = ({
  userId,
  debtData,
  currentIncome = 75000,
  onGoalCreated,
  onGoalUpdated,
  className = ''
}) => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AIGoalSuggestion[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form state for creating/editing goals
  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    category: 'debt_payoff' as const,
    targetAmount: 0,
    targetDate: '',
    priority: 'medium' as const
  });

  // Goal categories with icons and colors
  const goalCategories = [
    {
      id: 'debt_payoff',
      name: 'Debt Payoff',
      icon: CreditCard,
      color: 'text-red-600 bg-red-50 border-red-200',
      description: 'Eliminate specific debts or reduce total debt'
    },
    {
      id: 'emergency_fund',
      name: 'Emergency Fund',
      icon: PiggyBank,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      description: 'Build financial safety net for unexpected expenses'
    },
    {
      id: 'savings',
      name: 'Savings Goal',
      icon: Target,
      color: 'text-green-600 bg-green-50 border-green-200',
      description: 'Save for specific purchases or life events'
    },
    {
      id: 'investment',
      name: 'Investment',
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      description: 'Build wealth through investments and growth'
    },
    {
      id: 'credit_improvement',
      name: 'Credit Score',
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      description: 'Improve credit score and financial health'
    },
    {
      id: 'custom',
      name: 'Custom Goal',
      icon: Star,
      color: 'text-gray-600 bg-gray-50 border-gray-200',
      description: 'Create a personalized financial goal'
    }
  ];

  // Generate AI goal suggestions
  const generateAISuggestions = async () => {
    setIsGeneratingSuggestions(true);

    // Simulate AI analysis (in real implementation, this would call the AI service)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const suggestions: AIGoalSuggestion[] = [
      {
        id: 'debt_free_24m',
        title: 'Become Debt-Free in 24 Months',
        description: 'Completely eliminate all existing debts using optimized payment strategy',
        category: 'debt_payoff',
        targetAmount: 245000,
        recommendedTimeframe: 24,
        reasoning: 'Based on your current income and debt load, this timeline allows for comfortable payments while maintaining quality of life.',
        benefits: [
          'Save ₹45,000 in interest payments',
          'Improve credit score by 80+ points',
          'Free up ₹12,000/month for other goals'
        ],
        strategies: [
          'Switch to debt avalanche method',
          'Increase monthly payment by ₹3,000',
          'Use tax refunds for debt reduction'
        ],
        confidence: 92,
        difficulty: 'moderate',
        impact: 'high'
      },
      {
        id: 'emergency_fund_6m',
        title: 'Build 6-Month Emergency Fund',
        description: 'Accumulate emergency savings equal to 6 months of expenses',
        category: 'emergency_fund',
        targetAmount: 225000,
        recommendedTimeframe: 18,
        reasoning: 'Emergency fund provides crucial financial security. 6 months of expenses (₹37,500/month) offers comprehensive protection.',
        benefits: [
          'Financial security and peace of mind',
          'Ability to handle unexpected expenses',
          'Reduced stress and financial anxiety'
        ],
        strategies: [
          'Automate ₹12,500 monthly savings',
          'Use high-yield savings account',
          'Redirect windfall income to emergency fund'
        ],
        confidence: 88,
        difficulty: 'easy',
        impact: 'high'
      },
      {
        id: 'credit_score_750',
        title: 'Achieve Credit Score of 750+',
        description: 'Improve credit score to excellent range for better financial opportunities',
        category: 'credit_improvement',
        targetAmount: 750,
        recommendedTimeframe: 12,
        reasoning: 'Your current payment history and debt reduction efforts position you well for significant credit score improvement.',
        benefits: [
          'Access to best interest rates',
          'Higher credit limits and approvals',
          'Better insurance rates and terms'
        ],
        strategies: [
          'Maintain credit utilization below 10%',
          'Pay all bills on time consistently',
          'Keep old credit accounts open'
        ],
        confidence: 85,
        difficulty: 'easy',
        impact: 'medium'
      },
      {
        id: 'house_down_payment',
        title: 'Save for House Down Payment',
        description: 'Accumulate 20% down payment for home purchase',
        category: 'savings',
        targetAmount: 1000000,
        recommendedTimeframe: 36,
        reasoning: 'After debt freedom, redirect payment funds toward homeownership goal. 20% down payment avoids PMI costs.',
        benefits: [
          'Avoid private mortgage insurance',
          'Lower monthly mortgage payments',
          'Build equity from day one'
        ],
        strategies: [
          'Start after debt payoff completion',
          'Invest in balanced mutual funds',
          'Use home-buyer savings programs'
        ],
        confidence: 78,
        difficulty: 'challenging',
        impact: 'high'
      }
    ];

    setAiSuggestions(suggestions);
    setIsGeneratingSuggestions(false);
  };

  // Initialize with mock goals and generate suggestions
  useEffect(() => {
    const mockGoals: FinancialGoal[] = [
      {
        id: 'goal_1',
        title: 'Pay Off Credit Cards',
        description: 'Eliminate all credit card debt using avalanche method',
        category: 'debt_payoff',
        targetAmount: 125000,
        currentAmount: 35000,
        targetDate: new Date('2025-12-31'),
        priority: 'high',
        status: 'active',
        aiGenerated: true,
        aiConfidence: 92,
        milestones: [
          {
            id: 'm1',
            title: 'Pay off first credit card',
            targetAmount: 45000,
            targetDate: new Date('2025-06-30'),
            completed: true,
            completedAt: new Date('2025-05-15'),
            reward: 'Celebrate with dinner out'
          },
          {
            id: 'm2',
            title: 'Pay off second credit card',
            targetAmount: 85000,
            targetDate: new Date('2025-09-30'),
            completed: false
          },
          {
            id: 'm3',
            title: 'Pay off remaining balance',
            targetAmount: 125000,
            targetDate: new Date('2025-12-31'),
            completed: false
          }
        ],
        strategies: [
          'Focus on highest interest rate debts first',
          'Make extra payments when possible',
          'Avoid new credit card charges'
        ],
        metrics: {
          progressPercentage: 28,
          monthlyRequired: 7500,
          daysRemaining: 276,
          onTrack: true,
          averageMonthlyProgress: 8200,
          projectedCompletionDate: new Date('2025-11-15'),
          riskLevel: 'low'
        },
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date()
      }
    ];

    setGoals(mockGoals);
    generateAISuggestions();
  }, []);

  // Handle goal creation
  const handleCreateGoal = () => {
    const newGoal: FinancialGoal = {
      id: `goal_${Date.now()}`,
      title: goalForm.title,
      description: goalForm.description,
      category: goalForm.category,
      targetAmount: goalForm.targetAmount,
      currentAmount: 0,
      targetDate: new Date(goalForm.targetDate),
      priority: goalForm.priority,
      status: 'active',
      aiGenerated: false,
      aiConfidence: 0,
      milestones: [],
      strategies: [],
      metrics: {
        progressPercentage: 0,
        monthlyRequired: 0,
        daysRemaining: 0,
        onTrack: true,
        averageMonthlyProgress: 0,
        projectedCompletionDate: new Date(goalForm.targetDate),
        riskLevel: 'low'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setGoals(prev => [...prev, newGoal]);
    onGoalCreated?.(newGoal);
    setShowCreateModal(false);
    resetForm();
  };

  // Handle goal update
  const handleUpdateGoal = (goalId: string, updates: Partial<FinancialGoal>) => {
    setGoals(prev =>
      prev.map(goal =>
        goal.id === goalId
          ? { ...goal, ...updates, updatedAt: new Date() }
          : goal
      )
    );
  };

  // Accept AI suggestion as goal
  const handleAcceptSuggestion = (suggestion: AIGoalSuggestion) => {
    const newGoal: FinancialGoal = {
      id: `goal_ai_${Date.now()}`,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category as any,
      targetAmount: suggestion.targetAmount,
      currentAmount: 0,
      targetDate: new Date(Date.now() + suggestion.recommendedTimeframe * 30 * 24 * 60 * 60 * 1000),
      priority: suggestion.impact === 'high' ? 'high' : suggestion.impact === 'medium' ? 'medium' : 'low',
      status: 'active',
      aiGenerated: true,
      aiConfidence: suggestion.confidence,
      milestones: [],
      strategies: suggestion.strategies,
      metrics: {
        progressPercentage: 0,
        monthlyRequired: Math.round(suggestion.targetAmount / suggestion.recommendedTimeframe),
        daysRemaining: suggestion.recommendedTimeframe * 30,
        onTrack: true,
        averageMonthlyProgress: 0,
        projectedCompletionDate: new Date(Date.now() + suggestion.recommendedTimeframe * 30 * 24 * 60 * 60 * 1000),
        riskLevel: suggestion.difficulty === 'easy' ? 'low' : suggestion.difficulty === 'moderate' ? 'medium' : 'high'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setGoals(prev => [...prev, newGoal]);
    onGoalCreated?.(newGoal);
    setShowSuggestionsModal(false);
  };

  // Reset form
  const resetForm = () => {
    setGoalForm({
      title: '',
      description: '',
      category: 'debt_payoff',
      targetAmount: 0,
      targetDate: '',
      priority: 'medium'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get category data
  const getCategoryData = (categoryId: string) => {
    return goalCategories.find(cat => cat.id === categoryId) || goalCategories[0];
  };

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Goals ({activeGoals.length})</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Dialog open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Suggestions
                </Button>
              </DialogTrigger>
            </Dialog>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Goal Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Active Goals</span>
                </div>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-xs text-green-600 mt-1">
                  {activeGoals.filter(g => g.metrics.onTrack).length} on track
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Total Target</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatCurrency(activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0))} achieved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Completed</span>
                </div>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
                <p className="text-xs text-purple-600 mt-1">
                  Goals achieved this year
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.slice(0, 3).map((goal) => {
                  const categoryData = getCategoryData(goal.category);
                  const CategoryIcon = categoryData.icon;

                  return (
                    <div key={goal.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`p-2 rounded-lg ${categoryData.color}`}>
                        <CategoryIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{goal.title}</h4>
                          <Badge
                            className={
                              goal.status === 'completed' ? 'bg-green-100 text-green-700' :
                              goal.status === 'active' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }
                          >
                            {goal.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 mb-2">
                          <div className="flex-1">
                            <Progress value={goal.metrics.progressPercentage} className="h-2" />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{formatCurrency(goal.currentAmount)}</span>
                              <span>{formatCurrency(goal.targetAmount)}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{goal.metrics.progressPercentage}%</div>
                            <div className="text-xs text-gray-500">
                              {goal.metrics.daysRemaining} days left
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Goals Tab */}
        <TabsContent value="active" className="space-y-4">
          {activeGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Active Goals</h3>
              <p className="text-gray-500 mb-6">
                Create your first financial goal to start tracking your progress
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Goal
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeGoals.map((goal) => {
                const categoryData = getCategoryData(goal.category);
                const CategoryIcon = categoryData.icon;

                return (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`${goal.aiGenerated ? 'ring-1 ring-blue-200 bg-blue-50/30' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${categoryData.color}`}>
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold flex items-center gap-2">
                                {goal.title}
                                {goal.aiGenerated && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI
                                  </Badge>
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">{goal.description}</p>
                            </div>
                          </div>

                          <Badge
                            className={
                              goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }
                          >
                            {goal.priority}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Progress */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Progress</span>
                            <span className="text-sm font-medium">{goal.metrics.progressPercentage}%</span>
                          </div>
                          <Progress value={goal.metrics.progressPercentage} className="h-3" />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{formatCurrency(goal.currentAmount)}</span>
                            <span>{formatCurrency(goal.targetAmount)}</span>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Monthly Required</span>
                            <p className="font-medium">{formatCurrency(goal.metrics.monthlyRequired)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Target Date</span>
                            <p className="font-medium">{goal.targetDate.toLocaleDateString('en-IN')}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Days Remaining</span>
                            <p className="font-medium">{goal.metrics.daysRemaining}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">On Track</span>
                            <p className={`font-medium ${goal.metrics.onTrack ? 'text-green-600' : 'text-red-600'}`}>
                              {goal.metrics.onTrack ? 'Yes' : 'Behind'}
                            </p>
                          </div>
                        </div>

                        {/* Milestones */}
                        {goal.milestones.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Milestones</h4>
                            <div className="space-y-1">
                              {goal.milestones.slice(0, 2).map((milestone) => (
                                <div key={milestone.id} className="flex items-center gap-2 text-sm">
                                  <CheckCircle
                                    className={`h-4 w-4 ${
                                      milestone.completed ? 'text-green-500' : 'text-gray-300'
                                    }`}
                                  />
                                  <span className={milestone.completed ? 'line-through text-gray-500' : ''}>
                                    {milestone.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Update Progress
                          </Button>
                          <Button size="sm" variant="outline">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* AI Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">AI-Powered Goal Suggestions</h3>
              <p className="text-gray-600">Personalized financial goals based on your current situation</p>
            </div>
            <Button
              onClick={generateAISuggestions}
              disabled={isGeneratingSuggestions}
              variant="outline"
            >
              {isGeneratingSuggestions ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              {isGeneratingSuggestions ? 'Generating...' : 'Generate New Suggestions'}
            </Button>
          </div>

          {isGeneratingSuggestions ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {aiSuggestions.map((suggestion) => {
                const categoryData = getCategoryData(suggestion.category);
                const CategoryIcon = categoryData.icon;

                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${categoryData.color}`}>
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{suggestion.title}</h3>
                              <p className="text-sm text-gray-600">{suggestion.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                suggestion.impact === 'high' ? 'bg-red-100 text-red-700' :
                                suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }
                            >
                              {suggestion.impact} impact
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-700">
                              {suggestion.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Goal Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Target Amount</span>
                            <p className="font-medium">{formatCurrency(suggestion.targetAmount)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Timeframe</span>
                            <p className="font-medium">{suggestion.recommendedTimeframe} months</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Monthly Required</span>
                            <p className="font-medium">
                              {formatCurrency(Math.round(suggestion.targetAmount / suggestion.recommendedTimeframe))}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Difficulty</span>
                            <p className={`font-medium capitalize ${
                              suggestion.difficulty === 'easy' ? 'text-green-600' :
                              suggestion.difficulty === 'moderate' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {suggestion.difficulty}
                            </p>
                          </div>
                        </div>

                        {/* AI Reasoning */}
                        <div className="p-3 bg-white/60 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                            <Lightbulb className="h-4 w-4" />
                            AI Reasoning
                          </h4>
                          <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
                        </div>

                        {/* Benefits */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Key Benefits</h4>
                          <ul className="space-y-1">
                            {suggestion.benefits.slice(0, 2).map((benefit, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleAcceptSuggestion(suggestion)}
                            className="flex-1"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Accept Goal
                          </Button>
                          <Button variant="outline" size="sm">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Goal Modal */}
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Financial Goal</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={goalForm.title}
                onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Pay off credit cards"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={goalForm.category}
                onValueChange={(value) => setGoalForm(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={goalForm.description}
              onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your goal and motivation"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="targetAmount">Target Amount (₹)</Label>
              <Input
                id="targetAmount"
                type="number"
                value={goalForm.targetAmount || ''}
                onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={goalForm.priority}
                onValueChange={(value) => setGoalForm(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGoal}
              disabled={!goalForm.title || !goalForm.targetAmount || !goalForm.targetDate}
            >
              Create Goal
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* AI Suggestions Modal */}
      <Dialog open={showSuggestionsModal} onOpenChange={setShowSuggestionsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              AI Goal Suggestions
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {aiSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="border-blue-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{suggestion.title}</h3>
                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      {suggestion.confidence}% confidence
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Amount</span>
                      <p className="font-medium">{formatCurrency(suggestion.targetAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Timeframe</span>
                      <p className="font-medium">{suggestion.recommendedTimeframe} months</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly</span>
                      <p className="font-medium">
                        {formatCurrency(Math.round(suggestion.targetAmount / suggestion.recommendedTimeframe))}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Impact</span>
                      <p className={`font-medium capitalize ${
                        suggestion.impact === 'high' ? 'text-red-600' :
                        suggestion.impact === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {suggestion.impact}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Accept Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIGoalSettingInterface;