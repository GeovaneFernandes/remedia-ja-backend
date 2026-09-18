import request from 'supertest';
import { app } from '../index';

describe('GET /health', () => {
  it('responde 200 com status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
