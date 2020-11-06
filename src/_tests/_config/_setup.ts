import { DbManager } from '../..';
import { addDatabases } from './db.config';

process.env.NODE_ENV = 'test';

beforeAll(async (done) => {
  // Let's add all the databases
  const dbManager = DbManager.getInstance();
  await addDatabases(dbManager);
  done();
});

afterAll(async (done) => {
  const dbManager = DbManager.getInstance();
  await dbManager.clear();
  done();
});
