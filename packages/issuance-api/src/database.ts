import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = '../../credential.db';

export const openDb = async (path: string = DB_PATH) => {
  return open({
    filename: path,
    driver: sqlite3.Database,
  });
};

export const initializeDb = async () => {
  const db = await openDb();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      credential TEXT NOT NULL,
      workerId TEXT NOT NULL,
      issuedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.close();
};
