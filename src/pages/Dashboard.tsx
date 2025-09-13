
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  Receipt,
  Building2,
  Banknote
} from 'lucide-react';
import { motion } from 'framer-motion';
import DebtWidget from '@/components/dashboard/widgets/DebtWidget';
import PlaceholderWidget from '@/components/dashboard/widgets/PlaceholderWidget';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {greeting}, {userProfile.full_name} 👋
              </h1>
              <p className="text-sm text-gray-500">
                Here's your financial overview
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Monthly Income</p>
              <p className="text-lg font-semibold">{formatCurrency(userProfile.monthly_income)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Debt Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <DebtWidget />
          </motion.div>

          {/* Investments Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PlaceholderWidget
              title="Investments"
              icon={<TrendingUp className="h-4 w-4 text-gray-600" />}
              value={formatCurrency(208893)}
              subtext="Total value"
              trend="+26.6%"
              trendUp={true}
            />
          </motion.div>

          {/* Cash Flow Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PlaceholderWidget
              title="Cash Flow"
              icon={<Wallet className="h-4 w-4 text-gray-600" />}
              value={formatCurrency(3301)}
              subtext="September 2025"
              trend="94% less"
              trendUp={false}
            />
          </motion.div>

          {/* Spending Summary Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <PlaceholderWidget
              title="Spending Summary"
              icon={<PieChart className="h-4 w-4 text-gray-600" />}
              value={formatCurrency(30009)}
              subtext="September 2025"
            />
          </motion.div>

          {/* Bills Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <PlaceholderWidget
              title="Bills"
              icon={<Receipt className="h-4 w-4 text-gray-600" />}
              value="No upcoming dues"
              subtext="September 2025"
            />
          </motion.div>

          {/* Net Worth Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <PlaceholderWidget
              title="MHRH"
              icon={<Building2 className="h-4 w-4 text-gray-600" />}
              value={formatCurrency(253221)}
              subtext="Net worth"
              trend="+16.1%"
              trendUp={true}
            />
          </motion.div>

          {/* Current Balance Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <PlaceholderWidget
              title="STATE BANK OF INDIA"
              icon={<Banknote className="h-4 w-4 text-gray-600" />}
              value={formatCurrency(43527)}
              subtext="Current balance"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
