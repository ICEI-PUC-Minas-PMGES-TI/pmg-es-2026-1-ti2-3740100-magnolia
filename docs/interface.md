
## 6. Interface do sistema

_Visão geral da interação do usuário por meio das telas do sistema. Apresente as principais interfaces da plataforma._

## 6.1. Tela principal do sistema

A tela principal do Jardim Magnólia é o ponto de entrada da plataforma e está organizada em quatro seções:

**Hero:** painel verde com formato orgânico exibindo foto de flores, o slogan "Presentes para quem você ama entregues hoje em todo o Brasil", destaque para entrega em até 3 horas e botão de acesso ao catálogo.

**Carrosséis de produtos:** oito carrosséis horizontais categorizados (Buquês, Orquídeas, Aniversário, Rosas, Campo, Presentes, Cestas e Plantas), cada card exibindo foto, nome, preço e botão de adicionar ao carrinho. A barra de busca da navegação filtra os produtos em tempo real nessas listagens.

**Avaliações:** grid com depoimentos de clientes reais, exibindo nota em estrelas, comentário, nome e data.

**Presentes Online:** grade de categorias de presentes com ícones e rótulos, com atalho para a página de presentes.

<img width="1366" height="720" alt="image" src="https://github.com/user-attachments/assets/09de2707-b55d-48fb-8fc0-6c6e7c7b6966" />



## 6.2. Telas do processo 1 (Estoque)

_Tela de autenticação e listagem de produtos._

A tela de **Login Admin** exibe um formulário centralizado com campos de e-mail e senha. Somente usuários com perfil de administrador têm acesso liberado; credenciais inválidas encerram o fluxo com mensagem de acesso negado.

![Login Admin](images/Telas/Admin.png)

Após autenticação bem-sucedida, a tela de **Produtos** apresenta a listagem completa do catálogo em formato de tabela, com as colunas: imagem, nome, categoria, preço, quantidade em estoque e status (ativo/inativo). Um botão de edição em cada linha permite selecionar o produto para ajuste de estoque.

![Produtos](images/Telas/Produtos.png)

_Tela de movimentação de estoque._

A tela de **Movimentação de Estoque** é exibida ao selecionar um produto para edição. Ela apresenta o nome do produto e o estoque atual em modo somente leitura, um campo numérico para informar a nova quantidade (valor obrigatório, maior ou igual a zero) e os botões **Salvar** — que valida e persiste a alteração no backend — e **Cancelar** — que retorna à listagem sem modificações. Após salvar com sucesso, a listagem é recarregada exibindo o estoque atualizado.

![Movimentação Estoque](images/Telas/Mov-estoque.png)


## 6.3. Telas do processo 2

_Descrição da tela relativa à atividade 1._

Tela da atividade 1

_Descrição da tela relativa à atividade 2._

Tela da atividade 2

