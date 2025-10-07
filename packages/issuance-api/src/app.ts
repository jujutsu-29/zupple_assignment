import express from 'express';
import { openDb } from './database';
import os from 'os';

const app = express();
app.use(express.json());

// A simple CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/issue', async (req, res) => {
  const { credential } = req.body;

  if (!credential || !credential.id) {
    return res.status(400).json({ message: 'Invalid credential format. It must be a JSON object with an id property.' });
  }

  const db = await openDb();

  try {
    const existing = await db.get('SELECT id FROM credentials WHERE id = ?', credential.id);

    if (existing) {
      return res.status(409).json({ message: 'Credential already issued.' });
    }

    const workerId = `worker-${os.hostname()}`;
    await db.run(
      'INSERT INTO credentials (id, credential, workerId) VALUES (?, ?, ?)',
      credential.id,
      JSON.stringify(credential),
      workerId
    );

    res.status(201).json({ message: `Credential issued by ${workerId}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await db.close();
  }
});

export default app;
