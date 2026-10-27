import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function VendorDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [saleQuantity, setSaleQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [message, setMessage] = useState('');

  const authHeader = localStorage.getItem('authHeader');
  const userPhone = localStorage.getItem('userPhone');

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get('/api/products', { headers: { Authorization: authHeader } });
      setProducts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadSales = async () => {
    try {
      const res = await api.get('/api/sales', { headers: { Authorization: authHeader } });
      setSales(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMakeSale = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/sales?productId=${selectedProduct}&quantity=${saleQuantity}&paymentMethod=${paymentMethod}`, {}, { headers: { Authorization: authHeader } });
      setMessage(`Venda realizada com sucesso via ${paymentMethod}!`);
      setSelectedProduct('');
      setSaleQuantity(1);
      loadProducts();
      loadSales();
    } catch (error) {
      setMessage('Erro ao realizar venda: ' + (error.response?.data || error.message));
    }
  };

  // Ranking de produtos mais vendidos com base nas vendas registadas
  const productRanking = products.map(p => {
    const totalSold = sales
      .filter(s => s.productId === p.id)
      .reduce((acc, s) => acc + s.quantity, 0);
    return { ...p, totalSold };
  }).sort((a, b) => b.totalSold - a.totalSold);

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
        <h2>Gelateria Raspanti - Painel do Vendedor</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Vendedor: <strong>{userPhone}</strong></span>
          <button onClick={onLogout} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      {message && <p style={{ padding: '10px', background: '#e9ecef', borderRadius: '4px', marginTop: '15px' }}>{message}</p>}

      {/* Ponto de Venda (PDV) com formas de pagamento */}
      <div style={{ background: '#e2f0d9', padding: '15px', borderRadius: '6px', marginTop: '20px', border: '1px solid #c8e6c9' }}>
        <h3>Registar Venda Balcão (PDV)</h3>
        <form onSubmit={handleMakeSale} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '2fr 1fr 1fr auto' }}>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required style={{ padding: '8px' }}>
            <option value="">Selecione o Gelato...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} - R$ {p.price?.toFixed(2)} (Stock: {p.stockQuantity})</option>
            ))}
          </select>
          <input type="number" min="1" placeholder="Qtd" value={saleQuantity} onChange={e => setSaleQuantity(e.target.value)} required style={{ padding: '8px' }} />
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '8px' }}>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Cartão">Cartão</option>
            <option value="Pix">Pix</option>
          </select>
          <button type="submit" style={{ padding: '10px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Concluir Venda</button>
        </form>
      </div>

      {/* Ranking de Vendas de Produtos */}
      <h3 style={{ marginTop: '30px' }}>Ranking de Vendas de Produtos</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#007bff', color: '#fff' }}>
            <th>Posição</th><th>Produto</th><th>Unidades Vendidas</th><th>Stock Atual</th>
          </tr>
        </thead>
        <tbody>
          {productRanking.map((p, idx) => (
            <tr key={p.id}>
              <td>{idx + 1}º</td>
              <td>{p.name}</td>
              <td>{p.totalSold} un.</td>
              <td>{p.stockQuantity}</td>
            </tr>
          ))}
          {productRanking.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Sem dados de vendas.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}