import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  PartyPopper,
  TrendingUp,
  Target,
  Calendar,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency, cn } from '@/lib/utils';
import { Debt } from '@/types/debt';

interface PaymentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt;
  paymentAmount: number;
  newBalance: number;
  isFullPayoff: boolean;
  totalInterestSaved?: number;
  monthsAhead?: number;
}

const PaymentSuccessDialog: React.FC<PaymentSuccessDialogProps> = ({
  isOpen,
  onClose,
  debt,
  paymentAmount,
  newBalance,
  isFullPayoff,
  totalInterestSaved,
  monthsAhead
}) => {
  const progressPercentage = ((debt.current_balance - newBalance) / debt.current_balance) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
        <div className="space-y-6 text-center">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1
            }}
            className="mx-auto"
          >
            {isFullPayoff ? (
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PartyPopper className="h-10 w-10 text-white" />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute -top-2 -right-2 text-2xl"
                >
                  🎉
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="absolute -bottom-2 -left-2 text-2xl"
                >
                  🎊
                </motion.div>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            )}
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {isFullPayoff ? '🎉 Debt Paid Off!' : 'Payment Successful!'}
            </h2>
            <p className="text-gray-600">
              {isFullPayoff
                ? `Congratulations! You've completely paid off ${debt.name}!`
                : `Your payment has been applied to ${debt.name}`
              }
            </p>
          </motion.div>

          {/* Payment Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={cn(
              "border-2",
              isFullPayoff ? "border-green-200 bg-green-50" : "border-blue-200 bg-blue-50"
            )}>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Payment Amount</p>
                    <p className="font-semibold text-lg">{formatCurrency(paymentAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      {isFullPayoff ? 'Final Balance' : 'New Balance'}
                    </p>
                    <p className={cn(
                      "font-semibold text-lg",
                      isFullPayoff ? "text-green-600" : "text-gray-900"
                    )}>
                      {formatCurrency(newBalance)}
                    </p>
                  </div>
                </div>

                {!isFullPayoff && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{progressPercentage.toFixed(1)}% paid</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            {isFullPayoff && (
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  <Target className="h-3 w-3 mr-1" />
                  Debt Free!
                </Badge>
                {totalInterestSaved && totalInterestSaved > 0 && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Saved {formatCurrency(totalInterestSaved)}
                  </Badge>
                )}
                {monthsAhead && monthsAhead > 0 && (
                  <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                    <Calendar className="h-3 w-3 mr-1" />
                    {monthsAhead} months ahead
                  </Badge>
                )}
              </div>
            )}

            {!isFullPayoff && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Keep it up!</span>
                </div>
                <p className="text-xs text-yellow-700 mt-1">
                  You're making great progress on paying down this debt.
                </p>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-3"
          >
            <Button
              onClick={onClose}
              className="w-full"
              size="lg"
            >
              {isFullPayoff ? (
                <>
                  <PartyPopper className="h-4 w-4 mr-2" />
                  Celebrate More!
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Continue
                </>
              )}
            </Button>

            {isFullPayoff && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>🎉 Share your success with friends!</p>
                <p>💡 Consider applying this payment to another debt</p>
              </div>
            )}
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessDialog;