import { useEffect, useState } from 'react';

export default function NavBar({ currentPage, onNavigate, cartCount, searchTerm, onSearchChange, cliente, onLogout }) {
    const [activeLabel, setActiveLabel] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { label: 'Buquês', page: 'home' },
        { label: 'Arranjos', page: 'home' },
        { label: 'Flores em Vasos', page: 'home' },
        { label: 'Ocasiões', page: 'presentes' },
        { label: 'Presentes', page: 'presentes' },
        { label: 'Dicas para Cuidado', page: 'dicas' },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar__inner">
                <div className="navbar__top">
                    <div className="navbar__logo" onClick={() => onNavigate('home')}>
                        <div className="navbar__logo-frame">
                            <img
                                src="/images/logo.png"
                                alt="Jardim Magnólia"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextSibling.style.display = 'flex';
                                }}
                            />
                            <span style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🌿</span>
                        </div>
                    </div>

                    <div className="navbar__search">
                        <input
                            type="text"
                            placeholder="Buscar flores, buquês, arranjos..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            onFocus={() => onNavigate('home')}
                        />
                        <span className="navbar__search-icon">🔍</span>
                    </div>

                    <button className="navbar__address-btn" onClick={() => onNavigate('address')}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                        </svg>
                        Informe seu endereço de entrega
                    </button>

                    <div className="navbar__icons">
                        <div className="navbar__cart" onClick={() => onNavigate('cart')} title="Ver carrinho">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"/>
                                <circle cx="20" cy="21" r="1"/>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            </svg>
                            {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
                        </div>

                        <div className="navbar__user" onClick={() => onNavigate(cliente ? 'minha-conta' : 'login')}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            {cliente ? (
                                <span>
                  Olá, {cliente.nome?.split(' ')[0] || 'Cliente'}
                                    <button className="navbar__logout-btn" onClick={(e) => { e.stopPropagation(); onLogout?.(); }}>
                    Sair
                  </button>
                </span>
                            ) : <span>Entrar</span>}
                        </div>
                    </div>
                </div>

                <div className="navbar__nav">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            className={`navbar__nav-link ${activeLabel === link.label ? 'active' : ''}`}
                            onClick={() => { setActiveLabel(link.label); onNavigate(link.page); }}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}