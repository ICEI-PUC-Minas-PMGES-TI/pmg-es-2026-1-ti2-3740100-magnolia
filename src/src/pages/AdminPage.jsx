import { useEffect, useState, Fragment } from 'react';
import { useProdutosAdmin, CATEGORIA_LABELS, CATEGORIA_OPTIONS, API } from '../hooks/useProdutos.js';
import {
  getDashboardMetrics,
  readAdminPedidos,
  updateAdminPedidoStatus,
  writeAdminPedidos,
} from '../utils/adminStore.js';

const fmt = (n = 0) => 'R$' + Number(n).toFixed(2).replace('.', ',');
const STATUS_MAP = {
  pendente:  { label: 'Aguardando pagamento',  color: '#856404', bg: '#fff3cd' },
  em_rota:   { label: 'Em rota',   color: '#155724', bg: '#d4edda' },
  entregue:  { label: 'Entregue',  color: '#0c5460', bg: '#d1ecf1' },
  cancelado: { label: 'Cancelado', color: '#721c24', bg: '#f8d7da' },
  PENDENTE:  { label: 'Aguardando pagamento',  color: '#856404', bg: '#fff3cd' },
  EM_ROTA:   { label: 'Em rota',   color: '#155724', bg: '#d4edda' },
  ENTREGUE:  { label: 'Entregue',  color: '#0c5460', bg: '#d1ecf1' },
  CANCELADO: { label: 'Cancelado', color: '#721c24', bg: '#f8d7da' },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, color: '#555', bg: '#eee' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function MetricCard({ icon, label, value, sub, color = '#1B3A2D' }) {
  return (
    <div className="adm-metric">
      <div className="adm-metric__icon" style={{ background: color + '18', color }}>{icon}</div>
      <div>
        <p className="adm-metric__label">{label}</p>
        <p className="adm-metric__value" style={{ color }}>{value}</p>
        {sub && <p className="adm-metric__sub">{sub}</p>}
      </div>
    </div>
  );
}

function TabDashboard() {
  const [dash, setDash] = useState(null);

  useEffect(() => {
    fetch(`${API}/admin/dashboard`)
      .then((r) => {
        if (!r.ok) throw new Error('Erro ao buscar dashboard');
        return r.json();
      })
      .then(setDash)
      .catch(() => setDash(getDashboardMetrics()));
  }, []);

  if (!dash) return <p style={{ color: 'var(--gray-500)' }}>Carregando métricas...</p>;

  return (
    <div>
      <div className="adm-metrics-grid">
        <MetricCard icon="💰" label="Vendas do mês"      value={fmt(dash.vendasMes)}        sub="+14,3% vs mês anterior" color="#1B8A4F" />
        <MetricCard icon="📦" label="Pedidos do mês"     value={dash.pedidosMes}             sub={`Ticket médio ${fmt(dash.ticketMedio)}`} color="#1B3A2D" />
        <MetricCard icon="🚚" label="Entregas pendentes" value={dash.entregasPendentes}      sub="Hoje" color="#856404" />
        <MetricCard icon="📈" label="Lucro do mês"       value={fmt(dash.lucroMes)}          sub="53,2% de margem" color="#0c5460" />
      </div>
      <div className="adm-section-title" style={{ marginTop: 32 }}>Últimos pedidos</div>
      <PedidosTable compact />
    </div>
  );
}

function PedidosTable({ compact = false }) {
  const [pedidos, setPedidos] = useState([]);
  const [filter,  setFilter]  = useState('todos');

  useEffect(() => {
    fetch(`${API}/pedidos`)
      .then((r) => {
        if (!r.ok) throw new Error('Erro ao buscar pedidos');
        return r.json();
      })
      .then((data) => {
        writeAdminPedidos(data);
        setPedidos(data);
      })
      .catch(() => setPedidos(readAdminPedidos()));
  }, []);

  const atualizarStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/pedidos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar pedido');
    } catch {}

    const updated = updateAdminPedidoStatus(id, status);
    setPedidos(updated);
  };

  const excluirPedido = async (id) => {
    if (!window.confirm('Remover este pedido permanentemente?')) return;
    try {
      const res = await fetch(`${API}/pedidos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir pedido');
    } catch {
      alert('Não foi possível remover o pedido.');
      return;
    }
    setPedidos((prev) => prev.filter((p) => p.id !== id));
  };

  const filtrados = filter === 'todos' ? pedidos : pedidos.filter((p) => p.status === filter.toUpperCase());
  const lista = compact ? filtrados.slice(0, 4) : filtrados;

  return (
    <div>
      {!compact && (
        <div className="adm-filter-row">
          {['todos', 'PENDENTE', 'EM_ROTA', 'ENTREGUE', 'CANCELADO'].map((f) => (
            <button key={f} className={`adm-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'todos' ? 'Todos' : STATUS_MAP[f]?.label}
            </button>
          ))}
        </div>
      )}
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Data</th>
              <th>Status</th>
              {!compact && <th>Ação</th>}
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.id}>
                <td><span className="adm-order-id">#{String(p.id).padStart(5, '0')}</span></td>
                <td>{p.clienteNome}</td>
                <td style={{ fontWeight: 600 }}>{fmt(p.total)}</td>
                <td style={{ color: '#777', fontSize: 12 }}>
                  {p.criadoEm ? new Date(p.criadoEm).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td><StatusBadge status={p.status} /></td>
                {!compact && (
                  <td>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <select
                        value={p.status}
                        onChange={(e) => atualizarStatus(p.id, e.target.value)}
                        style={{ fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}
                      >
                        <option value="PENDENTE">Pendente</option>
                        <option value="EM_ROTA">Em rota</option>
                        <option value="ENTREGUE">Entregue</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                      <button className="adm-btn-sm adm-btn-danger" onClick={() => excluirPedido(p.id)} title="Excluir pedido">🗑️</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabPedidos() { return <PedidosTable />; }

function TabEntregas() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    fetch(`${API}/pedidos`)
      .then((r) => {
        if (!r.ok) throw new Error('Erro ao buscar entregas');
        return r.json();
      })
      .then((data) => {
        writeAdminPedidos(data);
        setPedidos(data);
      })
      .catch(() => setPedidos(readAdminPedidos()));
  }, []);

  const pendentes = pedidos.filter((p) => p.status === 'PENDENTE' || p.status === 'EM_ROTA');

  const confirmar = async (id) => {
    try {
      const res = await fetch(`${API}/pedidos/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ENTREGUE' }),
      });
      if (!res.ok) throw new Error('Erro ao confirmar entrega');
    } catch {}
    const updated = updateAdminPedidoStatus(id, 'ENTREGUE');
    setPedidos(updated);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <MetricCard icon="⏳" label="Pendentes"       value={pedidos.filter((p) => p.status === 'PENDENTE').length} color="#856404" />
        <MetricCard icon="🚚" label="Em rota"         value={pedidos.filter((p) => p.status === 'EM_ROTA').length}  color="#155724" />
        <MetricCard icon="✅" label="Entregues hoje"  value={pedidos.filter((p) => p.status === 'ENTREGUE').length} color="#0c5460" />
      </div>
      <div className="adm-section-title">Entregas em aberto</div>
      {pendentes.length === 0
        ? <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Nenhuma entrega pendente no momento.</p>
        : (
          <div className="adm-deliveries">
            {pendentes.map((p) => (
              <div key={p.id} className="adm-delivery-card">
                <div className="adm-delivery-card__left">
                  <span className="adm-order-id">#{String(p.id).padStart(5, '0')}</span>
                  <div>
                    <strong>{p.clienteNome}</strong>
                    <p style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{p.enderecoEntrega || '—'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge status={p.status} />
                  <button className="adm-btn-sm adm-btn-green" onClick={() => confirmar(p.id)}>
                    ✓ Confirmar entrega
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

const EMPTY = { nome: '', preco: '', estoque: '', descricao: '', categoria: 'BUQUES', imgFile: null, imgPreview: null };
const EMPTY_MOV = { tipo: 'ENTRADA', quantidade: '', observacao: '' };

function MovimentacaoModal({ produto, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_MOV);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setErro('');
    if (!form.quantidade || Number(form.quantidade) < 1) {
      setErro('Informe uma quantidade válida (mínimo 1).');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API}/movimentacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId: produto.id,
          tipo: form.tipo,
          quantidade: Number(form.quantidade),
          observacao: form.observacao || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || 'Erro ao registrar movimentação.');
        return;
      }
      onSaved();
      onClose();
    } catch {
      setErro('Erro de conexão. Verifique o servidor.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-modal-bg">
      <div className="adm-modal" style={{ maxWidth: 440 }}>
        <div className="adm-modal__header">
          <h3>Movimentar Estoque</h3>
          <button className="adm-modal__close" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '0 4px 8px', color: '#555', fontSize: 13 }}>
          <strong>{produto.name}</strong>
          <span style={{ marginLeft: 10, color: '#888' }}>
            Estoque atual: <strong style={{ color: produto.estoque < 5 ? '#856404' : '#155724' }}>{produto.estoque} un.</strong>
          </span>
        </div>
        <form onSubmit={handleSave} className="adm-form">
          <div className="adm-form__group adm-form__group--full">
            <label>Tipo de movimentação *</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['ENTRADA', 'SAIDA'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 9, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    border: '2px solid',
                    borderColor: form.tipo === t ? (t === 'ENTRADA' ? '#1B8A4F' : '#c0392b') : '#ddd',
                    background: form.tipo === t ? (t === 'ENTRADA' ? '#d4edda' : '#f8d7da') : '#fff',
                    color: form.tipo === t ? (t === 'ENTRADA' ? '#155724' : '#721c24') : '#888',
                  }}
                >
                  {t === 'ENTRADA' ? '⬆ Entrada' : '⬇ Saída'}
                </button>
              ))}
            </div>
          </div>

          <div className="adm-form__group adm-form__group--full">
            <label>Quantidade *</label>
            <input
              type="number" min="1" value={form.quantidade}
              onChange={(e) => setForm((f) => ({ ...f, quantidade: e.target.value }))}
              required placeholder="Ex: 10"
            />
          </div>

          <div className="adm-form__group adm-form__group--full">
            <label>Observação</label>
            <textarea
              rows={3} value={form.observacao}
              onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
              placeholder="Ex: Reposição semanal, ajuste de inventário..."
            />
          </div>

          {erro && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              {erro}
            </div>
          )}

          <div className="adm-form__actions">
            <button type="button" className="adm-btn-outline" onClick={onClose}>Cancelar</button>
            <button
              type="submit" disabled={saving}
              style={{
                background: form.tipo === 'ENTRADA' ? '#1B8A4F' : '#c0392b',
                color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px',
                fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Registrando...' : 'Registrar movimentação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TabProdutos() {
  const { produtos, setProdutos, loading, refetch } = useProdutosAdmin();
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [filterCat, setFilterCat] = useState('TODOS');
  const [movProduto, setMovProduto] = useState(null);

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, imgFile: file, imgPreview: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({
      nome: p.name, preco: p.price, estoque: p.estoque,
      descricao: p.descricao || '', categoria: p.categoria || 'BUQUES',
      imgFile: null, imgPreview: p.img,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover este produto?')) return;
    try {
      const res = await fetch(`${API}/produtos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao remover produto');
    } catch {
      alert('Não foi possível remover o produto no backend.');
      return;
    }
    await refetch();
  };

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`${API}/produtos/${id}/toggle`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Erro ao alterar status do produto');
      await refetch();
    } catch {
      alert('Não foi possível alterar status do produto no backend.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('nome',      form.nome);
      fd.append('descricao', form.descricao);
      fd.append('preco',     form.preco);
      fd.append('estoque',   form.estoque);
      fd.append('categoria', form.categoria);
      if (form.imgFile) fd.append('imagem', form.imgFile);

      const url = editing ? `${API}/produtos/${editing}` : `${API}/produtos`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) throw new Error('Erro ao salvar produto');
      await refetch();
    } catch {
      alert('Não foi possível salvar o produto no backend.');
    } finally {
      setSaving(false);
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY);
    }
  };

  const produtosFiltrados = filterCat === 'TODOS'
    ? produtos
    : produtos.filter((p) => p.categoria === filterCat);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: '#666' }}>{produtos.length} produtos cadastrados</span>
        <button className="adm-btn-green" onClick={() => { setShowForm(true); setEditing(null); setForm(EMPTY); }}>
          + Novo produto
        </button>
      </div>

      <div className="adm-filter-row" style={{ marginBottom: 16 }}>
        <button className={`adm-filter-btn ${filterCat === 'TODOS' ? 'active' : ''}`} onClick={() => setFilterCat('TODOS')}>Todos</button>
        {CATEGORIA_OPTIONS.map(({ value, label }) => (
          <button key={value} className={`adm-filter-btn ${filterCat === value ? 'active' : ''}`} onClick={() => setFilterCat(value)}>
            {label}
          </button>
        ))}
      </div>

      {movProduto && (
        <MovimentacaoModal
          produto={movProduto}
          onClose={() => setMovProduto(null)}
          onSaved={refetch}
        />
      )}

      {showForm && (
        <div className="adm-modal-bg">
          <div className="adm-modal">
            <div className="adm-modal__header">
              <h3>{editing ? 'Editar produto' : 'Novo produto'}</h3>
              <button className="adm-modal__close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} className="adm-form">
              <div className="adm-form__img-upload">
                {form.imgPreview
                  ? <img src={form.imgPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                  : <div className="adm-form__img-placeholder">
                      <span style={{ fontSize: 32 }}>🌹</span>
                      <span style={{ fontSize: 12, color: '#999', marginTop: 6 }}>Clique para adicionar foto</span>
                    </div>
                }
                <input type="file" accept="image/*" onChange={handleImgChange}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              </div>

              <div className="adm-form__group adm-form__group--full">
                <label>Nome do produto *</label>
                <input name="nome" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  required placeholder="Ex: Buquê de Rosas Vermelhas" />
              </div>

              <div className="adm-form__group adm-form__group--full">
                <label>Categoria *</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                  style={{ padding: '11px 13px', border: '1.5px solid #ccc', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
                >
                  {CATEGORIA_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="adm-form__row">
                <div className="adm-form__group">
                  <label>Preço (R$) *</label>
                  <input type="number" step="0.01" value={form.preco}
                    onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))}
                    required placeholder="149.90" />
                </div>
                <div className="adm-form__group">
                  <label>Estoque *</label>
                  <input type="number" value={form.estoque}
                    onChange={(e) => setForm((f) => ({ ...f, estoque: e.target.value }))}
                    required placeholder="20" />
                </div>
              </div>

              <div className="adm-form__group adm-form__group--full">
                <label>Descrição</label>
                <textarea rows={3} value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  placeholder="Descrição do produto..." />
              </div>

              <div className="adm-form__actions">
                <button type="button" className="adm-btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="adm-btn-green" disabled={saving}>
                  {saving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Cadastrar produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading
        ? <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Carregando produtos...</p>
        : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((p) => (
                  <tr key={p.id} style={{ opacity: p.ativo ? 1 : 0.55 }}>
                    <td>
                      <div style={{ width: 52, height: 44, borderRadius: 8, overflow: 'hidden', background: '#f5f0e4' }}>
                        {p.img && <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                      </div>
                    </td>
                    <td style={{ fontWeight: 500, maxWidth: 200, fontSize: 13 }}>{p.name}</td>
                    <td>
                      <span style={{ background: '#f0faf3', color: '#1B3A2D', padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600 }}>
                        {CATEGORIA_LABELS[p.categoria] || p.categoria}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#1B3A2D' }}>{fmt(p.price)}</td>
                    <td>
                      <span style={{
                        fontWeight: 600,
                        color: p.estoque === 0 ? '#721c24' : p.estoque < 5 ? '#856404' : '#155724',
                        fontSize: 13,
                      }}>
                        {p.estoque === 0 ? 'Sem estoque' : `${p.estoque} un.`}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(p.id)}
                        style={{
                          background: p.ativo ? '#d4edda' : '#f8d7da',
                          color:      p.ativo ? '#155724' : '#721c24',
                          border: 'none', borderRadius: 20, padding: '3px 12px',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="adm-btn-sm"
                          title="Movimentar estoque"
                          onClick={() => setMovProduto(p)}
                          style={{ background: '#e8f4fd', color: '#0c5460', border: '1px solid #bee5eb' }}
                        >
                          📦
                        </button>
                        <button className="adm-btn-sm adm-btn-outline" onClick={() => handleEdit(p)}>✏️</button>
                        <button className="adm-btn-sm adm-btn-danger"  onClick={() => handleDelete(p.id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

function TabAvaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/admin/avaliacoes`);
      if (!res.ok) throw new Error('Erro ao buscar avaliações');
      const data = await res.json();
      setAvaliacoes(Array.isArray(data) ? data : []);
    } catch {
      setAvaliacoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const atualizarStatus = async (id, status) => {
    const res = await fetch(`${API}/admin/avaliacoes/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    setAvaliacoes((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  if (loading) return <p style={{ color: 'var(--gray-500)' }}>Carregando avaliações...</p>;

  return (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Nota</th>
            <th>Comentário</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {avaliacoes.map((a) => (
            <tr key={a.id}>
              <td>{a.clienteNome}</td>
              <td>{a.produtoNome || '—'}</td>
              <td>{a.nota}★</td>
              <td style={{ maxWidth: 320 }}>{a.comentario}</td>
              <td>{a.status}</td>
              <td>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="adm-btn-sm adm-btn-green" onClick={() => atualizarStatus(a.id, 'APROVADA')}>Aprovar</button>
                  <button className="adm-btn-sm adm-btn-danger" onClick={() => atualizarStatus(a.id, 'REJEITADA')}>Rejeitar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [senhaVisivel, setSenhaVisivel] = useState({});
  const [expandido, setExpandido] = useState({});

  useEffect(() => {
    fetch(`${API}/auth/admin/clientes`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(setClientes)
      .catch(() => setClientes([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleSenha  = (id) => setSenhaVisivel((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleExpand = (id) => setExpandido((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) return <p style={{ color: 'var(--gray-500)' }}>Carregando clientes...</p>;

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 14, color: '#666' }}>
        {clientes.length} cliente(s) cadastrado(s)
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Senha</th>
              <th>Endereços</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#999', fontSize: 13 }}>
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            ) : (
              clientes.map((c, i) => (
                <Fragment key={c.id}>
                  <tr>
                    <td><span className="adm-order-id">{i + 1}</span></td>
                    <td style={{ fontWeight: 500 }}>{c.nome}</td>
                    <td style={{ color: '#555', fontSize: 13 }}>{c.email}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>
                          {senhaVisivel[c.id] ? c.senha : '••••••••'}
                        </span>
                        <button
                          onClick={() => toggleSenha(c.id)}
                          style={{ background: 'none', border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}
                        >
                          {senhaVisivel[c.id] ? 'Ocultar' : 'Ver'}
                        </button>
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleExpand(c.id)}
                        style={{
                          background: (c.enderecos?.length || 0) > 0 ? '#f0faf3' : '#f5f5f5',
                          color: (c.enderecos?.length || 0) > 0 ? '#1B3A2D' : '#999',
                          border: 'none', borderRadius: 20, padding: '3px 12px',
                          fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {c.enderecos?.length || 0} endereço(s) {expandido[c.id] ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>
                  {expandido[c.id] && (
                    <tr style={{ background: '#fafafa' }}>
                      <td colSpan={5} style={{ padding: '8px 20px 14px' }}>
                        {(c.enderecos?.length || 0) === 0 ? (
                          <p style={{ color: '#aaa', fontSize: 13, margin: 0 }}>Sem endereços cadastrados.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {c.enderecos.map((end) => (
                              <div key={end.id} style={{
                                background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                                padding: '8px 14px', fontSize: 13, display: 'flex', gap: 10, alignItems: 'center',
                              }}>
                                {end.apelido && (
                                  <span style={{ background: '#1B3A2D', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                                    {end.apelido}
                                  </span>
                                )}
                                <span>
                                  {end.rua}, {end.numero}
                                  {end.complemento ? ` – ${end.complemento}` : ''} · {end.bairro} · {end.cidade}/{end.uf} · CEP {end.cep}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const STATUS_CONTATO = {
  ABERTO:        { label: 'Aberto',        color: '#856404', bg: '#fff3cd' },
  EM_ANDAMENTO:  { label: 'Em andamento',  color: '#004085', bg: '#cce5ff' },
  RESOLVIDO:     { label: 'Resolvido',     color: '#155724', bg: '#d4edda' },
};

function TabSuporte() {
  const [contatos, setContatos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expandido, setExpandido] = useState({});

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/admin/contatos`);
      if (!res.ok) throw new Error();
      setContatos(await res.json());
    } catch {
      setContatos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const atualizarStatus = async (id, status) => {
    try {
      await fetch(`${API}/admin/contatos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setContatos((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    } catch {}
  };

  if (loading) return <p style={{ color: 'var(--gray-500)' }}>Carregando mensagens...</p>;

  const abertos = contatos.filter((c) => c.status !== 'RESOLVIDO').length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <MetricCard icon="📨" label="Total de mensagens" value={contatos.length} color="#1B3A2D" />
        <MetricCard icon="🔔" label="Pendentes"           value={abertos}         color="#856404" />
        <MetricCard icon="✅" label="Resolvidos"          value={contatos.length - abertos} color="#155724" />
      </div>

      {contatos.length === 0 ? (
        <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Nenhuma mensagem de suporte recebida ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contatos.map((c) => {
            const s = STATUS_CONTATO[c.status] || STATUS_CONTATO.ABERTO;
            const isOpen = expandido[c.id];
            return (
              <div key={c.id} style={{ border: '1px solid', borderRadius: 12, overflow: 'hidden', borderColor: c.status === 'RESOLVIDO' ? '#e2e8e0' : '#d4a017' }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: c.status === 'RESOLVIDO' ? '#fafaf8' : '#fffdf0', cursor: 'pointer', flexWrap: 'wrap' }}
                  onClick={() => setExpandido((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                >
                  <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 14 }}>{c.nome}</strong>
                    <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{c.email}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1B3A2D', background: '#f0faf3', borderRadius: 20, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                    {c.assunto}
                  </span>
                  {c.numeroPedido && <span style={{ fontSize: 12, color: '#777' }}>Pedido #{c.numeroPedido}</span>}
                  <span style={{ fontSize: 11, color: '#aaa', whiteSpace: 'nowrap' }}>
                    {c.criadoEm ? new Date(c.criadoEm).toLocaleDateString('pt-BR') : '—'}
                  </span>
                  <span style={{ color: '#1B3A2D', fontSize: 16 }}>{isOpen ? '▲' : '▼'}</span>
                </div>

                {isOpen && (
                  <div style={{ padding: '14px 16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
                    <p style={{ fontSize: 14, color: '#333', lineHeight: 1.7, marginBottom: 16, whiteSpace: 'pre-wrap' }}>
                      {c.mensagem}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, color: '#666', alignSelf: 'center', marginRight: 4 }}>Alterar status:</span>
                      {['ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO'].map((st) => (
                        <button
                          key={st}
                          onClick={() => atualizarStatus(c.id, st)}
                          style={{
                            background: c.status === st ? STATUS_CONTATO[st].bg : '#f5f5f5',
                            color:      c.status === st ? STATUS_CONTATO[st].color : '#555',
                            border: 'none', borderRadius: 20, padding: '5px 14px',
                            fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          {STATUS_CONTATO[st].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TabMovimentacoes() {
  const [movs, setMovs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [filtroProduto, setFiltroProduto] = useState('');

  const carregar = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/movimentacoes`);
      if (!res.ok) throw new Error();
      setMovs(await res.json());
    } catch {
      setMovs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const lista = movs.filter((m) => {
    const matchTipo = filtroTipo === 'TODOS' || m.tipo === filtroTipo;
    const matchProd = !filtroProduto || m.produtoNome.toLowerCase().includes(filtroProduto.toLowerCase());
    return matchTipo && matchProd;
  });

  const totalEntradas = movs.filter((m) => m.tipo === 'ENTRADA').reduce((s, m) => s + m.quantidade, 0);
  const totalSaidas   = movs.filter((m) => m.tipo === 'SAIDA').reduce((s, m) => s + m.quantidade, 0);

  if (loading) return <p style={{ color: 'var(--gray-500)' }}>Carregando log de movimentações...</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <MetricCard icon="📋" label="Total de registros" value={movs.length}     color="#1B3A2D" />
        <MetricCard icon="⬆"  label="Total entradas"     value={`${totalEntradas} un.`} color="#155724" />
        <MetricCard icon="⬇"  label="Total saídas"       value={`${totalSaidas} un.`}   color="#721c24" />
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="adm-filter-row" style={{ margin: 0 }}>
          {['TODOS', 'ENTRADA', 'SAIDA'].map((t) => (
            <button
              key={t}
              className={`adm-filter-btn ${filtroTipo === t ? 'active' : ''}`}
              onClick={() => setFiltroTipo(t)}
            >
              {t === 'TODOS' ? 'Todos' : t === 'ENTRADA' ? '⬆ Entrada' : '⬇ Saída'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Filtrar por produto..."
          value={filtroProduto}
          onChange={(e) => setFiltroProduto(e.target.value)}
          style={{
            padding: '7px 13px', border: '1.5px solid #ddd', borderRadius: 8,
            fontSize: 13, outline: 'none', minWidth: 200,
          }}
        />
        <button
          onClick={carregar}
          style={{
            padding: '7px 14px', background: '#f0faf3', color: '#1B3A2D',
            border: '1px solid #c3e6cb', borderRadius: 8, fontSize: 13,
            fontWeight: 600, cursor: 'pointer',
          }}
        >
          ↻ Atualizar
        </button>
      </div>

      {lista.length === 0 ? (
        <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Nenhuma movimentação registrada ainda.</p>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Produto</th>
                <th>Tipo</th>
                <th>Qtd</th>
                <th>Antes</th>
                <th>Depois</th>
                <th>Observação</th>
                <th>Data / Hora</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((m) => (
                <tr key={m.id}>
                  <td><span className="adm-order-id">#{String(m.id).padStart(4, '0')}</span></td>
                  <td style={{ fontWeight: 500, fontSize: 13, maxWidth: 200 }}>{m.produtoNome}</td>
                  <td>
                    <span style={{
                      background: m.tipo === 'ENTRADA' ? '#d4edda' : '#f8d7da',
                      color:      m.tipo === 'ENTRADA' ? '#155724' : '#721c24',
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    }}>
                      {m.tipo === 'ENTRADA' ? '⬆ Entrada' : '⬇ Saída'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, textAlign: 'center' }}>{m.quantidade}</td>
                  <td style={{ textAlign: 'center', color: '#888' }}>{m.estoqueAntes} un.</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: m.estoqueDepois < 5 ? '#856404' : '#155724' }}>
                    {m.estoqueDepois} un.
                  </td>
                  <td style={{ fontSize: 12, color: '#666', maxWidth: 220, whiteSpace: 'pre-wrap' }}>
                    {m.observacao || <span style={{ color: '#bbb' }}>—</span>}
                  </td>
                  <td style={{ fontSize: 12, color: '#777', whiteSpace: 'nowrap' }}>
                    {m.criadoEm
                      ? new Date(m.criadoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [code,    setCode]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) { onLogin(); return; }
    } catch {}
    if (code === 'JARDIM@2026') { onLogin(); }
    else { setError('Código de acesso inválido.'); }
    setLoading(false);
  };

  return (
    <div className="adm-login-wrap">
      <div className="adm-login-card">
        <div className="adm-login-logo">
          <svg width="54" height="54" viewBox="0 0 118 118" fill="none">
            <ellipse cx="59" cy="59" rx="55" ry="55" stroke="#1B3A2D" strokeWidth="1.8"/>
            <ellipse cx="59" cy="59" rx="50" ry="50" stroke="#1B3A2D" strokeWidth="0.8"/>
            <text x="59" y="65" textAnchor="middle" fontFamily="Georgia,serif" fontSize="22" fontWeight="700" fill="#1B3A2D">JM</text>
          </svg>
        </div>
        <h2 className="adm-login-title">Área do Administrador</h2>
        <p className="adm-login-sub">Digite o código de acesso para entrar</p>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input type="password" className="adm-login-input" placeholder="Código de acesso"
            value={code} onChange={(e) => setCode(e.target.value)} required autoComplete="off" />
          {error && <p className="adm-login-error">{error}</p>}
          <button type="submit" className="adm-login-btn" disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
        <p className="adm-login-hint">Código: <code>JARDIM@2026</code></p>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'dashboard',     label: '📊 Dashboard'     },
  { id: 'pedidos',       label: '📦 Pedidos'        },
  { id: 'entregas',      label: '🚚 Entregas'       },
  { id: 'produtos',      label: '🌹 Produtos'       },
  { id: 'movimentacoes', label: '📋 Movimentações'  },
  { id: 'avaliacoes',    label: '⭐ Avaliações'     },
  { id: 'suporte',       label: '💬 Suporte'        },
  { id: 'clientes',      label: '👥 Clientes'       },
];

export default function AdminPage({ onNavigate }) {
  const [authed, setAuthed] = useState(false);
  const [tab,    setTab]    = useState('dashboard');

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />;

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <svg width="36" height="36" viewBox="0 0 118 118" fill="none">
            <ellipse cx="59" cy="59" rx="55" ry="55" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8"/>
            <text x="59" y="66" textAnchor="middle" fontFamily="Georgia,serif" fontSize="24" fontWeight="700" fill="#fff">JM</text>
          </svg>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Jardim Magnólia</div>
            <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>Painel Admin</div>
          </div>
        </div>
        <nav className="adm-sidebar__nav">
          {TABS.map((t) => (
            <button key={t.id} className={`adm-sidebar__link ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar__footer">
          <button className="adm-sidebar__logout" onClick={() => { setAuthed(false); setTab('dashboard'); }}>← Sair</button>
          <button className="adm-sidebar__logout" style={{ opacity: 0.7 }} onClick={() => onNavigate('home')}>Ver loja</button>
        </div>
      </aside>

      <main className="adm-main">
        <div className="adm-main__header">
          <h1 className="adm-main__title">{TABS.find((t) => t.id === tab)?.label}</h1>
          <span className="adm-main__date">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="adm-main__body">
          {tab === 'dashboard'     && <TabDashboard     />}
          {tab === 'pedidos'       && <TabPedidos       />}
          {tab === 'entregas'      && <TabEntregas      />}
          {tab === 'produtos'      && <TabProdutos      />}
          {tab === 'movimentacoes' && <TabMovimentacoes />}
          {tab === 'avaliacoes'    && <TabAvaliacoes    />}
          {tab === 'suporte'       && <TabSuporte       />}
          {tab === 'clientes'      && <TabClientes      />}
        </div>
      </main>
    </div>
  );
}