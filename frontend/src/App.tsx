import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Contexts
import { AuthProvider } from '@/context/AuthContext';
import { WalletProvider } from '@/context/WalletContext';
import { NotificationProvider } from '@/context/NotificationContext';

// Layout
import Layout from '@/components/layout/Layout';

// Common Components
import ProtectedRoute from '@/components/common/ProtectedRoute';
import ErrorBoundary from '@/components/common/ErrorBoundary';

// Public Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

// Protected Pages
import Dashboard from '@/pages/Dashboard';
import BuyUSDT from '@/pages/BuyUSDT';
import SellUSDT from '@/pages/SellUSDT';
import MyOrders from '@/pages/MyOrders';
import Wallet from '@/pages/Wallet';
import Profile from '@/pages/Profile';
import Referrals from '@/pages/Referrals';
import KYCPage from '@/pages/KYCPage';
import NotFound from '@/pages/NotFound';

// Create Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AuthProvider>
          <WalletProvider>
            <NotificationProvider>
              <Router>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected Routes */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/buy" element={<BuyUSDT />} />
                    <Route path="/sell" element={<SellUSDT />} />
                    <Route path="/orders" element={<MyOrders />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/referrals" element={<Referrals />} />
                    <Route path="/kyc" element={<KYCPage />} />
                    
                    {/* Placeholder Routes - Will be implemented */}
                    <Route path="/deposit" element={<PlaceholderPage title="Deposit" />} />
                    <Route path="/withdraw" element={<PlaceholderPage title="Withdraw" />} />
                    <Route path="/upi" element={<PlaceholderPage title="UPI Accounts" />} />
                    <Route path="/bank" element={<PlaceholderPage title="Bank Accounts" />} />
                    <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
                    <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
                    <Route path="/trade/:id" element={<PlaceholderPage title="Trade Details" />} />
                  </Route>

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </NotificationProvider>
          </WalletProvider>
        </AuthProvider>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

// Placeholder component for routes under development
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-muted-foreground mb-6">This page is under development.</p>
      <div className="animate-pulse">
        <div className="h-32 w-64 bg-muted rounded-lg mx-auto" />
      </div>
    </div>
  </div>
);

export default App;
