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
                <div className="footer__logo" onClick={() => onNavigate && onNavigate('home')}>
                    <img src="/images/logo.png" alt="Jardim Magnólia" />
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
                    <a
                        href="https://www.instagram.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Instagram"
                        aria-label="Instagram"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                        </svg>
                    </a>
                    <a
                        href="https://x.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="X (Twitter)"
                        aria-label="X"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"/>
                        </svg>
                    </a>
                    <a
                        href="https://wa.me/5527999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp"
                        aria-label="WhatsApp"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.064 2.876 1.213 3.074c.149.198 2.095 3.2 5.077 4.487.71.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884Zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                    </a>
                    <a
                        href="mailto:contato@jardimmagnolia.com.br"
                        title="Email"
                        aria-label="Email"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="5" width="18" height="14" rx="2" />
                            <path d="m3 7 9 6 9-6" />
                        </svg>
                    </a>
                </div>

                <div className="footer__copy">JardimMagnólia. © Copyright 2026</div>
            </div>
        </footer>
    );
}