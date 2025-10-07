import request from 'supertest';
import app from './app';
import fs from 'fs/promises';
import path from 'path';

const CREDENTIALS_FILE = path.join(__dirname, '..', '..', 'credentials.json');

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

describe('POST /verify', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (fs.readFile as jest.Mock).mockClear();
  });

  it('should verify an existing credential', async () => {
    const issuedAt = new Date().toISOString();
    const existingCredential = { id: '123', credential: JSON.stringify({ id: '123' }), workerId: 'worker-test', issuedAt };
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingCredential]));

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/verify').send({ credential });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({
      workerId: 'worker-test',
      issuedAt: issuedAt,
    });
    expect(fs.readFile).toHaveBeenCalledWith(CREDENTIALS_FILE, 'utf-8');
  });

  it('should not verify a non-existent credential', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]'); // No existing credentials

    const credential = { id: '456', data: 'test' };
    const res = await request(app).post('/verify').send({ credential });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Credential not found.');
    expect(fs.readFile).toHaveBeenCalledWith(CREDENTIALS_FILE, 'utf-8');
  });

  it('should return 400 for invalid credential format', async () => {
    const res = await request(app).post('/verify').send({ credential: { data: 'test' } });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Invalid credential format');
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it('should handle file read errors', async () => {
    (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File read error'));

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/verify').send({ credential });

    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toEqual('Internal server error');
    expect(fs.readFile).toHaveBeenCalledWith(CREDENTIALS_FILE, 'utf-8');
  });

  it('should handle file not found (ENOENT) by returning empty array', async () => {
    const error = new Error('File not found') as any;
    error.code = 'ENOENT';
    (fs.readFile as jest.Mock).mockRejectedValueOnce(error);

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/verify').send({ credential });

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Credential not found.');
    expect(fs.readFile).toHaveBeenCalledWith(CREDENTIALS_FILE, 'utf-8');
  });
});
