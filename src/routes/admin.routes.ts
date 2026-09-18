import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('ADMIN'));

// Métricas de uso para o painel administrativo (remedia-ja-admin).
// "Uso e downloads" no spec do app-intake = uso dentro do app; números de
// download de loja ficaram fora do MVP (exigiriam conectar contas de
// desenvolvedor do Google Play/App Store — ver ARCHITECTURE.md).
adminRouter.get('/metrics', async (_req, res) => {
  const [activeCaregivers, activeElderly, totalDoses, confirmedDoses, missedDoses] = await Promise.all([
    prisma.user.count({ where: { role: 'CAREGIVER' } }),
    prisma.elderlyProfile.count(),
    prisma.doseLog.count(),
    prisma.doseLog.count({ where: { status: 'CONFIRMED' } }),
    prisma.doseLog.count({ where: { status: 'MISSED' } }),
  ]);

  const adherenceRate = totalDoses === 0 ? null : Math.round((confirmedDoses / totalDoses) * 100);

  return res.json({
    activeCaregivers,
    activeElderly,
    totalDoses,
    confirmedDoses,
    missedDoses,
    adherenceRate,
  });
});
