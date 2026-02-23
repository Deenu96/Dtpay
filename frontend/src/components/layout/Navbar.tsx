import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  User,
  Wallet,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotificationContext } from '@/context/NotificationContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, getInitials } from '@/utils/helpers';
import { useTheme } from '@/hooks/useTheme';

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotificationContext();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="hidden text-xl font-bold md:inline">CryptoP2P</span>
          </Link>
        </div>

        {/* Center Section - Navigation Links (Desktop) */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-1 ml-8">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/buy">Buy</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/sell">Sell</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/orders">Orders</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/wallet">Wallet</Link>
            </Button>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <NotificationDropdown />
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {getInitials(`${user?.firstName} ${user?.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">
                      {user?.firstName}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {getInitials(`${user?.firstName} ${user?.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {user?.firstName} {user?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wallet" className="flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Wallet
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

// Notification Dropdown Component
const NotificationDropdown: React.FC = () => {
  const { notifications, markAllAsRead, markAsRead } = useNotificationContext();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: { id: string; read: boolean; type: string }) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    // Navigate based on notification type
    navigate('/notifications');
  };

  return (
    <div className="py-2">
      <div className="flex items-center justify-between px-3 pb-2 border-b">
        <span className="font-medium">Notifications</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAllAsRead()}
        >
          Mark all read
        </Button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                'px-3 py-2 cursor-pointer hover:bg-accent transition-colors',
                !notification.read && 'bg-accent/50'
              )}
            >
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {notification.message}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="border-t pt-2 px-3">
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link to="/notifications">View all notifications</Link>
        </Button>
      </div>
    </div>
  );
};

// Theme hook
export const useTheme = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return { theme, toggleTheme };
};

export default Navbar;
