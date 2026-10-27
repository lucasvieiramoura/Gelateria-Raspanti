/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import ActivePage from './components/ActivatePage';
import ManagerDashboard from './components/ManagerDashboard';
import VendorDashboard from './components/VendorDashboard';
import ClientDashboard from './components/ClientDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState('LOADING'); // 'AUTH', 'PENDING_ACTIVATION', 'ROLE_ADMIN', 'ROLE_GERENTE', 'ROLE_VENDEDOR', 'ROLE_CLIENTE'

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const tempPhone = localStorage.getItem('tempPhone');
    
    if (tempPhone && !localStorage.getItem('authHeader')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentView('PENDING_ACTIVATION');
    } else if (role) {
      setCurrentView(role);
    } else {
      setCurrentView('AUTH');
    }
  }, []);

  if (currentView === 'LOADING') {
    return (
      <div className="full-screen-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
        <h2>A carregar painel e permissões...</h2>
      </div>
    );
  }

  if (currentView === 'PENDING_ACTIVATION') {
    return (
      <ActivePage 
        onActivated={() => {
          localStorage.removeItem('tempPhone');
          setCurrentView('AUTH');
        }} 
      />
    );
  }

  if (currentView === 'AUTH') {
    return (
      <AuthPage 
        onLoginSuccess={(viewOrRole) => {
          setCurrentView(viewOrRole);
        }} 
      />
    );
  }

  // Dashboards baseados na Role
  if (currentView === 'ROLE_ADMIN' || currentView === 'ROLE_GERENTE') {
    return <ManagerDashboard onLogout={() => { localStorage.clear(); setCurrentView('AUTH'); }} />;
  }

  if (currentView === 'ROLE_VENDEDOR') {
    return <VendorDashboard onLogout={() => { localStorage.clear(); setCurrentView('AUTH'); }} />;
  }

  if (currentView === 'ROLE_CLIENTE') {
    return <ClientDashboard onLogout={() => { localStorage.clear(); setCurrentView('AUTH'); }} />;
  }

  return <AuthPage onLoginSuccess={(role) => setCurrentView(role)} />;
}