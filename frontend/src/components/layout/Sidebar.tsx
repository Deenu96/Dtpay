import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  List,
  Wallet,
  CreditCard,
  Landmark,
  Users,
  ShieldCheck,
  UserCircle,
  Settings,
  Bell,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/utils/helpers';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Buy USDT', href: '/buy', icon: ShoppingCart },
      { label: 'Sell USDT', href: '/sell', icon: TrendingUp },
      { label: 'My Orders', href: '/orders', icon: List },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Wallet', href: '/wallet', icon: Wallet },
      { label: 'Deposit', href: '/deposit', icon: TrendingDown },
      { label: 'Withdraw', href: '/withdraw', icon: TrendingUp },
      { label: 'UPI Accounts', href: '/upi', icon: CreditCard },
      { label: 'Bank Accounts', href: '/bank', icon: Landmark },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Referrals', href: '/referrals', icon: Users },
      { label: 'KYC Verification', href: '/kyc', icon: ShieldCheck },
      { label: 'Profile', href: '/profile', icon: UserCircle },
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full py-4">
          {navSections.map((section, index) => (
            <div key={section.title} className="px-3">
              {index > 0 && <Separator className="my-4" />}
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => onClose()}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </NavLink>
                ))}
              </nav>
            </div>
          ))}

          {/* Quick Stats */}
          <div className="mt-6 px-6">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground mb-2">USDT/INR</p>
              <p className="text-lg font-bold">₹83.50</p>
              <p className="text-xs text-green-500">+0.5%</p>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default Sidebar;
