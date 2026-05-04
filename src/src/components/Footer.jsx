const links = [
    { label: 'Minha Conta', page: 'minha-conta' },
    { label: 'Ajuda', page: 'ajuda' },
    { label: 'Política de Privacidade', page: 'politica-privacidade' },
    { label: 'Política de Cookies', page: 'politica-cookies' },
    { label: 'Termos de Uso', page: 'termos' },
    { label: 'Contato', page: 'contact' },
];

export default function Footer({ onNavigate }) {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__logo">
                    <span>🌿</span>
                    <span>JardimMagnólia</span>
                </div>

                <div className="footer__links">
                    {links.map((l) => (
                        <a
                            key={l.label}
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                onNavigate && onNavigate(l.page);
                            }}
                        >
                            {l.label}
                        </a>
                    ))}
                </div>

                <div className="footer__social">
                    <a href="#" title="Instagram" aria-label="Instagram">📸</a>
                    <a href="#" title="X (Twitter)" aria-label="X">✕</a>
                    <a href="#" title="Email" aria-label="Email">✉️</a>
                </div>

                <div className="footer__copy">JardimMagnólia. © Copyright 2026</div>
            </div>
        </footer>
    );
}