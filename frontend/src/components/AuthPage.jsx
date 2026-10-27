// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import api from '../services/api';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const credentials = btoa(`${phone}:${password}`);
        const res = await api.get('/api/users/me', {
          headers: { Authorization: `Basic ${credentials}` }
        });
        if (!res.data.active) {
          localStorage.setItem('tempPhone', phone);
          onLoginSuccess('PENDING_ACTIVATION');
          return;
        }
        localStorage.setItem('authHeader', `Basic ${credentials}`);
        localStorage.setItem('userPhone', phone);
        localStorage.setItem('userRole', res.data.role);
        onLoginSuccess(res.data.role);
      } else {
        await api.post('/api/users/register', { phoneNumber: phone, password, name });
        localStorage.setItem('tempPhone', phone);
        onLoginSuccess('PENDING_ACTIVATION');
      }
    } catch (err) {
      setMessage('Erro na autenticação: ' + (err.response?.data || err.message));
    }
  };

  return (
    <>
      <div className="rotating-gelato-bg"></div>
      <div className="full-screen-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '420px', background: '#18181b', padding: '35px', borderRadius: '12px', border: '1px solid #27272a', boxSizing: 'border-box' }}>
          <h2 style={{ textAlign: 'center', color: '#00b37e', marginBottom: '8px' }}>Gelateria Raspanti</h2>
          <p style={{ textAlign: 'center', color: '#a1a1aa', marginBottom: '25px', fontSize: '14px' }}>{isLogin ? 'Faça login para continuar' : 'Registe a sua conta'}</p>

          {message && <div style={{ padding: '10px', background: '#27272a', color: '#f75a68', borderRadius: '6px', marginBottom: '15px', fontSize: '13px', textAlign: 'center' }}>{message}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '5px' }}>Nome Completo:</label>
                <input type="text" placeholder="O seu nome" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '5px' }}>Telemóvel:</label>
              <input type="text" placeholder="O seu telemóvel" value={phone} onChange={e => setPhone(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '5px' }}>Palavra-passe:</label>
              <input type="password" placeholder="******" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" style={{ padding: '14px', background: '#00875f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {isLogin ? 'Entrar' : 'Registar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#a1a1aa' }}>
            {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#00b37e', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLogin ? 'Registar' : 'Entrar'}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}