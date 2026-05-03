import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Package, Sun, Moon, User, ShieldAlert, LifeBuoy, Database, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
  const { logout, currentUser, userData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Erreur de déconnexion', error);
    }
  }

  return (
    <div className="sidebar">
      <Link to="/" className="sidebar-logo">
        <Package className="icon" size={28} />
        Tontine Connect
      </Link>
      
      <div className="nav-links">
        {userData?.role === 'super_admin' ? (
          <>
            <div style={{ marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)', paddingLeft: '16px' }}>
              Administration
            </div>
            <NavLink to="/admin" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <ShieldAlert size={20} /> Admin Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Users size={20} /> Utilisateurs
            </NavLink>
            <NavLink to="/admin/tontines" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Package size={20} /> Tontines
            </NavLink>
            <NavLink to="/admin/support" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <LifeBuoy size={20} /> Requêtes Support
            </NavLink>
            <NavLink to="/admin/database" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <Database size={20} /> Base de données
            </NavLink>
            <NavLink to="/admin/stats" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
              <BarChart3 size={20} /> Analyses Stats
            </NavLink>
          </>
        ) : (
          <>
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <LayoutDashboard size={20} />
              Tableau de bord
            </NavLink>
            
            <NavLink 
              to="/tontines" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <Users size={20} />
              Tontines
            </NavLink>
            
            <NavLink 
              to="/paiements" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <CreditCard size={20} />
              Paiements
            </NavLink>
            
            <NavLink 
              to="/profil" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <User size={20} />
              Profil
            </NavLink>

            <NavLink 
              to="/support" 
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <LifeBuoy size={20} />
              Support
            </NavLink>
          </>
        )}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          className="nav-item" 
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }} 
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
        </button>

        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={handleLogout}>
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
