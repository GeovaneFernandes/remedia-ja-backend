import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';

export const medicationsRouter = Router();
medicationsRouter.use(requireAuth, requireRole('CAREGIVER'));

const elderlySchema = z.object({ name: z.string().min(2), expoPushToken: z.string().optional() });

// Cadastro do idoso pelo cuidador.
medicationsRouter.post('/elderly-profiles', async (req: AuthedRequest, res) => {
  const parsed = elderlySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const elderly = await prisma.elderlyProfile.create({
    data: { ...parsed.data, caregiverId: req.auth!.userId },
  });
  return res.status(201).json(elderly);
});

medicationsRouter.get('/elderly-profiles', async (req: AuthedRequest, res) => {
  const elderlyProfiles = await prisma.elderlyProfile.findMany({
    where: { caregiverId: req.auth!.userId },
    include: { medications: true },
  });
  return res.json(elderlyProfiles);
});

const medicationSchema = z.object({
  elderlyId: z.string(),
  name: z.string().min(1),
  dosage: z.string().min(1),
  timesOfDay: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
});

medicationsRouter.post('/medications', async (req: AuthedRequest, res) => {
  const parsed = medicationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // Garante que o idoso pertence a este cuidador antes de criar o remédio.
  const elderly = await prisma.elderlyProfile.findFirst({
    where: { id: parsed.data.elderlyId, caregiverId: req.auth!.userId },
  });
  if (!elderly) return res.status(404).json({ error: 'Perfil de idoso não encontrado.' });

  const medication = await prisma.medication.create({ data: parsed.data });
  return res.status(201).json(medication);
});
