
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Receipt,
  Building2,
  Banknote,
  TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import WidgetCard from '@/components/dashboard/WidgetCard';
import DebtWidget from '@/components/dashboard/widgets/DebtWidget';

const Dashboard = () => {
  const [greeting, setGreeting] = useState('');

  // Sample data - in real app this would come from Supabase
  const userProfile = {
    full_name: 'Mihir',
    monthly_income: 85000
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Helper function for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-fold-gray-100">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-fold-gray-900">
              {greeting}, {userProfile.full_name} 👋
            </h1>
            <p className="text-sm text-fold-gray-500 mt-1">
              Here's your financial overview
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-4 space-y-4">
        {/* Debt Widget - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DebtWidget />
        </motion.div>

        {/* Investments Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WidgetCard
            title="Investments"
            icon={<TrendingUp className="h-5 w-5 text-fold-gray-600" />}
            subtitle="Mutual Funds"
            value={formatCurrency(208893)}
            label="Total"
          />
        </motion.div>

        {/* MHRH Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <WidgetCard
            title="MHRH"
            subtitle="Mihirsinh Chauhan"
            icon={<Building2 className="h-5 w-5 text-fold-gray-600" />}
            value={formatCurrency(253221)}
            label="Net worth"
            hasChart={true}
            chartData={[
              { value: 253221, date: "Sep 13" },
              { value: 250000, date: "Sep 12" },
              { value: 248000, date: "Sep 11" },
            ]}
            metrics={[
              { label: "THIS MONTH", value: "+₹3,542" },
              { label: "THIS YEAR", value: "+₹70,664" },
              { label: "LIQUID", value: "₹44,327" },
              { label: "INVESTMENT", value: "₹2,08,893" }
            ]}
          />
        </motion.div>

        {/* Cash Flow Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <WidgetCard
            title="Cash Flow"
            icon={<Wallet className="h-5 w-5 text-fold-gray-600" />}
            subtitle="SEPTEMBER 2025"
            flowData={{
              incoming: 3301,
              outgoing: -30009,
              invested: 0,
              left: 0
            }}
          />
        </motion.div>

        {/* Spending Summary Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <WidgetCard
            title="Spending Summary"
            icon={<PieChart className="h-5 w-5 text-fold-gray-600" />}
            subtitle="SEPTEMBER 2025"
            spendingData={[
              { category: "Bill", amount: -19691 },
              { category: "Food & Drinks", amount: -2765 },
              { category: "Groceries", amount: -1578 },
              { category: "Transport", amount: -837 },
              { category: "Services", amount: -500 },
              { category: "Untagged", amount: -4638 }
            ]}
          />
        </motion.div>

        {/* STATE BANK OF INDIA Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <WidgetCard
            title="STATE BANK OF INDIA"
            subtitle="****6482"
            icon={<Banknote className="h-5 w-5 text-fold-gray-600" />}
            value={formatCurrency(43527)}
            label="Current balance"
            hasAreaChart={true}
            chartData={[
              { value: 43527, date: "Sep 13" },
              { value: 40000, date: "Sep 10" },
              { value: 42000, date: "Sep 7" },
              { value: 45000, date: "Aug 14" },
            ]}
          />
        </motion.div>
      </div>
    </div>
  );
};


export default Dashboard;
