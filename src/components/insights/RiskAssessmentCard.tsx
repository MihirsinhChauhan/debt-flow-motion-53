import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  TrendingUp,
  Target,
  Info
} from 'lucide-react';

interface RiskAssessment {
  level: 'low' | 'moderate' | 'high';
  factors: string[];
  mitigation_strategies: string[];
}

interface RiskAssessmentCardProps {
  riskAssessment: RiskAssessment;
  className?: string;
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({
  riskAssessment,
  className = ''
}) => {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'low':
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          badgeClass: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          progress: 25,
          description: 'Your debt situation is well-managed with minimal risk factors.'
        };
      case 'moderate':
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          progress: 60,
          description: 'Some risk factors present that require attention and monitoring.'
        };
      case 'high':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          badgeClass: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
          progress: 85,
          description: 'Significant risk factors require immediate attention and action.'
        };
      default:
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Info className="h-5 w-5 text-gray-600" />,
          progress: 50,
          description: 'Risk assessment unavailable.'
        };
    }
  };

  const config = getRiskConfig(riskAssessment.level);

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          {config.icon}
          <span>Financial Risk Assessment</span>
          <Badge className={`${config.badgeClass} ml-auto`}>
            {riskAssessment.level.toUpperCase()} RISK
          </Badge>
        </CardTitle>
        <p className={`text-sm ${config.color}`}>
          {config.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Risk Level Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Risk Level</span>
            <span className={`font-medium ${config.color}`}>
              {riskAssessment.level.charAt(0).toUpperCase() + riskAssessment.level.slice(1)}
            </span>
          </div>
          <Progress
            value={config.progress}
            className="h-2"
          />
        </div>

        {/* Risk Factors */}
        {riskAssessment.factors && riskAssessment.factors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Identified Risk Factors
            </h4>
            <div className="space-y-2">
              {riskAssessment.factors.map((factor, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-white/60 rounded-lg border border-white/40">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    riskAssessment.level === 'high' ? 'bg-red-400' :
                    riskAssessment.level === 'moderate' ? 'bg-yellow-400' : 'bg-green-400'
                  }`} />
                  <p className="text-sm text-muted-foreground">{factor}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mitigation Strategies */}
        {riskAssessment.mitigation_strategies && riskAssessment.mitigation_strategies.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Risk Mitigation Strategies
            </h4>
            <div className="space-y-2">
              {riskAssessment.mitigation_strategies.map((strategy, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-white/40">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-sm text-muted-foreground">{strategy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Advice Footer */}
        <div className="bg-white/60 p-4 rounded-lg border border-white/40">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h5 className="font-medium text-foreground mb-1">Professional Guidance</h5>
              <p className="text-sm text-muted-foreground">
                {riskAssessment.level === 'high'
                  ? 'Consider consulting with a certified financial advisor for personalized guidance on managing high-risk debt situations.'
                  : riskAssessment.level === 'moderate'
                  ? 'Monitor your progress closely and implement the recommended mitigation strategies to prevent risk escalation.'
                  : 'Continue following your current strategy while staying vigilant for any changes in your financial situation.'
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAssessmentCard;