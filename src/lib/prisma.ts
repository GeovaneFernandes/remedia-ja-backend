import { PrismaClient } from '@prisma/client';

// Instância única do Prisma Client, reaproveitada em toda a aplicação
// (nunca criar um novo PrismaClient por request).
export const prisma = new PrismaClient();
