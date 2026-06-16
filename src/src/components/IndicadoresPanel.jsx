import { useEffect, useState } from 'react';
import { API } from '../hooks/useProdutos.js';
import { getIndicadoresFallback } from '../utils/adminStore.js';

function Donut({ pct = 0, color = '#1B8A4F', label }) {
  const safe = Math.max(0, Math.min(100, Number(pct) || 0));
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = (safe / 100) * c;
  return (
    <div className="kpi-donut">
      <svg viewBox="0 0 110 110" width="120" height="120">
        <circle cx="55" cy="55" r={r} stroke="#eef3ef" strokeWidth="12" fill="none" />
        <circle
          cx="55" cy="55" r={r}
          stroke={color} strokeWidth="12" fill="none"
          strokeDasharray={`${dash} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
        />
        <text x="55" y="58" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1B3A2D">
          {safe.toFixed(1)}%
        </text>
      </svg>
      {label && <p className="kpi-donut__label">{label}</p>}
    </div>
  );
}

function KpiCard({ titulo, descricao, badge, children }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__head">
        <h4>{titulo}</h4>
        {badge && <span className={`kpi-badge kpi-badge--${badge.tipo}`}>{badge.texto}</span>}
      </div>
      {descricao && <p className="kpi-card__desc">{descricao}</p>}
      <div className="kpi-card__body">{children}</div>
    </div>
  );
}

function BarDistribuicao({ dados, color = '#1B8A4F' }) {
  const max = Math.max(1, ...Object.values(dados));
  return (
    <div className="kpi-dist">
      {Object.entries(dados).map(([k, v]) => (
        <div key={k} className="kpi-dist__row">
          <span className="kpi-dist__label">{k}</span>
          <div className="kpi-dist__track">
            <div
              className="kpi-dist__fill"
              style={{ width: `${(v / max) * 100}%`, background: color }}
            />
          </div>
          <span className="kpi-dist__value">{v}</span>
        </div>
      ))}
    </div>
  );
}

function Sparkline({ pontos = [] }) {
  if (!pontos.length) return null;
  const W = 280, H = 90, P = 8;
  const totais   = pontos.map((p) => Number(p.total) || 0);
  const entregs  = pontos.map((p) => Number(p.entregues) || 0);
  const max      = Math.max(1, ...totais, ...entregs);
  const step     = (W - 2 * P) / Math.max(1, pontos.length - 1);
  const toPath = (vals) =>
    vals.map((v, i) => {
      const x = P + i * step;
      const y = H - P - ((v / max) * (H - 2 * P));
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');

  return (
    <div className="kpi-spark">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <path d={toPath(totais)}  stroke="#1B3A2D" strokeWidth="2" fill="none" />
        <path d={toPath(entregs)} stroke="#1B8A4F" strokeWidth="2" fill="none" strokeDasharray="4 3" />
        {pontos.map((p, i) => {
          const x = P + i * step;
          const y = H - P - ((totais[i] / max) * (H - 2 * P));
          return <circle key={i} cx={x} cy={y} r="2.5" fill="#1B3A2D" />;
        })}
      </svg>
      <div className="kpi-spark__legend">
        <span><i style={{ background: '#1B3A2D' }} /> Pedidos</span>
        <span><i style={{ background: '#1B8A4F' }} /> Entregues</span>
      </div>
      <div className="kpi-spark__xaxis">
        {pontos.map((p) => <span key={p.dia}>{p.dia}</span>)}
      </div>
    </div>
  );
}

export default function IndicadoresPanel() {
  const [data, setData] = useState(null);
  const [aviso, setAviso] = useState(null);

  useEffect(() => {
    fetch(`${API}/admin/dashboard/indicadores`)
      .then((r) => {
        if (!r.ok) throw new Error('falha');
        return r.json();
      })
      .then(setData)
      .catch(() => {
        setAviso('Backend indisponível — exibindo dados de exemplo.');
        setData(getIndicadoresFallback());
      });
  }, []);

  if (!data) return <p style={{ color: 'var(--gray-500)' }}>Carregando indicadores...</p>;

  const dist   = data.distribuicaoNotas    || { '1':0, '2':0, '3':0, '4':0, '5':0 };
  const ultimos = data.pedidosUltimos7Dias || [];

  return (
    <div className="kpi-page">
      <div className="kpi-page__head">
        <h2>📈 Indicadores de Desempenho</h2>
        {aviso && <span className="kpi-warn">{aviso}</span>}
      </div>

      <div className="kpi-grid">
        <KpiCard
          titulo="Taxa de pedidos entregues"
          descricao="(entregues / total) × 100"
        >
          <Donut pct={data.taxaEntrega} color="#1B8A4F" label={`${data.totalPedidos} pedidos`} />
        </KpiCard>

        <KpiCard
          titulo="Taxa de aprovação de pagamento"
          descricao="(aprovados / total tentativas) × 100"
        >
          <Donut pct={data.taxaAprovacaoPagamento} color="#0c5460" label={`${data.totalPagamentos} pagamentos`} />
        </KpiCard>

        <KpiCard
          titulo="Taxa de reembolso"
          descricao="(reembolsos / concluídos) × 100"
          badge={{ tipo: 'proxy', texto: 'proxy: usa cancelados' }}
        >
          <Donut pct={data.taxaReembolso} color="#d9534f" label="aproximação" />
        </KpiCard>

        <KpiCard
          titulo="Avaliação média dos pedidos"
          descricao="distribuição de notas (1 a 5)"
        >
          <div className="kpi-row">
            <div className="kpi-big">
              <span className="kpi-big__valor">{Number(data.avaliacaoMedia).toFixed(2)}</span>
              <span className="kpi-big__sufixo">/ 5</span>
            </div>
            <BarDistribuicao dados={dist} color="#856404" />
          </div>
        </KpiCard>

        <KpiCard
          titulo="Cancelamento por indisp. de estoque"
          descricao="(cancelados por estoque / total) × 100"
          badge={{ tipo: 'proxy', texto: 'proxy: motivo não rastreado' }}
        >
          <Donut pct={data.taxaCancelamentoEstoque} color="#f0ad4e" label="usa cancelados" />
        </KpiCard>

        <KpiCard
          titulo="Taxa de conversão de carrinho"
          descricao="(carrinhos finalizados / carrinhos iniciados há +1h) × 100"
        >
          <Donut pct={data.taxaConversaoCarrinho} color="#5bc0de" label="últimas horas" />
        </KpiCard>
      </div>

      <div className="kpi-card kpi-card--wide">
        <div className="kpi-card__head">
          <h4>Evolução de pedidos — últimos 7 dias</h4>
        </div>
        <Sparkline pontos={ultimos} />
      </div>
    </div>
  );
}
