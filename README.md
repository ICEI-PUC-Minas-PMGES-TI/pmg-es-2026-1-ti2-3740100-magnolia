
# Jardim Magnólia

O projeto Jardim Magnólia tem como objetivo desenvolver uma plataforma de e-commerce voltada para floriculturas, reunindo diferentes lojas em um único ambiente digital. A proposta busca transformar o modelo tradicional de vendas, permitindo que floriculturas cadastrem seus produtos e serviços, como buquês e arranjos, e os disponibilizem de forma prática e organizada para os clientes. Dessa forma, a plataforma atua como um shopping virtual, facilitando a conexão entre vendedores e consumidores.

Além disso, o sistema pretende reduzir a dependência de processos manuais, como atendimentos via redes sociais, automatizando pedidos, pagamentos e gestão de estoque. Com isso, o projeto visa ampliar o alcance das floriculturas parceiras, aumentar suas vendas e proporcionar uma experiência mais ágil, acessível e eficiente para os clientes que desejam comprar flores online.

## Integrantes

- Ana Luiza Cavalcante Oliveira
- Andre Fortini de Mello
- Cauã Thomarco Thomaz Teixeira
- Guilherme Augusto Silva Machado
- Júlia Fonseca Lasmar
- Sofia Figueiredo de Oliveira

## Professor

- Lucca Soares de Paiva Lacerda
- Luiz Carlos da Silva
- Michelle Hanne Soares de Andrade

## Instruções de utilização

As instruções completas para instalar dependências e executar o projeto estão em:

[src/README.md](src/README.md)

## Histórico de versões

* **0.0.1**
    * Trabalhando na modelagem do processo de negócio.

* **0.1.0**
    * FEATURE: back-end implementado com Spring Boot 3 e JPA/Hibernate.
    * FEATURE: entidades: `Cliente`, `Produto`, `Pedido`, `PedidoItem`, `Endereco`, `Avaliacao`, `Contato`.
    * FEATURE: API REST com suporte a perfis `dev` (H2) e `prod` (PostgreSQL).
    * FEATURE: upload de imagens de produtos.
    * DOCS: modelagem do banco de dados e processos de negócio.

* **0.2.0**
    * FEATURE: front-end implementado com React 18 e Vite — páginas: Home, Produto, Carrinho, Login, Cadastro, Presentes, Dicas.
    * FEATURE: carrinho de compras com controle de quantidade e finalização de pedido.
    * FEATURE: autenticação de clientes (registro e login com hash SHA-256).
    * FEATURE: filtro de produtos por categoria e busca por nome.
    * FEATURE: página de produto com galeria de imagens, avaliações e seleção de data de entrega.

* **0.3.0**
    * FEATURE: painel administrativo com abas de Produtos, Pedidos, Clientes e Movimentações.
    * FEATURE: gestão completa de produtos (criar, editar, ativar/desativar, upload de imagem).
    * FEATURE: gerenciamento de pedidos com atualização de status (Pendente → Em Rota → Entregue).
    * FEATURE: página "Minha Conta" do cliente (histórico de pedidos, gerenciamento de endereços, avaliações, exclusão de conta).
    * FEATURE: busca de CEP automática no cadastro de endereço.
    * FEATURE: sistema de avaliações de produtos com moderação pelo admin.
    * FEATURE: página de contato integrada ao banco de dados.

* **0.4.0**
    * FEATURE: sistema completo de movimentação de estoque com log de auditoria (impede subtração maior que o estoque disponível).
    * FEATURE: modal de movimentação no painel admin (tipo Entrada/Saída, quantidade, observação).
    * FEATURE: aba "Movimentações" no painel admin com métricas, filtros e histórico completo.
    * FEATURE: tabela `movimentacao_estoque` adicionada ao banco de dados.
    * FEATURE: endpoints REST — `GET /api/movimentacoes`, `GET /api/movimentacoes/produto/{id}`, `POST /api/movimentacoes`.

* **0.5.0**
    * SEGURANÇA: removido campo `senhaPlana` da entidade `Cliente` — senhas agora armazenadas apenas com hash SHA-256.
    * SEGURANÇA: endpoint `/clientes` do admin não expõe mais dados de senha.
    * CORREÇÃO: `atualizarStatus` e `confirmar` no painel admin corrigidos para atualizar o estado somente após sucesso da API.
    * MELHORIA: campo estoque removido do formulário de edição de produto — estoque gerenciado exclusivamente via movimentações.

* **0.6.0**
    * MELHORIA: sistema de fontes atualizado — Raleway e DM Sans substituem Cormorant Garamond nos títulos e menus.
    * MELHORIA: logo e banner principal linkados ao site a partir da pasta `public/images/`.
    * CORREÇÃO: remoção de arquivos desnecessários do repositório (`.idea/`, `target/`, `data/*.db`).
    * DOCS: `.gitignore` criado para ignorar arquivos de IDE, banco local e dependências.
    * DOCS: diagrama BPMN do processo de movimentação de estoque criado (`docs/processo-movimentacao-estoque.bpmn`).

* **0.7.0**
    * CORREÇÃO: breadcrumb sem borda ao redor do botão "Início" na página do produto.
    * CORREÇÃO: footer desformatado na página do produto (movido para fora do contêiner restrito).
    * CORREÇÃO: itens do menu de navegação aparecendo todos selecionados ao mesmo tempo.
    * MELHORIA: espaçamento entre botões de data de entrega na página do produto.
    * MELHORIA: navegação por datas futuras na página do produto (setas ‹ / ›).
    * DOCS: instruções de execução adicionadas ao `src/README.md`.
    * DOCS: modelo relacional (DBML) atualizado com correções do professor.
    * DOCS: diagrama BPMN do processo do cliente criado (`docs/processo-cliente.bpmn`).
