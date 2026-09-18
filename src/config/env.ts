import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET', 'change-me-in-production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Remedia Já <naoresponda@remediaja.com.br>',
  expoPushAccessToken: process.env.EXPO_PUSH_ACCESS_TOKEN ?? '',
  reminderRepeatMinutes: Number(process.env.REMINDER_REPEAT_MINUTES ?? 15),
  reminderMaxAttempts: Number(process.env.REMINDER_MAX_ATTEMPTS ?? 2),
};
