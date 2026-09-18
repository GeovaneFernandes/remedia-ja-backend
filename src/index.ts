import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './routes/auth.routes';
import { medicationsRouter } from './routes/medications.routes';
import { dosesRouter } from './routes/doses.routes';
import { adminRouter } from './routes/admin.routes';
import { startReminderCron } from './services/reminder.service';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/auth', authRouter);
app.use(medicationsRouter);
app.use(dosesRouter);
app.use('/admin', adminRouter);

if (require.main === module) {
  startReminderCron();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`remedia-ja-backend rodando na porta ${env.port}`);
  });
}
