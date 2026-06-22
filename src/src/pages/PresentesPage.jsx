import { useState, useMemo } from 'react';
import MiniCard from '../components/MiniCard.jsx';
import Footer from '../components/Footer.jsx';
import { useProdutos, CATEGORIA_LABELS, CATEGORIA_OPTIONS } from '../hooks/useProdutos.js';

const OCASIOES = [
  { label: 'Dia dos Namorados', emoji: '💑', cat: 'BUQUES' },
  { label: 'Aniversário',       emoji: '🎂', cat: 'ANIVERSARIO' },
  { label: 'Casamento',         emoji: '💍', cat: 'ROSAS' },
  { label: 'Dia das Mães',      emoji: '👩', cat: 'CESTAS' },
  { label: 'Formatura',         emoji: '🎓', cat: 'PRESENTES' },
  { label: 'Nascimento',        emoji: '👶', cat: 'PLANTAS' },
];

function PriceRange({ value, onChange }) {
  return (
    <div className="pres-filter__group">
      <label className="pres-filter__label">Faixa de preço</label>
      <div className="pres-price-btns">
        {[
          { label: 'Até R$100',       max: 100  },
          { label: 'R$100 – R$200',   max: 200  },
          { label: 'R$200 – R$400',   max: 400  },
          { label: 'Acima de R$400',  max: 9999 },
        ].map((r) => (
          <button
            key={r.label}
            className={`pres-price-btn ${value === r.max ? 'active' : ''}`}
            onClick={() => onChange(value === r.max ? null : r.max)}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PresentesPage({ onNavigate, onAddToCart, initialCategoria }) {
  const { grupos, loading } = useProdutos();

  const [catSel,    setCatSel]    = useState(initialCategoria || 'TODOS');
  const [precoMax,  setPrecoMax]  = useState(null);
  const [busca,     setBusca]     = useState('');
  const [ordem,     setOrdem]     = useState('nome');
  const [addedId,   setAddedId]   = useState(null);
  const todosOsProdutos = useMemo(() => {
    return Object.values(grupos).flat();
  }, [grupos]);
  const produtosFiltrados = useMemo(() => {
    let lista = catSel === 'TODOS'
      ? todosOsProdutos
      : grupos[catSel] || [];

    if (busca.trim()) {
      lista = lista.filter((p) =>
        p.name.toLowerCase().includes(busca.toLowerCase())
      );
    }

    if (precoMax) {
      const min = precoMax === 100 ? 0 : precoMax === 200 ? 100 : precoMax === 400 ? 200 : 400;
      lista = lista.filter((p) => p.price >= min && p.price <= precoMax);
    }

    return [...lista].sort((a, b) => {
      if (ordem === 'preco_asc')  return a.price - b.price;
      if (ordem === 'preco_desc') return b.price - a.price;
      return a.name.localeCompare(b.name);
    });
  }, [grupos, catSel, busca, precoMax, ordem, todosOsProdutos]);

  const handleAddToCart = (item) => {
    onAddToCart(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div>

      <div className="pres-hero">
        <div className="pres-hero__content">
          <h1 className="pres-hero__title">
            Presentes <em>Online</em>
          </h1>
          <p className="pres-hero__sub">
            Flores frescas, cestas e presentes especiais entregues em todo o Brasil
          </p>
        </div>
      </div>

      <div className="pres-layout">

        <aside className="pres-sidebar">

          <div className="pres-filter__group">
            <label className="pres-filter__label">Buscar</label>
            <div className="pres-search-wrap">
              <input
                className="pres-search"
                placeholder="Ex: buquê de rosas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
              {busca && (
                <button className="pres-search__clear" onClick={() => setBusca('')}>✕</button>
              )}
            </div>
          </div>

          <div className="pres-filter__group">
            <label className="pres-filter__label">Categoria</label>
            <div className="pres-cat-list">
              <button
                className={`pres-cat-btn ${catSel === 'TODOS' ? 'active' : ''}`}
                onClick={() => setCatSel('TODOS')}
              >
                🌺 Todos os produtos
                <span className="pres-cat-count">{todosOsProdutos.length}</span>
              </button>
              {CATEGORIA_OPTIONS.map(({ value, label }) => {
                const count = grupos[value]?.length || 0;
                if (count === 0) return null;
                return (
                  <button
                    key={value}
                    className={`pres-cat-btn ${catSel === value ? 'active' : ''}`}
                    onClick={() => setCatSel(value)}
                  >
                    {label}
                    <span className="pres-cat-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pres-filter__group">
            <label className="pres-filter__label">Ocasiões</label>
            <div className="pres-ocasioes">
              {OCASIOES.map((o) => (
                <button
                  key={o.label}
                  className="pres-ocasiao-btn"
                  onClick={() => setCatSel(o.cat)}
                >
                  <span>{o.emoji}</span>
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          <PriceRange value={precoMax} onChange={setPrecoMax} />

          {(catSel !== 'TODOS' || precoMax || busca) && (
            <button
              className="pres-clear-btn"
              onClick={() => { setCatSel('TODOS'); setPrecoMax(null); setBusca(''); }}
            >
              Limpar filtros
            </button>
          )}
        </aside>

        <main className="pres-main">

          <div className="pres-main__header">
            <div>
              <h2 className="pres-main__title">
                {catSel === 'TODOS' ? 'Todos os produtos' : CATEGORIA_LABELS[catSel]}
              </h2>
              <p className="pres-main__count">
                {loading ? 'Carregando...' : `${produtosFiltrados.length} produto${produtosFiltrados.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="pres-sort">
              <label>Ordenar por</label>
              <select value={ordem} onChange={(e) => setOrdem(e.target.value)}>
                <option value="nome">Nome (A-Z)</option>
                <option value="preco_asc">Menor preço</option>
                <option value="preco_desc">Maior preço</option>
              </select>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-500)' }}>
              <p>Carregando produtos...</p>
            </div>
          )}

          {!loading && produtosFiltrados.length === 0 && (
            <div className="pres-empty">
              <div style={{ fontSize: 56 }}>🌸</div>
              <h3>Nenhum produto encontrado</h3>
              <p>Tente ajustar os filtros ou buscar por outro termo.</p>
              <button
                className="pres-clear-btn"
                onClick={() => { setCatSel('TODOS'); setPrecoMax(null); setBusca(''); }}
              >
                Ver todos os produtos
              </button>
            </div>
          )}

          {!loading && produtosFiltrados.length > 0 && (
            <div className="pres-grid">
              {produtosFiltrados.map((item) => (
                <div key={item.id} className="pres-card-wrap">
                  <MiniCard
                    item={item}
                    onClick={() => onNavigate('product', { productId: item.id, product: item })}
                    onAddToCart={handleAddToCart}
                  />

                  {item.estoque <= 5 && item.estoque > 0 && (
                    <div className="pres-stock-badge pres-stock-badge--low">
                      Últimas {item.estoque} unidades
                    </div>
                  )}
                  {item.estoque === 0 && (
                    <div className="pres-stock-badge pres-stock-badge--out">
                      Sem estoque
                    </div>
                  )}

                  {addedId === item.id && (
                    <div className="pres-added-badge">✓ Adicionado!</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
  
}