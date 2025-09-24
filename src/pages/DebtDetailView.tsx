import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  TrendingDown,
  Calendar,
  Brain,
  Clock,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import { Debt, DebtSummary } from '@/types/debt';
import PaymentCalendar from '@/components/debt/PaymentCalendar';
import DebtOverviewTab from '@/components/debt/tabs/DebtOverviewTab';
import AIInsightsTab from '@/components/debt/tabs/AIInsightsTab';
import UpcomingEMIsTab from '@/components/debt/tabs/UpcomingEMIsTab';
import AddDebtDialog from '@/components/debt/AddDebtDialog';

interface PaymentEvent {
  id: string;
  date: string;
  amount: number;
  debt_name: string;
  status: 'paid' | 'overdue' | 'upcoming' | 'due_today';
  type: 'payment' | 'emi' | 'reminder';
}

const DebtDetailView: React.FC = () => {
  const { debtId } = useParams<{ debtId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [payments, setPayments] = useState<PaymentEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isCalendarCollapsed, setIsCalendarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        setError(null);

        const [debtResponse, summaryResponse] = await Promise.all([
          apiService.getDebts(),
          apiService.getDebtSummary().catch(() => null)
        ]);

        setDebts(debtResponse || []);
        setSummary(summaryResponse);

        // If a specific debt ID is provided, find and select it
        if (debtId && debtResponse) {
          const debt = debtResponse.find(d => d.id === debtId);
          setSelectedDebt(debt || null);
        }

        // Generate mock payment events
        generatePaymentEvents(debtResponse || []);

      } catch (err) {
        console.error('Failed to load debt data:', err);
        setError('Unable to load debt information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, debtId]);

  // Generate mock payment events from debts
  const generatePaymentEvents = (debtList: Debt[]) => {
    const events: PaymentEvent[] = [];
    const today = new Date();

    debtList.forEach(debt => {
      // Generate events for next 3 months
      for (let i = 0; i < 12; i++) {
        const eventDate = new Date(debt.due_date);

        // Add months based on payment frequency
        const monthsToAdd = debt.payment_frequency === 'monthly' ? i :
                          debt.payment_frequency === 'quarterly' ? i * 3 :
                          debt.payment_frequency === 'weekly' ? 0 : i;

        if (debt.payment_frequency === 'weekly') {
          eventDate.setDate(eventDate.getDate() + (i * 7));
        } else {
          eventDate.setMonth(eventDate.getMonth() + monthsToAdd);
        }

        const timeDiff = eventDate.getTime() - today.getTime();
        const daysUntilDue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        let status: PaymentEvent['status'] = 'upcoming';
        if (daysUntilDue < -30) continue; // Don't show very old overdue payments
        if (daysUntilDue < 0) status = 'overdue';
        else if (daysUntilDue === 0) status = 'due_today';
        else if (Math.random() > 0.7 && daysUntilDue < -7) status = 'paid'; // Some past payments marked as paid

        // Only include events within reasonable range
        if (daysUntilDue <= 90 && daysUntilDue >= -30) {
          events.push({
            id: `${debt.id}-${i}`,
            date: eventDate.toISOString().split('T')[0],
            amount: debt.minimum_payment,
            debt_name: debt.name,
            status,
            type: 'emi'
          });
        }
      }
    });

    setPayments(events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const handleAddDebt = (newDebt: Debt) => {
    setDebts(prev => [...prev, newDebt]);
    generatePaymentEvents([...debts, newDebt]);
  };

  const handleDebtClick = (debt: Debt) => {
    setSelectedDebt(debt);
    navigate(`/debt-details/${debt.id}`);
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  // Calculate header stats
  const totalDebt = summary?.total_debt || debts.reduce((sum, debt) => sum + debt.current_balance, 0);
  const totalOriginal = debts.reduce((sum, debt) => sum + debt.principal_amount, 0);
  const progressPercentage = totalOriginal > 0 ? ((totalOriginal - totalDebt) / totalOriginal) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-200 rounded w-48"></div>

            {/* Calendar skeleton */}
            <div className="h-64 bg-gray-200 rounded"></div>

            {/* Tabs skeleton */}
            <div className="h-12 bg-gray-200 rounded"></div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <TrendingDown className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()} className="flex-1">
                Retry
              </Button>
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {selectedDebt ? selectedDebt.name : 'Debt Management'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {formatCurrency(totalDebt)} across {debts.length} debts • {progressPercentage.toFixed(1)}% paid off
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <PaymentCalendar
            payments={payments}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            isCollapsed={isCalendarCollapsed}
            onToggleCollapse={() => setIsCalendarCollapsed(!isCalendarCollapsed)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full max-w-lg grid-cols-3 bg-muted">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Upcoming EMIs</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview" className="space-y-6">
              <DebtOverviewTab
                debts={debts}
                summary={summary}
                isLoading={false}
                onDebtClick={handleDebtClick}
              />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <AIInsightsTab
                debts={debts}
                summary={summary}
                isLoading={false}
              />
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-6">
              <UpcomingEMIsTab
                debts={debts}
                isLoading={false}
              />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>

      {/* Floating Action Button for Adding Debt */}
      <div className="fixed bottom-6 right-6 z-50">
        <AddDebtDialog onAddDebt={handleAddDebt}>
          <Button
            size="lg"
            className="rounded-full h-14 w-14 min-h-[56px] min-w-[56px] shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </AddDebtDialog>
      </div>
    </div>
  );
};

export default DebtDetailView;