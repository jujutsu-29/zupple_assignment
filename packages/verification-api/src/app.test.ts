import request from 'supertest';
import app from './app';
import { openDb } from './database';

// Mock the database module
jest.mock('./database');

describe('POST /verify', () => {
  let mockDb: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockDb = {
      get: jest.fn(),
      close: jest.fn(),
    };
    (openDb as jest.Mock).mockResolvedValue(mockDb);
  });

  it('should verify an existing credential', async () => {
    const dbResult = { workerId: 'worker-test', issuedAt: new Date().toISOString() };
    mockDb.get.mockResolvedValue(dbResult);

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/verify').send({ credential });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual(dbResult);
    expect(mockDb.get).toHaveBeenCalledWith('SELECT workerId, issuedAt FROM credentials WHERE id = ?', '123');
  });

  it('should not verify a non-existent credential', async () => {
    mockDb.get.mockResolvedValue(undefined);

    const credential = { id: '456', data: 'test' };
    const res = await request(app).post('/verify').send({ credential });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Credential not found.');
    expect(mockDb.get).toHaveBeenCalledWith('SELECT workerId, issuedAt FROM credentials WHERE id = ?', '456');
  });

  it('should return 400 for invalid credential format', async () => {
    const res = await request(app).post('/verify').send({ credential: { data: 'test' } });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Invalid credential format');
  });

  it('should handle database errors', async () => {
    const errorMessage = 'Database error';
    mockDb.get.mockRejectedValue(new Error(errorMessage));

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/verify').send({ credential });

    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toEqual('Internal server error');
  });
});
