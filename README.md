# Remedia Já — Backend

API que serve o app mobile (idoso/cuidador) e o painel administrativo web.
Segue os padrões definidos em `software-house-standards` (kit: `software-house-kit`).

## Stack

Node.js + Express + TypeScript, Prisma + PostgreSQL, Argon2id para senhas,
JWT para sessão, Resend para e-mail transacional, Expo Push API para
notificações no app.

## Como rodar localmente

1. `cp .env.example .env` e ajuste os valores (a `DATABASE_URL` padrão já
   funciona com o `docker-compose.yml`).
2. `docker compose up -d db mailhog` (sobe Postgres + captura local de e-mail).
3. `npm install`
4. `npm run prisma:migrate` (cria as tabelas).
5. `npm run dev` — API em `http://localhost:3001`, e-mails capturados em
   `http://localhost:8025`.

## Scripts

- `npm run dev` — servidor com reload automático.
- `npm run build` / `npm run start` — build e execução de produção.
- `npm test` — testes (unit + integração).
- `npm run lint` — lint.
- `npm run prisma:migrate` — aplica migrations do schema.

## Rotas principais

- `POST /auth/register`, `/auth/login`, `/auth/google`, `/auth/apple`,
  `/auth/forgot-password` — autenticação do cuidador.
- `POST /elderly-profiles`, `GET /elderly-profiles` — cadastro de idosos.
- `POST /medications` — cadastro de remédio/horários.
- `POST /doses/:id/confirm` — confirmação de dose pelo app.
- `GET /elderly-profiles/:id/doses` — histórico de doses.
- `GET /admin/metrics` — métricas agregadas para o painel admin.

## Status deste scaffold

Isto é o resultado do `repo-provisioner` + uma primeira passada do
`backend-dev` — a lógica central (lembrete, repetição, escalonamento,
hashing, e-mail) está implementada e testável, mas ainda **não** passou por
`test-writer` (cobertura completa), `qa-e2e-tester`, `security-reviewer`,
`privacy-compliance` nem `deploy-engineer`. Login social (Google/Apple) está
com a validação do token marcada como `TODO` — não usar em produção antes
disso.
