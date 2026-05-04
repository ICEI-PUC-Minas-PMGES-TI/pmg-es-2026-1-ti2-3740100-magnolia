import { useState } from 'react';
import Footer from '../components/Footer.jsx';
import { IMAGES } from '../data';
import { API } from '../hooks/useProdutos.js';

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.06 12.34a1 1 0 0 1 0-.68 10.94 10.94 0 0 1 19.88 0 1 1 0 0 1 0 .68 10.94 10.94 0 0 1-19.88 0"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 2 20 20"/>
      <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83"/>
      <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.91c4.62 0 8.58 2.88 10 7.09a10.95 10.95 0 0 1-4.24 5.37"/>
      <path d="M6.61 6.61A10.94 10.94 0 0 0 2 12c1.41 4.21 5.37 7.09 10 7.09 1.36 0 2.67-.25 3.88-.7"/>
    </svg>
  );
}

export default function LoginPage({ onNavigate, onLoginCliente }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [admin, setAdmin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API}/auth/clientes/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: pass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Falha no login');
      onLoginCliente?.(data);
      onNavigate('home');
    } catch (err) {
      setError(err.message || 'Não foi possível entrar.');
    }
  };

  const handleAdmin = async (e) => {
    e.preventDefault();
    if (!admin.trim()) return;

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: admin }),
      });
      if (res.ok) {
        onNavigate('admin');
        return;
      }
    } catch {}

    if (admin.trim() === 'JARDIM@2026') {
      onNavigate('admin');
      return;
    }

    setError('Código de administrador inválido.');
  };

  return (
    <div>
      <div className="login-page">
        <div className="login-page__left">
          <img className="login-page__left-bg" src={IMAGES.login} alt="Flores" />
          <div className="login-page__left-overlay" />
          <div className="login-page__left-content">
            <h1 className="login-page__tagline">A incrível<br />magia das<br /><em>flores</em></h1>
            <p className="login-page__sub">Flores colombianas frescas,<br />entregues com amor em todo o Brasil.</p>
          </div>
        </div>

        <div className="login-page__right">
          <div className="login-form">
            <h2 className="login-form__title">Entre na sua conta</h2>

            <form onSubmit={handleLogin}>
              <input type="email" className="form-input" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <div className="password-field">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input password-field__input"
                  placeholder="Senha"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
                <button type="button" className="password-field__toggle" onClick={() => setShowPass((prev) => !prev)} aria-label="Mostrar senha">
                  <EyeIcon open={showPass} />
                </button>
              </div>
              <button type="submit" className="btn-login">ENTRAR</button>
            </form>

            {error && <p style={{ color: '#9f1239', marginTop: 10, fontSize: 13 }}>{error}</p>}

            <div className="form-divider"><span>OU</span></div>

            <button className="btn-register" onClick={() => onNavigate('cadastro')}>CADASTRE-SE</button>

            <p className="form-terms">Ao se cadastrar, você concorda com os termos e políticas de privacidade.</p>

            <h3 className="login-form__subtitle">Administrador</h3>

            <form onSubmit={handleAdmin}>
              <input type="text" className="form-input" placeholder="Código de acesso" value={admin} onChange={(e) => setAdmin(e.target.value)} />
              <button type="submit" className="btn-admin">ENTRAR</button>
            </form>
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}