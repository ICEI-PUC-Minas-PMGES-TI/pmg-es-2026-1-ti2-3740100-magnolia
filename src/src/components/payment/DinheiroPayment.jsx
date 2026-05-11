const fmt = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
export default function DinheiroPayment({ onConfirm, loading, valor }) {
  return (
    <div className="pag-section">
      <h2 className="pag-section__title">Pagamento em dinheiro</h2>
      <div className="pag-dinheiro">
        <div className="pag-dinheiro__icon">$</div>
        <h3 style={{ fontSize: 16, color: '#1B3A2D', marginBottom: 8, fontWeight: 700 }}>
          Pagar na hora da entrega
        </h3>
        <p style={{ fontSize: 14, color: '#555', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}>
          Tenha {fmt(valor)} em maos para o entregador. Caso precise de troco,
          informe o valor no momento da entrega.
        </p>
        <button
          className="pag-confirm-btn"
          onClick={() => onConfirm({ metodo: 'DINHEIRO' })}
          disabled={loading}
          style={{ maxWidth: 320, margin: '20px auto 0' }}
        >
          {loading ? 'Confirmando...' : 'Confirmar pedido'}
        </button>
      </div>
    </div>
  );
}