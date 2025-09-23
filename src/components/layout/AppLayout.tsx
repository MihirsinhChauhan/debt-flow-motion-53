
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PieChart,
  Calendar,
  Plus,
  ShieldCheck,
  Menu,
  X,
  User,
  Home
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import AddDebtDialog from '@/components/debt/AddDebtDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, mobileIcon: <Home className="h-6 w-6" /> },
    { name: 'AI Insights', path: '/insights', icon: <PieChart className="h-5 w-5" />, mobileIcon: <PieChart className="h-6 w-6" /> },
    { name: 'Reminders', path: '/reminders', icon: <Calendar className="h-5 w-5" />, mobileIcon: <Calendar className="h-6 w-6" /> },
    { name: 'Security', path: '/security', icon: <ShieldCheck className="h-5 w-5" />, mobileIcon: <ShieldCheck className="h-6 w-6" /> },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div
          className="flex items-center justify-between px-4 pt-safe-top"
          style={{ height: 'var(--header-height)' }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="min-h-touch min-w-touch"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="font-bold text-mobile-title text-foreground">
            DebtEase
          </div>

          <AddDebtDialog
            onAddDebt={(debt) => console.log('Add debt:', debt)}
            trigger={
              <Button size="icon" variant="default" className="min-h-touch min-w-touch rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            }
          />
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out",
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div className={cn(
          "absolute left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out max-w-[85vw]",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <span className="font-bold text-mobile-title text-foreground">DebtEase</span>
              <p className="text-sm text-muted-foreground">{user?.full_name || user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="min-h-touch min-w-touch"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 min-h-touch",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground font-medium shadow-sm"
                    : "hover:bg-secondary/80 text-foreground/80 hover:text-foreground active:bg-secondary"
                )}
              >
                {item.icon}
                <span className="text-mobile-body font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
            <div className="space-y-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-3 min-h-touch">
                    <User className="h-5 w-5" />
                    <span className="text-mobile-body">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem disabled className="py-2">
                    <div>
                      <p className="font-medium">{user?.full_name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="py-2 text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col w-64 border-r border-gray-200 p-4 sticky top-0 h-screen">
          <div className="font-bold text-2xl mb-8">DebtEase</div>
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-secondary text-foreground/80 hover:text-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </a>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t space-y-2">
            <AddDebtDialog onAddDebt={(debt) => {
              // This will be handled by the parent component
              console.log('Add debt:', debt);
            }} />
            <div className="flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2 w-full">
                    <User className="h-4 w-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    {user?.full_name || user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-0 p-4 lg:p-6 max-w-6xl mx-auto w-full lg:pb-6 pb-24">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-safe-left pr-safe-right pb-safe-bottom z-30">
        <div
          className="flex items-center justify-around"
          style={{ height: 'var(--nav-height)' }}
        >
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center min-h-touch min-w-touch px-3 py-2 rounded-lg transition-all duration-200",
                location.pathname === item.path
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground active:bg-secondary/50"
              )}
            >
              {item.mobileIcon}
              <span className="text-xs font-medium mt-1 leading-none">
                {item.name === 'AI Insights' ? 'Insights' : item.name}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
