// eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line react-hooks/immutability
    loadData();
  }, []);

  const loadData = async () => {
    try {
      try {
        const prodRes = await api.get('/api/products', { headers: { Authorization: authHeader } });
        setProducts(prodRes.data);
      } catch (e) { console.error("Erro ao carregar produtos", e); }

      try {
        const salesRes = await api.get('/api/sales', { headers: { Authorization: authHeader } });
        setSales(salesRes.data);
      } catch (e) { console.error("Erro ao carregar vendas", e); }

      try {
        const usersRes = await api.get('/api/users', { headers: { Authorization: authHeader } });
        setUsers(usersRes.data);
      } catch (e) { console.error("Erro ao carregar utilizadores", e); }

    } catch (e) {
      console.error(e);
      setMessage('Erro ao carregar dados do painel.');
    }
  };

  const handleRegisterEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/users/employee?phone=${empPhone}&password=${empPassword}&roleStr=${empRole}`, {}, {
        headers: { Authorization: authHeader }
      });
      setMessage('Funcionário registado com sucesso!');
      setEmpPhone('');
      setEmpPassword('');
      loadData();
    } catch (error) {
      setMessage('Erro ao registar funcionário: ' + (error.response?.data || error.message));
    }
  };

  const handleInactivateUser = async (phone) => {
    try {
      await api.put(`/api/users/inactivate?phone=${phone}`, {}, { headers: { Authorization: authHeader } });
      setMessage(`Utilizador ${phone} inativado com sucesso.`);
      loadData();
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessage('Erro ao inativar utilizador.');
    }
  };

const handleCreateOrUpdateProduct = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      name,
      description,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity, 10) || 0, 
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
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessage('Erro ao inativar produto.');
    }
  };

  // Cálculo e Filtros de Rankings por Período
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
    <>
      <div className="rotating-gelato-bg"></div>
      <div className="full-screen-container">
        
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #27272a', paddingBottom: '20px', marginBottom: '25px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', color: '#00b37e', letterSpacing: '-0.5px' }}>Gelateria Raspanti</h1>
            <span style={{ fontSize: '14px', color: '#a1a1aa' }}>Painel Administrativo e de Gestão Global</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '15px' }}>Gestor: <strong style={{ color: '#00b37e' }}>{userPhone}</strong></span>
            <button onClick={onLogout} style={{ padding: '10px 20px', background: '#f75a68', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Sair</button>
          </div>
        </div>

        {message && (
          <div style={{ padding: '12px 20px', background: '#18181b', borderLeft: '4px solid #00b37e', borderRadius: '4px', marginBottom: '25px' }}>
            {message}
          </div>
        )}

        {/* Formulários Lado a Lado */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
          
          {/* Registar Funcionário */}
          <div style={{ background: '#18181b', padding: '25px', borderRadius: '10px', border: '1px solid #27272a' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#00b37e' }}>Registar Funcionário</h3>
            <form onSubmit={handleRegisterEmployee} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#a1a1aa' }}>Telemóvel / Telefone:</label>
                <input type="text" placeholder="Ex: 31984525602" value={empPhone} onChange={e => setEmpPhone(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#a1a1aa' }}>Palavra-passe:</label>
                <input type="password" placeholder="******" value={empPassword} onChange={e => setEmpPassword(e.target.value)} required style={{ width: '100%', padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#a1a1aa' }}>Função (Role):</label>
                <select value={empRole} onChange={e => setEmpRole(e.target.value)} style={{ width: '100%', padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px', boxSizing: 'border-box' }}>
                  <option value="ROLE_VENDEDOR">Vendedor</option>
                  <option value="ROLE_GERENTE">Gerente</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" style={{ marginTop: '10px', padding: '14px', background: '#00875f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                Registar Funcionário
              </button>
            </form>
          </div>

          {/* Registar / Editar Produto */}
          <div style={{ background: '#18181b', padding: '25px', borderRadius: '10px', border: '1px solid #27272a' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#00b37e' }}>{editingId ? `Editar Produto (ID: ${editingId})` : 'Registar Novo Produto'}</h3>
            <form onSubmit={handleCreateOrUpdateProduct} style={{ display: 'grid', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="text" placeholder="Nome do Produto" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px' }} />
                <input type="number" step="0.01" placeholder="Preço (R$)" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input type="number" placeholder="Quantidade em Stock" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required style={{ padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px' }} />
                <input type="text" placeholder="URL da Foto (https://...)" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{ padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px' }} />
              </div>
              <input type="text" placeholder="Descrição Breve" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px' }} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                <button type="submit" style={{ flex: 1, padding: '14px', background: '#00875f', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {editingId ? 'Atualizar Produto' : 'Salvar Produto'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetProductForm} style={{ padding: '14px 20px', background: '#27272a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

        </div>

        {/* Tabela de Produtos */}
        <div style={{ background: '#18181b', padding: '25px', borderRadius: '10px', border: '1px solid #27272a', marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#00b37e' }}>Gestão de Produtos</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #27272a', color: '#a1a1aa' }}>
                <th style={{ padding: '14px' }}>ID</th>
                <th style={{ padding: '14px' }}>Foto</th>
                <th style={{ padding: '14px' }}>Nome</th>
                <th style={{ padding: '14px' }}>Preço</th>
                <th style={{ padding: '14px' }}>Stock</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '14px' }}>{p.id}</td>
                  <td style={{ padding: '14px' }}>
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <div style={{ width: '45px', height: '45px', background: '#09090b', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#71717a' }}>Sem foto</div>
                    )}
                  </td>
                  <td style={{ padding: '14px', fontWeight: 'bold' }}>{p.name}</td>
                  <td style={{ padding: '14px', color: '#00b37e' }}>R$ {p.price?.toFixed(2)}</td>
                  <td style={{ padding: '14px' }}>{p.stockQuantity} un.</td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    <button onClick={() => handleEditClick(p)} style={{ background: '#fba94c', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginRight: '8px' }}>Editar</button>
                    <button onClick={() => handleInactivateProduct(p.id)} style={{ background: '#f75a68', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Inativar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tabela de Funcionários */}
        <div style={{ background: '#18181b', padding: '25px', borderRadius: '10px', border: '1px solid #27272a', marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#00b37e' }}>Funcionários Registados</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #27272a', color: '#a1a1aa' }}>
                <th style={{ padding: '14px' }}>ID</th>
                <th style={{ padding: '14px' }}>Telemóvel / Usuário</th>
                <th style={{ padding: '14px' }}>Função (Role)</th>
                <th style={{ padding: '14px' }}>Estado</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #27272a' }}>
                  <td style={{ padding: '14px' }}>{u.id}</td>
                  <td style={{ padding: '14px', fontWeight: 'bold' }}>{u.phoneNumber}</td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ padding: '4px 10px', background: '#27272a', borderRadius: '4px', fontSize: '12px' }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '14px' }}>
                    <span style={{ color: u.active ? '#00b37e' : '#f75a68', fontWeight: 'bold' }}>
                      {u.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '14px', textAlign: 'right' }}>
                    {u.active && (
                      <button onClick={() => handleInactivateUser(u.phoneNumber)} style={{ background: '#f75a68', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Inativar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Seção Restaurada: Rankings e Analytics */}
        <div style={{ background: '#18181b', padding: '25px', borderRadius: '10px', border: '1px solid #27272a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#00b37e' }}>Rankings e Desempenho</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: '#a1a1aa' }}>Filtrar Período:</span>
              <select value={period} onChange={e => setPeriod(e.target.value)} style={{ padding: '8px 12px', background: '#09090b', color: '#fff', border: '1px solid #27272a', borderRadius: '6px' }}>
                <option value="todos">Todos os Períodos</option>
                <option value="dia">Hoje (Dia)</option>
                <option value="semana">Últimos 7 Dias</option>
                <option value="mes">Este Mês</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {/* Ranking Produtos */}
            <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#fff' }}>Produtos Mais Vendidos</h4>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                {productRanking.map(p => (
                  <li key={p.id} style={{ marginBottom: '10px', fontSize: '14px', color: '#e1e1e6' }}>
                    {p.name} - <strong style={{ color: '#00b37e' }}>{p.totalSold} un.</strong>
                  </li>
                ))}
              </ol>
            </div>

            {/* Ranking Clientes */}
            <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#fff' }}>Clientes em Destaque</h4>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                {clientRanking.map((c, i) => (
                  <li key={i} style={{ marginBottom: '10px', fontSize: '14px', color: '#e1e1e6' }}>
                    {c.client} - <strong style={{ color: '#00b37e' }}>R$ {c.totalSpent.toFixed(2)}</strong>
                  </li>
                ))}
              </ol>
            </div>

            {/* Ranking Vendedores */}
            <div style={{ background: '#09090b', padding: '20px', borderRadius: '8px', border: '1px solid #27272a' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#fff' }}>Desempenho Vendedores</h4>
              <ol style={{ paddingLeft: '20px', margin: 0 }}>
                {vendorRanking.map((v, i) => (
                  <li key={i} style={{ marginBottom: '10px', fontSize: '14px', color: '#e1e1e6' }}>
                    {v.vendor} - <strong style={{ color: '#00b37e' }}>R$ {v.totalValue.toFixed(2)}</strong> ({v.totalQty} un.)
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}