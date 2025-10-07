import express from 'express';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

const app = express();
app.use(express.json());

const CREDENTIALS_FILE = '/var/data/credentials.json'; // Path on Render persistent disk

// A simple CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

interface CredentialRecord {
  id: string;
  credential: string;
  workerId: string;
  issuedAt: string;
}

const readCredentials = async (): Promise<CredentialRecord[]> => {
  try {
    const data = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File not found, return empty array
      return [];
    }
    throw error;
  }
};

const writeCredentials = async (credentials: CredentialRecord[]) => {
  await fs.writeFile(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2), 'utf-8');
};

app.post('/issue', async (req, res) => {
  const { credential } = req.body;

  if (!credential || !credential.id) {
    return res.status(400).json({ message: 'Invalid credential format. It must be a JSON object with an id property.' });
  }

  try {
    const credentials = await readCredentials();

    const existing = credentials.find(c => c.id === credential.id);

    if (existing) {
      return res.status(409).json({ message: 'Credential already issued.' });
    }

    const workerId = `worker-${os.hostname()}`;
    const newCredentialRecord: CredentialRecord = {
      id: credential.id,
      credential: JSON.stringify(credential),
      workerId: workerId,
      issuedAt: new Date().toISOString(),
    };

    credentials.push(newCredentialRecord);
    await writeCredentials(credentials);

    res.status(201).json({ message: `Credential issued by ${workerId}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default app;
