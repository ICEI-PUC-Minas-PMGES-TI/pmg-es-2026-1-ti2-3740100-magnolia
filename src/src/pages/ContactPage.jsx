import { useState } from 'react';
import Footer from '../components/Footer.jsx';
import { IMAGES } from '../data/index.js';
import { API } from '../hooks/useProdutos.js';

const SUBJECTS = [
  'Dúvida sobre pedido',
  'Problema na entrega',
  'Devolução / Reembolso',
  'Produto danificado',
  'Cancelamento',
  'Elogio',
  'Parceria comercial',
  'Outro assunto',
];

const PEDIDO_ASSUNTOS = new Set([
  'Dúvida sobre pedido',
  'Problema na entrega',
  'Devolução / Reembolso',
  'Produto danificado',
  'Cancelamento',
]);

export default function ContactPage({ onNavigate, cliente }) {
  const [form, setForm] = useState({
    nome: cliente?.nome || '',
    email: cliente?.email || '',
    assunto: SUBJECTS[0],
    numeroPedido: '',
    mensagem: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/contato`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Erro ao enviar mensagem');
      setSuccess(true);
    } catch {
      setError('Não foi possível enviar a mensagem. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="contact-page">
        {/* Painel esquerdo */}
        <div className="contact-page__left">
          <img className="contact-page__bg" src={IMAGES.contact} alt="Flores" />
          <div className="contact-page__overlay" />
          <div className="contact-page__left-content">
            <h1 className="contact-page__tagline">Estamos aqui<br />por <em>você</em></h1>
            <p className="contact-page__sub">Respondemos em até 24 horas úteis.</p>
            <div className="contact-page__infos">
              <div className="contact-page__info-item">
                <span>✉️</span>
                <span>contato@jardimmagnolia.com.br</span>
              </div>
              <div className="contact-page__info-item">
                <span>💬</span>
                <span>WhatsApp: (11) 99999-0000</span>
              </div>
              <div className="contact-page__info-item">
                <span>🕐</span>
                <span>Seg–Sex: 8h–18h · Sáb: 8h–13h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel direito */}
        <div className="contact-page__right">
          {success ? (
            <div className="contact-page__success">
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h2>Mensagem enviada!</h2>
              <p>Responderemos no e-mail <strong>{form.email}</strong> em até 24 horas.</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
                <button className="btn-login" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => onNavigate('home')}>
                  Ir para a loja
                </button>
                <button className="btn-register" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => { setSuccess(false); setForm((f) => ({ ...f, mensagem: '', numeroPedido: '' })); }}>
                  Enviar outra mensagem
                </button>
              </div>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2 className="contact-form__title">Fale conosco</h2>

              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
                <input
                  className="form-input"
                  placeholder="Seu nome *"
                  value={form.nome}
                  onChange={(e) => set('nome', e.target.value)}
                  required
                  style={{ marginBottom: 0 }}
                />
                <input
                  className="form-input"
                  type="email"
                  placeholder="E-mail *"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                  style={{ marginBottom: 0 }}
                />
              </div>

              <select
                className="form-input"
                value={form.assunto}
                onChange={(e) => set('assunto', e.target.value)}
                style={{ marginTop: 12 }}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {PEDIDO_ASSUNTOS.has(form.assunto) && (
                <input
                  className="form-input"
                  placeholder="Número do pedido (opcional)"
                  value={form.numeroPedido}
                  onChange={(e) => set('numeroPedido', e.target.value)}
                />
              )}

              <textarea
                className="form-input"
                rows={5}
                placeholder="Sua mensagem *"
                value={form.mensagem}
                onChange={(e) => set('mensagem', e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />

              {error && <p style={{ color: '#9f1239', fontSize: 13 }}>{error}</p>}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar mensagem'}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
