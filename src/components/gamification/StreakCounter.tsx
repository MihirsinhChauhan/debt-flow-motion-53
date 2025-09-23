
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  totalPayments: number;
  milestones: string[];
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  longestStreak,
  totalPayments,
  milestones
}) => {
  return (
    <Card className="bg-card border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-warning/10 p-2 rounded-full"
            >
              <Flame className="h-5 w-5 text-warning" />
            </motion.div>
            <h3 className="font-medium text-foreground">Payment Streak</h3>
          </div>

          {currentStreak >= 7 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-warning/20 p-1 rounded-full"
            >
              <Trophy className="h-4 w-4 text-warning-foreground" />
            </motion.div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <motion.div
              className="text-2xl font-semibold text-warning"
              key={currentStreak}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentStreak}
            </motion.div>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">{longestStreak}</div>
            <p className="text-xs text-muted-foreground">Best</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-semibold text-foreground">{totalPayments}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
        
        {milestones.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-foreground">Latest Achievement</span>
            </div>
            <p className="text-sm text-muted-foreground">{milestones[milestones.length - 1]}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
