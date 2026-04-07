### 3.3.2 Processo 2 – Processo de Venda


<img width="1147" height="538" alt="image" src="https://github.com/user-attachments/assets/043bdf9a-9eb8-4df2-a4b8-3ba9c257510c" />


1. Início e Navegação no Site 
O processo de venda se inicia quando o cliente acessa o site da floricultura e visualiza os produtos 
disponíveis. O sistema apresenta a interface de navegação, permitindo que o usuário explore as opções 
de flores, arranjos e presentes. O cliente então executa a tarefa “Selecionar produto”, escolhendo o item 
desejado e adicionando-o ao carrinho por meio da tarefa “Adicionar ao carrinho”.

2. Montagem do Carrinho de Compras 
Após adicionar um item, o sistema direciona o fluxo para uma decisão: “Deseja continuar comprando?”. 
• Caso a resposta seja sim, o cliente retorna à navegação de produtos.  
• Caso seja não, o fluxo segue para a tarefa “Ir para o carrinho”.  

3. Identificação do Cliente
Ao acessar o carrinho, o sistema solicita a identificação do cliente por meio de login ou cadastro.
• Caso o cliente não esteja cadastrado, ele executa a tarefa “Cadastrar cliente”. Após o cadastro,
  o sistema envia os dados para o processo de cliente, gerando um evento de “Cadastro enviado para o Processo Cliente”.  
• Caso já possua cadastro, o processo segue normalmente para a próxima etapa.

4. Dados de Entrega
Após a identificação do cliente, ele confirma os dados necessários para entrega.
O sistema apresenta a tarefa “Confirmar dados para entrega”, onde o cliente informa endereço, tipo de frete e demais informações.
O sistema então verifica a decisão “Dados de entrega corretos?”.
• Caso não estejam corretos, o cliente permanece na mesma etapa para realizar os ajustes necessários.  
• Caso estejam corretos, o processo segue para a próxima etapa.

5. Revisão e Validação do Pedido
Após a confirmação dos dados de entrega, o cliente realiza a tarefa “Revisar pedido”, onde pode verificar quantidades, valores e itens selecionados.
Em seguida, o sistema apresenta a decisão “Pedido está correto?”.
• Caso não esteja correto, o fluxo retorna para a etapa de confirmação dos dados de entrega para ajustes.
• Caso esteja tudo correto, o processo continua para a finalização da compra.

6. Finalização da Venda
Na etapa final, o cliente executa a tarefa “Finalizar compra”, consolidando o pedido.
Neste momento, o sistema envia o pedido para o processo de pagamento, gerando um evento de mensagem que
representa a transição entre o processo de venda e o processo de pagamento.

---

**Selecionar produto / Adicionar ao carrinho**

|       **Campo**      |    **Tipo**   |      **Restrições**      | **Valor default** |
|----------------------|---------------|--------------------------|-------------------|
|  Quantidade          | Número        | Maior que 0              |        1          |
|  Opções de embalagem | Seleção única | Obrigatório              |      Padrão       |
|  Mensagem do cartão  | Área de texto | Máximo de 250 caracteres |                   |

| **Camandos** |                  **Destino**                     | **Tipo** |
|--------------|--------------------------------------------------|----------|
| Adicionar    | Ir para o carrinho / Deseja continuar comprando? | Default  |
| Cancelar     | Visualizar produtos no site | Obrigatório        | Cancel   |

---

**Revisar Pedido**

|     **Campo**     |     **Tipo**   |        **Restrições**          | 
|-------------------|----------------|--------------------------------|
| Lista de Produtos | Tabela         | Não editável (exceto exclusão) |    
| Quantidade        | Número         | Maior que 0                    | 
| Cupom de desconto | Caixa de texto |                                | 

| **Camandos** |                  **Destino**                     | **Tipo** |
|--------------|--------------------------------------------------|----------|
| Adicionar    | Ir para o carrinho / Deseja continuar comprando? | Default  |
| Cancelar     | Visualizar produtos no site | Obrigatório        | Cancel   |

---

**Indentificar cliente (login ou cadastro)**

|      **Campo**     |     **Tipo**     |        **Restrições**       |
|--------------------|------------------|-----------------------------|
| e-mail             | Caixa de texto   | Formato de e-mail           |                   
| senha              | Caixa de texto   | Mínimo de 8 caracteres      |                  

|  **Comandos** |        **Destino**              |  **Tipo**  | 
|---------------|---------------------------------|------------|
| Entrar        | Confirmar dados para entrega    | Default    | 
| Cadastrar     | Cadastrar Cliente               |            |

---

**Cadastrar Cliente**

|      **Campo**     |     **Tipo**     |      **Restrições**     |
|--------------------|------------------|-------------------------|
| Nome Completo      | Caixa de texto   | Obrigatório             |
| CPF                | Caixa de texto   | Formato 000.000.000-00  |                   
| E-mail             | Caixa de texto   | Formato de e-mail       |                    
| Data de Nascimento | Data             | Formato dd-mm-aaaa      |                   
| Senha              | Caixa de texto   | Mínimo de 8 caracteres  |   

|  **Comandos** |               **Destino**               |  **Tipo**  | 
|---------------|-----------------------------------------|------------|
| Salvar        | Confirmar dados para entrega            | Default    | 
| Cancelar      | Identificar cliente (login ou cadastro) | Cancel     |

---

**Confirmar dados para entrega**

|      **Campo**     |     **Tipo**     |    **Restrições**   | **Valor default** | 
|--------------------|------------------|---------------------|-------------------|
| CEP                | Caixa de texto   | Formato 00000-000   |                   | 
| Endereço           | Caixa de texto   | Obrigatório         |                   | 
| Número             | Número           | Maior que 0         |                   | 
| Complemento        | Caixa de texto   |                     |                   | 
| Tipo de Frete      | Seleção única    | Obrigatório         | Padrão            |

|  **Comandos** |      **Destino**  |  **Tipo**  | 
|---------------|-------------------|------------|
| Confirmar     | Finalizar compra  | Default    | 
| Voltar        | Revisar Pedido    | Cancel     |

---

**Finalizar compra**

|      **Campo**     |   **Tipo**    |     **Restrições**    | **Valor default** | 
|--------------------|---------------|-----------------------|-------------------|
| Resumo da Venda    | Tabela        | Não editável          |                   | 
| Forma de Pagamento | Seleção única | Cartão, Pix ou Boleto | Pix               |

|  **Comandos** |          **Destino**          |  **Tipo**  | 
|---------------|-------------------------------|------------|
| Pagar         | Enviar pedido para pagamento  | Default    | 
| Cancelar      | Início da venda               | Cancel     |

---

