import { useMemo, useState } from 'react';
const fmt = (n) => 'R$ ' + Number(n || 0).toFixed(2).replace('.', ',');
// Gera um SVG estilo "QR Code" aleatorio (apenas visual)
function generateFakeQR(size = 25) {
  const cells = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inCorner =
        (x < 7 && y < 7) ||
        (x >= size - 7 && y < 7) ||
        (x < 7 && y >= size - 7);
      const isMarker =
        (inCorner && (x === 0 || x === 6 || y === 0 || y === 6)) ||
        (inCorner && x >= 2 && x <= 4 && y >= 2 && y <= 4);
      const fill = isMarker ? true : (inCorner ? false : Math.random() > 0.55);
      if (fill) cells.push({ x, y });
    }
  }
  return { size, cells };
  }
function gerarCopiaCola() {
  const rand = (n) => Array.from({ length: n }, () =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
  ).join('');
  return `00020126580014BR.GOV.BCB.PIX0136${rand(32)}` +
         `5204000053039865802BR5913JARDIM MAGNOLIA6304${rand(4)}`;
}
export default function PixPayment({ onConfirm, loading, valor }) {
  const qr = useMemo(() => generateFakeQR(25), []);
  const [copiaCola] = useState(() => gerarCopiaCola());
  const [copiado, setCopiado] = useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(copiaCola).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  };
  const cellSize = 8;
  return (
    <div className="pag-section">
      <h2 className="pag-section__title">Pagamento via PIX</h2>
      <div className="pag-pix">
        <div className="pag-pix__qr">
          <svg viewBox={`0 0 ${qr.size * cellSize} ${qr.size * cellSize}`}
               xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#fff" />
            {qr.cells.map((c, i) => (
              <rect key={i}
                    x={c.x * cellSize}
                    y={c.y * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill="#1B3A2D" />
            ))}
          </svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1B3A2D' }}>
          Valor: {fmt(valor)}
        </p>
        <p style={{ fontSize: 13, color: '#666', textAlign: 'center', maxWidth: 320 }}>
          Escaneie o QR Code com o app do seu banco ou copie o codigo abaixo:
        </p>
        <div className="pag-pix__copy">{copiaCola}</div>
        <button className="pag-pix__copy-btn" onClick={handleCopy}>
          {copiado ? 'Copiado!' : 'Copiar codigo'}
        </button>
        <button
          className="pag-confirm-btn"
          onClick={() => onConfirm({ metodo: 'PIX' })}
          disabled={loading}
          style={{ maxWidth: 320 }}
        >
          {loading ? 'Confirmando...' : 'Ja paguei - confirmar'}
        </button>
        <p style={{ fontSize: 11, color: '#888', textAlign: 'center' }}>
          Simulacao academica - QR Code gerado aleatoriamente.
        </p>
      </div>
    </div>
  );
}