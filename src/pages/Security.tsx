
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Fingerprint, Database, Server, CheckCircle } from 'lucide-react';

const Security = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security & Privacy</h1>
        <p className="text-muted-foreground mt-1">
          Learn how we keep your financial data safe and secure
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Lock className="h-5 w-5 text-finance-blue" />
              Data Encryption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              All your sensitive financial data is encrypted using industry-standard 256-bit encryption
              both in transit and at rest.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
              We never store your full bank account numbers or credit card details.
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Eye className="h-5 w-5 text-finance-blue" />
              Privacy Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You have complete control over what data you share and how it's used.
              Opt out of data analytics or delete your data at any time.
            </p>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">No data sold to third parties</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-white overflow-hidden">
        <CardHeader className="border-b bg-gray-50 pb-4">
          <CardTitle className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-finance-blue" />
            How We Protect Your Data
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            <div className="flex p-4 gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-full">
                <Database className="h-5 w-5 text-finance-blue" />
              </div>
              <div>
                <h3 className="font-medium">Secure Bank Connections</h3>
                <p className="text-gray-600 text-sm mt-1">
                  We use read-only access tokens to connect to your financial institutions. This means we can never 
                  make transactions or changes to your accounts.
                </p>
              </div>
            </div>
            
            <div className="flex p-4 gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-full">
                <Fingerprint className="h-5 w-5 text-finance-blue" />
              </div>
              <div>
                <h3 className="font-medium">Biometric Authentication</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Enable Face ID or fingerprint login for an additional layer of security when accessing 
                  your debt information.
                </p>
              </div>
            </div>
            
            <div className="flex p-4 gap-4 items-start">
              <div className="bg-blue-100 p-2 rounded-full">
                <Server className="h-5 w-5 text-finance-blue" />
              </div>
              <div>
                <h3 className="font-medium">Regular Security Audits</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Our systems undergo regular security assessments and penetration testing by 
                  independent cybersecurity experts.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Your Privacy Choices</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Allow data analytics</h3>
                <p className="text-sm text-gray-500">
                  Helps us improve the debt repayment recommendations
                </p>
              </div>
              <div className="w-12 h-6 bg-finance-blue rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Store payment history</h3>
                <p className="text-sm text-gray-500">
                  Required for tracking your progress
                </p>
              </div>
              <div className="w-12 h-6 bg-finance-blue rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">Personalized recommendations</h3>
                <p className="text-sm text-gray-500">
                  Allow AI to analyze your debt data for custom insights
                </p>
              </div>
              <div className="w-12 h-6 bg-finance-blue rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
