const PRODUCTS_KEY = 'jm_admin_produtos';
const ORDERS_KEY = 'jm_admin_pedidos';

function isBrowser() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson(key, fallback) {
    if (!isBrowser()) return fallback;

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function writeJson(key, value) {
    if (!isBrowser()) return value;
    window.localStorage.setItem(key, JSON.stringify(value));
    return value;
}

export function readAdminProdutos() {
    return readJson(PRODUCTS_KEY, []);
}

export function writeAdminProdutos(produtos) {
    return writeJson(PRODUCTS_KEY, produtos);
}

export function upsertAdminProduto(produto) {
    const produtos = readAdminProdutos();
    const nextId = produto.id ?? Date.now();
    const nextProduto = { ...produto, id: nextId };
    const exists = produtos.some((item) => item.id === nextId);

    return writeAdminProdutos(
        exists
            ? produtos.map((item) => item.id === nextId ? nextProduto : item)
            : [nextProduto, ...produtos]
    );
}

export function removeAdminProduto(id) {
    return writeAdminProdutos(readAdminProdutos().filter((item) => item.id !== id));
}

export function toggleAdminProduto(id) {
    return writeAdminProdutos(
        readAdminProdutos().map((item) => item.id === id ? { ...item, ativo: !item.ativo } : item)
    );
}

export function readAdminPedidos() {
    return readJson(ORDERS_KEY, []);
}

export function writeAdminPedidos(pedidos) {
    return writeJson(ORDERS_KEY, pedidos);
}

export function updateAdminPedidoStatus(id, status) {
    return writeAdminPedidos(
        readAdminPedidos().map((pedido) => pedido.id === id ? { ...pedido, status } : pedido)
    );
}

export function getDashboardMetrics(pedidos = readAdminPedidos()) {
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth();

    const pedidosMes = pedidos.filter((pedido) => {
        if (!pedido.criadoEm) return false;
        const dataPedido = new Date(pedido.criadoEm);
        return dataPedido.getFullYear() === anoAtual && dataPedido.getMonth() === mesAtual;
    });

    const vendasMes = pedidosMes
        .filter((pedido) => pedido.status !== 'CANCELADO')
        .reduce((total, pedido) => total + Number(pedido.total || 0), 0);

    const entregasPendentes = pedidos.filter(
        (pedido) => pedido.status === 'PENDENTE' || pedido.status === 'EM_ROTA'
    ).length;

    const lucroMes = Number((vendasMes * 0.53).toFixed(2));
    const ticketMedio = pedidosMes.length ? Number((vendasMes / pedidosMes.length).toFixed(2)) : 0;

    return {
        vendasMes,
        pedidosMes: pedidosMes.length,
        entregasPendentes,
        lucroMes,
        ticketMedio,
    };
}

function TabProdutos ( ) {
  const { produtos, setProdutos, loading, refetch } = useProdutosAdmin();
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [filterCat, setFilterCat] = useState('TODOS');

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

  const handleToggle = async (id, ativo) => {
    try {
      const res = await fetch(`${API}/produtos/${id}/toggle`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Erro ao alterar status do produto');
      await refetch();
      return;
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
                      <span style={{
                        background: '#f0faf3', color: '#1B3A2D',
                        padding: '2px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                      }}>
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
                        onClick={() => handleToggle(p.id, p.ativo)}
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