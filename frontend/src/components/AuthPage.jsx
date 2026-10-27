import React, { useState } from 'react';
import api from '../services/api';

export default function AuthPage({ onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('login'); // 'login', 'register', ou 'activate'
  const [message, setMessage] = useState('');

  // 1. Função de Login com HTTP Basic Auth
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const authHeader = 'Basic ' + btoa(`${phone}:${password}`);
      const response = await api.get('/api/products', {
        headers: {
          Authorization: authHeader
        }
      });

      // Salva as credenciais no localStorage para futuras requisições
      localStorage.setItem('authHeader', authHeader);
      localStorage.setItem('userPhone', phone);

      setMessage('Login realizado com sucesso!');
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage('Senha incorreta ou usuário não encontrado.');
      } else {
        setMessage('Erro no login: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // 2. Função de Autocadastro
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/auth/register?phone=${phone}&password=${password}`);
      setMessage('Cadastro realizado com sucesso! Verifique o console do Spring Boot para obter o código SMS.');
      setStep('activate');
    } catch (error) {
      setMessage('Erro ao cadastrar: ' + (error.response?.data?.message || error.message));
    }
  };

  // 3. Função de Ativação por SMS
  const handleActivate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/api/auth/activate?phone=${phone}&code=${code}`);
      setMessage(response.data + ' Faça login para continuar.');
      setStep('login');
    } catch (error) {
      setMessage('Erro ao ativar conta: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff', color: '#333' }}>
      <h2 style={{ textAlign: 'center', color: 'black' }}>Gelateria Raspanti</h2>
      
      {message && <p style={{ background: '#f0f0f0', padding: '10px', borderRadius: '4px', fontSize: '14px', color: '#d9534f' }}>{message}</p>}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button onClick={() => setStep('login')} style={{ background: step === 'login' ? '#007bff' : '#ccc', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer', flex: 1, marginRight: '5px' }}>Login</button>
        <button onClick={() => setStep('register')} style={{ background: step === 'register' ? '#007bff' : '#ccc', color: '#fff', border: 'none', padding: '8px', cursor: 'pointer', flex: 1 }}>Cadastrar</button>
      </div>

      {step === 'login' && (
        <form onSubmit={handleLogin}>
          <h3>Entrar no Sistema</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Telefone:</label><br />
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 11988887777" required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Senha:</label><br />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Entrar</button>
        </form>
      )}

      {step === 'register' && (
        <form onSubmit={handleRegister}>
          <h3>Autocadastro de Cliente</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Telefone (WhatsApp/Login):</label><br />
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: 11988887777" required style={{ width: '100%', padding: '8px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Senha:</label><br />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cadastrar e Gerar SMS</button>
        </form>
      )}

      {step === 'activate' && (
        <form onSubmit={handleActivate}>
          <h3>Ativar Conta (SMS)</h3>
          <p style={{ fontSize: '13px', color: '#666' }}>Insira o código enviado no console do backend.</p>
          <div style={{ marginBottom: '10px' }}>
            <label>Código de Ativação:</label><br />
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex: 570038" required style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Ativar Conta</button>
        </form>
      )}
    </div>
  );
}