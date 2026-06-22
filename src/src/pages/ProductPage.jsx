import { useEffect, useState } from 'react';
import Stars from '../components/Stars.jsx';
import MiniCard from '../components/MiniCard.jsx';
import Footer from '../components/Footer.jsx';
import { API, normalizeProduto } from '../hooks/useProdutos.js';
import { IMAGES, RELATED } from '../data/index.js';

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function buildDates(offset) {
  const today = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset * 5 + i + 1);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return { short: DAY_NAMES[d.getDay()], date: `${dd}/${mm}`, available: true };
  });
}

const FALLBACK_THUMBS = [IMAGES.rose6, IMAGES.rose12, IMAGES.rose14];

const API_ORIGIN = API.replace('/api', '');
const resolveUrl = (u) => {
  if (!u) return '';
  if (u.startsWith('data:') || u.startsWith('http://') || u.startsWith('https://')) return u;
  return `${API_ORIGIN}${u}`;
};

const FALLBACK_PRODUCT = {
  id: 1,
  name: 'Buquê com 6 Rosas Colombianas Vermelhas',
  price: 149.90,
  img: IMAGES.rose6,
  description: 'Rosas colombianas de alta qualidade, colhidas frescas e entregues com delicadeza. Ideal para declarar amor, homenagear ou presentear em qualquer ocasião especial.',
};

const fmt = (n) => 'R$ ' + Number(n).toFixed(2).replace('.', ',');

export default function ProductPage({ onNavigate, onAddToCart, cliente, productId, initialProduct }) {
  const [product, setProduct] = useState(() => {
    if (initialProduct) {
      return {
        id:          initialProduct.id,
        name:        initialProduct.name,
        price:       initialProduct.price,
        img:         initialProduct.img,
        description: initialProduct.descricao || initialProduct.description || '',
      };
    }
    return productId ? null : FALLBACK_PRODUCT;
  });
  const [thumbs, setThumbs] = useState(() => {
    if (initialProduct?.img) return [initialProduct.img];
    return productId ? [] : FALLBACK_THUMBS;
  });
  const [activeThumb, setActiveThumb] = useState(0);
  const [qty, setQty]                 = useState(1);
  const [selectedDate, setSelectedDate] = useState(0);
  const [weekOffset, setWeekOffset]     = useState(0);
  const deliveryDates = buildDates(weekOffset);
  const [avaliacoes, setAvaliacoes]   = useState([]);
  const [nota, setNota]               = useState(5);
  const [comentario, setComentario]   = useState('');
  const [reviewMsg, setReviewMsg]     = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!productId) return;
    fetch(`${API}/produtos/${productId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const norm = normalizeProduto(data);
        setProduct({
          id:          norm.id,
          name:        norm.name,
          price:       norm.price,
          img:         norm.img,
          description: norm.descricao || '',
        });
      })
      .catch(() => {});
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    setActiveThumb(0);
    fetch(`${API}/produtos/${productId}/imagens`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const urls = data
          .slice()
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
          .map((img) => resolveUrl(img.url))
          .filter(Boolean);
        if (urls.length > 0) setThumbs(urls);
      })
      .catch(() => {});
  }, [productId]);

  const currentProduct = product || FALLBACK_PRODUCT;
  const currentThumbs  = thumbs.length > 0 ? thumbs : (currentProduct.img ? [currentProduct.img] : []);
  const safeActive     = Math.min(activeThumb, Math.max(0, currentThumbs.length - 1));

  useEffect(() => {
    if (!currentProduct.id) return;
    fetch(`${API}/avaliacoes/produto/${currentProduct.id}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setAvaliacoes(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [currentProduct.id]);

  const avgNota = avaliacoes.length
    ? Math.round(avaliacoes.reduce((s, a) => s + (a.nota ?? 5), 0) / avaliacoes.length)
    : 5;

  const handleBuy = () => {
    onAddToCart({ ...currentProduct, img: currentThumbs[safeActive] || currentProduct.img, qty });
    onNavigate('cart');
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewMsg('');
    setReviewError('');
    if (!cliente?.id) { setReviewError('Faça login para avaliar.'); return; }
    if (!comentario.trim()) { setReviewError('Escreva um comentário antes de enviar.'); return; }
    try {
      const res = await fetch(`${API}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId:   currentProduct.id,
          clienteId:   cliente.id,
          clienteNome: cliente.nome,
          nota,
          comentario,
        }),
      });
      if (!res.ok) throw new Error('Erro ao enviar avaliação');
      const nova = await res.json();
      setAvaliacoes((prev) => [nova, ...prev]);
      setComentario('');
      setNota(5);
      setReviewMsg('Avaliação enviada! Ela será exibida após aprovação.');
    } catch {
      setReviewError('Não foi possível enviar a avaliação.');
    }
  };

  return (
    <>

      <div className="product-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button onClick={() => onNavigate('home')}>Início</button>
        <span> / </span>
        <span>Buquês</span>
        <span> / </span>
        <span>{currentProduct.name}</span>
      </div>

      <div className="product-layout">

        {/* Coluna esquerda: galeria + descrição + avaliações */}
        <div>
          {/* Galeria */}
          <div className="product-gallery__main">
            {currentThumbs[safeActive] && (
              <img src={currentThumbs[safeActive]} alt={currentProduct.name} />
            )}
            <div className="product-gallery__badge">
              <div className="product-gallery__badge-stars">
                <Stars n={avgNota} size={13} />
              </div>
              <div className="product-gallery__badge-name">Flores Online</div>
              <div className="product-gallery__badge-reviews">
                {avaliacoes.length} avaliação(ões)
              </div>
            </div>
          </div>

          {currentThumbs.length > 1 && (
            <div className="product-gallery__thumbs">
              {currentThumbs.map((src, i) => (
                <div
                  key={i}
                  className={`product-gallery__thumb ${safeActive === i ? 'active' : ''}`}
                  onClick={() => setActiveThumb(i)}
                >
                  <img src={src} alt={`Foto ${i + 1}`} />
                </div>
              ))}
            </div>
          )}

          {/* Descrição */}
          <div className="product-desc">
            <h2 className="product-desc__title">Sobre o produto</h2>
            <p className="product-desc__text">{currentProduct.description}</p>
          </div>

          {/* Avaliações */}
          <div className="reviews-section">
            <h3 className="reviews-section__title">Avaliações dos clientes</h3>
            <div className="reviews-section__overall">
              <Stars n={avgNota} size={18} />
              <span style={{ marginLeft: 8, fontSize: 14, color: '#666' }}>
                {avgNota}/5 · {avaliacoes.length} avaliação(ões)
              </span>
            </div>

            <form className="review-form" onSubmit={handleReview}>
              <div className="review-form__row">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNota(n)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: n <= nota ? '#f5a623' : '#ddd' }}
                  >★</button>
                ))}
              </div>
              <textarea
                className="form-input"
                rows={3}
                placeholder={cliente ? 'Escreva seu comentário...' : 'Faça login para avaliar'}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                disabled={!cliente}
                style={{ resize: 'vertical', width: '100%' }}
              />
              {reviewError && <p style={{ color: '#9f1239', fontSize: 13, margin: '4px 0' }}>{reviewError}</p>}
              {reviewMsg  && <p style={{ color: '#155724', fontSize: 13, margin: '4px 0' }}>{reviewMsg}</p>}
              <button
                type="submit"
                className="btn-login"
                style={{ width: 'auto', padding: '10px 24px', marginTop: 8 }}
                disabled={!cliente}
              >
                Enviar avaliação
              </button>
            </form>

            <div className="reviews-list">
              {avaliacoes.length === 0 && (
                <p style={{ color: '#999', fontSize: 14 }}>Nenhuma avaliação ainda. Seja o primeiro!</p>
              )}
              {avaliacoes.map((av, i) => (
                <div key={av.id ?? i} className="review-item">
                  <div className="review-item__stars">
                    <Stars n={av.nota ?? 5} size={13} />
                  </div>
                  <p className="review-item__text">{av.comentario}</p>
                  <div className="review-item__name">{av.clienteNome}</div>
                  <div className="review-item__date">
                    {av.criadoEm ? new Date(av.criadoEm).toLocaleDateString('pt-BR') : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna direita: painel de compra */}
        <div>
          <div className="purchase-panel">
            <div className="purchase-panel__source">Flores Online</div>
            <h1 className="purchase-panel__name">{currentProduct.name}</h1>
            <div className="purchase-panel__price">{fmt(currentProduct.price)}</div>
            <div className="purchase-panel__price-sub">
              ou 2x de {fmt(currentProduct.price / 2)} sem juros
            </div>

            <hr className="panel-divider" />

            <div className="panel-info-row">
              <span>🚚</span>
              <span>Entrega em todo o Brasil</span>
            </div>

            {/* Datas */}
            <div className="dates">
              <button
                className="date-more"
                onClick={() => { setWeekOffset(o => o - 1); setSelectedDate(0); }}
                disabled={weekOffset === 0}
                title="Datas anteriores"
              >‹</button>

              {deliveryDates.map((d, i) => (
                <button
                  key={i}
                  className={`date-btn ${selectedDate === i ? 'selected' : ''} ${!d.available ? 'disabled' : ''}`}
                  onClick={() => d.available && setSelectedDate(i)}
                  disabled={!d.available}
                >
                  <div className="date-btn__short">{d.short}</div>
                  <div className="date-btn__dot" />
                  <div>{d.date}</div>
                </button>
              ))}

              <button
                className="date-more"
                onClick={() => { setWeekOffset(o => o + 1); setSelectedDate(0); }}
                title="Datas futuras"
              >›</button>
            </div>

            {/* Quantidade */}
            <div className="quantity">
              <span className="quantity__label">Quantidade</span>
              <div className="quantity__control">
                <button className="quantity__btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <span className="quantity__value">{qty}</span>
                <button className="quantity__btn" onClick={() => setQty((q) => q + 1)}>+</button>
              </div>
            </div>

            <button className="btn-buy" onClick={handleBuy}>
              Comprar agora
            </button>
          </div>
        </div>

      </div>

      {/* Produtos relacionados — fora do grid para não conflitar com o painel sticky */}
      <div className="related">
        <h2 className="related__title">Você também pode gostar</h2>
        <div className="related__divider" />
        <div className="related__grid">
          {RELATED.map((p) => (
            <MiniCard key={p.id} item={p} onAddToCart={onAddToCart} onClick={() => onNavigate('product', { productId: p.id, product: p })} />
          ))}
        </div>
      </div>

      </div>

      <Footer onNavigate={onNavigate} />
    </>
  );
}
