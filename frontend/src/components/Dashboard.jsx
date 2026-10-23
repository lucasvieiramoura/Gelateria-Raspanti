import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  
  // Estados Produto
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  // Estados Funcionário
  const [empPhone, setEmpPhone] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRole, setEmpRole] = useState('ROLE_VENDEDOR');

  // Estados PDV (Venda)
  const [selectedProduct, setSelectedProduct] = useState('');
  const [saleQuantity, setSaleQuantity] = useState(1);

  const [message, setMessage] = useState('');

  const authHeader = localStorage.getItem('authHeader');
  const userPhone = localStorage.getItem('userPhone');

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/api/products', { headers: { Authorization: authHeader } });
      setProducts(response.data);
    } catch (error) {
      setMessage('Erro ao carregar produtos.');
    }
  };

  const loadSales = async () => {
    try {
      const response = await api.get('/api/sales', { headers: { Authorization: authHeader } });
      setSales(response.data);
    } catch (error) {
      console.error('Erro ao carregar vendas');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/products', {
        name, description, price: parseFloat(price), stockQuantity: parseInt(stockQuantity)
      }, { headers: { Authorization: authHeader } });
      setMessage('Produto cadastrado com sucesso!');
      setName(''); setDescription(''); setPrice(''); setStockQuantity('');
      loadProducts();
    } catch (error) {
      setMessage('Erro ao cadastrar produto.');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/users/employee?phone=${empPhone}&password=${empPassword}&roleStr=${empRole}`, {}, { headers: { Authorization: authHeader } });
      setMessage('Funcionário cadastrado com sucesso!');
      setEmpPhone(''); setEmpPassword('');
    } catch (error) {
      setMessage('Erro ao cadastrar funcionário.');
    }
  };

  const handleMakeSale = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/sales?productId=${selectedProduct}&quantity=${saleQuantity}`, {}, { headers: { Authorization: authHeader } });
      setMessage('Venda realizada com sucesso e stock atualizado!');
      setSelectedProduct('');
      setSaleQuantity(1);
      loadProducts();
      loadSales();
    } catch (error) {
      setMessage('Erro ao realizar venda: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif', background: '#fff', color: '#333', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px' }}>
        <h2 style={{ padding: '10px', color: '#333' }}>Gelateria Raspanti - Painel Geral & PDV</h2>
        <div>
          <span style={{ marginRight: '15px' }}>Utilizador: <strong>{userPhone}</strong></span>
          <button onClick={onLogout} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </div>

      {message && <p style={{ padding: '10px', background: '#e9ecef', borderRadius: '4px', color: '#333' }}>{message}</p>}

      {/* SECÇÃO PDV / VENDAS */}
      <div style={{ background: '#e2f0d9', padding: '15px', borderRadius: '6px', marginBottom: '25px', border: '1px solid #c8e6c9' }}>
        <h3>Ponto de Venda (PDV) - Registar Venda</h3>
        <form onSubmit={handleMakeSale} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '2fr 1fr auto' }}>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} required style={{ padding: '8px' }}>
            <option value="">Selecione o Gelato...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} - R$ {p.price?.toFixed(2)} (Stock: {p.stockQuantity})</option>
            ))}
          </select>
          <input type="number" min="1" placeholder="Quantidade" value={saleQuantity} onChange={e => setSaleQuantity(e.target.value)} required style={{ padding: '8px' }} />
          <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Concluir Venda
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
        {/* Gestão de Funcionários */}
        <div style={{ background: '#f1f3f5', padding: '15px', borderRadius: '6px', border: '1px solid #ced4da' }}>
          <h4>Registar Funcionário</h4>
          <form onSubmit={handleCreateEmployee} style={{ display: 'grid', gap: '8px' }}>
            <input type="text" placeholder="Telemóvel" value={empPhone} onChange={e => setEmpPhone(e.target.value)} required style={{ padding: '6px' }} />
            <input type="password" placeholder="Palavra-passe" value={empPassword} onChange={e => setEmpPassword(e.target.value)} required style={{ padding: '6px' }} />
            <select value={empRole} onChange={e => setEmpRole(e.target.value)} style={{ padding: '6px' }}>
              <option value="ROLE_VENDEDOR">Vendedor</option>
              <option value="ROLE_GERENTE">Gerente</option>
              <option value="ROLE_ADMIN">Admin</option>
            </select>
            <button type="submit" style={{ padding: '8px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Registar</button>
          </form>
        </div>

        {/* Novo Produto */}
        <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', border: '1px solid #ddd' }}>
          <h4>Novo Produto</h4>
          <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: '8px' }}>
            <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '6px' }} />
            <input type="number" step="0.01" placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '6px' }} />
            <input type="number" placeholder="Stock" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required style={{ padding: '6px' }} />
            <button type="submit" style={{ padding: '8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Salvar</button>
          </form>
        </div>
      </div>

      {/* Tabela de Stock */}
      <h3>Stock Atual</h3>
      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#007bff', color: '#fff' }}>
            <th>ID</th><th>Nome</th><th>Preço</th><th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td><td>{p.name}</td><td>R$ {p.price?.toFixed(2)}</td><td>{p.stockQuantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tabela de Vendas Realizadas */}
      <h3>Histórico de Vendas (PDV)</h3>
      <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#6c757d', color: '#fff' }}>
            <th>ID Venda</th><th>Produto</th><th>Qtd</th><th>Total</th><th>Vendedor</th><th>Data</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.productName}</td>
              <td>{s.quantity}</td>
              <td>R$ {s.totalPrice?.toFixed(2)}</td>
              <td>{s.sellerPhone}</td>
              <td>{new Date(s.saleDate).toLocaleString()}</td>
            </tr>
          ))}
          {sales.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>Nenhuma venda registada.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}