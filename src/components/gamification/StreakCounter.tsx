
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
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-orange-100 p-2 rounded-full"
            >
              <Flame className="h-5 w-5 text-orange-600" />
            </motion.div>
            <h3 className="font-semibold text-gray-800">Payment Streak</h3>
          </div>
          
          {currentStreak >= 7 && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-yellow-100 p-1 rounded-full"
            >
              <Trophy className="h-4 w-4 text-yellow-600" />
            </motion.div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <motion.div
              className="text-2xl font-bold text-orange-600"
              key={currentStreak}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentStreak}
            </motion.div>
            <p className="text-xs text-gray-600">Current</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{longestStreak}</div>
            <p className="text-xs text-gray-600">Best</p>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-700">{totalPayments}</div>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
        
        {milestones.length > 0 && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Latest Achievement</span>
            </div>
            <p className="text-sm text-gray-600">{milestones[milestones.length - 1]}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreakCounter;
