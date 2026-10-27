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
    loadProfile();
    loadProducts();
    loadPurchases();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/api/users/me', { headers: { Authorization: authHeader } });
      setUserData(res.data);
    } catch (e) { console.error(e); }
  };

  const loadProducts = async () => {
    const res = await api.get('/api/products', { headers: { Authorization: authHeader } });
    setProducts(res.data);
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
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
        <h2>Gelateria Raspanti - Portal do Cliente</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Olá, <strong>{userData.name || userData.phoneNumber}</strong></span>
          <button onClick={onLogout} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      {message && <p style={{ padding: '10px', background: '#e9ecef', borderRadius: '4px', marginTop: '15px', color: '#333' }}>{message}</p>}

      {/* Cardápio com Fotos */}
      <h3>Cardápio de Gelatos</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '10px' }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#f8f9fa', color: '#333' }}>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
            ) : (
              <div style={{ width: '100%', height: '140px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', marginBottom: '10px', color: '#555' }}>
                Sem Imagem
              </div>
            )}
            <h4>{p.name}</h4>
            <p style={{ fontSize: '13px', color: '#666' }}>{p.description}</p>
            <p style={{ fontWeight: 'bold', color: '#28a745' }}>R$ {p.price?.toFixed(2)}</p>
            <p style={{ fontSize: '12px' }}>Estoque disponível: {p.stockQuantity}</p>
            <button 
              onClick={() => addToCart(p)} 
              disabled={p.stockQuantity <= 0}
              style={{ width: '100%', padding: '8px', background: p.stockQuantity > 0 ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {p.stockQuantity > 0 ? 'Adicionar à Cesta' : 'Esgotado'}
            </button>
          </div>
        ))}
      </div>

      {/* Cesta de Compras */}
      <div style={{ marginTop: '30px', background: '#fff3cd', padding: '20px', borderRadius: '8px', border: '1px solid #ffeeba', color: '#333' }}>
        <h3>Cesta de Compras</h3>
        {cart.length === 0 ? <p>A sua cesta está vazia.</p> : (
          <div>
            <ul>
              {cart.map(item => (
                <li key={item.id}>{item.name} (Qtd: {item.qty}) - R$ {(item.price * item.qty).toFixed(2)}</li>
              ))}
            </ul>
            <form onSubmit={handleCheckout} style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
              <label>Número do Cartão de Crédito:</label>
              <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required style={{ padding: '8px', width: '300px' }} />
              <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '200px' }}>
                Concluir Compra
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Histórico de Compras do Cliente */}
      <h3 style={{ marginTop: '30px' }}>Meu Histórico de Compras</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: '#fff', color: '#333' }}>
        <thead>
          <tr style={{ background: '#007bff', color: '#fff' }}>
            <th>Produto</th><th>Qtd</th><th>Total</th><th>Data</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map(s => (
            <tr key={s.id}>
              <td>{s.productName}</td>
              <td>{s.quantity}</td>
              <td>R$ {s.totalPrice?.toFixed(2)}</td>
              <td>{new Date(s.saleDate).toLocaleString()}</td>
            </tr>
          ))}
          {purchases.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Nenhuma compra registada.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}