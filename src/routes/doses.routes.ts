import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

export const dosesRouter = Router();

// Confirmação da dose. Sem token de usuário do idoso no MVP (ele não tem
// conta própria) — o app mobile chama este endpoint com um token de
// dispositivo/dose específico. Ver ARCHITECTURE.md para a decisão completa.
dosesRouter.post('/doses/:id/confirm', async (req, res) => {
  const dose = await prisma.doseLog.update({
    where: { id: req.params.id },
    data: { status: 'CONFIRMED', confirmedAt: new Date() },
  });
  return res.json(dose);
});

// Histórico de doses de um idoso — usado pelo cuidador para acompanhar adesão.
dosesRouter.get('/elderly-profiles/:elderlyId/doses', requireAuth, async (req: AuthedRequest, res) => {
  const elderly = await prisma.elderlyProfile.findFirst({
    where: { id: req.params.elderlyId, caregiverId: req.auth!.userId },
  });
  if (!elderly) return res.status(404).json({ error: 'Perfil de idoso não encontrado.' });

  const doses = await prisma.doseLog.findMany({
    where: { medication: { elderlyId: elderly.id } },
    orderBy: { scheduledFor: 'desc' },
    take: 100,
  });
  return res.json(doses);
});
