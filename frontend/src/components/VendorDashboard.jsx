import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function VendorDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [message, setMessage] = useState('');

  const authHeader = localStorage.getItem('authHeader');
  const userPhone = localStorage.getItem('userPhone');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/api/products', { headers: { Authorization: authHeader } });
      setProducts(res.data);
    } catch (e) {
      console.error(e);
      setMessage('Erro ao carregar produtos.');
    }
  };

  const addToCart = (product) => {
    if (product.stockQuantity <= 0) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.qty < product.stockQuantity) {
        setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      } else {
        setMessage(`Stock máximo atingido para ${product.name}.`);
      }
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0).toFixed(2);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      setMessage('A cesta de compras está vazia.');
      return;
    }

    try {
      for (let item of cart) {
        await api.post(`/api/sales?productId=${item.id}&quantity=${item.qty}`, {}, {
          headers: { Authorization: authHeader }
        });
      }
      setMessage(`Venda de balcão concluída com sucesso via ${paymentMethod}!`);
      setCart([]);
      loadProducts();
    } catch (error) {
      setMessage('Erro ao finalizar venda: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        <h2>Gelateria Raspanti - Painel do Vendedor (PDV)</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Vendedor: <strong>{userPhone}</strong></span>
          <button onClick={onLogout} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      {message && <p style={{ padding: '10px', background: '#333', borderRadius: '4px', marginTop: '15px' }}>{message}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* Catálogo de Produtos em Cards com Imagem e Botão + */}
        <div>
          <h3>Catálogo de Produtos</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '15px' }}>
            {products.map(p => (
              <div key={p.id} style={{ position: 'relative', background: '#1a1a1a', border: '1px solid #444', borderRadius: '8px', padding: '15px', paddingBottom: '45px' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} />
                ) : (
                  <div style={{ width: '100%', height: '120px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', marginBottom: '10px', color: '#aaa' }}>Sem Imagem</div>
                )}
                <h4 style={{ margin: '5px 0' }}>{p.name}</h4>
                <p style={{ color: '#28a745', fontWeight: 'bold', margin: '5px 0' }}>R$ {p.price?.toFixed(2)}</p>
                <p style={{ fontSize: '12px', color: '#aaa', margin: '0' }}>Stock: {p.stockQuantity}</p>

                {/* Botão + no canto inferior direito */}
                <button 
                  onClick={() => addToCart(p)}
                  disabled={p.stockQuantity <= 0}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    background: p.stockQuantity > 0 ? '#007bff' : '#555',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    fontSize: '20px',
                    cursor: p.stockQuantity > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                  }}
                  title={p.stockQuantity > 0 ? "Adicionar item" : "Esgotado"}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cesta de Compras e Finalização do PDV */}
        <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #444', height: 'fit-content' }}>
          <h3>Cesta de Compras</h3>
          {cart.length === 0 ? (
            <p style={{ color: '#aaa', marginTop: '15px' }}>A cesta está vazia. Clique no `+` dos produtos para adicionar.</p>
          ) : (
            <div>
              <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                {cart.map(item => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                    <div>
                      <span style={{ display: 'block', fontWeight: 'bold' }}>{item.name}</span>
                      <span style={{ fontSize: '12px', color: '#aaa' }}>Qtd: {item.qty} x R$ {item.price.toFixed(2)}</span>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Remover</button>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '10px' }}>
                <h4>Total: R$ {calculateTotal()}</h4>
              </div>

              <form onSubmit={handleCheckout} style={{ marginTop: '15px', display: 'grid', gap: '10px' }}>
                <label>Forma de Pagamento:</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '8px', background: '#333', color: '#fff', border: '1px solid #555' }}>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Pix">Pix</option>
                </select>

                <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                  Concluir Venda PDV
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}