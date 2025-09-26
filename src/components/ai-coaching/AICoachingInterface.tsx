// Interactive AI Coaching Interface - Conversational AI-powered financial coaching
// Provides personalized, interactive guidance and recommendations

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Lightbulb,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  recommendations?: AIRecommendation[];
  actionItems?: ActionItem[];
  insights?: string[];
  confidence?: number;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'strategy' | 'payment' | 'goal' | 'insight';
  actionRequired: boolean;
  estimatedImpact: number;
  timeframe: string;
}

interface ActionItem {
  id: string;
  text: string;
  type: 'immediate' | 'this_week' | 'this_month' | 'long_term';
  completed: boolean;
  difficulty: 'easy' | 'moderate' | 'challenging';
}

interface CoachingSession {
  id: string;
  topic: string;
  startTime: Date;
  duration: number;
  messagesCount: number;
  satisfaction?: number;
  followUpScheduled?: boolean;
}

interface AICoachingInterfaceProps {
  userId: string;
  debtData?: any;
  onActionItemComplete?: (actionId: string) => void;
  onRecommendationAccept?: (recommendation: AIRecommendation) => void;
  onSessionEnd?: (session: CoachingSession) => void;
}

const AICoachingInterface: React.FC<AICoachingInterfaceProps> = ({
  userId,
  debtData,
  onActionItemComplete,
  onRecommendationAccept,
  onSessionEnd
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [coachingMode, setCoachingMode] = useState<'chat' | 'guided' | 'interactive'>('chat');
  const [currentSession, setCurrentSession] = useState<CoachingSession | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [coachPersonality, setCoachPersonality] = useState<'supportive' | 'analytical' | 'motivational'>('supportive');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick action suggestions
  const quickActions = [
    { text: "Analyze my debt strategy", icon: TrendingUp, category: "analysis" },
    { text: "Help me set financial goals", icon: Target, category: "planning" },
    { text: "Review my progress", icon: CheckCircle, category: "review" },
    { text: "Emergency financial help", icon: AlertCircle, category: "urgent" },
    { text: "Optimize my payments", icon: Zap, category: "optimization" },
    { text: "Explain debt concepts", icon: BookOpen, category: "education" }
  ];

  // Initialize coaching session
  useEffect(() => {
    if (!currentSession) {
      const session: CoachingSession = {
        id: `session_${Date.now()}`,
        topic: 'General Debt Coaching',
        startTime: new Date(),
        duration: 0,
        messagesCount: 0
      };
      setCurrentSession(session);

      // Add welcome message
      addAIMessage(
        "Hello! I'm your AI debt coach. I'm here to help you navigate your debt payoff journey with personalized advice and strategies. What would you like to focus on today?",
        {
          recommendations: [
            {
              id: '1',
              title: 'Start with a debt assessment',
              description: 'Let me analyze your current debt situation',
              priority: 'high',
              category: 'strategy',
              actionRequired: true,
              estimatedImpact: 85,
              timeframe: '5 minutes'
            }
          ]
        }
      );
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add AI message with optional enhancements
  const addAIMessage = (content: string, enhancements?: {
    recommendations?: AIRecommendation[];
    actionItems?: ActionItem[];
    insights?: string[];
    confidence?: number;
  }) => {
    const message: ChatMessage = {
      id: `ai_${Date.now()}`,
      type: 'ai',
      content,
      timestamp: new Date(),
      ...enhancements
    };

    setMessages(prev => [...prev, message]);
    updateSession('messagesCount');
  };

  // Add user message
  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, message]);
    updateSession('messagesCount');
  };

  // Update session metrics
  const updateSession = (metric: keyof CoachingSession) => {
    if (currentSession) {
      setCurrentSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [metric]: metric === 'messagesCount' ? prev.messagesCount + 1 : prev[metric],
          duration: Date.now() - prev.startTime.getTime()
        };
      });
    }
  };

  // Simulate AI response (in real implementation, this would call the AI service)
  const generateAIResponse = async (userMessage: string) => {
    setIsTyping(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    let response = '';
    let enhancements: any = {};

    // Basic response logic (replace with actual AI service call)
    if (userMessage.toLowerCase().includes('debt strategy') || userMessage.toLowerCase().includes('analyze')) {
      response = `Based on your debt portfolio, I can see you have multiple debts with varying interest rates. Here's my strategic assessment:

🎯 **Recommended Strategy**: Debt Avalanche Method
📈 **Potential Savings**: ₹45,000 in interest over 18 months
⏱️ **Timeline**: 24 months to debt freedom

The avalanche method will save you the most money by targeting your highest interest rate debts first. Would you like me to create a detailed payment plan?`;

      enhancements = {
        recommendations: [
          {
            id: 'rec_1',
            title: 'Switch to Avalanche Method',
            description: 'Target highest interest rate debts first to minimize total interest paid',
            priority: 'high',
            category: 'strategy',
            actionRequired: true,
            estimatedImpact: 90,
            timeframe: 'Immediate'
          },
          {
            id: 'rec_2',
            title: 'Increase Monthly Payment by ₹5,000',
            description: 'Accelerate payoff and save additional ₹15,000 in interest',
            priority: 'medium',
            category: 'payment',
            actionRequired: false,
            estimatedImpact: 75,
            timeframe: 'Next month'
          }
        ],
        actionItems: [
          {
            id: 'action_1',
            text: 'Review and reorganize debt payment order',
            type: 'this_week',
            completed: false,
            difficulty: 'easy'
          },
          {
            id: 'action_2',
            text: 'Set up automatic payments for minimum amounts',
            type: 'this_week',
            completed: false,
            difficulty: 'moderate'
          }
        ],
        confidence: 92
      };
    } else if (userMessage.toLowerCase().includes('goal') || userMessage.toLowerCase().includes('planning')) {
      response = `Great choice! Setting clear financial goals is crucial for debt success. Let me help you create SMART goals:

💡 **Your Current Situation**:
- Total Debt: ₹2,45,000
- Current Timeline: 36 months
- Monthly Payment: ₹8,500

🎯 **Suggested Goals**:
1. **Short-term (3 months)**: Pay off credit card debt (₹45,000)
2. **Medium-term (12 months)**: Reduce total debt by 40%
3. **Long-term (24 months)**: Achieve complete debt freedom

Which goal resonates most with you? I can help you create a detailed action plan.`;

      enhancements = {
        actionItems: [
          {
            id: 'goal_1',
            text: 'Define your debt-free target date',
            type: 'immediate',
            completed: false,
            difficulty: 'easy'
          },
          {
            id: 'goal_2',
            text: 'Calculate required monthly payment for goal',
            type: 'this_week',
            completed: false,
            difficulty: 'moderate'
          }
        ],
        insights: [
          'Setting specific deadlines increases success rates by 60%',
          'Breaking large goals into smaller milestones improves motivation',
          'Visual progress tracking helps maintain momentum'
        ],
        confidence: 88
      };
    } else if (userMessage.toLowerCase().includes('progress') || userMessage.toLowerCase().includes('review')) {
      response = `Excellent! Let me review your progress since we last talked:

📊 **Progress Summary**:
✅ Debt Reduced: ₹35,000 (14% decrease)
✅ Interest Saved: ₹8,200
✅ Payment Consistency: 95% on-time payments
⚠️ Average Payment: ₹8,200 (₹300 below target)

🎉 **Achievements**:
- Paid off smallest credit card
- Improved credit utilization to 25%
- Built emergency fund to ₹15,000

💪 **Next Steps**: You're doing great! Let's focus on increasing your payment by just ₹500 to stay on track for your 24-month goal.`;

      enhancements = {
        recommendations: [
          {
            id: 'progress_1',
            title: 'Increase Monthly Payment',
            description: 'Add ₹500 to monthly payment to maintain timeline',
            priority: 'medium',
            category: 'payment',
            actionRequired: true,
            estimatedImpact: 70,
            timeframe: 'Next payment'
          }
        ],
        confidence: 95
      };
    } else {
      response = `I understand you're looking for guidance on "${userMessage}". Let me provide some personalized advice based on your debt profile:

Every financial journey is unique, and I'm here to help you navigate yours. Whether it's about payment strategies, goal setting, or overcoming challenges, we can work through it together.

What specific aspect would you like to explore further? I can provide detailed analysis, create action plans, or simply be here to answer your questions.`;

      enhancements = {
        confidence: 75
      };
    }

    setIsTyping(false);
    addAIMessage(response, enhancements);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = currentMessage.trim();
    addUserMessage(userMessage);
    setCurrentMessage('');
    setShowQuickActions(false);

    // Generate AI response
    await generateAIResponse(userMessage);
  };

  // Handle quick action click
  const handleQuickAction = (action: typeof quickActions[0]) => {
    addUserMessage(action.text);
    setShowQuickActions(false);
    generateAIResponse(action.text);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Accept recommendation
  const handleAcceptRecommendation = (recommendation: AIRecommendation) => {
    onRecommendationAccept?.(recommendation);
    addAIMessage(`Great! I've added "${recommendation.title}" to your action plan. I'll help you implement this step by step.`);
  };

  // Complete action item
  const handleCompleteAction = (actionId: string) => {
    onActionItemComplete?.(actionId);
    addAIMessage(`Excellent work completing that action item! Every step forward is progress toward your debt-free goal. 🎉`);
  };

  // Format message content with markdown-like styling
  const formatMessageContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/🎯|📈|⏱️|💡|📊|✅|⚠️|🎉|💪/g, '<span class="text-lg">$&</span>');
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600">
                <AvatarFallback className="bg-transparent text-white">
                  <Bot className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Debt Coach</h3>
              <p className="text-sm text-gray-600">
                {isTyping ? 'Analyzing your situation...' : 'Ready to help'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Sparkles className="h-3 w-3 mr-1" />
              {coachPersonality}
            </Badge>
            {currentSession && (
              <Badge variant="outline" className="text-xs">
                {Math.floor(currentSession.duration / 60000)}m session
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-white border'} rounded-2xl p-4 shadow-sm`}>
                <div className="flex items-start gap-3">
                  {message.type === 'ai' && (
                    <Avatar className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                      <AvatarFallback className="bg-transparent text-white text-xs">
                        <Bot className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex-1">
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />

                    {/* Confidence indicator */}
                    {message.confidence && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Confidence:</span>
                        <Progress value={message.confidence} className="h-1 w-16" />
                        <span className="text-xs text-gray-500">{message.confidence}%</span>
                      </div>
                    )}

                    {/* Recommendations */}
                    {message.recommendations && message.recommendations.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Recommendations:</h4>
                        {message.recommendations.map((rec) => (
                          <div key={rec.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge
                                    className={
                                      rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-green-100 text-green-700'
                                    }
                                  >
                                    {rec.priority}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{rec.timeframe}</span>
                                </div>
                                <h5 className="font-medium text-sm text-gray-900">{rec.title}</h5>
                                <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAcceptRecommendation(rec)}
                                className="ml-2"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Items */}
                    {message.actionItems && message.actionItems.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Action Items:</h4>
                        {message.actionItems.map((action) => (
                          <div key={action.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                            <button
                              onClick={() => handleCompleteAction(action.id)}
                              className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center hover:border-green-500 transition-colors"
                            >
                              {action.completed && <CheckCircle className="h-3 w-3 text-green-500" />}
                            </button>
                            <span className={`text-sm flex-1 ${action.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {action.text}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {action.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Insights */}
                    {message.insights && message.insights.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">💡 Key Insights:</h4>
                        <ul className="space-y-1">
                          {message.insights.map((insight, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      {message.timestamp.toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-6 w-6 bg-gradient-to-br from-blue-500 to-purple-600">
                  <AvatarFallback className="bg-transparent text-white text-xs">
                    <Bot className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        {showQuickActions && messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-2"
          >
            {quickActions.map((action) => (
              <Button
                key={action.text}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action)}
                className="justify-start h-auto p-3 text-left"
              >
                <action.icon className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="text-sm">{action.text}</span>
              </Button>
            ))}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white/80 backdrop-blur-sm p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about debt strategies, goals, or any financial questions..."
              className="w-full resize-none border-gray-200"
              disabled={isTyping}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isTyping}
            size="sm"
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AICoachingInterface;