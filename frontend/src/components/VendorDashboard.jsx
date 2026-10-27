// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function VendorDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [message, setMessage] = useState('');

  const authHeader = localStorage.getItem('authHeader');
  const userPhone = localStorage.getItem('userPhone');

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    try {
        const prodRes = await api.get('/api/products', { headers: { Authorization: authHeader } });
        setProducts(prodRes.data);
      } catch (e) { console.error("Erro ao carregar produtos", e); }
  };

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty < product.stockQuantity) {
        setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    try {
      for (let item of cart) {
        await api.post(`/api/sales?productId=${item.id}&quantity=${item.qty}`, {}, { headers: { Authorization: authHeader } });
      }
      setMessage(`Venda de balcão efetuada com sucesso via ${paymentMethod}!`);
      setCart([]);
      loadProducts();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessage('Erro ao concluir venda.');
    }
  };

  return (
    <>
      <div className="rotating-gelato-bg"></div>
      <div className="full-screen-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '20px', marginBottom: '25px' }}>
          <h2>Gelateria Raspanti - Painel do Vendedor (PDV)</h2>
          <div>
            <span style={{ marginRight: '15px' }}>Vendedor: <strong>{userPhone}</strong></span>
            <button onClick={onLogout} style={{ padding: '8px 16px', background: '#f75a68', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Sair</button>
          </div>
        </div>

        {message && <div style={{ padding: '12px 20px', background: '#18181b', borderLeft: '4px solid #00b37e', borderRadius: '4px', marginBottom: '25px' }}>{message}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '25px' }}>
          {/* Catalogo de Cards */}
          <div>
            <h3>Catálogo de Produtos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', marginTop: '15px' }}>
              {products.map(p => (
                <div key={p.id} style={{ position: 'relative', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', padding: '15px', paddingBottom: '50px' }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                  ) : (
                    <div style={{ width: '100%', height: '140px', background: '#09090b', borderRadius: '6px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>Sem foto</div>
                  )}
                  <h4 style={{ margin: '5px 0' }}>{p.name}</h4>
                  <p style={{ color: '#00b37e', fontWeight: 'bold', margin: '5px 0' }}>R$ {p.price?.toFixed(2)}</p>
                  <p style={{ fontSize: '12px', color: '#a1a1aa' }}>Stock: {p.stockQuantity}</p>
                  
                  <button onClick={() => addToCart(p)} disabled={p.stockQuantity <= 0} style={{ position: 'absolute', bottom: '12px', right: '12px', width: '38px', height: '38px', background: p.stockQuantity > 0 ? '#00875f' : '#27272a', color: '#fff', border: 'none', borderRadius: '50%', fontSize: '22px', cursor: 'pointer' }}>+</button>
                </div>
              ))}
            </div>
          </div>

          {/* Cesta PDV */}
          <div style={{ background: '#18181b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a', height: 'fit-content' }}>
            <h3>Cesta de Compras</h3>
            {cart.length === 0 ? <p style={{ color: '#71717a' }}>A cesta está vazia.</p> : (
              <div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {cart.map(item => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', borderBottom: '1px solid #27272a', paddingBottom: '8px' }}>
                      <div>
                        <div>{item.name}</div>
                        <small style={{ color: '#a1a1aa' }}>Qtd: {item.qty} x R$ {item.price.toFixed(2)}</small>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: '#f75a68', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>X</button>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleCheckout} style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
                  <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '10px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px' }}>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Pix">Pix</option>
                  </select>
                  <button type="submit" style={{ padding: '12px', background: '#00875f', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Concluir Venda</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}