import { hashPassword, verifyPassword } from '../password';

describe('password hashing', () => {
  it('gera um hash diferente da senha original e valida corretamente', async () => {
    const hash = await hashPassword('minha-senha-forte');
    expect(hash).not.toBe('minha-senha-forte');
    await expect(verifyPassword(hash, 'minha-senha-forte')).resolves.toBe(true);
    await expect(verifyPassword(hash, 'senha-errada')).resolves.toBe(false);
  });
});
