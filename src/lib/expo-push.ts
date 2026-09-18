import { env } from '../config/env';

// Push notification para o app mobile via Expo. Esta é a via de reforço
// (servidor→dispositivo); o alarme principal é agendado localmente no
// próprio app (ver notifications.ts do remedia-ja-mobile) para funcionar
// mesmo sem rede no exato horário da dose.
export async function sendExpoPush(expoPushToken: string, title: string, body: string, data?: Record<string, unknown>) {
  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(env.expoPushAccessToken ? { Authorization: `Bearer ${env.expoPushAccessToken}` } : {}),
    },
    body: JSON.stringify({ to: expoPushToken, title, body, data, sound: 'default', priority: 'high' }),
  });
  if (!res.ok) {
    throw new Error(`Falha ao enviar push Expo: ${res.status} ${await res.text()}`);
  }
  return res.json();
}
