import { useEffect, useMemo, useState } from 'react';
import Footer from '../components/Footer.jsx';
import { API } from '../hooks/useProdutos.js';

const STATUS_LABEL = {
  PENDENTE:  'Pendente',
  EM_ROTA:   'Em rota',
  ENTREGUE:  'Entregue',
  CANCELADO: 'Cancelado',
};

const STATUS_COLOR = {
  PENDENTE:  { color: '#856404', bg: '#fff3cd' },
  EM_ROTA:   { color: '#155724', bg: '#d4edda' },
  ENTREGUE:  { color: '#0c5460', bg: '#d1ecf1' },
  CANCELADO: { color: '#721c24', bg: '#f8d7da' },
};

const currency = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ENDERECO_VAZIO = { apelido: '', cep: '', rua: '', bairro: '', numero: '', complemento: '', cidade: '', uf: '' };

export default function ClientePage({ cliente, onNavigate, onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [msg, setMsg]       = useState('');

  // Avaliação
  const [showFormAvaliacao, setShowFormAvaliacao] = useState(false);
  const [formAvaliacao, setFormAvaliacao]         = useState({ nota: 5, comentario: '', produtoNome: '' });
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [erroAvaliacao, setErroAvaliacao]         = useState('');
  const [avaliacaoEnviada, setAvaliacaoEnviada]   = useState(false);

  // Endereços
  const [enderecos, setEnderecos]               = useState([]);
  const [showFormEndereco, setShowFormEndereco] = useState(false);
  const [editandoId, setEditandoId]             = useState(null);
  const [formEndereco, setFormEndereco]         = useState(ENDERECO_VAZIO);
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);
  const [erroEndereco, setErroEndereco]         = useState('');
  const [cepLoading, setCepLoading]             = useState(false);
  const [ultimoCepBuscado, setUltimoCepBuscado] = useState('');

  const carregarPedidos = async () => {
    if (!cliente?.id) return;
    try {
      setLoading(true);
      setError('');
      const res  = await fetch(`${API}/pedidos/cliente/${cliente.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Não foi possível carregar seus pedidos.');
      setPedidos(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar pedidos.');
    } finally {
      setLoading(false);
    }
  };

  const carregarEnderecos = async () => {
    if (!cliente?.id) return;
    try {
      const res = await fetch(`${API}/clientes/${cliente.id}/enderecos`);
      if (res.ok) setEnderecos(await res.json());
    } catch {}
  };

  useEffect(() => {
    carregarPedidos();
    carregarEnderecos();
  }, [cliente?.id]);

  const totalGasto = useMemo(() => pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0), [pedidos]);
  const temCompra  = pedidos.some((p) => p.status !== 'CANCELADO');

  // CEP
  const buscarCep = async (cepValue = formEndereco.cep) => {
    const cepDigits = (cepValue || '').replace(/\D/g, '');
    if (cepDigits.length !== 8) return;
    try {
      setCepLoading(true);
      setErroEndereco('');
      const res  = await fetch(`${API}/cep/${cepDigits}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'CEP não encontrado.');
      setFormEndereco((prev) => ({
        ...prev,
        cep:    data.cep        || prev.cep,
        rua:    data.logradouro || prev.rua,
        bairro: data.bairro     || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf:     (data.uf || prev.uf || '').toUpperCase(),
      }));
      setUltimoCepBuscado(cepDigits);
    } catch (err) {
      setErroEndereco(err.message || 'CEP não encontrado.');
    } finally {
      setCepLoading(false);
    }
  };

  const updateCampo = (field, value) => {
    if (field === 'cep') {
      const mask = value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
      setFormEndereco((prev) => ({ ...prev, cep: mask }));
      const digits = mask.replace(/\D/g, '');
      if (digits.length === 8 && digits !== ultimoCepBuscado) buscarCep(mask);
      return;
    }
    setFormEndereco((prev) => ({ ...prev, [field]: value }));
  };

  const abrirFormNovo = () => {
    setEditandoId(null);
    setFormEndereco(ENDERECO_VAZIO);
    setUltimoCepBuscado('');
    setErroEndereco('');
    setShowFormEndereco(true);
  };

  const iniciarEdicao = (end) => {
    setEditandoId(end.id);
    setFormEndereco({
      apelido:     end.apelido     || '',
      cep:         end.cep         || '',
      rua:         end.rua         || '',
      bairro:      end.bairro      || '',
      numero:      end.numero      || '',
      complemento: end.complemento || '',
      cidade:      end.cidade      || '',
      uf:          end.uf          || '',
    });
    setUltimoCepBuscado((end.cep || '').replace(/\D/g, ''));
    setErroEndereco('');
    setShowFormEndereco(true);
  };

  const salvarEndereco = async (e) => {
    e.preventDefault();
    setSalvandoEndereco(true);
    setErroEndereco('');
    try {
      const url    = editandoId
        ? `${API}/clientes/${cliente.id}/enderecos/${editandoId}`
        : `${API}/clientes/${cliente.id}/enderecos`;
      const method = editandoId ? 'PUT' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEndereco),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Não foi possível salvar o endereço.');
      setShowFormEndereco(false);
      setEditandoId(null);
      setFormEndereco(ENDERECO_VAZIO);
      carregarEnderecos();
    } catch (err) {
      setErroEndereco(err.message || 'Erro ao salvar endereço.');
    } finally {
      setSalvandoEndereco(false);
    }
  };

  const removerEndereco = async (id) => {
    if (!window.confirm('Remover este endereço?')) return;
    try {
      const res = await fetch(`${API}/clientes/${cliente.id}/enderecos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao remover endereço.');
      carregarEnderecos();
    } catch (err) {
      setErroEndereco(err.message || 'Não foi possível remover o endereço.');
    }
  };

  const excluirConta = async () => {
    if (!window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;
    try {
      setError('');
      const res  = await fetch(`${API}/auth/clientes/${cliente.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Não foi possível excluir sua conta.');
      window.localStorage.removeItem('jm_cliente');
      onLogout?.();
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Não foi possível excluir conta.');
    }
  };

  const solicitarDevolucao = async (pedidoId) => {
    try {
      setError('');
      setMsg('');
      const res  = await fetch(`${API}/pedidos/${pedidoId}/devolucao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId: cliente.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Não foi possível solicitar devolução.');
      setMsg(`Pedido #${pedidoId}: ${data.message || 'solicitação registrada com sucesso.'}`);
      carregarPedidos();
    } catch (err) {
      setError(err.message || 'Falha ao solicitar devolução.');
    }
  };

  const enviarAvaliacao = async (e) => {
    e.preventDefault();
    setSalvandoAvaliacao(true);
    setErroAvaliacao('');
    try {
      const res = await fetch(`${API}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId:   String(cliente.id),
          clienteNome: cliente.nome,
          comentario:  formAvaliacao.comentario,
          produtoNome: formAvaliacao.produtoNome,
          nota:        String(formAvaliacao.nota),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Não foi possível enviar avaliação.');
      setAvaliacaoEnviada(true);
      setShowFormAvaliacao(false);
    } catch (err) {
      setErroAvaliacao(err.message || 'Erro ao enviar avaliação.');
    } finally {
      setSalvandoAvaliacao(false);
    }
  };

  // Sem login
  if (!cliente) {
    return (
      <div>
        <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ fontSize: 18, color: '#555', marginBottom: 24 }}>Faça login para acessar sua conta.</p>
          <button className="btn-login" style={{ width: 'auto', padding: '12px 32px' }} onClick={() => onNavigate('login')}>
            Entrar
          </button>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div>
      <div className="container" style={{ paddingTop: 40, paddingBottom: 56 }}>

        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1B3A2D', marginBottom: 4 }}>
              Olá, {cliente.nome} 👋
            </h1>
            <p style={{ color: '#666', fontSize: 14 }}>{cliente.email}</p>
          </div>
          <button
            onClick={onLogout}
            style={{ background: 'none', border: '1px solid #ccc', borderRadius: 8, padding: '8px 18px', cursor: 'pointer', fontSize: 13, color: '#555' }}
          >
            Sair da conta
          </button>
        </div>

        {/* Métricas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { label: 'Pedidos realizados', value: pedidos.length },
            { label: 'Total gasto',        value: currency(totalGasto) },
            { label: 'Pedidos entregues',  value: pedidos.filter((p) => p.status === 'ENTREGUE').length },
            { label: 'Endereços salvos',   value: enderecos.length },
          ].map((m) => (
            <div key={m.label} style={{ background: '#f9f6f0', borderRadius: 12, padding: '16px 20px', borderLeft: '4px solid #1B3A2D' }}>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{m.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#1B3A2D' }}>{m.value}</p>
            </div>
          ))}
        </div>

        {error && <p style={{ color: '#9f1239', marginBottom: 16, fontSize: 14 }}>{error}</p>}
        {msg   && <p style={{ color: '#155724', marginBottom: 16, fontSize: 14 }}>{msg}</p>}

        {/* Histórico de pedidos */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1B3A2D', marginBottom: 16 }}>Histórico de compras</h2>
          {loading && <p style={{ color: '#888', fontSize: 14 }}>Carregando pedidos...</p>}
          {!loading && pedidos.length === 0 && (
            <p style={{ color: '#888', fontSize: 14 }}>Você ainda não realizou compras.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pedidos.map((pedido) => {
              const podeDevolver = pedido.status === 'ENTREGUE' || pedido.status === 'EM_ROTA';
              const sc = STATUS_COLOR[pedido.status] || { color: '#555', bg: '#eee' };
              return (
                <div key={pedido.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <strong style={{ fontSize: 15 }}>Pedido #{String(pedido.id).padStart(5, '0')}</strong>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 10px' }}>
                          {STATUS_LABEL[pedido.status] || pedido.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>
                        <strong>{currency(pedido.total)}</strong>
                        {pedido.criadoEm && (
                          <span style={{ marginLeft: 10, color: '#999' }}>
                            {new Date(pedido.criadoEm).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </p>
                      {pedido.enderecoEntrega && (
                        <p style={{ fontSize: 12, color: '#888' }}>📍 {pedido.enderecoEntrega}</p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        className="btn-register"
                        style={{ marginTop: 0, padding: '8px 16px', fontSize: 13 }}
                        onClick={() => onNavigate('contact')}
                      >
                        Suporte
                      </button>
                      <button
                        className="btn-login"
                        style={{ padding: '8px 16px', fontSize: 13 }}
                        onClick={() => solicitarDevolucao(pedido.id)}
                        disabled={!podeDevolver}
                      >
                        Solicitar devolução
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Endereços */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1B3A2D' }}>Meus endereços</h2>
            {!showFormEndereco && (
              <button className="btn-login" style={{ padding: '8px 18px', fontSize: 13 }} onClick={abrirFormNovo}>
                + Novo endereço
              </button>
            )}
          </div>

          {showFormEndereco && (
            <form onSubmit={salvarEndereco} style={{ background: '#f9f6f0', borderRadius: 12, padding: '20px 22px', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: '#1B3A2D' }}>
                {editandoId ? 'Editar endereço' : 'Novo endereço'}
              </h3>
              <div style={{ display: 'grid', gap: 10 }}>
                <input className="form-input" placeholder="Apelido (ex: Casa, Trabalho)" value={formEndereco.apelido} onChange={(e) => updateCampo('apelido', e.target.value)} style={{ marginBottom: 0 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" placeholder="CEP" value={formEndereco.cep} onChange={(e) => updateCampo('cep', e.target.value)} maxLength={9} style={{ marginBottom: 0, flex: 1 }} />
                  <button type="button" className="btn-register" style={{ marginTop: 0, whiteSpace: 'nowrap' }} onClick={() => buscarCep()} disabled={cepLoading}>
                    {cepLoading ? 'Buscando...' : 'Buscar CEP'}
                  </button>
                </div>
                <input className="form-input" placeholder="Rua / Logradouro *" value={formEndereco.rua} onChange={(e) => updateCampo('rua', e.target.value)} required style={{ marginBottom: 0 }} />
                <input className="form-input" placeholder="Bairro *" value={formEndereco.bairro} onChange={(e) => updateCampo('bairro', e.target.value)} required style={{ marginBottom: 0 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input className="form-input" placeholder="Número *" value={formEndereco.numero} onChange={(e) => updateCampo('numero', e.target.value)} required style={{ marginBottom: 0 }} />
                  <input className="form-input" placeholder="Complemento" value={formEndereco.complemento} onChange={(e) => updateCampo('complemento', e.target.value)} style={{ marginBottom: 0 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
                  <input className="form-input" placeholder="Cidade *" value={formEndereco.cidade} onChange={(e) => updateCampo('cidade', e.target.value)} required style={{ marginBottom: 0 }} />
                  <input className="form-input" placeholder="UF *" value={formEndereco.uf} onChange={(e) => updateCampo('uf', e.target.value.toUpperCase())} maxLength={2} required style={{ marginBottom: 0 }} />
                </div>
              </div>
              {erroEndereco && <p style={{ color: '#9f1239', fontSize: 13, marginTop: 8 }}>{erroEndereco}</p>}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button type="button" className="btn-register" style={{ marginTop: 0 }} onClick={() => { setShowFormEndereco(false); setEditandoId(null); }}>Cancelar</button>
                <button type="submit" className="btn-login" disabled={salvandoEndereco}>
                  {salvandoEndereco ? 'Salvando...' : editandoId ? 'Salvar alterações' : 'Adicionar endereço'}
                </button>
              </div>
            </form>
          )}

          {enderecos.length === 0 && !showFormEndereco && (
            <p style={{ color: '#888', fontSize: 14 }}>Nenhum endereço cadastrado ainda.</p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enderecos.map((end) => (
              <div key={end.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 14 }}>
                  {end.apelido && (
                    <span style={{ background: '#1B3A2D', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 8px', marginRight: 8 }}>
                      {end.apelido}
                    </span>
                  )}
                  <span>{end.rua}, {end.numero}{end.complemento ? ` – ${end.complemento}` : ''}</span>
                  <br />
                  <span style={{ color: '#777', fontSize: 13 }}>{end.bairro} · {end.cidade}/{end.uf} · CEP {end.cep}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => iniciarEdicao(end)} style={{ background: 'none', border: '1px solid #ccc', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>Editar</button>
                  <button onClick={() => removerEndereco(end.id)} style={{ background: 'none', border: '1px solid #f8d7da', color: '#721c24', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Avaliação */}
        {temCompra && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1B3A2D', marginBottom: 12 }}>Avaliar compra</h2>
            {avaliacaoEnviada ? (
              <p style={{ color: '#155724', fontSize: 14 }}>Obrigado! Sua avaliação foi enviada e será analisada.</p>
            ) : showFormAvaliacao ? (
              <form onSubmit={enviarAvaliacao} style={{ background: '#f9f6f0', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nota</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormAvaliacao((f) => ({ ...f, nota: n }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, color: n <= formAvaliacao.nota ? '#f5a623' : '#ddd' }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  className="form-input"
                  placeholder="Nome do produto (opcional)"
                  value={formAvaliacao.produtoNome}
                  onChange={(e) => setFormAvaliacao((f) => ({ ...f, produtoNome: e.target.value }))}
                />
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Seu comentário *"
                  value={formAvaliacao.comentario}
                  onChange={(e) => setFormAvaliacao((f) => ({ ...f, comentario: e.target.value }))}
                  required
                  style={{ resize: 'vertical' }}
                />
                {erroAvaliacao && <p style={{ color: '#9f1239', fontSize: 13, marginTop: 6 }}>{erroAvaliacao}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button type="button" className="btn-register" style={{ marginTop: 0 }} onClick={() => setShowFormAvaliacao(false)}>Cancelar</button>
                  <button type="submit" className="btn-login" disabled={salvandoAvaliacao}>
                    {salvandoAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
                  </button>
                </div>
              </form>
            ) : (
              <button className="btn-login" style={{ padding: '10px 24px', fontSize: 13 }} onClick={() => setShowFormAvaliacao(true)}>
                Escrever avaliação
              </button>
            )}
          </section>
        )}

        {/* Ações da conta */}
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1B3A2D', marginBottom: 16 }}>Minha conta</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-register" style={{ marginTop: 0 }} onClick={() => onNavigate('contact')}>
              Falar com suporte
            </button>
            <button
              onClick={excluirConta}
              style={{ background: 'none', border: '1px solid #f8d7da', color: '#721c24', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              Excluir minha conta
            </button>
          </div>
        </section>

      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
