import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import ActivatePage from './components/ActivatePage';
import ClientDashboard from './components/ClientDashboard';
import VendorDashboard from './components/VendorDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import api from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authHeader'));
  const [view, setView] = useState('login'); // 'login' ou 'activate'
  const [phoneToActivate, setPhoneToActivate] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/immutability
      fetchUserRole();
    }
  }, [isAuthenticated]);

  const fetchUserRole = async () => {
    try {
      const res = await api.get('/api/users/me', {
        headers: { Authorization: localStorage.getItem('authHeader') }
      });
      setUserRole(res.data.role); // Ex: "ROLE_CLIENTE", "ROLE_VENDEDOR", "ROLE_GERENTE", "ROLE_ADMIN"
    } catch (e) {
      console.error("Erro ao obter o perfil do utilizador", e);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authHeader');
    localStorage.removeItem('userPhone');
    setIsAuthenticated(false);
    setUserRole('');
    setView('login');
  };

  if (!isAuthenticated) {
    if (view === 'activate') {
      return (
        <ActivatePage 
          phoneToActivate={phoneToActivate} 
          onActivated={() => setView('login')} 
          onBackToLogin={() => setView('login')} 
        />
      );
    }
    return (
      <AuthPage 
        onLoginSuccess={handleLoginSuccess} 
        onGoToActivate={(phone) => { setPhoneToActivate(phone); setView('activate'); }} 
      />
    );
  }

  // Redirecionamento dinâmico baseado na regra de acesso do utilizador
  if (userRole === 'ROLE_CLIENTE') {
    return <ClientDashboard onLogout={handleLogout} />;
  } else if (userRole === 'ROLE_VENDEDOR') {
    return <VendorDashboard onLogout={handleLogout} />;
  } else if (userRole === 'ROLE_GERENTE' || userRole === 'ROLE_ADMIN') {
    return <ManagerDashboard onLogout={handleLogout} />;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h3>A carregar painel e permissões...</h3>
    </div>
  );
}