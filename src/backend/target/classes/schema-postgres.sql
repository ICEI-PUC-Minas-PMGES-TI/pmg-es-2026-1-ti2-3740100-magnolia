-- ═══════════════════════════════════════════════════════════════
-- Jardim Magnólia — Schema PostgreSQL
-- Execute no banco "jardimmagnolia" antes de rodar a aplicação
-- em modo "prod"
-- ═══════════════════════════════════════════════════════════════

-- Cria banco (rode como superusuário, fora de uma transação)
-- CREATE DATABASE jardimmagnolia;
-- \c jardimmagnolia

-- ─── Produto ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS produto (
    id              BIGSERIAL     PRIMARY KEY,
    nome            VARCHAR(255)  NOT NULL,
    descricao       TEXT,
    preco           NUMERIC(10,2) NOT NULL CHECK (preco > 0),
    estoque         INTEGER       NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    ativo           BOOLEAN       NOT NULL DEFAULT TRUE,
    categoria       VARCHAR(50)   NOT NULL DEFAULT 'BUQUES',
    imagem_url      VARCHAR(512),
    imagens_extras  TEXT,
    criado_em       TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ─── Cliente ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cliente (
    id          BIGSERIAL    PRIMARY KEY,
    nome        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    senha_hash  VARCHAR(255) NOT NULL,
    criado_em   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ─── Pedido ───────────────────────────────────────────────────
CREATE TYPE status_pedido AS ENUM (
    'PENDENTE', 'EM_ROTA', 'ENTREGUE', 'CANCELADO'
);

CREATE TABLE IF NOT EXISTS pedido (
                                      id                 BIGSERIAL     PRIMARY KEY,
                                      cliente_id         BIGINT        NOT NULL REFERENCES cliente(id),
    cliente_nome       VARCHAR(255)  NOT NULL,
    cliente_email      VARCHAR(255),
    cliente_telefone   VARCHAR(20),
    endereco_entrega   TEXT          NOT NULL,
    metodo_pagamento   VARCHAR(80)   NOT NULL DEFAULT 'DINHEIRO_NA_ENTREGA',
    total              NUMERIC(10,2) NOT NULL,
    status             status_pedido NOT NULL DEFAULT 'PENDENTE',
    criado_em          TIMESTAMP     NOT NULL DEFAULT NOW()
    );

-- ─── Pedido Item ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pedido_item (
                                           id              BIGSERIAL     PRIMARY KEY,
                                           pedido_id       BIGINT        NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    produto_id      BIGINT        NOT NULL REFERENCES produto(id),
    quantidade      INTEGER       NOT NULL CHECK (quantidade > 0),
    preco_unitario  NUMERIC(10,2) NOT NULL
    );

-- ─── Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pedido_status    ON pedido(status);
CREATE INDEX IF NOT EXISTS idx_pedido_criado_em ON pedido(criado_em);
CREATE INDEX IF NOT EXISTS idx_produto_ativo    ON produto(ativo);
CREATE INDEX IF NOT EXISTS idx_item_pedido      ON pedido_item(pedido_id);

-- ─── Dados iniciais ───────────────────────────────────────────
INSERT INTO produto (nome, descricao, preco, estoque, ativo) VALUES
                                                                 ('Buquê com 6 Rosas Colombianas Vermelhas',
                                                                  'Elegante buquê com seis rosas grandes em papel de ceda branco com laço de cetim.',
                                                                  149.90, 28, true),
                                                                 ('Buquê de Rosas Pink Plantation Para Entrega',
                                                                  'Buquê exclusivo com rosas pink colombianas.',
                                                                  189.90, 15, true),
                                                                 ('Cesta de Presentes com Buquê de Margaridas',
                                                                  'Cesta completa com flores e itens especiais.',
                                                                  210.00, 8,  true),
                                                                 ('Orquídea Phalaenopsis Pink Plantada Para Entrega',
                                                                  'Orquídea phalaenopsis em vaso elegante.',
                                                                  179.41, 0,  false),
                                                                 ('Buquê de 30 Rosas Colombianas Para Entrega',
                                                                  'Luxuoso buquê com 30 rosas colombianas selecionadas.',
                                                                  349.90, 5,  true)
    ON CONFLICT DO NOTHING;

-- ─── Avaliação ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS avaliacao (
                                         id            BIGSERIAL PRIMARY KEY,
                                         cliente_id    BIGINT NOT NULL REFERENCES cliente(id),
    cliente_nome  VARCHAR(255) NOT NULL,
    comentario    TEXT NOT NULL,
    nota          INTEGER NOT NULL CHECK (nota BETWEEN 1 AND 5),
    produto_nome  VARCHAR(255),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    criado_em     TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE INDEX IF NOT EXISTS idx_avaliacao_status ON avaliacao(status);

-- ─── Movimentação de Estoque ──────────────────────────────────
CREATE TABLE IF NOT EXISTS movimentacao_estoque (
    id              BIGSERIAL     PRIMARY KEY,
    produto_id      BIGINT        NOT NULL REFERENCES produto(id),
    produto_nome    VARCHAR(255)  NOT NULL,
    tipo            VARCHAR(10)   NOT NULL CHECK (tipo IN ('ENTRADA', 'SAIDA')),
    quantidade      INTEGER       NOT NULL CHECK (quantidade > 0),
    estoque_antes   INTEGER       NOT NULL,
    estoque_depois  INTEGER       NOT NULL,
    observacao      TEXT,
    criado_em       TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mov_produto    ON movimentacao_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_mov_criado_em  ON movimentacao_estoque(criado_em DESC);