# Arquitetura — Remedia Já Backend

## Decisões principais

- **Alarme híbrido (local + servidor)**: o horário do remédio dispara uma
  notificação agendada *localmente* no app do idoso (funciona mesmo sem
  rede no instante exato). O cron deste backend (`reminder.service.ts`,
  a cada minuto) é a autoridade sobre tentativas e quem decide escalar —
  ele também envia um push via Expo como reforço. Sem essa duplicidade, uma
  falha de rede no horário exato faria o idoso nunca ser alarmado.
- **Escalonamento**: após `REMINDER_MAX_ATTEMPTS` (padrão 2, a cada
  `REMINDER_REPEAT_MINUTES` = 15 min) sem confirmação, a dose é marcada
  `MISSED` e um e-mail é enviado ao cuidador. Essa é a rede de segurança
  pedida no intake.
- **Idoso sem conta própria no MVP**: o cuidador cadastra o `ElderlyProfile`
  e os remédios; o idoso só confirma a dose a partir da notificação, sem
  precisar fazer login. Simplifica bastante o uso para o público-alvo.
- **"Uso e downloads" no admin = uso dentro do app**: números reais de
  download de loja (Google Play/App Store) ficaram fora do MVP por
  exigirem conectar contas de desenvolvedor externas — decisão do intake.

## Módulos

- `routes/` — HTTP (auth, medications, doses, admin).
- `services/reminder.service.ts` — motor de lembrete/escalonamento.
- `lib/` — infraestrutura transversal (prisma, senha, JWT, e-mail, push).
- `prisma/schema.prisma` — modelo de dados.

## Pendências conhecidas (próximos agentes)

- Validação real de `idToken` do Google/Apple (`auth.routes.ts`) —
  `backend-dev`.
- Token de verificação/recuperação de senha ainda não persiste nem expira
  de fato (está com `TODO`) — `backend-dev` + `security-reviewer`.
- Cobertura de testes além do smoke test atual — `test-writer`.
- Revisão de segurança e LGPD completas — `security-reviewer`,
  `privacy-compliance`.
- CI/CD e ambientes de deploy — `deploy-engineer`.
