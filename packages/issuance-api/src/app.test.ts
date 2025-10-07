import request from 'supertest';
import app from './app';
import fs from 'fs/promises';
import path from 'path';

const CREDENTIALS_FILE = path.join(__dirname, '..', '..', 'credentials.json');

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe('POST /issue', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (fs.readFile as jest.Mock).mockClear();
    (fs.writeFile as jest.Mock).mockClear();
  });

  it('should issue a new credential', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]'); // No existing credentials

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/issue').send({ credential });

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toMatch(/Credential issued by worker-/);
    expect(fs.readFile).toHaveBeenCalledWith(CREDENTIALS_FILE, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      CREDENTIALS_FILE,
      JSON.stringify([
        expect.objectContaining({ id: '123', credential: JSON.stringify(credential) })
      ], null, 2),
      'utf-8'
    );
  });

  it('should not issue an existing credential', async () => {
    const existingCredential = { id: '123', credential: JSON.stringify({ id: '123' }), workerId: 'worker-old', issuedAt: new Date().toISOString() };
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingCredential]));

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/issue').send({ credential });

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toEqual('Credential already issued.');
    expect(fs.readFile).toHaveBeenCalledWith(CREDENTIALS_FILE, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled(); // Should not write if already exists
  });

  it('should return 400 for invalid credential format', async () => {
    const res = await request(app).post('/issue').send({ credential: { data: 'test' } });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toContain('Invalid credential format');
    expect(fs.readFile).not.toHaveBeenCalled();
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should handle file read errors', async () => {
    (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File read error'));

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/issue').send({ credential });

    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toEqual('Internal server error');
    expect(fs.readFile).toHaveBeenCalledWith(CREDENTIALS_FILE, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should handle file not found (ENOENT) by returning empty array', async () => {
    const error = new Error('File not found') as any;
    error.code = 'ENOENT';
    (fs.readFile as jest.Mock).mockRejectedValueOnce(error);

    const credential = { id: '123', data: 'test' };
    const res = await request(app).post('/issue').send({ credential });

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toMatch(/Credential issued by worker-/);
    expect(fs.readFile).toHaveBeenCalledWith(CREDENTIALS_FILE, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalled();
  });
});