import { useEffect, useState } from 'react';
import { API } from './hooks/useProdutos.js';
import NavBar from './components/NavBar.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import CadastroPage from './pages/CadastroPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import CartPage from './pages/CartPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import PresentesPage from './pages/PresentesPage.jsx';
import InstitutionalPage from './pages/InstitutionalPage.jsx';
import TipsPage from './pages/TipsPage.jsx';
import AddressLookupPage from './pages/AddressLookupPage.jsx';
import ClientePage from './pages/ClientePage.jsx';
import PagamentoPage from './pages/PagamentoPage.jsx';


const FOOTER_PAGES = new Set(['ajuda', 'politica-privacidade', 'politica-cookies', 'termos']);

export default function App() {
    const [page, setPage] = useState('home');
    const [pageParams, setPageParams] = useState({});
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [cliente, setCliente] = useState(null);

    useEffect(() => {
        const raw = window.localStorage.getItem('jm_cliente');
        if (raw) {
            try {
                setCliente(JSON.parse(raw));
            } catch {
                window.localStorage.removeItem('jm_cliente');
            }
        }
    }, []);

    const cartCount = cart.reduce((acc, i) => acc + i.qty, 0);

    const iniciarCarrinhoSeNecessario = () => {
        if (!cliente?.id) return;
        if (window.localStorage.getItem('jm_carrinho_id')) return;
        fetch(`${API}/carrinhos/iniciar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clienteId: cliente.id }),
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((c) => {
                if (c?.id) window.localStorage.setItem('jm_carrinho_id', String(c.id));
            })
            .catch(() => {});
    };

    const addToCart = (item) => {
        iniciarCarrinhoSeNecessario();
        setCart((prev) => {
            const exists = prev.find((i) => i.id === item.id);
            if (exists) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + (item.qty ?? 1) } : i);
            return [...prev, { ...item, qty: item.qty ?? 1 }];
        });
    };

    const handleLoginCliente = (data) => {
        setCliente(data);
        window.localStorage.setItem('jm_cliente', JSON.stringify(data));
    };

    const handleLogout = () => {
        setCliente(null);
        window.localStorage.removeItem('jm_cliente');
        setPage('home');
    };

    const handleUpdateCliente = (data) => {
        const atualizado = { ...cliente, ...data };
        setCliente(atualizado);
        window.localStorage.setItem('jm_cliente', JSON.stringify(atualizado));
    };

    const clearCart = () => {
        setCart([]);
        window.localStorage.removeItem('jm_carrinho_id');
    };

    const changeQty = (id, delta) => {
        setCart((prev) =>
            prev.map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0)
        );
    };

    const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

    const navigate = (target, params = {}) => {
        setPage(target);
        setPageParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (page === 'admin') {
        return <AdminPage onNavigate={navigate} />;
    }

    return (
        <div>
            <NavBar
                currentPage={page}
                onNavigate={navigate}
                cartCount={cartCount}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                cliente={cliente}
                onLogout={handleLogout}
            />

            {page === 'home' && <HomePage onNavigate={navigate} onAddToCart={addToCart} searchTerm={searchTerm} cliente={cliente} />}
            {page === 'product' && <ProductPage onNavigate={navigate} onAddToCart={addToCart} cliente={cliente} />}
            {page === 'login' && <LoginPage onNavigate={navigate} onLoginCliente={handleLoginCliente} />}
            {page === 'cadastro' && <CadastroPage onNavigate={navigate} onCadastroRealizado={handleLoginCliente} />}
            {page === 'contact' && <ContactPage onNavigate={navigate} cliente={cliente} />}
            {page === 'cart' && (
                <CartPage
                    cart={cart}
                    onNavigate={navigate}
                    onQtyChange={changeQty}
                    onRemove={removeItem}
                    onOrderFinished={clearCart}
                    cliente={cliente}
                />

     

            )}
            {page === 'presentes' && <PresentesPage onNavigate={navigate} onAddToCart={addToCart} initialCategoria={pageParams.categoria} />}
            {page === 'dicas' && <TipsPage onNavigate={navigate} />}
            {page === 'address' && <AddressLookupPage onNavigate={navigate} />}
            {page === 'minha-conta' && <ClientePage onNavigate={navigate} cliente={cliente} onLogout={handleLogout} onUpdateCliente={handleUpdateCliente} />}
            {FOOTER_PAGES.has(page) && <InstitutionalPage page={page} onNavigate={navigate} cliente={cliente} />}
                
                {page === 'pagamento' && (
                <PagamentoPage
                onNavigate={navigate}
                pedidoId={pageParams.pedidoId}
                total={pageParams.total}
                />
                )}
        </div>
    );
}