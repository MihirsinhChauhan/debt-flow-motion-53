// Debt Gamification System - Engaging achievement and progress system
// Motivates users through gamification elements, achievements, and social features

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Star,
  Target,
  Zap,
  Award,
  Crown,
  Shield,
  Heart,
  Gift,
  Medal,
  Sparkles,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  Share2,
  Users,
  MessageCircle,
  ThumbsUp,
  Fire,
  Timer,
  Rocket,
  Lock,
  Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'milestone' | 'consistency' | 'optimization' | 'social' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  points: number;
  requirement: {
    type: 'debt_reduced' | 'payments_made' | 'streak_days' | 'savings_amount' | 'referrals' | 'custom';
    value: number;
    unit?: string;
  };
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
  reward?: {
    type: 'badge' | 'title' | 'feature' | 'discount' | 'celebration';
    value: string;
  };
}

interface UserLevel {
  level: number;
  title: string;
  xp: number;
  xpRequired: number;
  benefits: string[];
  icon: React.ComponentType<any>;
  color: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'limited_time';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  deadline: Date;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  requirement: string;
  reward: {
    xp: number;
    points: number;
    special?: string;
  };
}

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  level: number;
  points: number;
  debtReduced: number;
  streak: number;
  rank: number;
  isCurrentUser: boolean;
}

interface DebtGameificationSystemProps {
  userId: string;
  currentDebtReduced: number;
  totalPayments: number;
  consecutiveDays: number;
  onShareAchievement?: (achievement: Achievement) => void;
  onChallengeAccept?: (challenge: Challenge) => void;
  className?: string;
}

const DebtGameificationSystem: React.FC<DebtGameificationSystemProps> = ({
  userId,
  currentDebtReduced = 125000,
  totalPayments = 15,
  consecutiveDays = 45,
  onShareAchievement,
  onChallengeAccept,
  className = ''
}) => {
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Level progression system
  const levels: UserLevel[] = [
    {
      level: 1,
      title: 'Debt Fighter',
      xp: 0,
      xpRequired: 100,
      benefits: ['Basic debt tracking', 'Payment reminders'],
      icon: Shield,
      color: 'text-gray-600 bg-gray-100'
    },
    {
      level: 2,
      title: 'Debt Warrior',
      xp: 100,
      xpRequired: 300,
      benefits: ['AI insights', 'Strategy recommendations'],
      icon: Award,
      color: 'text-bronze-600 bg-bronze-100'
    },
    {
      level: 3,
      title: 'Debt Champion',
      xp: 400,
      xpRequired: 700,
      benefits: ['Advanced analytics', 'Priority support'],
      icon: Medal,
      color: 'text-silver-600 bg-silver-100'
    },
    {
      level: 4,
      title: 'Debt Master',
      xp: 1100,
      xpRequired: 1500,
      benefits: ['Premium features', 'Financial advisor access'],
      icon: Crown,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      level: 5,
      title: 'Debt Legend',
      xp: 2600,
      xpRequired: 0,
      benefits: ['All features unlocked', 'VIP status'],
      icon: Trophy,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  // Generate achievements data
  const generateAchievements = (): Achievement[] => {
    return [
      {
        id: 'first_payment',
        title: 'First Step',
        description: 'Made your first debt payment',
        icon: CheckCircle,
        category: 'milestone',
        tier: 'bronze',
        points: 50,
        requirement: { type: 'payments_made', value: 1 },
        isUnlocked: totalPayments >= 1,
        unlockedAt: totalPayments >= 1 ? new Date('2025-01-15') : undefined,
        progress: Math.min(100, (totalPayments / 1) * 100),
        reward: { type: 'badge', value: 'Debt Fighter Badge' }
      },
      {
        id: 'debt_reducer_25k',
        title: 'Quarter Century',
        description: 'Reduced debt by ₹25,000',
        icon: TrendingUp,
        category: 'milestone',
        tier: 'silver',
        points: 100,
        requirement: { type: 'debt_reduced', value: 25000, unit: '₹' },
        isUnlocked: currentDebtReduced >= 25000,
        unlockedAt: currentDebtReduced >= 25000 ? new Date('2025-03-01') : undefined,
        progress: Math.min(100, (currentDebtReduced / 25000) * 100),
        reward: { type: 'celebration', value: 'Victory Animation' }
      },
      {
        id: 'consistency_champion',
        title: 'Consistency Champion',
        description: 'Made payments for 30 consecutive days',
        icon: Fire,
        category: 'consistency',
        tier: 'gold',
        points: 200,
        requirement: { type: 'streak_days', value: 30, unit: 'days' },
        isUnlocked: consecutiveDays >= 30,
        unlockedAt: consecutiveDays >= 30 ? new Date('2025-02-15') : undefined,
        progress: Math.min(100, (consecutiveDays / 30) * 100),
        reward: { type: 'title', value: 'Consistency Champion' }
      },
      {
        id: 'debt_crusher_100k',
        title: 'Debt Crusher',
        description: 'Reduced debt by ₹1,00,000',
        icon: Rocket,
        category: 'milestone',
        tier: 'gold',
        points: 300,
        requirement: { type: 'debt_reduced', value: 100000, unit: '₹' },
        isUnlocked: currentDebtReduced >= 100000,
        unlockedAt: currentDebtReduced >= 100000 ? new Date('2025-05-01') : undefined,
        progress: Math.min(100, (currentDebtReduced / 100000) * 100),
        reward: { type: 'feature', value: 'Premium Analytics Access' }
      },
      {
        id: 'payment_perfectionist',
        title: 'Payment Perfectionist',
        description: 'Made 50 successful payments',
        icon: Star,
        category: 'milestone',
        tier: 'platinum',
        points: 400,
        requirement: { type: 'payments_made', value: 50 },
        isUnlocked: false,
        progress: Math.min(100, (totalPayments / 50) * 100),
        reward: { type: 'badge', value: 'Platinum Star' }
      },
      {
        id: 'debt_destroyer',
        title: 'Debt Destroyer',
        description: 'Completely eliminated all debt',
        icon: Trophy,
        category: 'milestone',
        tier: 'diamond',
        points: 1000,
        requirement: { type: 'debt_reduced', value: 500000, unit: '₹' },
        isUnlocked: false,
        progress: Math.min(100, (currentDebtReduced / 500000) * 100),
        reward: { type: 'celebration', value: 'Grand Victory Celebration' }
      }
    ];
  };

  // Generate challenges
  const generateChallenges = (): Challenge[] => {
    const now = new Date();
    return [
      {
        id: 'daily_check',
        title: 'Daily Check-in',
        description: 'Check your debt progress today',
        type: 'daily',
        difficulty: 'easy',
        points: 10,
        deadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        isActive: true,
        isCompleted: false,
        progress: 0,
        requirement: 'Log in and view dashboard',
        reward: { xp: 25, points: 10 }
      },
      {
        id: 'weekly_payment',
        title: 'Weekly Payment Warrior',
        description: 'Make extra payment this week',
        type: 'weekly',
        difficulty: 'medium',
        points: 50,
        deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        isActive: true,
        isCompleted: false,
        progress: 65,
        requirement: 'Make payment ₹2,000 above minimum',
        reward: { xp: 100, points: 50, special: 'Warrior Badge' }
      },
      {
        id: 'monthly_milestone',
        title: 'Monthly Milestone',
        description: 'Reduce debt by ₹20,000 this month',
        type: 'monthly',
        difficulty: 'hard',
        points: 200,
        deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        isCompleted: false,
        progress: 75,
        requirement: 'Achieve ₹20,000 debt reduction',
        reward: { xp: 300, points: 200, special: 'Monthly Champion Title' }
      },
      {
        id: 'strategy_optimizer',
        title: 'Strategy Optimizer',
        description: 'Try AI-recommended strategy',
        type: 'limited_time',
        difficulty: 'medium',
        points: 75,
        deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        isActive: true,
        isCompleted: false,
        progress: 0,
        requirement: 'Implement AI strategy recommendation',
        reward: { xp: 150, points: 75, special: 'Strategy Master Badge' }
      }
    ];
  };

  // Generate leaderboard
  const generateLeaderboard = (): LeaderboardEntry[] => {
    return [
      {
        id: '1',
        name: 'Rajesh Kumar',
        avatar: 'RK',
        level: 4,
        points: 2150,
        debtReduced: 350000,
        streak: 89,
        rank: 1,
        isCurrentUser: false
      },
      {
        id: '2',
        name: 'Priya Sharma',
        avatar: 'PS',
        level: 4,
        points: 1980,
        debtReduced: 285000,
        streak: 67,
        rank: 2,
        isCurrentUser: false
      },
      {
        id: userId,
        name: 'You',
        avatar: 'YU',
        level: 3,
        points: 1650,
        debtReduced: currentDebtReduced,
        streak: consecutiveDays,
        rank: 3,
        isCurrentUser: true
      },
      {
        id: '4',
        name: 'Amit Patel',
        avatar: 'AP',
        level: 3,
        points: 1420,
        debtReduced: 195000,
        streak: 45,
        rank: 4,
        isCurrentUser: false
      },
      {
        id: '5',
        name: 'Sneha Gupta',
        avatar: 'SG',
        level: 2,
        points: 890,
        debtReduced: 125000,
        streak: 23,
        rank: 5,
        isCurrentUser: false
      }
    ];
  };

  // Initialize data
  useEffect(() => {
    const totalXP = 750; // Mock user XP
    const currentLevel = levels.find(level =>
      totalXP >= level.xp && (level.xpRequired === 0 || totalXP < level.xp + level.xpRequired)
    ) || levels[0];

    setUserLevel(currentLevel);
    setAchievements(generateAchievements());
    setChallenges(generateChallenges());
    setLeaderboard(generateLeaderboard());

    // Simulate new achievement unlock
    const timer = setTimeout(() => {
      const newAchievement = generateAchievements().find(a => a.id === 'consistency_champion');
      if (newAchievement && newAchievement.isUnlocked) {
        setShowCelebration(newAchievement);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get tier color
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-700 bg-amber-100 border-amber-300';
      case 'silver': return 'text-gray-700 bg-gray-100 border-gray-300';
      case 'gold': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'platinum': return 'text-purple-700 bg-purple-100 border-purple-300';
      case 'diamond': return 'text-blue-700 bg-blue-100 border-blue-300';
      default: return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'hard': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  // Handle achievement share
  const handleShareAchievement = (achievement: Achievement) => {
    onShareAchievement?.(achievement);
  };

  // Handle challenge accept
  const handleChallengeAccept = (challenge: Challenge) => {
    onChallengeAccept?.(challenge);
  };

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);
  const activeChallenges = challenges.filter(c => c.isActive && !c.isCompleted);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <Dialog open={!!showCelebration} onOpenChange={() => setShowCelebration(null)}>
            <DialogContent className="max-w-md">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="text-center py-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: 2
                  }}
                  className="inline-block mb-4"
                >
                  <showCelebration.icon className="h-16 w-16 text-yellow-500 mx-auto" />
                </motion.div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 Achievement Unlocked!
                </h2>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {showCelebration.title}
                </h3>

                <p className="text-gray-600 mb-4">
                  {showCelebration.description}
                </p>

                <div className="flex justify-center gap-2 mb-6">
                  <Badge className={getTierColor(showCelebration.tier)}>
                    {showCelebration.tier.toUpperCase()}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700">
                    +{showCelebration.points} points
                  </Badge>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => handleShareAchievement(showCelebration)}
                    variant="outline"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={() => setShowCelebration(null)}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Header Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {userLevel && (
                  <div className={`p-2 rounded-lg ${userLevel.color}`}>
                    <userLevel.icon className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Current Level</p>
                  <p className="font-bold">{userLevel?.title}</p>
                  <p className="text-xs text-gray-500">Level {userLevel?.level}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-gray-600">Total Points</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{totalPoints.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{unlockedAchievements.length} achievements unlocked</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Fire className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-gray-600">Current Streak</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{consecutiveDays}</p>
              <p className="text-xs text-gray-500">consecutive days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Active Challenges</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{activeChallenges.length}</p>
              <p className="text-xs text-gray-500">in progress</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Gamification Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements ({unlockedAchievements.length})</TabsTrigger>
          <TabsTrigger value="challenges">Challenges ({activeChallenges.length})</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Level Progress */}
          {userLevel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <userLevel.icon className="h-5 w-5" />
                  {userLevel.title} Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">XP Progress</span>
                      <span className="text-sm font-medium">
                        750 / {userLevel.xpRequired === 0 ? 'MAX' : userLevel.xp + userLevel.xpRequired} XP
                      </span>
                    </div>
                    <Progress
                      value={userLevel.xpRequired === 0 ? 100 : (750 - userLevel.xp) / userLevel.xpRequired * 100}
                      className="h-3"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Level Benefits</h4>
                    <ul className="space-y-1">
                      {userLevel.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unlockedAchievements.slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-lg ${getTierColor(achievement.tier)}`}>
                      <achievement.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getTierColor(achievement.tier)}>
                        {achievement.tier}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">+{achievement.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Challenges Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeChallenges.slice(0, 2).map((challenge) => (
                  <div key={challenge.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{challenge.title}</h4>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={challenge.progress} className="flex-1 h-2" />
                        <span className="text-xs text-gray-500">{challenge.progress}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">+{challenge.points} pts</p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((challenge.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days left
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unlocked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Unlocked ({unlockedAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unlockedAchievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 border-green-200"
                    >
                      <div className={`p-2 rounded-lg ${getTierColor(achievement.tier)}`}>
                        <achievement.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        {achievement.unlockedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Unlocked {achievement.unlockedAt.toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className={getTierColor(achievement.tier)}>
                          {achievement.tier}
                        </Badge>
                        <p className="text-sm text-green-600 font-medium mt-1">
                          +{achievement.points} pts
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleShareAchievement(achievement)}
                          className="mt-2 text-xs"
                        >
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Locked Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gray-600" />
                  Locked ({lockedAchievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lockedAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-3 border rounded-lg opacity-75"
                    >
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-700">{achievement.title}</h4>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-gray-100 text-gray-600">
                          {achievement.tier}
                        </Badge>
                        <p className="text-sm text-gray-500 mt-1">
                          +{achievement.points} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={challenge.isCompleted ? 'bg-green-50 border-green-200' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {challenge.title}
                          {challenge.isCompleted && <CheckCircle className="h-4 w-4 text-green-600" />}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(challenge.difficulty)}>
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {challenge.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">+{challenge.points} pts</p>
                        <p className="text-xs text-gray-500">
                          {Math.ceil((challenge.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000))} days left
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{challenge.progress}%</span>
                        </div>
                        <Progress value={challenge.progress} className="h-2" />
                      </div>

                      <div className="text-sm">
                        <p className="text-gray-600 mb-1">Requirement:</p>
                        <p className="font-medium">{challenge.requirement}</p>
                      </div>

                      <div className="text-sm">
                        <p className="text-gray-600 mb-1">Rewards:</p>
                        <div className="flex gap-2">
                          <Badge className="bg-blue-100 text-blue-700">
                            +{challenge.reward.xp} XP
                          </Badge>
                          <Badge className="bg-yellow-100 text-yellow-700">
                            +{challenge.reward.points} pts
                          </Badge>
                          {challenge.reward.special && (
                            <Badge className="bg-purple-100 text-purple-700">
                              {challenge.reward.special}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {!challenge.isCompleted && (
                        <Button
                          onClick={() => handleChallengeAccept(challenge)}
                          className="w-full"
                          size="sm"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Accept Challenge
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Debt Reduction Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-4 border rounded-lg ${
                      entry.isCurrentUser ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-300' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        entry.rank === 1 ? 'bg-yellow-500' :
                        entry.rank === 2 ? 'bg-gray-400' :
                        entry.rank === 3 ? 'bg-amber-600' :
                        'bg-blue-500'
                      }`}>
                        {entry.rank <= 3 ? (
                          entry.rank === 1 ? <Crown className="h-4 w-4" /> :
                          entry.rank === 2 ? <Medal className="h-4 w-4" /> :
                          <Award className="h-4 w-4" />
                        ) : (
                          entry.rank
                        )}
                      </div>

                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {entry.avatar}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        {entry.name}
                        {entry.isCurrentUser && (
                          <Badge className="bg-blue-100 text-blue-700">You</Badge>
                        )}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Level {entry.level}</span>
                        <span>{formatCurrency(entry.debtReduced)} reduced</span>
                        <span className="flex items-center gap-1">
                          <Fire className="h-3 w-3 text-orange-500" />
                          {entry.streak} day streak
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.points.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  View Full Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebtGameificationSystem;