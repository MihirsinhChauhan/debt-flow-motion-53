import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingDown, AlertCircle, Loader2, ExternalLink, ChevronRight, Edit3, Calendar, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AddDebtDialog from '@/components/debt/AddDebtDialog';
import DebtProgressRing from '@/components/debt/DebtProgressRing';

const DebtWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDebts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [debtResponse, summaryResponse] = await Promise.all([
        apiService.getDebts(),
        apiService.getDebtSummary().catch(() => null)
      ]);
      setDebts(debtResponse || []);
      setSummary(summaryResponse);
    } catch (err) {
      console.error('Failed to load debts:', err);
      setError('Unable to load debt information. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDebts();
    }
  }, [user]);

  const handleAddDebt = (newDebt) => {
    setDebts([...debts, newDebt]);
    loadDebts(); // Refresh the debts list
  };

  const handleWidgetClick = () => {
    navigate('/debt-details');
  };

  const handleDebtClick = (debt) => {
    navigate(`/debt-details/${debt.id}`);
  };

  const totalDebt = summary?.total_debt || debts.reduce((sum, debt) => sum + (debt.current_balance || 0), 0);
  const totalOriginal = debts.reduce((sum, debt) => sum + (debt.principal_amount || debt.amount || 0), 0);
  const debtCount = debts.length;
  const upcomingEMIs = summary?.upcomingPaymentsCount || 0;

  // Calculate progress percentage (amount paid)
  const progressPercentage = totalOriginal > 0 ? ((totalOriginal - totalDebt) / totalOriginal) * 100 : 0;

  // Calculate debt health based on DTI and payment status
  const getDebtHealth = () => {
    if (debtCount === 0) return { label: 'No Debt', color: 'green' };
    if (progressPercentage > 60) return { label: 'Excellent', color: 'green' };
    if (progressPercentage > 30) return { label: 'Good', color: 'green' };
    if (progressPercentage > 10) return { label: 'Fair', color: 'yellow' };
    return { label: 'Needs Attention', color: 'red' };
  };

  const debtHealth = getDebtHealth();

  // Get top 3 debts sorted by balance
  const topDebts = debts
    .sort((a, b) => (b.current_balance || 0) - (a.current_balance || 0))
    .slice(0, 3)
    .map(debt => ({
      ...debt,
      percentage: totalDebt > 0 ? ((debt.current_balance || 0) / totalDebt * 100) : 0
    }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading debt information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className="w-full cursor-pointer bg-card border-0 shadow-sm hover:shadow-md transition-all duration-200"
        onClick={handleWidgetClick}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-muted-foreground">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-medium text-foreground">Debt Analysis</h3>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {error ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600 mb-2">{error}</p>
              <Button onClick={loadDebts} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : debtCount === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">No debts found</p>
              <p className="text-sm text-muted-foreground">Add your first debt to get started</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Stats Section */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Outstanding Debt</div>
                  <div className="text-3xl font-semibold text-foreground">{formatCurrency(totalDebt)}</div>
                  <Badge
                    className={`mt-2 ${
                      debtHealth.color === 'green' ? 'bg-success/10 text-success-foreground border-success/20' :
                      debtHealth.color === 'yellow' ? 'bg-warning/10 text-warning-foreground border-warning/20' :
                      'bg-destructive/10 text-destructive-foreground border-destructive/20'
                    }`}
                    variant="outline"
                  >
                    Debt Health: {debtHealth.label}
                  </Badge>
                </div>

                <div className="flex flex-col items-center">
                  <DebtProgressRing
                    progress={progressPercentage}
                    size={100}
                    strokeWidth={6}
                    showPercentage={true}
                  />
                  <div className="text-xs text-muted-foreground mt-1">paid</div>
                </div>
              </div>

              {/* Top 3 Debts Section */}
              <div>
                <div className="text-sm font-medium text-foreground mb-3">Top 3 Debts:</div>
                <div className="space-y-2">
                  {topDebts.map((debt, index) => (
                    <div
                      key={debt.id || index}
                      className="flex justify-between items-center py-2 border-b border-border last:border-b-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDebtClick(debt);
                      }}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-foreground">
                          {debt.name || 'Unnamed Debt'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">
                          {formatCurrency(debt.current_balance || 0)} ({debt.percentage.toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming EMIs Section */}
              <div className="text-center pt-4 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Upcoming EMIs:</span>
                </div>
                <div className="text-2xl font-semibold text-foreground mt-1">
                  {upcomingEMIs} this week
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DebtWidget;