const PRODUCTS_KEY = 'jm_admin_produtos';
const ORDERS_KEY = 'jm_admin_pedidos';

function isBrowser() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson(key, fallback) {
    if (!isBrowser()) return fallback;

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function writeJson(key, value) {
    if (!isBrowser()) return value;
    window.localStorage.setItem(key, JSON.stringify(value));
    return value;
}

export function readAdminProdutos() {
    return readJson(PRODUCTS_KEY, []);
}

export function writeAdminProdutos(produtos) {
    return writeJson(PRODUCTS_KEY, produtos);
}

export function upsertAdminProduto(produto) {
    const produtos = readAdminProdutos();
    const nextId = produto.id ?? Date.now();
    const nextProduto = { ...produto, id: nextId };
    const exists = produtos.some((item) => item.id === nextId);

    return writeAdminProdutos(
        exists
            ? produtos.map((item) => item.id === nextId ? nextProduto : item)
            : [nextProduto, ...produtos]
    );
}

export function removeAdminProduto(id) {
    return writeAdminProdutos(readAdminProdutos().filter((item) => item.id !== id));
}

export function toggleAdminProduto(id) {
    return writeAdminProdutos(
        readAdminProdutos().map((item) => item.id === id ? { ...item, ativo: !item.ativo } : item)
    );
}

export function readAdminPedidos() {
    return readJson(ORDERS_KEY, []);
}

export function writeAdminPedidos(pedidos) {
    return writeJson(ORDERS_KEY, pedidos);
}

export function updateAdminPedidoStatus(id, status) {
    return writeAdminPedidos(
        readAdminPedidos().map((pedido) => pedido.id === id ? { ...pedido, status } : pedido)
    );
}

export function getDashboardMetrics(pedidos = readAdminPedidos()) {
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth();

    const pedidosMes = pedidos.filter((pedido) => {
        if (!pedido.criadoEm) return false;
        const dataPedido = new Date(pedido.criadoEm);
        return dataPedido.getFullYear() === anoAtual && dataPedido.getMonth() === mesAtual;
    });

    const vendasMes = pedidosMes
        .filter((pedido) => pedido.status !== 'CANCELADO')
        .reduce((total, pedido) => total + Number(pedido.total || 0), 0);

    const entregasPendentes = pedidos.filter(
        (pedido) => pedido.status === 'PENDENTE' || pedido.status === 'EM_ROTA'
    ).length;

    const lucroMes = Number((vendasMes * 0.53).toFixed(2));
    const ticketMedio = pedidosMes.length ? Number((vendasMes / pedidosMes.length).toFixed(2)) : 0;

    return {
        vendasMes,
        pedidosMes: pedidosMes.length,
        entregasPendentes,
        lucroMes,
        ticketMedio,
    };
}