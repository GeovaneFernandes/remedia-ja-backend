import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import { sendExpoPush } from '../lib/expo-push';
import { sendMissedDoseAlert } from '../lib/email';
import { env } from '../config/env';

// Núcleo da regra do app-intake: alarme no horário, repete a cada
// REMINDER_REPEAT_MINUTES (padrão 15) se não confirmado, e após
// REMINDER_MAX_ATTEMPTS (padrão 2) tentativas sem confirmação, escala
// por e-mail para o cuidador.
//
// O alarme "principal" é agendado localmente no próprio app do idoso
// (ver remedia-ja-mobile/src/lib/notifications.ts) para funcionar mesmo
// sem rede exatamente no horário. Este cron do servidor é quem garante o
// reforço por push e, mais importante, a escalada — que só faz sentido
// centralizada no backend.

const REPEAT_MS = env.reminderRepeatMinutes * 60 * 1000;

export function startReminderCron() {
  // Roda a cada minuto — granularidade suficiente para um intervalo de 15min.
  cron.schedule('* * * * *', () => {
    processDueDoses().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[reminder.service] erro ao processar doses pendentes:', err);
    });
  });
}

export async function processDueDoses() {
  const now = new Date();

  const dueDoses = await prisma.doseLog.findMany({
    where: {
      status: 'PENDING',
      scheduledFor: { lte: now },
      OR: [
        { lastReminderAt: null },
        { lastReminderAt: { lte: new Date(now.getTime() - REPEAT_MS) } },
      ],
    },
    include: {
      medication: {
        include: {
          elderly: { include: { caregiver: true } },
        },
      },
    },
  });

  for (const dose of dueDoses) {
    const { elderly } = dose.medication;
    const nextAttempt = dose.attempts + 1;

    if (nextAttempt > env.reminderMaxAttempts) {
      // Esgotou as tentativas — marca como perdida e escala para o cuidador.
      await prisma.doseLog.update({
        where: { id: dose.id },
        data: { status: 'MISSED', escalatedAt: now },
      });
      await sendMissedDoseAlert(
        elderly.caregiver.email,
        elderly.caregiver.name,
        elderly.name,
        dose.medication.name,
        dose.scheduledFor,
      );
      continue;
    }

    if (elderly.expoPushToken) {
      await sendExpoPush(
        elderly.expoPushToken,
        'Hora do remédio 💊',
        `${elderly.name}, é hora de tomar ${dose.medication.name} (${dose.medication.dosage}).`,
        { doseLogId: dose.id },
      ).catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`[reminder.service] push falhou para dose ${dose.id}:`, err);
      });
    }

    await prisma.doseLog.update({
      where: { id: dose.id },
      data: { attempts: nextAttempt, lastReminderAt: now },
    });
  }
}
