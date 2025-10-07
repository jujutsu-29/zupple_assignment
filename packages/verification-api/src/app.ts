import express from 'express';
import { openDb } from './database';

const app = express();
app.use(express.json());

// A simple CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

app.post('/verify', async (req, res) => {
  const { credential } = req.body;

  if (!credential || !credential.id) {
    return res.status(400).json({ message: 'Invalid credential format. It must be a JSON object with an id property.' });
  }

  const db = await openDb();

  try {
    const result = await db.get(
      'SELECT workerId, issuedAt FROM credentials WHERE id = ?',
      credential.id
    );

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: 'Credential not found.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await db.close();
  }
});

export default app;
