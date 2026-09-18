import { Router } from 'express';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/password';
import { signAuthToken } from '../lib/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

// Cadastro do cuidador (quem usa o app para configurar os remédios do idoso —
// ver spec do app-intake). Login/cadastro do idoso em si não existe: ele só
// recebe e confirma alarmes, sem precisar de conta própria no MVP.
authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Nunca revelar se o e-mail já existe (evita user enumeration —
    // checklist do security-reviewer). Resposta genérica em ambos os casos.
    return res.status(202).json({ message: 'Se os dados forem válidos, você receberá um e-mail de confirmação.' });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({ data: { name, email, passwordHash } });

  // TODO(backend-dev): gerar token de verificação de uso único (expira em 1h),
  // persistir e montar verifyUrl real antes de ir para produção.
  const verifyUrl = `https://app.remediaja.com.br/verify?token=${randomUUID()}`;
  await sendVerificationEmail(email, name, verifyUrl);

  return res.status(202).json({ message: 'Se os dados forem válidos, você receberá um e-mail de confirmação.' });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const genericError = () => res.status(401).json({ error: 'E-mail ou senha inválidos.' });

  if (!user?.passwordHash) return genericError();
  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) return genericError();

  const token = signAuthToken({ userId: user.id, role: user.role });
  return res.json({ token });
});

// Login social — Google e Apple, no mínimo (padrão obrigatório do kit).
// O app mobile/admin obtém o idToken via SDK nativo e manda pra cá; o
// backend valida o token com o provedor antes de emitir o JWT próprio.
authRouter.post('/google', async (req, res) => {
  // TODO(backend-dev): validar req.body.idToken com google-auth-library
  // antes de criar/logar o usuário. Nunca confiar no idToken sem validar.
  return res.status(501).json({ error: 'Login com Google ainda não implementado neste scaffold.' });
});

authRouter.post('/apple', async (req, res) => {
  // TODO(backend-dev): validar req.body.idToken com apple-signin-auth
  // antes de criar/logar o usuário.
  return res.status(501).json({ error: 'Login com Apple ainda não implementado neste scaffold.' });
});

const forgotPasswordSchema = z.object({ email: z.string().email() });

authRouter.post('/forgot-password', async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    // TODO(backend-dev): token de uso único com expiração de 1h, persistido.
    const resetUrl = `https://app.remediaja.com.br/reset-password?token=${randomUUID()}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
  }
  // Resposta genérica sempre — nunca revelar se o e-mail existe.
  return res.status(202).json({ message: 'Se o e-mail existir, você receberá instruções de recuperação.' });
});
