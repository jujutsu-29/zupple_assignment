import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = '../../credential.db';

export const openDb = async () => {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database,
  });
};
