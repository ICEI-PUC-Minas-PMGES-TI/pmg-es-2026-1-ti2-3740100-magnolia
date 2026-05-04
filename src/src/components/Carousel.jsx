import { useRef } from 'react';
import MiniCard from './MiniCard.jsx';

export default function Carousel({ title, items, onItemClick, onAddToCart }) {
    const scrollRef = useRef(null);

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' });
        }
    };

    return (
        <div className="section">
            <div className="section__header">
                <h2 className="section__title">{title}</h2>
                <div className="section__nav">
                    <button className="section__nav-btn" onClick={() => scroll(-1)} aria-label="anterior">
                        ‹
                    </button>
                    <button className="section__nav-btn" onClick={() => scroll(1)} aria-label="próximo">
                        ›
                    </button>
                </div>
            </div>

            <div className="carousel" ref={scrollRef}>
                {items.map((item) => (
                    <MiniCard
                        key={item.id}
                        item={item}
                        onClick={() => onItemClick && onItemClick(item)}
                        onAddToCart={onAddToCart}
                    />
                ))}
            </div>
        </div>
    );
}