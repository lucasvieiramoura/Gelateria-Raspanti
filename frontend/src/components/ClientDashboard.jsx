// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ClientDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [userData, setUserData] = useState({ name: 'Cliente' });
  const [cardNumber, setCardNumber] = useState('');
  const [message, setMessage] = useState('');

  const authHeader = localStorage.getItem('authHeader');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadProfile();
    // eslint-disable-next-line react-hooks/immutability
    loadProducts();
    // eslint-disable-next-line react-hooks/immutability
    loadPurchases();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/api/users/me', { headers: { Authorization: authHeader } });
      setUserData(res.data);
    } catch (e) { console.error(e); }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get('/api/products', { headers: { Authorization: authHeader } });
      setProducts(res.data);
    } catch (e) { console.error(e); }
  };

  const loadPurchases = async () => {
    try {
      const res = await api.get('/api/sales/my-sales', { headers: { Authorization: authHeader } });
      setPurchases(res.data);
    } catch (e) { console.error(e); }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cardNumber) {
      setMessage('Por favor, informe os dados do cartão para concluir a compra.');
      return;
    }
    try {
      for (let item of cart) {
        await api.post(`/api/sales?productId=${item.id}&quantity=${item.qty}`, {}, { headers: { Authorization: authHeader } });
      }
      setMessage('Compra realizada com sucesso com o cartão informado!');
      setCart([]);
      setCardNumber('');
      loadProducts();
      loadPurchases();
    } catch (error) {
      setMessage('Erro ao finalizar compra: ' + (error.response?.data || error.message));
    }
  };

  return (
    <>
      <div className="rotating-gelato-bg"></div>
      <div className="full-screen-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '20px', marginBottom: '25px' }}>
          <h2 style={{ color: '#00b37e', margin: 0 }}>Gelateria Raspanti - Portal do Cliente</h2>
          <div>
            <span style={{ marginRight: '15px' }}>Olá, <strong>{userData.name || userData.phoneNumber}</strong></span>
            <button onClick={onLogout} style={{ padding: '8px 16px', background: '#f75a68', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Sair</button>
          </div>
        </div>

        {message && <p style={{ padding: '12px 20px', background: '#18181b', borderLeft: '4px solid #00b37e', borderRadius: '4px', marginBottom: '25px' }}>{message}</p>}

        <h3>Cardápio de Gelatos</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginTop: '15px' }}>
          {products.map(p => (
            <div key={p.id} style={{ background: '#18181b', border: '1px solid #27272a', padding: '15px', borderRadius: '8px' }}>
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
              ) : (
                <div style={{ width: '100%', height: '140px', background: '#09090b', borderRadius: '6px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>Sem Imagem</div>
              )}
              <h4 style={{ margin: '5px 0' }}>{p.name}</h4>
              <p style={{ fontSize: '13px', color: '#a1a1aa' }}>{p.description}</p>
              <p style={{ fontWeight: 'bold', color: '#00b37e' }}>R$ {p.price?.toFixed(2)}</p>
              <p style={{ fontSize: '12px', color: '#71717a' }}>Stock disponível: {p.stockQuantity}</p>
              <button 
                onClick={() => addToCart(p)} 
                disabled={p.stockQuantity <= 0}
                style={{ width: '100%', padding: '10px', background: p.stockQuantity > 0 ? '#00875f' : '#27272a', color: '#fff', border: 'none', borderRadius: '6px', cursor: p.stockQuantity > 0 ? 'pointer' : 'not-allowed', fontWeight: 'bold', marginTop: '10px' }}>
                {p.stockQuantity > 0 ? 'Adicionar à Cesta' : 'Esgotado'}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '30px', background: '#18181b', padding: '25px', borderRadius: '8px', border: '1px solid #27272a' }}>
          <h3>Cesta de Compras</h3>
          {cart.length === 0 ? <p style={{ color: '#71717a' }}>A sua cesta está vazia.</p> : (
            <div>
              <ul style={{ paddingLeft: '20px' }}>
                {cart.map(item => (
                  <li key={item.id} style={{ marginBottom: '5px' }}>{item.name} (Qtd: {item.qty}) - R$ {(item.price * item.qty).toFixed(2)}</li>
                ))}
              </ul>
              <form onSubmit={handleCheckout} style={{ marginTop: '20px', display: 'grid', gap: '12px', maxWidth: '400px' }}>
                <label style={{ fontSize: '13px', color: '#a1a1aa' }}>Número do Cartão de Crédito:</label>
                <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required style={{ padding: '10px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px' }} />
                <button type="submit" style={{ padding: '12px', background: '#00875f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Concluir Compra
                </button>
              </form>
            </div>
          )}
        </div>

        <h3 style={{ marginTop: '30px' }}>Meu Histórico de Compras</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', background: '#18181b', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#27272a', color: '#a1a1aa', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Produto</th>
              <th style={{ padding: '12px' }}>Qtd</th>
              <th style={{ padding: '12px' }}>Total</th>
              <th style={{ padding: '12px' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #27272a' }}>
                <td style={{ padding: '12px' }}>{s.productName}</td>
                <td style={{ padding: '12px' }}>{s.quantity}</td>
                <td style={{ padding: '12px', color: '#00b37e' }}>R$ {s.totalPrice?.toFixed(2)}</td>
                <td style={{ padding: '12px' }}>{new Date(s.saleDate).toLocaleString()}</td>
              </tr>
            ))}
            {purchases.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#71717a' }}>Nenhuma compra registada.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}