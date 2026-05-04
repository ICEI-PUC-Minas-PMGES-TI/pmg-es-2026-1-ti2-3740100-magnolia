import { useEffect, useMemo, useState } from 'react';
import Footer from '../components/Footer.jsx';
import { API } from '../hooks/useProdutos.js';

const STATUS_LABEL = {
  PENDENTE: 'Pendente',
  EM_ROTA: 'Em rota',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

const currency = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const ENDERECO_VAZIO = { apelido: '', cep: '', rua: '', bairro: '', numero: '', complemento: '', cidade: '', uf: '' };

export default function ClientePage({ cliente, onNavigate, onLogout }) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Avaliação
  const [showFormAvaliacao, setShowFormAvaliacao] = useState(false);
  const [formAvaliacao, setFormAvaliacao] = useState({ nota: 5, comentario: '', produtoNome: '' });
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);
  const [erroAvaliacao, setErroAvaliacao] = useState('');
  const [avaliacaoEnviada, setAvaliacaoEnviada] = useState(false);

  // Endereços
  const [enderecos, setEnderecos] = useState([]);
  const [showFormEndereco, setShowFormEndereco] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formEndereco, setFormEndereco] = useState(ENDERECO_VAZIO);
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);
  const [erroEndereco, setErroEndereco] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [ultimoCepBuscado, setUltimoCepBuscado] = useState('');


//Carregar Pedidos
const carregarPedidos = async () => {
    if (!cliente?.id) return;
    try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API}/pedidos/cliente/${cliente.id}`);
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
  const temCompra = pedidos.some((p) => p.status !== 'CANCELADO');



  // CEP auto-preenchimento (mesmo padrão do CartPage)
  const buscarCep = async (cepValue = formEndereco.cep) => {
    const cepDigits = (cepValue || '').replace(/\D/g, '');
    if (cepDigits.length !== 8) return;
    try {
      setCepLoading(true);
      setErroEndereco('');
      const res = await fetch(`${API}/cep/${cepDigits}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'CEP não encontrado.');
      setFormEndereco((prev) => ({
        ...prev,
        cep: data.cep || prev.cep,
        rua: data.logradouro || prev.rua,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        uf: (data.uf || prev.uf || '').toUpperCase(),
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
      if (digits.length === 8 && digits !== ultimoCepBuscado) {
        buscarCep(mask);
      }
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
      cep:         end.cep        || '',
      rua:         end.rua        || '',
      bairro:      end.bairro     || '',
      numero:      end.numero     || '',
      complemento: end.complemento || '',
      cidade:      end.cidade     || '',
      uf:          end.uf         || '',
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
      const url = editandoId
        ? `${API}/clientes/${cliente.id}/enderecos/${editandoId}`
        : `${API}/clientes/${cliente.id}/enderecos`;
      const method = editandoId ? 'PUT' : 'POST';
      const res = await fetch(url, {
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

  //Excluir conta 
   const excluirConta = async () => {
    const confirmar = window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.');
    if (!confirmar) return;
    try {
      setError('');
      const res = await fetch(`${API}/auth/clientes/${cliente.id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Não foi possível excluir sua conta.');
      window.localStorage.removeItem('jm_cliente');
      onLogout?.();
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Não foi possível excluir conta.');
    }
  };

//Solicitar Devolução
const solicitarDevolucao = async (pedidoId) => {
    try {
        setError('');
        setMsg('');
        const res = await fetch(`${API}/pedidos/${pedidoId}/devolucao`, {
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


//Avaliação
const enviarAvaliacao = async (e) => {
    e.preventDefault();
    setSalvandoAvaliacao(true);
    setErroAvaliacao('');
    try {
        const res = await fetch(`${API}/avaliacoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clienteId: String(cliente.id),
                nomeCliente: cliente.nome,
                comentario: formAvaliacao.comentario,
                produtoNome: formAvaliacao.produtoNome,
                nota: String(formAvaliacao.nota),
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


{/* Histórico de compras */ }
<section className="institutional-page__section">
    <h2>Histórico de compras</h2>
    {loading && <p>Carregando pedidos...</p>}
    {!loading && pedidos.length === 0 && <p>Você ainda não realizou compras.</p>}
    <div className="cliente-page__orders">
        {pedidos.map((pedido) => {
            const podeDevolver = pedido.status === 'ENTREGUE' || pedido.status === 'EM_ROTA';
            return (
                <article key={pedido.id} className="cliente-order">
                    <div>
                        <h3>Pedido #{pedido.id}</h3>
                        <p>Status: <strong>{STATUS_LABEL[pedido.status] || pedido.status}</strong></p>
                        <p>Total: {currency(pedido.total)}</p>
                        <p>Entrega: {pedido.enderecoEntrega}</p>
                    </div>
                    <div className="cliente-order__actions">
                        <button className="btn-register" style={{ marginTop: 0 }} onClick={() => onNavigate('contact')}>Suporte</button>
                        <button className="btn-login" onClick={() => solicitarDevolucao(pedido.id)} disabled={!podeDevolver}>
                            Solicitar devolução
                        </button>
                    </div>
                </article>
            );
        })}
    </div>
</section>
}
