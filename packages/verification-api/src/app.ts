import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const app = express();
app.use(express.json());

const CREDENTIALS_FILE = path.join(__dirname, '..', '..', 'credentials.json');

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

app.post('/verify', async (req, res) => {
  const { credential } = req.body;

  if (!credential || !credential.id) {
    return res.status(400).json({ message: 'Invalid credential format. It must be a JSON object with an id property.' });
  }

  try {
    const credentials = await readCredentials();

    const foundCredential = credentials.find(c => c.id === credential.id);

    if (foundCredential) {
      res.status(200).json({
        workerId: foundCredential.workerId,
        issuedAt: foundCredential.issuedAt,
      });
    } else {
      res.status(404).json({ message: 'Credential not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default app;
