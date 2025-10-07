import request from 'supertest';
import app from './app';
import { openDb } from './database';

// Mock the database module
jest.mock('./database');

describe('POST /issue', () => {
  let mockDb: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockDb = {
      get: jest.fn(),
      run: jest.fn(),
      close: jest.fn(),
    };
    (openDb as jest.Mock).mockResolvedValue(mockDb);
  });

  it('should issue a new credential', async () => {
    mockDb.get.mockResolvedValue(undefined);

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/issue').send({ credential });

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toMatch(/Credential issued by worker-/);
    expect(mockDb.get).toHaveBeenCalledWith('SELECT id FROM credentials WHERE id = ?', '123');
    expect(mockDb.run).toHaveBeenCalled();
  });

  it('should not issue an existing credential', async () => {
    mockDb.get.mockResolvedValue({ id: '123' });

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/issue').send({ credential });

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toEqual('Credential already issued.');
    expect(mockDb.get).toHaveBeenCalledWith('SELECT id FROM credentials WHERE id = ?', '123');
    expect(mockDb.run).not.toHaveBeenCalled();
  });

  it('should return 400 for invalid credential format', async () => {
    const res = await request(app).post('/issue').send({ credential: { data: 'test' } });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Invalid credential format');
  });

  it('should handle database errors', async () => {
    const errorMessage = 'Database error';
    mockDb.get.mockRejectedValue(new Error(errorMessage));

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/issue').send({ credential });

    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toEqual('Internal server error');
  });
});