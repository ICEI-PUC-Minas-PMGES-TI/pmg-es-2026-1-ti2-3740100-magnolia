

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

