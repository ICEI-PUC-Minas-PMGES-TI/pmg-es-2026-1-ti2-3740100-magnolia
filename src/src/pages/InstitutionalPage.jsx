import { useState } from 'react';
import Footer from '../components/Footer.jsx';

const FAQ = [
  {
    categoria: 'Pedidos',
    perguntas: [
      { q: 'Como faço um pedido?', r: 'Adicione os produtos ao carrinho, informe seus dados e o endereço de entrega, e finalize o pedido. Você receberá a confirmação por e-mail.' },
      { q: 'Posso cancelar um pedido?', r: 'Sim. Pedidos no status "Pendente" podem ser cancelados pelo painel Minha Conta ou entrando em contato com o suporte.' },
      { q: 'Como acompanho meu pedido?', r: 'Acesse "Minha Conta" e veja o status atualizado em tempo real: Pendente, Em rota ou Entregue.' },
    ],
  },
  {
    categoria: 'Entrega',
    perguntas: [
      { q: 'Quais regiões vocês atendem?', r: 'Realizamos entregas em todo o Brasil. O prazo varia conforme a localidade.' },
      { q: 'Quanto tempo leva a entrega?', r: 'Na maioria das capitais entregamos em até 3 horas após a aprovação. Para demais cidades, o prazo é de 1 a 3 dias úteis.' },
      { q: 'O frete é grátis?', r: 'Sim! Pedidos acima de R$200,00 têm frete grátis. Abaixo disso, o frete é de R$19,90.' },
    ],
  },
  {
    categoria: 'Pagamento',
    perguntas: [
      { q: 'Quais formas de pagamento são aceitas?', r: 'No momento aceitamos pagamento em dinheiro na entrega.' },
      { q: 'O site é seguro para compras?', r: 'Sim. Não armazenamos dados de cartão. Toda a comunicação é protegida.' },
    ],
  },
  {
    categoria: 'Devoluções',
    perguntas: [
      { q: 'Como faço uma devolução?', r: 'Entre em contato pelo formulário de Contato em até 24 horas após o recebimento, descrevendo o problema e enviando fotos.' },
      { q: 'Produtos danificados, o que faço?', r: 'Fotografe o produto e entre em contato. Realizaremos a reentrega ou o estorno sem custos adicionais.' },
    ],
  },
  {
    categoria: 'Conta',
    perguntas: [
      { q: 'Como crio uma conta?', r: 'Clique em "Cadastre-se" no menu superior e preencha nome, e-mail e senha.' },
      { q: 'Esqueci minha senha, o que faço?', r: 'Na página de login há a opção "Esqueci minha senha". Um link de redefinição será enviado ao seu e-mail.' },
      { q: 'Como excluo minha conta?', r: 'Acesse "Minha Conta" > "Excluir conta". A exclusão é permanente e todos os seus dados serão removidos.' },
    ],
  },
];

function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: '100%', textAlign: 'left', padding: '14px 18px',
              background: open === i ? '#f0faf3' : '#fff',
              border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontWeight: 600, fontSize: 14, color: '#1B3A2D',
            }}
          >
            {item.q}
            <span style={{ fontSize: 18, lineHeight: 1 }}>{open === i ? '−' : '+'}</span>
          </button>
          {open === i && (
            <div style={{ padding: '12px 18px 16px', fontSize: 14, color: '#555', lineHeight: 1.7, background: '#fafafa' }}>
              {item.r}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Ajuda({ onNavigate }) {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1B3A2D', marginBottom: 8 }}>Central de Ajuda</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Encontre respostas para as dúvidas mais comuns.</p>
      {FAQ.map((cat) => (
        <div key={cat.categoria} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1B3A2D', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #e5e7eb' }}>
            {cat.categoria}
          </h2>
          <Accordion items={cat.perguntas} />
        </div>
      ))}
      <div style={{ marginTop: 32, background: '#f9f6f0', borderRadius: 12, padding: '20px 24px' }}>
        <p style={{ fontWeight: 600, marginBottom: 6 }}>Não encontrou o que procurava?</p>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 14 }}>Nossa equipe está pronta para ajudar.</p>
        <button className="btn-login" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => onNavigate('contact')}>
          Fale conosco
        </button>
      </div>
    </div>
  );
}

function Privacidade() {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1B3A2D', marginBottom: 8 }}>Política de Privacidade</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Última atualização: Janeiro de 2025</p>
      {[
        { titulo: '1. Dados que coletamos', texto: 'Coletamos nome, e-mail, senha (em formato hash), endereços de entrega, telefone e histórico de pedidos. Não coletamos dados de cartão de crédito nem documentos de identidade.' },
        { titulo: '2. Como usamos seus dados', texto: 'Utilizamos seus dados para processar pedidos, comunicar atualizações de entrega, melhorar nossos serviços e cumprir obrigações legais.' },
        { titulo: '3. Compartilhamento', texto: 'Não vendemos seus dados. Podemos compartilhar informações com parceiros logísticos estritamente para fins de entrega.' },
        { titulo: '4. Seus direitos (LGPD)', texto: 'Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento por meio do painel "Minha Conta" ou pelo formulário de contato.' },
        { titulo: '5. Segurança', texto: 'Adotamos medidas técnicas e organizacionais para proteger seus dados contra acesso não autorizado, perda ou alteração.' },
        { titulo: '6. Contato', texto: 'Dúvidas sobre esta política? Entre em contato pelo formulário na página de Contato.' },
      ].map((s) => (
        <div key={s.titulo} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1B3A2D', marginBottom: 8 }}>{s.titulo}</h2>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>{s.texto}</p>
        </div>
      ))}
    </div>
  );
}

function Cookies() {
  const tipos = [
    { nome: 'Essenciais', cor: '#1B8A4F', bg: '#d4edda', desc: 'Necessários para o funcionamento do site (carrinho, login, sessão). Não podem ser desativados.' },
    { nome: 'Funcionais', cor: '#004085', bg: '#cce5ff', desc: 'Lembram suas preferências (endereço salvo, idioma) para melhorar sua experiência.' },
    { nome: 'Analíticos', cor: '#856404', bg: '#fff3cd', desc: 'Coletam dados agregados sobre uso do site para nos ajudar a melhorar o serviço.' },
  ];
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1B3A2D', marginBottom: 8 }}>Política de Cookies</h1>
      <p style={{ color: '#666', marginBottom: 28 }}>Usamos cookies para garantir a melhor experiência no Jardim Magnólia.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {tipos.map((t) => (
          <div key={t.nome} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: t.bg, borderRadius: 10, padding: '14px 18px' }}>
            <span style={{ background: t.cor, color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 12px', whiteSpace: 'nowrap', marginTop: 2 }}>
              {t.nome}
            </span>
            <p style={{ fontSize: 14, color: '#333', lineHeight: 1.7, margin: 0 }}>{t.desc}</p>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 24, fontSize: 13, color: '#777' }}>
        Você pode gerenciar os cookies nas configurações do seu navegador. Desativar cookies essenciais pode afetar o funcionamento do site.
      </p>
    </div>
  );
}

function Termos() {
  return (
    <div>
      <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1B3A2D', marginBottom: 8 }}>Termos de Uso</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Ao usar o Jardim Magnólia, você concorda com os termos abaixo.</p>
      {[
        { titulo: '1. Conta de usuário', texto: 'Você é responsável por manter a confidencialidade de suas credenciais. Não compartilhe sua senha com terceiros.' },
        { titulo: '2. Produtos e preços', texto: 'Nos reservamos o direito de alterar preços e disponibilidade de produtos sem aviso prévio. Os preços vigentes são os exibidos no momento da finalização do pedido.' },
        { titulo: '3. Entrega', texto: 'Os prazos de entrega são estimados e podem variar por fatores externos. Não nos responsabilizamos por atrasos causados por eventos de força maior.' },
        { titulo: '4. Cancelamento e reembolso', texto: 'O consumidor tem direito ao cancelamento em até 7 dias após a entrega, conforme Art. 49 do CDC. Para produtos danificados, o prazo é de 24 horas após o recebimento.' },
        { titulo: '5. Propriedade intelectual', texto: 'Todo o conteúdo do site (textos, imagens, logotipo) é de propriedade do Jardim Magnólia e protegido por lei.' },
        { titulo: '6. Foro', texto: 'Estes termos são regidos pelas leis brasileiras. Fica eleito o foro da comarca de São Paulo/SP para dirimir eventuais conflitos.' },
      ].map((s) => (
        <div key={s.titulo} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1B3A2D', marginBottom: 8 }}>{s.titulo}</h2>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>{s.texto}</p>
        </div>
      ))}
    </div>
  );
}

export default function InstitutionalPage({ page, onNavigate, cliente }) {
  const content = {
    ajuda: <Ajuda onNavigate={onNavigate} />,
    'politica-privacidade': <Privacidade />,
    'politica-cookies': <Cookies />,
    termos: <Termos />,
  };

  return (
    <div>
      {cliente && (
        <div style={{ background: '#f0faf3', padding: '10px 24px', fontSize: 13, color: '#1B3A2D' }}>
          Olá, <strong>{cliente.nome}</strong>! 👋
        </div>
      )}
      <div className="container" style={{ paddingTop: 40, paddingBottom: 56 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {content[page] ?? (
            <p style={{ color: '#999' }}>Página não encontrada.</p>
          )}
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
