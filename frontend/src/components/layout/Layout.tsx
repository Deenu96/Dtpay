import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  showFooter?: boolean;
  showSidebar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  showFooter = true, 
  showSidebar = true 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Navbar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex">
        {showSidebar && (
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        )}
        
        <main 
          className={`flex-1 min-h-[calc(100vh-4rem)] ${
            showSidebar ? 'lg:ml-64' : ''
          }`}
        >
          <div className="container mx-auto p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
