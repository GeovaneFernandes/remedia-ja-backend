import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.resendApiKey);

// E-mails transacionais — padrão obrigatório definido em software-house-standards:
// provedor dedicado (Resend), nunca SMTP solto; sempre com fallback em texto plano.

export async function sendVerificationEmail(to: string, name: string, verifyUrl: string) {
  return resend.emails.send({
    from: env.emailFrom,
    to,
    subject: 'Confirme seu e-mail — Remedia Já',
    html: `<p>Olá, ${name}!</p><p>Confirme seu e-mail para começar a usar o Remedia Já:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Este link expira em 1 hora.</p>`,
    text: `Olá, ${name}! Confirme seu e-mail: ${verifyUrl} (expira em 1 hora)`,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  return resend.emails.send({
    from: env.emailFrom,
    to,
    subject: 'Recuperação de senha — Remedia Já',
    html: `<p>Olá, ${name}.</p><p>Clique para redefinir sua senha:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Se não foi você, ignore este e-mail. O link expira em 1 hora.</p>`,
    text: `Redefina sua senha: ${resetUrl} (expira em 1 hora). Se não foi você, ignore.`,
  });
}

// Escalonamento: disparado pelo reminder.service quando uma dose não é
// confirmada após REMINDER_MAX_ATTEMPTS lembretes (spec do app-intake).
export async function sendMissedDoseAlert(
  to: string,
  caregiverName: string,
  elderlyName: string,
  medicationName: string,
  scheduledFor: Date,
) {
  const when = scheduledFor.toLocaleString('pt-BR');
  return resend.emails.send({
    from: env.emailFrom,
    to,
    subject: `⚠️ ${elderlyName} não confirmou o remédio das ${when}`,
    html: `<p>Olá, ${caregiverName}.</p><p><strong>${elderlyName}</strong> não confirmou a dose de <strong>${medicationName}</strong> agendada para ${when}, mesmo após os lembretes automáticos.</p><p>Vale a pena checar com ${elderlyName} agora.</p>`,
    text: `${elderlyName} não confirmou a dose de ${medicationName} agendada para ${when}. Vale a pena checar agora.`,
  });
}
