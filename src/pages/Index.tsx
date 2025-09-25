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
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-xl sm:text-2xl font-bold text-primary">DebtEase</div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
            <Link to="/auth">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex text-xs sm:text-sm">Login</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-3">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
            Take Control of Your
            <span className="text-primary block mt-1 sm:mt-2">Debt Journey</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed">
            The smart way to manage all your Indian debts, track payments, and become debt-free faster with AI-powered insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                Start Your Debt-Free Journey
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Debt Types Section */}
      <section className="bg-muted/50 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 px-2">
              Support for All Indian Debt Types
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed">
              Whether it's credit cards, EMIs, loans, or overdrafts - DebtEase handles all your debts in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center max-w-4xl mx-auto px-2 sm:px-4">
            {debtTypes.map((type, index) => (
              <div
                key={index}
                className="bg-background border border-border rounded-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Everything You Need to Become Debt-Free
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed">
            Powerful features designed specifically for Indian users to manage debts effectively.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-2 sm:px-0">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-base sm:text-lg md:text-xl px-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm sm:text-base px-2 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-primary/5 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4 px-2">
                Why Choose DebtEase?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:gap-8 px-2 sm:px-0">
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
                <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-foreground leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 lg:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 sm:mb-6 px-2 leading-tight">
            Ready to Start Your Debt-Free Journey?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 px-2 sm:px-4 leading-relaxed">
            Join thousands of users who are taking control of their finances with DebtEase.
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
              Get Started for Free
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-primary mb-2">DebtEase</div>
            <p className="text-muted-foreground text-xs sm:text-sm px-2">
              Take control of your debts, achieve financial freedom.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;