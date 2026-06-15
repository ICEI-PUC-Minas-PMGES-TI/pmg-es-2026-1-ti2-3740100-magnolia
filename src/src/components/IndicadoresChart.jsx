import { useEffect, useState } from 'react';
import { API } from '../hooks/useProdutos.js';
import { getIndicadoresFallback } from '../utils/adminStore.js';
const STATUS_PEDIDO = {
PENDENTE: { label: 'Aguardando pagamento', color: '#f0ad4e' },
EM_ROTA: { label: 'Em rota', color: '#5bc0de' },
ENTREGUE: { label: 'Entregue', color: '#1B8A4F' },
CANCELADO: { label: 'Cancelado', color: '#d9534f' },
};
const STATUS_PAGAMENTO = {
APROVADO: { label: 'Aprovado', color: '#1B8A4F' },
PENDENTE: { label: 'Pendente (não pagou)', color: '#f0ad4e' },
RECUSADO: { label: 'Recusado', color: '#d9534f' },
};
function Bar({ label, value, total, color }) {
const pct = total > 0 ? (value / total) * 100 : 0;
return (
<div className="ind-bar-row">
<div className="ind-bar-label">{label}</div>
<div className="ind-bar-track">
<div className="ind-bar-fill" style={{ width: `${pct}%`, background: color }} />
</div>
<div className="ind-bar-value">{value}</div>
</div>
);
}
function TaxaCard({ titulo, valor, sufixo = '%', cor = '#1B3A2D' }) {
return (
<div className="ind-taxa">
<p className="ind-taxa__label">{titulo}</p>
<p className="ind-taxa__valor" style={{ color: cor }}>
{valor}{sufixo}
</p>
</div>
);
}
export default function IndicadoresChart() {
const [data, setData] = useState(null);
const [erro, setErro] = useState(null);
useEffect(() => {
fetch(`${API}/admin/dashboard/indicadores`)
.then((r) => {
if (!r.ok) throw new Error('Falha ao buscar indicadores');
return r.json();
})
.then(setData)
.catch(() => {
setErro('Usando dados locais (fallback).');
setData(getIndicadoresFallback());
});
}, []);
if (!data) return <p style={{ color: 'var(--gray-500)' }}>Carregando indicadores...</p>;
const pedidos = data.pedidosPorStatus || {};
const pagamentos = data.pagamentosPorStatus || {};
const totalPed = data.totalPedidos || 0;
const totalPag = data.totalPagamentos || 0;
return (
<div className="ind-card">
<div className="ind-card__head">
<h3>📊 Indicadores de Desempenho</h3>
{erro && <span className="ind-warn">{erro}</span>}
</div>
<div className="ind-taxa-grid">
<TaxaCard titulo="Taxa de entrega" valor={data.taxaEntrega} cor="#1B8A4F" />
<TaxaCard titulo="Aprovação de pagamento" valor={data.taxaAprovacaoPagamento} cor="#0c5460" />
<TaxaCard titulo="Taxa de cancelamento" valor={data.taxaCancelamento} cor="#d9534f" />
<TaxaCard titulo="Avaliação média" valor={data.avaliacaoMedia} sufixo=" / 5" cor="#856404" />
</div>
<div className="ind-section">
<p className="ind-section__title">Pedidos por status (total: {totalPed})</p>
{Object.entries(STATUS_PEDIDO).map(([key, cfg]) => (
<Bar
key={key}
label={cfg.label}
value={pedidos[key] || 0}
total={totalPed}
color={cfg.color}
/>
))}
</div>
<div className="ind-section">
<p className="ind-section__title">Pagamentos por status (total: {totalPag})</p>
{Object.entries(STATUS_PAGAMENTO).map(([key, cfg]) => (
<Bar
key={key}
label={cfg.label}
value={pagamentos[key] || 0}
total={totalPag}
color={cfg.color}
/>
))}
</div>
</div>
);
}