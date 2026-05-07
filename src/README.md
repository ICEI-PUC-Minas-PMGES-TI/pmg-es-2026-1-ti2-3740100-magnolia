# Jardim Magnólia — Código do Projeto

[Código do front-end](src) — React + Vite

[Código do back-end](backend) — Spring Boot 3 + Maven

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Java (JDK) | 17 |
| Maven | 3.8 |
| Node.js | 18 |
| npm | 9 |

---

## Executando o Back-end

O back-end usa **H2** em modo de desenvolvimento (banco de dados em arquivo local, sem necessidade de instalar PostgreSQL).

```bash
# Dentro da pasta src/backend/
cd backend
mvn spring-boot:run
```

A API ficará disponível em: `http://localhost:8080`

> O banco de dados é criado automaticamente em `backend/data/jardim.mv.db` na primeira execução.

### Perfil de produção (PostgreSQL)

Para usar PostgreSQL, edite `backend/src/main/resources/application.properties` e troque o perfil:

```properties
spring.profiles.active=prod
```

Configure também as variáveis de conexão em `application-prod.properties`.

---

## Executando o Front-end

```bash
# Dentro da pasta src/src/
cd src
npm install
npm run dev
```

A aplicação ficará disponível em: `http://localhost:5173`

> O front-end espera o back-end rodando em `http://localhost:8080`. Caso o back-end esteja em outra URL, crie o arquivo `src/.env` com:
> ```
> VITE_API_URL=http://seu-host:porta/api
> ```

---

## Executando os dois juntos

Abra **dois terminais**:

**Terminal 1 — Back-end:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 — Front-end:**
```bash
cd src
npm install   # apenas na primeira vez
npm run dev
```

Acesse `http://localhost:5173` no navegador.

---

## Acesso ao painel administrativo

Na tela de login, clique em **"Acesso Admin"** e informe o código:

```
1011
```

---

## Scripts disponíveis (front-end)

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot-reload |
| `npm run build` | Gera a build de produção em `dist/` |
| `npm run preview` | Pré-visualiza a build de produção localmente |
