import { useState } from 'react';
import Footer from '../components/Footer.jsx';
import { API } from '../hooks/useProdutos.js';

export default function AddressLookupPage({ onNavigate }) {
  const [cep, setCep] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const onlyDigits = cep.replace(/\D/g, '');
    if (onlyDigits.length !== 8) {
      setError('Digite um CEP válido com 8 números.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/cep/${onlyDigits}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'CEP não encontrado.');
      setResult(data);
    } catch (err) {
      setError(err.message || 'Não foi possível consultar o CEP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h1 className="section__title" style={{ marginBottom: 8 }}>Consulta de CEP</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 28 }}>
            Verifique o endereço correspondente a um CEP brasileiro.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
            <input
              className="form-input"
              placeholder="00000-000"
              value={cep}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
                setCep(v);
              }}
              maxLength={9}
              style={{ marginBottom: 0, flex: 1 }}
            />
            <button type="submit" className="btn-login" style={{ width: 'auto', padding: '10px 24px', marginTop: 0 }} disabled={loading}>
              {loading ? 'Consultando...' : 'Buscar'}
            </button>
          </form>

          {error && (
            <p style={{ color: '#9f1239', fontSize: 13, marginTop: 12 }}>{error}</p>
          )}

          {result && (
            <div style={{
              marginTop: 24, background: '#f0faf3', border: '1px solid #d4edda',
              borderRadius: 12, padding: '20px 22px',
            }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1B3A2D', marginBottom: 12 }}>
                CEP {result.cep}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, color: '#444' }}>
                {result.logradouro && <span><strong>Rua:</strong> {result.logradouro}</span>}
                {result.bairro     && <span><strong>Bairro:</strong> {result.bairro}</span>}
                {result.localidade && <span><strong>Cidade:</strong> {result.localidade}</span>}
                {result.uf         && <span><strong>Estado:</strong> {result.uf}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
