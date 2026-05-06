import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Package, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      <header className="mobile-header">
        <div className="auth-brand" style={{ fontSize: '18px' }}>
          <Package size={24} color="#c084fc" />
          <span>Tontine Connect</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-icon" onClick={toggleTheme}>
            <span style={{ display: 'flex' }}>
              {theme === 'dark' ? <Sun size={20} key="sun-mobile" /> : <Moon size={20} key="moon-mobile" />}
            </span>
          </button>
          <button className="btn-icon" onClick={toggleSidebar}>
            <span style={{ display: 'flex' }}>
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </span>
          </button>
        </div>
      </header>

      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`} 
        onClick={closeSidebar}
      />

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
