import { useState } from 'react';

import Footer from '../components/Footer.jsx';
import CartaoForm from '../components/payment/CartaoForm.jsx';
import PixPayment from '../components/payment/PixPayment.jsx';
import DinheiroPayment from '../components/payment/DinheiroPayment.jsx';

import { API } from '../hooks/useProdutos.js';

const fmt = (n) =>
  'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');

const METODOS = [
  {
    id: 'CARTAO',
    label: 'Cartao',
    emoji: 'CC',
    desc: 'Credito ou debito',
  },
  {
    id: 'PIX',
    label: 'PIX',
    emoji: 'PX',
    desc: 'Aprovacao imediata',
  },
  {
    id: 'DINHEIRO',
    label: 'Dinheiro',
    emoji: 'R$',
    desc: 'Pague na entrega',
  },
];



export default function PagamentoPage({
  onNavigate,
  pedidoId,
  total,
}) {
  const [metodoSelecionado, setMetodoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(null);

  if (!pedidoId) {
    return (
      <div>
        <div
          className="container"
          style={{
            textAlign: 'center',
            padding: '80px 24px',
          }}
        >
          <p
            style={{
              fontSize: 16,
              color: '#555',
              marginBottom: 24,
            }}
          >
            Nenhum pedido para pagar. Volte ao carrinho.
          </p>

          <button
            className="btn-login"
            style={{
              width: 'auto',
              padding: '12px 32px',
            }}
            onClick={() => onNavigate('cart')}
          >
            Voltar ao carrinho
          </button>
        </div>


    <Footer onNavigate={onNavigate} />
      </div>
      
    );
  }
  

  const enviarPagamento = async (payload) => {
    setLoading(true);
    setErro('');

    try {
      const res = await fetch(`${API}/pagamentos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pedidoId,
          valor: total,
          ...payload,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || 'Falha ao processar pagamento.'
        );
      }

      setSucesso(data);
    } catch (err) {
      setErro(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div>
        <div className="cart-success">
          <div className="cart-success__icon">
            {sucesso.status === 'APROVADO' ? 'OK' : '...'}
          </div>

          <h2 className="cart-success__title">
            {sucesso.status === 'APROVADO'
              ? 'Pagamento aprovado!'
              : 'Pedido registrado!'}
          </h2>

          <p className="cart-success__sub">
            Pedido{' '}
            <strong>
              #{String(pedidoId).padStart(5, '0')}
            </strong>
            <br />

            {sucesso.metodo === 'DINHEIRO'
              ? 'Pagamento sera efetuado no momento da entrega.'
              : `Pagamento via ${sucesso.metodo.replace(
                  '_',
                  ' '
                )} confirmado.`}
          </p>

          <button
            className="cart-success__btn"
            onClick={() => onNavigate('home')}
          >
            Continuar comprando
          </button>
        </div>

        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  return (
    <div>
      <div className="pag-page">
        <div className="pag-page__header">
          <h1 className="pag-page__title">
            Pagamento
          </h1>

          <button
            className="cart-page__back"
            onClick={() => onNavigate('cart')}
          >
            &larr; Voltar
          </button>
        </div>

        <div className="pag-layout">
          <div className="pag-main">
            <div className="pag-section">
              <h2 className="pag-section__title">
                Escolha a forma de pagamento
              </h2>

              <div className="pag-metodos">
                {METODOS.map((m) => (
                  <button
                    key={m.id}
                    className={`pag-metodo ${
                      metodoSelecionado === m.id
                        ? 'active'
                        : ''
                    }`}
                    onClick={() => {
                      setMetodoSelecionado(m.id);
                      setErro('');
                    }}
                  >
                    <span className="pag-metodo__emoji">
                      {m.emoji}
                    </span>

                    <span className="pag-metodo__label">
                      {m.label}
                    </span>

                    <span className="pag-metodo__desc">
                      {m.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {metodoSelecionado === 'CARTAO' && (
              <CartaoForm
                onSubmit={enviarPagamento}
                loading={loading}
              />
            )}

            {metodoSelecionado === 'PIX' && (
              <PixPayment
                onConfirm={enviarPagamento}
                loading={loading}
                valor={total}
              />
            )}

            {metodoSelecionado === 'DINHEIRO' && (
              <DinheiroPayment
                onConfirm={enviarPagamento}
                loading={loading}
                valor={total}
              />
            )}

            {erro && (
              <p
                style={{
                  color: '#9f1239',
                  marginTop: 12,
                  fontSize: 14,
                }}
              >
                {erro}
              </p>
            )}
          </div>

          <aside className="pag-summary">
            <h3 className="cart-summary__title">
              Resumo
            </h3>

            <div className="cart-summary__rows">
              <div className="cart-summary__row">
                <span>Pedido</span>

                <span>
                  #{String(pedidoId).padStart(5, '0')}
                </span>
              </div>

              <div className="cart-summary__row">
                <span>Total</span>

                <span
                  style={{
                    fontWeight: 700,
                    color: '#1B3A2D',
                  }}
                >
                  {fmt(total)}
                </span>
              </div>
            </div>

            <div className="cart-summary__divider" />

            <p
              style={{
                fontSize: 12,
                color: '#777',
                lineHeight: 1.6,
              }}
            >
              Seus dados sao protegidos.
              Esta e uma simulacao para fins academicos.
            </p>
          </aside>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}