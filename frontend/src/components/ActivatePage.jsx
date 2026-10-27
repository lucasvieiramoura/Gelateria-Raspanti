import React, { useState } from 'react';
import api from '../services/api';

export default function ActivatePage({ phoneToActivate, onActivated, onBackToLogin }) {
  const [phone, setPhone] = useState(phoneToActivate || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');

  const handleActivate = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(`/api/auth/activate?phone=${phone}&code=${code}`);
      setMessage(response.data + ' Redirecionando para o login...');
      setTimeout(() => {
        onActivated();
      }, 2000);
    } catch (error) {
      setMessage('Erro ao ativar conta: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '25px', border: '1px solid #ccc', borderRadius: '8px', background: '#fff', color: '#333', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#007bff' }}>Ativação de Conta</h2>
      <p style={{ fontSize: '13px', color: '#666', textAlign: 'center' }}>
        Insira o código de 6 dígitos enviado para o console do backend (simulando o SMS).
      </p>

      {message && <p style={{ padding: '10px', background: '#e9ecef', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }}>{message}</p>}

      <form onSubmit={handleActivate} style={{ display: 'grid', gap: '12px', marginTop: '15px' }}>
        <div>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Telemóvel:</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            placeholder="Ex: 11988887777" 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginTop: '5px' }} 
          />
        </div>
        <div>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Código de Ativação:</label>
          <input 
            type="text" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
            placeholder="Ex: 817416" 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginTop: '5px' }} 
          />
        </div>
        <button type="submit" style={{ padding: '12px', background: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Ativar Conta
        </button>
        <button type="button5" onClick={onBackToLogin} style={{ background: 'transparent', border: 'none', color: '#007bff', cursor: 'pointer', textAlign: 'center', marginTop: '5px' }}>
          Voltar para o Login
        </button>
      </form>
    </div>
  );
}