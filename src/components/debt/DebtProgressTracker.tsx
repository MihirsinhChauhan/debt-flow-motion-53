/**
 * Advanced Debt Progress Tracker with Milestones and Achievements
 * Gamified debt management experience with visual progress indicators
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Target,
  Zap,
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  CheckCircle,
  Lock,
  Unlock,
  Fire,
  Crown,
  Medal,
  Sparkles,
  ChevronRight,
  BarChart3,
  LineChart,
  Progress as ProgressIcon,
  Gift
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Debt, PaymentHistoryItem, UserStreak } from '@/types/debt';
import { debtUtils } from '@/lib/debt-utils';

interface DebtProgressTrackerProps {
  debts: Debt[];
  paymentHistory: PaymentHistoryItem[];
  userStreak: UserStreak;
  onRecordPayment?: (debtId: string, amount: number) => void;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'payment' | 'reduction' | 'streak' | 'goal' | 'special';
  icon: React.ComponentType<{ className?: string }>;
  requirement: {
    type: 'amount_paid' | 'debt_reduction' | 'streak_days' | 'debts_completed' | 'consistency';
    value: number;
  };
  reward: {
    points: number;
    badge?: string;
    unlocks?: string[];
  };
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  points: number;
}

interface ProgressSummary {
  totalPaid: number;
  totalReduction: number;
  averagePayment: number;
  consistencyScore: number;
  debtFreeDate: Date | null;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  nextLevelProgress: number;
}

const DebtProgressTracker: React.FC<DebtProgressTrackerProps> = ({
  debts,
  paymentHistory,
  userStreak,
  onRecordPayment
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showCelebration, setShowCelebration] = useState(false);

  // Calculate comprehensive progress summary
  const progressSummary = useMemo((): ProgressSummary => {
    const totalPaid = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    const averagePayment = paymentHistory.length > 0 ? totalPaid / paymentHistory.length : 0;

    // Calculate debt reduction (approximate based on principal portions)
    const totalReduction = paymentHistory.reduce((sum, payment) => {
      return sum + (payment.principal_portion || payment.amount * 0.7); // Assume 70% goes to principal
    }, 0);

    // Consistency score based on regular payments
    const consistencyScore = calculateConsistencyScore(paymentHistory);

    // Estimate debt-free date
    const debtFreeDate = estimateDebtFreeDate(debts);

    // Calculate level and points
    const totalPoints = userStreak.total_payments_logged * 10 + userStreak.current_streak * 5;
    const level = Math.floor(totalPoints / 1000) + 1;
    const nextLevelProgress = (totalPoints % 1000) / 1000 * 100;

    return {
      totalPaid,
      totalReduction,
      averagePayment,
      consistencyScore,
      debtFreeDate,
      currentStreak: userStreak.current_streak,
      longestStreak: userStreak.longest_streak,
      totalPoints,
      level,
      nextLevelProgress
    };
  }, [debts, paymentHistory, userStreak]);

  // Generate milestones based on user progress
  const milestones = useMemo((): Milestone[] => {
    const baseMilestones: Omit<Milestone, 'isUnlocked' | 'progress' | 'unlockedAt'>[] = [
      {
        id: 'first_payment',
        title: 'First Payment',
        description: 'Record your first debt payment',
        category: 'payment',
        icon: Target,
        requirement: { type: 'amount_paid', value: 1 },
        reward: { points: 50, badge: '🎯' }
      },
      {
        id: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        category: 'streak',
        icon: Fire,
        requirement: { type: 'streak_days', value: 7 },
        reward: { points: 100, badge: '🔥' }
      },
      {
        id: 'paid_10k',
        title: 'Ten Thousand Club',
        description: 'Pay ₹10,000 towards debts',
        category: 'payment',
        icon: Star,
        requirement: { type: 'amount_paid', value: 10000 },
        reward: { points: 200, badge: '⭐' }
      },
      {
        id: 'reduction_25',
        title: 'Quarter Champion',
        description: 'Reduce total debt by 25%',
        category: 'reduction',
        icon: TrendingDown,
        requirement: { type: 'debt_reduction', value: 25 },
        reward: { points: 300, badge: '📉', unlocks: ['advanced_analytics'] }
      },
      {
        id: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        category: 'streak',
        icon: Trophy,
        requirement: { type: 'streak_days', value: 30 },
        reward: { points: 500, badge: '🏆' }
      },
      {
        id: 'paid_50k',
        title: 'High Roller',
        description: 'Pay ₹50,000 towards debts',
        category: 'payment',
        icon: Crown,
        requirement: { type: 'amount_paid', value: 50000 },
        reward: { points: 750, badge: '👑' }
      },
      {
        id: 'first_debt_free',
        title: 'Debt Slayer',
        description: 'Pay off your first debt completely',
        category: 'goal',
        icon: Award,
        requirement: { type: 'debts_completed', value: 1 },
        reward: { points: 1000, badge: '🥇', unlocks: ['celebration_mode'] }
      },
      {
        id: 'reduction_50',
        title: 'Half Way Hero',
        description: 'Reduce total debt by 50%',
        category: 'reduction',
        icon: Medal,
        requirement: { type: 'debt_reduction', value: 50 },
        reward: { points: 1500, badge: '🥈' }
      },
      {
        id: 'streak_100',
        title: 'Century Legend',
        description: 'Maintain a 100-day streak',
        category: 'streak',
        icon: Sparkles,
        requirement: { type: 'streak_days', value: 100 },
        reward: { points: 2000, badge: '✨' }
      },
      {
        id: 'debt_free',
        title: 'Debt Freedom',
        description: 'Achieve complete debt freedom',
        category: 'goal',
        icon: CheckCircle,
        requirement: { type: 'debt_reduction', value: 100 },
        reward: { points: 5000, badge: '🎉', unlocks: ['freedom_celebration'] }
      }
    ];

    return baseMilestones.map(milestone => {
      let progress = 0;
      let isUnlocked = false;

      switch (milestone.requirement.type) {
        case 'amount_paid':
          progress = Math.min(100, (progressSummary.totalPaid / milestone.requirement.value) * 100);
          isUnlocked = progressSummary.totalPaid >= milestone.requirement.value;
          break;
        case 'streak_days':
          progress = Math.min(100, (progressSummary.currentStreak / milestone.requirement.value) * 100);
          isUnlocked = progressSummary.currentStreak >= milestone.requirement.value;
          break;
        case 'debt_reduction':
          const totalOriginalDebt = debts.reduce((sum, debt) => sum + (debt.principal_amount || debt.current_balance), 0);
          const currentTotalDebt = debts.reduce((sum, debt) => sum + debt.current_balance, 0);
          const reductionPercentage = totalOriginalDebt > 0 ? ((totalOriginalDebt - currentTotalDebt) / totalOriginalDebt) * 100 : 0;
          progress = Math.min(100, (reductionPercentage / milestone.requirement.value) * 100);
          isUnlocked = reductionPercentage >= milestone.requirement.value;
          break;
        case 'debts_completed':
          const completedDebts = debts.filter(debt => debt.current_balance === 0).length;
          progress = Math.min(100, (completedDebts / milestone.requirement.value) * 100);
          isUnlocked = completedDebts >= milestone.requirement.value;
          break;
        case 'consistency':
          progress = Math.min(100, progressSummary.consistencyScore);
          isUnlocked = progressSummary.consistencyScore >= milestone.requirement.value;
          break;
      }

      return {
        ...milestone,
        isUnlocked,
        progress,
        unlockedAt: isUnlocked ? new Date() : undefined
      };
    });
  }, [debts, progressSummary]);

  // Generate recent achievements
  const recentAchievements = useMemo((): Achievement[] => {
    return milestones
      .filter(m => m.isUnlocked && m.unlockedAt)
      .slice(-3)
      .map(milestone => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        icon: milestone.icon,
        rarity: milestone.reward.points >= 1000 ? 'legendary' :
               milestone.reward.points >= 500 ? 'epic' :
               milestone.reward.points >= 200 ? 'rare' : 'common',
        unlockedAt: milestone.unlockedAt!,
        points: milestone.reward.points
      }));
  }, [milestones]);

  // Helper functions
  function calculateConsistencyScore(payments: PaymentHistoryItem[]): number {
    if (payments.length < 2) return 0;

    const sortedPayments = [...payments].sort((a, b) =>
      new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
    );

    let consistentDays = 0;
    let totalGaps = 0;

    for (let i = 1; i < sortedPayments.length; i++) {
      const daysDiff = Math.floor(
        (new Date(sortedPayments[i].payment_date).getTime() -
         new Date(sortedPayments[i-1].payment_date).getTime()) /
        (1000 * 60 * 60 * 24)
      );

      if (daysDiff <= 7) consistentDays++;
      totalGaps += daysDiff;
    }

    return Math.min(100, (consistentDays / (sortedPayments.length - 1)) * 100);
  }

  function estimateDebtFreeDate(debts: Debt[]): Date | null {
    if (debts.length === 0) return null;

    const averageMonthsToPayoff = debts.reduce((sum, debt) => {
      const payoff = debtUtils.calculations.estimatePayoffTime(debt);
      return sum + payoff.months;
    }, 0) / debts.length;

    if (!isFinite(averageMonthsToPayoff)) return null;

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + averageMonthsToPayoff);
    return futureDate;
  }

  function getRarityColor(rarity: Achievement['rarity']): string {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    }
  }

  function getCategoryColor(category: Milestone['category']): string {
    switch (category) {
      case 'payment': return 'bg-green-100 text-green-700';
      case 'reduction': return 'bg-blue-100 text-blue-700';
      case 'streak': return 'bg-orange-100 text-orange-700';
      case 'goal': return 'bg-purple-100 text-purple-700';
      case 'special': return 'bg-pink-100 text-pink-700';
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Your Progress Journey</CardTitle>
                <CardDescription>
                  Level {progressSummary.level} • {progressSummary.totalPoints.toLocaleString()} points
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{progressSummary.currentStreak}</div>
              <div className="text-sm text-muted-foreground">day streak</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Level Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Level {progressSummary.level}</span>
                <span>Level {progressSummary.level + 1}</span>
              </div>
              <Progress value={progressSummary.nextLevelProgress} className="h-3" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {debtUtils.formatting.formatCurrency(progressSummary.totalPaid)}
                </div>
                <div className="text-muted-foreground">Total Paid</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{progressSummary.consistencyScore.toFixed(0)}%</div>
                <div className="text-muted-foreground">Consistency</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{progressSummary.longestStreak}</div>
                <div className="text-muted-foreground">Best Streak</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {progressSummary.debtFreeDate ?
                    Math.ceil((progressSummary.debtFreeDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))
                    : '--'
                  }
                </div>
                <div className="text-muted-foreground">Months to Freedom</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`border-2 rounded-lg p-4 ${getRarityColor(achievement.rarity)}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <achievement.icon className="h-6 w-6" />
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-xs">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {achievement.rarity}
                    </Badge>
                    <span className="font-medium">+{achievement.points} pts</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Progress Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Streak */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Fire className="h-5 w-5" />
                  Payment Streak
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-orange-600">
                    {progressSummary.currentStreak}
                  </div>
                  <div className="text-muted-foreground">days in a row</div>
                  <Progress
                    value={Math.min(100, (progressSummary.currentStreak / 30) * 100)}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    Personal best: {progressSummary.longestStreak} days
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Debt Reduction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Debt Reduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {debts.slice(0, 3).map(debt => {
                    const progress = debtUtils.calculations.calculateProgress(debt);
                    return (
                      <div key={debt.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{debt.name}</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                  {debts.length > 3 && (
                    <Button variant="ghost" size="sm" className="w-full">
                      View all debts <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Keep the Momentum</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Target className="h-5 w-5" />
                  <span className="text-xs">Record Payment</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Calendar className="h-5 w-5" />
                  <span className="text-xs">Set Reminder</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">View Analytics</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                  <Gift className="h-5 w-5" />
                  <span className="text-xs">Claim Reward</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id} className={milestone.isUnlocked ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${milestone.isUnlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {milestone.isUnlocked ? (
                        <Unlock className="h-5 w-5 text-green-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{milestone.title}</h4>
                        <Badge className={getCategoryColor(milestone.category)}>
                          {milestone.category}
                        </Badge>
                        {milestone.reward.badge && (
                          <span className="text-lg">{milestone.reward.badge}</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {milestone.description}
                      </p>
                      <div className="space-y-2">
                        <Progress value={milestone.progress} className="h-2" />
                        <div className="flex justify-between text-xs">
                          <span>{milestone.progress.toFixed(0)}% complete</span>
                          <span className="font-medium">+{milestone.reward.points} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Payment Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <div className="text-center text-muted-foreground">
                    <LineChart className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Payment trend visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progress Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Principal Payments</span>
                      <span>{debtUtils.formatting.formatCurrency(progressSummary.totalReduction)}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Interest Payments</span>
                      <span>{debtUtils.formatting.formatCurrency(progressSummary.totalPaid - progressSummary.totalReduction)}</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div className="pt-2 border-t text-sm">
                    <div className="flex justify-between font-medium">
                      <span>Total Payments</span>
                      <span>{debtUtils.formatting.formatCurrency(progressSummary.totalPaid)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consistency Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Consistency Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{progressSummary.consistencyScore.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">Payment Consistency</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {debtUtils.formatting.formatCurrency(progressSummary.averagePayment)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Payment</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{paymentHistory.length}</div>
                  <div className="text-sm text-muted-foreground">Total Payments</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCelebration(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md mx-4 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-muted-foreground mb-4">
                You've unlocked a new achievement!
              </p>
              <Button onClick={() => setShowCelebration(false)}>
                Continue
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DebtProgressTracker;