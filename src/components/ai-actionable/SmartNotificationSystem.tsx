// Smart Notification System - AI-driven notifications for debt management
// Provides contextual, actionable notifications based on user behavior and debt status

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  X,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  Lightbulb,
  Clock,
  Zap,
  Heart,
  Trophy,
  Sparkles,
  ArrowRight,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SmartNotification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'achievement' | 'reminder' | 'opportunity' | 'milestone';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  timestamp: Date;
  category: 'payment' | 'strategy' | 'goal' | 'savings' | 'insight' | 'celebration';
  actionable: boolean;
  actions?: NotificationAction[];
  metadata?: {
    amount?: number;
    percentage?: number;
    daysUntil?: number;
    savingsImpact?: number;
    confidenceScore?: number;
  };
  isRead: boolean;
  isPersistent: boolean;
  expiresAt?: Date;
  source: 'ai_insights' | 'payment_tracker' | 'goal_monitor' | 'behavior_analyzer';
}

interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'success' | 'warning';
  icon?: React.ComponentType<any>;
  onClick: () => void;
}

interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  categories: {
    [key: string]: boolean;
  };
  frequency: 'real_time' | 'hourly' | 'daily';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface SmartNotificationSystemProps {
  userId: string;
  debtData?: any;
  onActionTaken?: (notificationId: string, actionId: string) => void;
  onNotificationDismiss?: (notificationId: string) => void;
  className?: string;
}

const SmartNotificationSystem: React.FC<SmartNotificationSystemProps> = ({
  userId,
  debtData,
  onActionTaken,
  onNotificationDismiss,
  className = ''
}) => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    soundEnabled: true,
    categories: {
      payment: true,
      strategy: true,
      goal: true,
      savings: true,
      insight: true,
      celebration: true
    },
    frequency: 'real_time',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'actionable'>('all');
  const [isVisible, setIsVisible] = useState(false);

  // Generate smart notifications based on user behavior and debt data
  const generateSmartNotifications = () => {
    const now = new Date();
    const mockNotifications: SmartNotification[] = [
      {
        id: 'ai_strategy_update',
        type: 'info',
        priority: 'high',
        title: 'Strategy Optimization Available',
        message: 'AI analysis suggests switching to avalanche method could save you ₹15,000 in interest over 18 months.',
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
        category: 'strategy',
        actionable: true,
        actions: [
          {
            id: 'view_strategy',
            label: 'View Analysis',
            type: 'primary',
            icon: TrendingUp,
            onClick: () => {}
          },
          {
            id: 'dismiss',
            label: 'Maybe Later',
            type: 'secondary',
            onClick: () => handleDismissNotification('ai_strategy_update')
          }
        ],
        metadata: {
          amount: 15000,
          confidenceScore: 92
        },
        isRead: false,
        isPersistent: true,
        source: 'ai_insights'
      },
      {
        id: 'payment_reminder',
        type: 'reminder',
        priority: 'high',
        title: 'Payment Due Tomorrow',
        message: 'Credit Card payment of ₹8,500 is due tomorrow. Pay now to avoid late fees.',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000),
        category: 'payment',
        actionable: true,
        actions: [
          {
            id: 'pay_now',
            label: 'Pay Now',
            type: 'primary',
            icon: DollarSign,
            onClick: () => {}
          },
          {
            id: 'set_reminder',
            label: 'Remind Later',
            type: 'secondary',
            icon: Clock,
            onClick: () => {}
          }
        ],
        metadata: {
          amount: 8500,
          daysUntil: 1
        },
        isRead: false,
        isPersistent: true,
        source: 'payment_tracker'
      },
      {
        id: 'milestone_achieved',
        type: 'achievement',
        priority: 'medium',
        title: '🎉 Milestone Achieved!',
        message: 'Congratulations! You\'ve paid off 25% of your total debt. Keep up the great work!',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        category: 'celebration',
        actionable: true,
        actions: [
          {
            id: 'celebrate',
            label: 'Celebrate',
            type: 'success',
            icon: Trophy,
            onClick: () => {}
          },
          {
            id: 'share',
            label: 'Share Achievement',
            type: 'secondary',
            onClick: () => {}
          }
        ],
        metadata: {
          percentage: 25
        },
        isRead: false,
        isPersistent: false,
        source: 'goal_monitor'
      },
      {
        id: 'savings_opportunity',
        type: 'opportunity',
        priority: 'medium',
        title: 'Savings Opportunity Detected',
        message: 'By increasing your monthly payment by just ₹2,000, you could save ₹12,000 in interest.',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        category: 'savings',
        actionable: true,
        actions: [
          {
            id: 'simulate',
            label: 'Simulate',
            type: 'primary',
            icon: Zap,
            onClick: () => {}
          },
          {
            id: 'learn_more',
            label: 'Learn More',
            type: 'secondary',
            icon: Lightbulb,
            onClick: () => {}
          }
        ],
        metadata: {
          amount: 2000,
          savingsImpact: 12000,
          confidenceScore: 85
        },
        isRead: true,
        isPersistent: false,
        source: 'ai_insights'
      },
      {
        id: 'behavior_insight',
        type: 'info',
        priority: 'low',
        title: 'Spending Pattern Insight',
        message: 'Your spending has decreased by 15% this month compared to last month. This trend could help accelerate debt payoff.',
        timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        category: 'insight',
        actionable: false,
        metadata: {
          percentage: 15
        },
        isRead: true,
        isPersistent: false,
        source: 'behavior_analyzer'
      }
    ];

    setNotifications(mockNotifications);
  };

  // Initialize notifications
  useEffect(() => {
    generateSmartNotifications();

    // Simulate real-time notifications
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance every 30 seconds
        generateNewNotification();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Generate new notification
  const generateNewNotification = () => {
    const now = new Date();
    const insights = [
      'Your debt-to-income ratio improved by 3% this month',
      'Making an extra ₹1,000 payment would save 2 months of interest',
      'Your credit utilization is at an optimal 22%',
      'Consider consolidating high-interest debts for better rates'
    ];

    const newNotification: SmartNotification = {
      id: `dynamic_${Date.now()}`,
      type: 'info',
      priority: 'low',
      title: 'New AI Insight',
      message: insights[Math.floor(Math.random() * insights.length)],
      timestamp: now,
      category: 'insight',
      actionable: false,
      isRead: false,
      isPersistent: false,
      source: 'ai_insights'
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play notification sound if enabled
    if (settings.soundEnabled && settings.enabled) {
      playNotificationSound();
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    // In a real implementation, you would play an actual sound
    console.log('🔔 Notification sound');
  };

  // Handle notification action
  const handleNotificationAction = (notificationId: string, actionId: string) => {
    onActionTaken?.(notificationId, actionId);

    // Mark notification as read
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Handle dismiss notification
  const handleDismissNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
    onNotificationDismiss?.(notificationId);
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Get notification icon
  const getNotificationIcon = (notification: SmartNotification) => {
    switch (notification.type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'achievement':
        return Trophy;
      case 'reminder':
        return Clock;
      case 'opportunity':
        return Lightbulb;
      case 'milestone':
        return Target;
      default:
        return Info;
    }
  };

  // Get notification color
  const getNotificationColor = (notification: SmartNotification) => {
    switch (notification.type) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'achievement':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'reminder':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'opportunity':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'actionable') return notification.actionable;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const actionableCount = notifications.filter(n => n.actionable && !n.isRead).length;

  return (
    <div className={className}>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>

        {/* Notification Panel */}
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-96 max-h-[600px] bg-white rounded-lg shadow-xl border z-50"
            >
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Smart Notifications</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVisible(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-1">
                  <Button
                    variant={filter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="flex-1 text-xs"
                  >
                    All ({notifications.length})
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                    className="flex-1 text-xs"
                  >
                    Unread ({unreadCount})
                  </Button>
                  <Button
                    variant={filter === 'actionable' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('actionable')}
                    className="flex-1 text-xs"
                  >
                    Actions ({actionableCount})
                  </Button>
                </div>

                {unreadCount > 0 && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600"
                    >
                      Mark all as read
                    </Button>
                  </div>
                )}
              </div>

              {/* Settings Panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b bg-gray-50"
                  >
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Enable Notifications</span>
                        <Switch
                          checked={settings.enabled}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, enabled: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sound Notifications</span>
                        <Switch
                          checked={settings.soundEnabled}
                          onCheckedChange={(checked) =>
                            setSettings(prev => ({ ...prev, soundEnabled: checked }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="text-sm font-medium">Categories</span>
                        {Object.entries(settings.categories).map(([category, enabled]) => (
                          <div key={category} className="flex items-center justify-between">
                            <span className="text-xs capitalize">{category.replace('_', ' ')}</span>
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked) =>
                                setSettings(prev => ({
                                  ...prev,
                                  categories: { ...prev.categories, [category]: checked }
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification);
                      const colorClass = getNotificationColor(notification);

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded-lg ${colorClass}`}>
                              <Icon className="h-4 w-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {notification.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                    {notification.message}
                                  </p>
                                </div>

                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>
                                )}
                              </div>

                              {/* Metadata */}
                              {notification.metadata && (
                                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                  {notification.metadata.amount && (
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      ₹{notification.metadata.amount.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                  {notification.metadata.confidenceScore && (
                                    <span className="flex items-center gap-1">
                                      <Sparkles className="h-3 w-3" />
                                      {notification.metadata.confidenceScore}% confidence
                                    </span>
                                  )}
                                  {notification.metadata.daysUntil && (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {notification.metadata.daysUntil} days
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Actions */}
                              {notification.actionable && notification.actions && (
                                <div className="mt-3 flex gap-2">
                                  {notification.actions.map((action) => (
                                    <Button
                                      key={action.id}
                                      variant={action.type === 'primary' ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleNotificationAction(notification.id, action.id);
                                        action.onClick();
                                      }}
                                      className="flex items-center gap-1 text-xs"
                                    >
                                      {action.icon && <action.icon className="h-3 w-3" />}
                                      {action.label}
                                    </Button>
                                  ))}
                                </div>
                              )}

                              <div className="mt-2 text-xs text-gray-400">
                                {notification.timestamp.toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDismissNotification(notification.id);
                              }}
                              className="p-1 h-auto text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SmartNotificationSystem;