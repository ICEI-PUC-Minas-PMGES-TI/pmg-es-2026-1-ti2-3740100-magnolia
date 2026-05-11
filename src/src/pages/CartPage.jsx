import { useEffect, useMemo, useState } from 'react';
import Footer from '../components/Footer.jsx';
import { API } from '../hooks/useProdutos.js';

const fmt = (n) => 'R$' + n.toFixed(2).replace('.', ',');

function CartEmpty({ onNavigate }) {
  return (
    <div className="cart-empty">
      <div className="cart-empty__icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      </div>
      <h2 className="cart-empty__title">Seu carrinho está vazio</h2>
      <p className="cart-empty__sub">Adicione flores e presentes especiais para continuar.</p>
      <button className="cart-empty__btn" onClick={() => onNavigate('home')}>Ver produtos</button>
    </div>
  );
}

function CartItem({ item, onQtyChange, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item__img"><img src={item.img} alt={item.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} /></div>
      <div className="cart-item__info">
        <p className="cart-item__source">Flores Online</p>
        <h3 className="cart-item__name">{item.name}</h3>
        <p className="cart-item__delivery">🚚 Entrega amanhã</p>
      </div>
      <div className="cart-item__qty">
        <button className="cart-item__qty-btn" onClick={() => onQtyChange(item.id, -1)}>−</button>
        <span className="cart-item__qty-val">{item.qty}</span>
        <button className="cart-item__qty-btn" onClick={() => onQtyChange(item.id, 1)}>+</button>
      </div>
      <div className="cart-item__price">{fmt(item.price * item.qty)}</div>
      <button className="cart-item__remove" onClick={() => onRemove(item.id)} title="Remover">✕</button>
    </div>
  );
}

function CheckoutForm({ cliente, onChange, cepLoading, enderecos, enderecoSelecionado, onSelecionarEndereco }) {
  const mostrarFormEndereco = enderecos.length === 0 || enderecoSelecionado === 'novo';

  return (
    <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
      <input className="form-input" placeholder="Nome completo" value={cliente.nome} onChange={(e) => onChange('nome', e.target.value)} required />
      <input className="form-input" type="email" placeholder="E-mail" value={cliente.email} onChange={(e) => onChange('email', e.target.value)} required />
      <input className="form-input" placeholder="Telefone" value={cliente.telefone} onChange={(e) => onChange('telefone', e.target.value)} required />

      {enderecos.length > 0 && (
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '4px 0 8px', color: '#333' }}>Endereço de entrega</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {enderecos.map((end) => (
              <label
                key={end.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px',
                  border: `1.5px solid ${enderecoSelecionado === end.id ? '#1B3A2D' : '#ddd'}`,
                  borderRadius: 10, cursor: 'pointer', fontSize: 13,
                  background: enderecoSelecionado === end.id ? '#f0faf3' : '#fff',
                }}
              >
                <input type="radio" name="endereco" style={{ marginTop: 2 }} checked={enderecoSelecionado === end.id} onChange={() => onSelecionarEndereco(end)} />
                <div>
                  {end.apelido && (
                    <span style={{ fontWeight: 700, background: '#1B3A2D', color: '#fff', fontSize: 10, borderRadius: 20, padding: '2px 8px', marginRight: 6 }}>
                      {end.apelido}
                    </span>
                  )}
                  <span>{end.rua}, {end.numero}{end.complemento ? ` – ${end.complemento}` : ''}</span>
                  <br />
                  <span style={{ color: '#666' }}>{end.bairro} · {end.cidade}/{end.uf} · CEP {end.cep}</span>
                </div>
              </label>
            ))}
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                border: `1.5px solid ${enderecoSelecionado === 'novo' ? '#1B3A2D' : '#ddd'}`,
                borderRadius: 10, cursor: 'pointer', fontSize: 13,
                background: enderecoSelecionado === 'novo' ? '#f0faf3' : '#fff',
              }}
            >
              <input type="radio" name="endereco" checked={enderecoSelecionado === 'novo'} onChange={() => onSelecionarEndereco('novo')} />
              + Outro endereço
            </label>
          </div>
        </div>
      )}

      {mostrarFormEndereco && (
        <>
          <div className="cep-row">
            <input className="form-input" placeholder="CEP" value={cliente.cep || ''} onChange={(e) => onChange('cep', e.target.value)} required />
            <button type="button" className="btn-cep" onClick={() => onChange('buscarCep')} disabled={cepLoading}>
              {cepLoading ? 'Buscando...' : 'Buscar CEP'}
            </button>
          </div>
          <input className="form-input" placeholder="Rua / Logradouro" value={cliente.rua} onChange={(e) => onChange('rua', e.target.value)} required />
          <input className="form-input" placeholder="Bairro" value={cliente.bairro} onChange={(e) => onChange('bairro', e.target.value)} required />
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
            <input className="form-input" placeholder="Número" value={cliente.numero} onChange={(e) => onChange('numero', e.target.value)} required style={{ marginBottom: 0 }} />
            <input className="form-input" placeholder="Complemento (opcional)" value={cliente.complemento} onChange={(e) => onChange('complemento', e.target.value)} style={{ marginBottom: 0 }} />
          </div>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 90px' }}>
            <input className="form-input" placeholder="Cidade" value={cliente.cidade} onChange={(e) => onChange('cidade', e.target.value)} required style={{ marginBottom: 0 }} />
            <input className="form-input" placeholder="UF" value={cliente.uf} onChange={(e) => onChange('uf', e.target.value.toUpperCase())} required maxLength={2} style={{ marginBottom: 0 }} />
          </div>
        </>
      )}

      <div className="cart-summary__tag" style={{ marginTop: 2 }}>
        Pagamento: <strong>Cartão, PIX ou Dinheiro</strong>
      </div>
    </div>
  );
}

function OrderSummary({ items, cliente, onClienteChange, onCheckout, loading, error, clienteLogado, onNavigate, cepLoading, enderecos, enderecoSelecionado, onSelecionarEndereco }) {
  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);
  const shipping = subtotal > 200 ? 0 : 19.90;
  const total = subtotal + shipping;

  return (
    <div className="cart-summary">
      <h2 className="cart-summary__title">Resumo do pedido</h2>
      <div className="cart-summary__rows">
        <div className="cart-summary__row"><span>Subtotal ({items.reduce((a, i) => a + i.qty, 0)} itens)</span><span>{fmt(subtotal)}</span></div>
        <div className="cart-summary__row"><span>Frete</span><span className={shipping === 0 ? 'cart-summary__free' : ''}>{shipping === 0 ? 'Grátis' : fmt(shipping)}</span></div>
      </div>
      <div className="cart-summary__divider" />
      <div className="cart-summary__total"><span>Total</span><span>{fmt(total)}</span></div>

      {!clienteLogado && (
        <div style={{ background: '#fff4e5', color: '#7a4b00', padding: '10px 12px', borderRadius: 8, marginTop: 12, fontSize: 13 }}>
          Faça login para finalizar a compra.
          <button onClick={() => onNavigate('login')} style={{ marginLeft: 8, border: 'none', background: 'transparent', color: '#1B3A2D', fontWeight: 700, textDecoration: 'underline' }}>Entrar</button>
        </div>
      )}

      <CheckoutForm cliente={cliente} onChange={onClienteChange} cepLoading={cepLoading} enderecos={enderecos} enderecoSelecionado={enderecoSelecionado} onSelecionarEndereco={onSelecionarEndereco} />

      <button className="cart-summary__checkout" onClick={() => onCheckout({ subtotal, shipping, total })} disabled={loading || !clienteLogado}>
        {loading ? 'Enviando pedido...' : 'Finalizar compra'}
      </button>

      {error && <p style={{ color: '#9f1239', marginTop: 8, fontSize: 13 }}>{error}</p>}

      <div className="cart-summary__payments">
        <span className="cart-summary__pay-label">Aceitamos</span>
        <div className="cart-summary__pay-icons">
          <div className="cart-summary__pay-chip">Cartão</div>
          <div className="cart-summary__pay-chip">PIX</div>
          <div className="cart-summary__pay-chip">Dinheiro</div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage({ cart, onNavigate, onQtyChange, onRemove, onOrderFinished, cliente }) {
  const [ordered, setOrdered] = useState(false);
  const [pedidoId, setPedidoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [ultimoCepBuscado, setUltimoCepBuscado] = useState('');
  const [enderecos, setEnderecos] = useState([]);
  const [enderecoSelecionado, setEnderecoSelecionado] = useState(null);
  const [dadosCliente, setDadosCliente] = useState({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    telefone: '',
    cep: '',
    rua: '',
    bairro: '',
    numero: '',
    complemento: '',
    cidade: '',
    uf: '',
  });

  useEffect(() => {
    if (!cliente?.id) {
      setEnderecoSelecionado('novo');
      return;
    }
    fetch(`${API}/clientes/${cliente.id}/enderecos`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const lista = Array.isArray(data) ? data : [];
        setEnderecos(lista);
        if (lista.length > 0) {
          const primeiro = lista[0];
          setEnderecoSelecionado(primeiro.id);
          setDadosCliente((prev) => ({
            ...prev,
            cep: primeiro.cep || '',
            rua: primeiro.rua || '',
            bairro: primeiro.bairro || '',
            numero: primeiro.numero || '',
            complemento: primeiro.complemento || '',
            cidade: primeiro.cidade || '',
            uf: primeiro.uf || '',
          }));
        } else {
          setEnderecoSelecionado('novo');
        }
      })
      .catch(() => setEnderecoSelecionado('novo'));
  }, [cliente?.id]);

  const selecionarEndereco = (end) => {
    if (end === 'novo') {
      setEnderecoSelecionado('novo');
      setDadosCliente((prev) => ({ ...prev, cep: '', rua: '', bairro: '', numero: '', complemento: '', cidade: '', uf: '' }));
    } else {
      setEnderecoSelecionado(end.id);
      setDadosCliente((prev) => ({
        ...prev,
        cep: end.cep || '',
        rua: end.rua || '',
        bairro: end.bairro || '',
        numero: end.numero || '',
        complemento: end.complemento || '',
        cidade: end.cidade || '',
        uf: end.uf || '',
      }));
    }
  };

  const total = useMemo(() => {
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    return subtotal + (subtotal > 200 ? 0 : 19.90);
  }, [cart]);

  const buscarCep = async (cepValue = dadosCliente.cep) => {
    const cepDigits = (cepValue || '').replace(/\D/g, '');
    if (cepDigits.length !== 8) {
      setError('Digite um CEP válido com 8 números.');
      return;
    }
    try {
      setCepLoading(true);
      setError('');
      const res = await fetch(`${API}/cep/${cepDigits}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'CEP não encontrado.');
      setDadosCliente((prev) => ({
        ...prev,
        cep: data.cep || prev.cep,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf: (data.uf || prev.uf || '').toUpperCase(),
      }));
      setUltimoCepBuscado(cepDigits);
    } catch (err) {
      setError(err.message || 'Não foi possível consultar o CEP.');
    } finally {
      setCepLoading(false);
    }
  };

  const updateCliente = async (field, value) => {
    if (field === 'buscarCep') {
      await buscarCep();
      return;
    }
    if (field === 'cep') {
      const cepMask = value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
      setDadosCliente((prev) => ({ ...prev, cep: cepMask }));
      const digits = cepMask.replace(/\D/g, '');
      if (digits.length === 8 && digits !== ultimoCepBuscado) {
        await buscarCep(cepMask);
      }
      return;
    }
    setDadosCliente((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    setError('');

    if (!cliente?.id) {
      setError('Você precisa estar logado para finalizar a compra.');
      return;
    }

    if (
      !dadosCliente.nome ||
      !dadosCliente.email ||
      !dadosCliente.telefone ||
      !dadosCliente.cep ||
      !dadosCliente.rua ||
      !dadosCliente.bairro ||
      !dadosCliente.numero ||
      !dadosCliente.cidade ||
      !dadosCliente.uf
    ) {
      setError('Preencha todos os dados para finalizar o pedido.');
      return;
    }

    setLoading(true);
    try {
      const enderecoEntrega = [
        `${dadosCliente.rua}, ${dadosCliente.numero}`,
        dadosCliente.complemento ? `Complemento: ${dadosCliente.complemento}` : '',
        dadosCliente.bairro,
        `${dadosCliente.cidade} - ${dadosCliente.uf}`,
        `CEP: ${dadosCliente.cep}`,
      ].filter(Boolean).join(' | ');

      const payload = {
        clienteId: cliente.id,
        clienteNome: dadosCliente.nome,
        clienteEmail: dadosCliente.email,
        clienteTelefone: dadosCliente.telefone,
        enderecoEntrega,
        total,
      };

      const res = await fetch(`${API}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Não foi possível finalizar o pedido.');

      setPedidoId(data.id);
      onOrderFinished?.();
      onNavigate('pagamento', { pedidoId: data.id, total })
    }
    catch (err) {
      const msg = err?.message === 'Failed to fetch'
        ? 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.'
        : (err.message || 'Erro inesperado ao criar pedido.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div>
        <div className="cart-success">
          <div className="cart-success__icon">✅</div>
          <h2 className="cart-success__title">Pedido realizado!</h2>
          <p className="cart-success__sub">
            Pedido #{pedidoId || '—'} criado com sucesso! Conclua o pagamento na próxima etapa.<br />
            Após confirmação, a administração marcará como <strong>Em rota</strong> e depois <strong>Entregue</strong>.
          </p>
          <button className="cart-success__btn" onClick={() => onNavigate('home')}>Continuar comprando</button>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div>
      <div className="cart-page">
        <div className="cart-page__header">
          <h1 className="cart-page__title">Meu carrinho</h1>
          <button className="cart-page__back" onClick={() => onNavigate('home')}>← Continuar comprando</button>
        </div>

        {cart.length === 0 ? (
          <CartEmpty onNavigate={onNavigate} />
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              <div className="cart-items__head"><span>Produto</span><span>Quantidade</span><span>Total</span></div>
              {cart.map((item) => (
                <CartItem key={item.id} item={item} onQtyChange={onQtyChange} onRemove={onRemove} />
              ))}
            </div>
            <OrderSummary
              items={cart}
              cliente={dadosCliente}
              onClienteChange={updateCliente}
              onCheckout={handleCheckout}
              loading={loading}
              error={error}
              clienteLogado={Boolean(cliente?.id)}
              onNavigate={onNavigate}
              cepLoading={cepLoading}
              enderecos={enderecos}
              enderecoSelecionado={enderecoSelecionado}
              onSelecionarEndereco={selecionarEndereco}
            />
          </div>
        )}
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}