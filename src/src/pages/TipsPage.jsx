import Footer from '../components/Footer.jsx';

const TIPS = [
  {
    title: 'Troque a água diariamente',
    text: 'Use água fresca e limpa todos os dias para evitar a proliferação de bactérias que bloqueiam os caules.',
  },
  {
    title: 'Corte os caules em diagonal',
    text: 'Faça um corte de aproximadamente 2 cm na diagonal antes de colocar no vaso. Isso aumenta a área de absorção de água e nutrientes.',
  },
  {
    title: 'Prefira luz indireta',
    text: 'Mantenha as flores em ambientes claros, mas longe da luz solar direta e de correntes de ar frio ou quente.',
  },
  {
    title: 'Remova folhas submersas',
    text: 'Tire todas as folhas que ficariam dentro da água. Folhas submersas apodrecem rapidamente e contaminam a água.',
  },
  {
    title: 'Fertilize com moderação',
    text: 'Use fertilizantes específicos para flores cortadas ou plantas em vaso, respeitando as proporções indicadas na embalagem.',
  },
  {
    title: 'Controle a umidade do solo',
    text: 'Para plantas envasadas, evite encharcar o solo. Toque a terra antes de regar — só regue quando sentir que está seca na superfície.',
  },
];

export default function TipsPage({ onNavigate }) {
  return (
    <div>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 className="section__title" style={{ marginBottom: 8 }}>Dicas de Cuidado</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 15, marginBottom: 36 }}>
            Guia rápido para manter suas flores e plantas sempre bonitas e saudáveis.
          </p>

          <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {TIPS.map((tip, i) => (
              <div
                key={i}
                style={{
                  background: '#f9f6f0',
                  borderRadius: 14,
                  padding: '20px 22px',
                  borderLeft: '4px solid #1B3A2D',
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1B3A2D', marginBottom: 8 }}>
                  {tip.title}
                </h3>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 }}>
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
