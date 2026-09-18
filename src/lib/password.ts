import argon2 from 'argon2';

// Hash de senha com Argon2id — padrão definido em software-house-standards.
// Nunca trocar por MD5/SHA/hash próprio.
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}
