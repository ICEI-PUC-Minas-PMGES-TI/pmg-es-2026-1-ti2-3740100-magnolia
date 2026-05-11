import { useState } from 'react';
function maskNumero(v) {
  return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
}
function maskValidade(v) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length < 3) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}
export default function CartaoForm({ onSubmit, loading }) {
  const [tipo, setTipo]         = useState('CARTAO_CREDITO');
  const [numero, setNumero]     = useState('');
  const [titular, setTitular]   = useState('');
  const [validade, setValidade] = useState('');
  const [cvv, setCvv]           = useState('');
  const [erroLocal, setErroLocal] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    setErroLocal('');
    const num = numero.replace(/\s/g, '');
    if (num.length < 13) { setErroLocal('Numero do cartao invalido.'); return; }
    if (!titular.trim()) { setErroLocal('Informe o nome do titular.'); return; }
    if (validade.length !== 5) { setErroLocal('Validade invalida (MM/AA).'); return; }
    if (cvv.length < 3) { setErroLocal('CVV invalido.'); return; }
    onSubmit({
      metodo: tipo,
      numeroCartao: num,
      nomeTitular: titular,
      validade,
      cvv,
    });
  };
  return (
    <div className="pag-section">
      <h2 className="pag-section__title">Dados do cartao</h2>
      <form className="pag-card-form" onSubmit={handleSubmit}>
        <div className="pag-card-form__tipo">
          <button type="button"
                  className={tipo === 'CARTAO_CREDITO' ? 'active' : ''}
                  onClick={() => setTipo('CARTAO_CREDITO')}>
            Credito
          </button>
          <button type="button"
                  className={tipo === 'CARTAO_DEBITO' ? 'active' : ''}
                  onClick={() => setTipo('CARTAO_DEBITO')}>
            Debito
          </button>
        </div>
        <input
          className="form-input"
          placeholder="Numero do cartao"
          value={numero}
          onChange={(e) => setNumero(maskNumero(e.target.value))}
          maxLength={19}
          inputMode="numeric"
          required
        />
        <input
          className="form-input"
          placeholder="Nome impresso no cartao"
          value={titular}
          onChange={(e) => setTitular(e.target.value.toUpperCase())}
          required
        />
        <div className="pag-card-form__row">
          <input
            className="form-input"
            placeholder="Validade (MM/AA)"
            value={validade}
            onChange={(e) => setValidade(maskValidade(e.target.value))}
            maxLength={5}
            inputMode="numeric"
            required
          />
          <input
            className="form-input"
            placeholder="CVV"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            maxLength={4}
            inputMode="numeric"
            required
          />
        </div>
        {erroLocal && <p style={{ color: '#9f1239', fontSize: 13 }}>{erroLocal}</p>}
        <button type="submit" className="pag-confirm-btn" disabled={loading}>
          {loading ? 'Processando...' : 'Pagar com cartao'}
        </button>
        <p style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 4 }}>
          Simulacao - nenhum dado real de cartao e processado.
        </p>
      </form>
    </div>
  );
}