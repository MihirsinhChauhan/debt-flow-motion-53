import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import {
  TrendingDown,
  Target,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Smartphone
} from 'lucide-react';

const Index = () => {
  const { user, debugAuth } = useAuth();

  const features = [
    {
      icon: <TrendingDown className="h-8 w-8 text-primary" />,
      title: "Smart Debt Tracking",
      description: "Track all your Indian debts - credit cards, EMIs, loans, and more in one place."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations to pay off debts faster and save on interest."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Progress Tracking",
      description: "Visualize your debt-free journey with beautiful charts and celebrate milestones."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Secure & Private",
      description: "Your financial data is encrypted and stored securely on your device."
    }
  ];

  const debtTypes = [
    "Credit Cards", "Personal Loans", "Home Loans", "Vehicle Loans", 
    "Education Loans", "Business Loans", "Gold Loans", "Overdrafts", "EMIs"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-primary">DebtEase</div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Take Control of Your
            <span className="text-primary block">Debt Journey</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto px-4">
            The smart way to manage all your Indian debts, track payments, and become debt-free faster with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Start Your Debt-Free Journey
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2">
              <Smartphone className="h-5 w-5" />
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Debt Types Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Support for All Indian Debt Types
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether it's credit cards, EMIs, loans, or overdrafts - DebtEase handles all your debts in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center max-w-4xl mx-auto px-4">
            {debtTypes.map((type, index) => (
              <div 
                key={index}
                className="bg-background border border-border rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium"
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Become Debt-Free
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed specifically for Indian users to manage debts effectively.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Why Choose DebtEase?
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {[
                "Track multiple debt types in one dashboard",
                "Get personalized payment strategies",
                "Visualize your progress with beautiful charts",
                "Receive smart payment reminders",
                "Calculate debt-to-income ratios",
                "Secure local data storage",
                "Works offline - no internet required",
                "Free to use with no hidden charges"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Ready to Start Your Debt-Free Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of users who are taking control of their finances with DebtEase.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2">
              Get Started for Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-xl font-bold text-primary mb-2">DebtEase</div>
            <p className="text-muted-foreground text-sm">
              Take control of your debts, achieve financial freedom.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;