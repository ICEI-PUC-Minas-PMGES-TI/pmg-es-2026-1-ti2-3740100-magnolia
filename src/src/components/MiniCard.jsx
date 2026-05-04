import { useState } from 'react';

export default function MiniCard({ item, onClick, onAddToCart }) {
    const [imgError, setImgError] = useState(false);

    const handleAdd = (e) => {
        e.stopPropagation();
        onAddToCart && onAddToCart(item);
    };

    return (
        <div className="card" onClick={onClick}>

            <div className="card__img">
                {imgError ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf4f0', fontSize: 60 }}>
                        🌹
                    </div>
                ) : (
                    <img
                        src={item.img}
                        alt={item.name}
                        onError={() => setImgError(true)}
                    />
                )}
            </div>

            <div className="card__body">
                <div className="card__meta">
                    <span className="card__source">Flores Online</span>
                    <span className="card__delivery">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>
            Amanhã
          </span>
                </div>

                <p className="card__name">{item.name}</p>

                <div className="card__footer">
          <span className="card__price">
            R${item.price.toFixed(2).replace('.', ',')}
          </span>
                    <button className="card__add" onClick={handleAdd} title="Adicionar ao carrinho">
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}