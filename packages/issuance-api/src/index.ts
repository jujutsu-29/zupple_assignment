import app from './app';
import { initializeDb } from './database';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await initializeDb();
  app.listen(PORT, () => {
    console.log(`Issuance API server running on port ${PORT}`);
  });
};

startServer();
