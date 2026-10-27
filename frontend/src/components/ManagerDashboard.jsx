import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ManagerDashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [period, setPeriod] = useState('todos');

  // Estados para Funcionário
  const [empPhone, setEmpPhone] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRole, setEmpRole] = useState('ROLE_VENDEDOR');

  // Estados para Produto e Edição
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [message, setMessage] = useState('');

  const authHeader = localStorage.getItem('authHeader');
  const userPhone = localStorage.getItem('userPhone');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, salesRes, usersRes] = await Promise.all([
        api.get('/api/products', { headers: { Authorization: authHeader } }),
        api.get('/api/sales', { headers: { Authorization: authHeader } }),
        api.get('/api/users', { headers: { Authorization: authHeader } }).catch(() => ({ data: [] }))
      ]);
      setProducts(prodRes.data);
      setSales(salesRes.data);
      setUsers(usersRes.data);
    } catch (e) {
      console.error(e);
      setMessage('Erro ao carregar dados do painel.');
    }
  };

  const handleCreateOrUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity),
        imageUrl
      };

      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload, { headers: { Authorization: authHeader } });
        setMessage('Produto atualizado com sucesso!');
      } else {
        await api.post('/api/products', payload, { headers: { Authorization: authHeader } });
        setMessage('Produto criado com sucesso!');
      }

      resetProductForm();
      loadData();
    } catch (error) {
      setMessage('Erro ao salvar produto: ' + (error.response?.data || error.message));
    }
  };

  const handleEditClick = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description || '');
    setPrice(p.price);
    setStockQuantity(p.stockQuantity);
    setImageUrl(p.imageUrl || '');
  };

  const resetProductForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setImageUrl('');
  };

  const handleInactivateProduct = async (id) => {
    try {
      await api.put(`/api/products/${id}/inactivate`, {}, { headers: { Authorization: authHeader } });
      setMessage('Produto inativado com sucesso.');
      loadData();
    } catch (error) {
      setMessage('Erro ao inativar produto.');
    }
  };

  const filterSalesByPeriod = (saleList) => {
    const now = new Date();
    return saleList.filter(s => {
      const saleDate = new Date(s.saleDate);
      if (period === 'dia') {
        return saleDate.toDateString() === now.toDateString();
      } else if (period === 'semana') {
        const diffTime = Math.abs(now - saleDate);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      } else if (period === 'mes') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const filteredSales = filterSalesByPeriod(sales);

  const productRanking = products.map(p => {
    const totalSold = filteredSales.filter(s => s.productId === p.id).reduce((acc, s) => acc + s.quantity, 0);
    return { ...p, totalSold };
  }).sort((a, b) => b.totalSold - a.totalSold);

  const clientRanking = Object.values(
    filteredSales.reduce((acc, s) => {
      const client = s.sellerPhone;
      if (!acc[client]) acc[client] = { client, totalSpent: 0, count: 0 };
      acc[client].totalSpent += s.totalPrice;
      acc[client].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.totalSpent - a.totalSpent);

  const vendorRanking = Object.values(
    filteredSales.reduce((acc, s) => {
      const vendor = s.sellerPhone;
      if (!acc[vendor]) acc[vendor] = { vendor, totalValue: 0, totalQty: 0 };
      acc[vendor].totalValue += s.totalPrice;
      acc[vendor].totalQty += s.quantity;
      return acc;
    }, {})
  ).sort((a, b) => b.totalValue - a.totalValue);

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '10px' }}>
        <h2>Gelateria Raspanti - Painel do Gerente / Admin </h2>
        <div>
          <span style={{ marginRight: '15px' }}>Gestor: <strong>{userPhone}</strong></span>
          <button onClick={onLogout} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      {message && <p style={{ padding: '10px', background: '#333', borderRadius: '4px', marginTop: '15px', color: '#fff' }}>{message}</p>}

      <div style={{ margin: '20px 0', background: '#222', padding: '10px', borderRadius: '6px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <strong>Filtrar Rankings por Período:</strong>
        <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '6px', background: '#333', color: '#fff', border: '1px solid #555' }}>
          <option value="todos">Todos os Períodos</option>
          <option value="dia">Hoje (Dia)</option>
          <option value="semana">Últimos 7 Dias (Semana)</option>
          <option value="mes">Este Mês</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
        {/* Registar Funcionário */}
        <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #444' }}>
          <h4>Registar Funcionário</h4>
          <form onSubmit={(e) => { e.preventDefault(); }} style={{ display: 'grid', gap: '8px' }}>
            <input type="text" placeholder="Telemóvel" value={empPhone} onChange={e => setEmpPhone(e.target.value)} required style={{ padding: '6px', background: '#333', color: '#fff', border: '1px solid #555' }} />
            <input type="password" placeholder="Palavra-passe" value={empPassword} onChange={e => setEmpPassword(e.target.value)} required style={{ padding: '6px', background: '#333', color: '#fff', border: '1px solid #555' }} />
            <select value={empRole} onChange={e => setEmpRole(e.target.value)} style={{ padding: '6px', background: '#333', color: '#fff', border: '1px solid #555' }}>
              <option value="ROLE_VENDEDOR">Vendedor</option>
              <option value="ROLE_GERENTE">Gerente</option>
              <option value="ROLE_ADMIN">Admin</option>
            </select>
          </form>
        </div>

        {/* Registar ou Editar Produto */}
        <div style={{ background: '#1a1a1a', padding: '15px', borderRadius: '6px', border: '1px solid #444' }}>
          <h4>{editingId ? 'Editar Produto (ID: ' + editingId + ')' : 'Registar Novo Produto'}</h4>
          <form onSubmit={handleCreateOrUpdateProduct} style={{ display: 'grid', gap: '8px' }}>
            <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '6px', background: '#333', color: '#fff', border: '1px solid #555' }} />
            <input type="text" placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '6px', background: '#333', color: '#fff', border: '1px solid #555' }} />
            <input type="number" step="0.01" placeholder="Preço" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '6px', background: '#333', color: '#fff', border: '1px solid #555' }} />
            <input type="number" placeholder="Stock" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required style={{ padding: '6px', background: '#333', color: '#fff', border: '1px solid #555' }} />
            <input type="text" placeholder="URL da Foto (Ex: https://...)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ padding: '6px', background: '#333', color: '#fff', border: '1px solid #555' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={{ padding: '8px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>
                {editingId ? 'Atualizar Produto' : 'Salvar Produto'}
              </button>
              {editingId && (
                <button type="button" onClick={resetProductForm} style={{ padding: '8px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Tabela de Gestão de Produtos com Botão de Atualizar/Editar */}
      <h3 style={{ marginTop: '20px' }}>Gestão e Inativação de Produtos</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'left', background: '#1a1a1a', color: '#fff' }}>
        <thead>
          <tr style={{ background: '#444', color: '#fff' }}>
            <th>ID</th><th>Foto</th><th>Nome</th><th>Preço</th><th>Stock</th><th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                ) : 'Sem foto'}
              </td>
              <td>{p.name}</td>
              <td>R$ {p.price?.toFixed(2)}</td>
              <td>{p.stockQuantity}</td>
              <td style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleEditClick(p)} style={{ background: '#ffc107', color: '#000', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Editar</button>
                <button onClick={() => handleInactivateProduct(p.id)} style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }}>Inativar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}