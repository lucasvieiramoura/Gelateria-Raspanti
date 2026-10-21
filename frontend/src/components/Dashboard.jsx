import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Dashboard({ onLogout }) {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [message, setMessage] = useState('');

  const authHeader = localStorage.getItem('authHeader');
  const userPhone = localStorage.getItem('userPhone');

  // Carregar produtos ao montar o componente
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await api.get('/api/products', {
        headers: { Authorization: authHeader }
      });
      setProducts(response.data);
    } catch (error) {
      setMessage('Erro ao carregar produtos.');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        '/api/products',
        {
          name,
          description,
          price: parseFloat(price),
          stockQuantity: parseInt(stockQuantity)
        },
        { headers: { Authorization: authHeader } }
      );
      setMessage('Produto cadastrado com sucesso!');
      setName('');
      setDescription('');
      setPrice('');
      setStockQuantity('');
      loadProducts();
    } catch (error) {
      setMessage('Erro ao cadastrar produto (requer perfil ADMIN ou GERENTE).');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Gelateria Raspanti - Painel</h2>
        <div>
          <span style={{ marginRight: '10px' }}>Usuário: <strong>{userPhone}</strong></span>
          <button onClick={onLogout} style={{ padding: '6px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Sair
          </button>
        </div>
      </div>

      {message && <p style={{ padding: '10px', background: '#e9ecef', borderRadius: '4px' }}>{message}</p>}

      {/* Formulário de Cadastro de Produto */}
      <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '20px', border: '1px solid #ddd' }}>
        <h3>Novo Produto (Gelato / Item)</h3>
        <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: '10px' }}>
          <input type="text" placeholder="Nome do Gelato" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '8px' }} />
          <input type="text" placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '8px' }} />
          <input type="number" step="0.01" placeholder="Preço (R$)" value={price} onChange={e => setPrice(e.target.value)} required style={{ padding: '8px' }} />
          <input type="number" placeholder="Quantidade em Estoque" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} required style={{ padding: '8px' }} />
          <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Salvar Produto
          </button>
        </form>
      </div>

      {/* Tabela / Lista de Produtos */}
      <h3>Estoque & Produtos</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#007bff', color: '#fff' }}>
            <th>ID</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Preço</th>
            <th>Estoque</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.description}</td>
              <td>R$ {p.price?.toFixed(2)}</td>
              <td>{p.stockQuantity}</td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>Nenhum produto cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}