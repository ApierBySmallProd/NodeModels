import { DbManager, GlobalModel, MigrationManager, TableField } from '../..';

import { expect as chaiexp } from 'chai';

describe.each([
  ['MariaDB', 'maria'],
  ['MySql', 'mysql'],
  ['PostgresSql', 'postgres'],
])('Seed table migration tests with %s', (dbName: string, name: string) => {
  let dbManager: DbManager;
  let model: GlobalModel;

  beforeAll(async (done) => {
    dbManager = DbManager.getInstance();
    dbManager.setConfig({ migrationPath: './src/_tests/migrations/_utils' });
    const m = dbManager.get(name);
    if (m) {
      model = m;
    } else {
      throw new Error(`Database connection not found ${name}`);
    }
    done();
  });

  test('Seed the categories table', async () => {
    const manager = new MigrationManager();
    await manager.migrate('test-create-table-1', name, true);
    await manager.migrate('test-create-table-2', name, true);
    await manager.migrate('test-alter-table-1', name, true);
    await manager.migrate('test-drop-table-1', name, true);
    await manager.migrate('test-seed-table-1', name, true);
    const res = await model.select(
      'categories',
      false,
      [],
      [],
      [],
      '',
      -1,
      -1,
      [],
      [],
      [],
    );
    chaiexp(res.length).to.be.equal(2);
  });

  test('Rollback the seed on the categories table', async () => {
    const manager = new MigrationManager();
    await manager.migrate('test-create-table-1', name, true);
    await manager.migrate('test-create-table-2', name, true);
    await manager.migrate('test-alter-table-1', name, true);
    await manager.migrate('test-drop-table-1', name, true);
    await manager.migrate('test-seed-table-1', name, true);
    const res = await model.select(
      'categories',
      false,
      [],
      [],
      [],
      '',
      -1,
      -1,
      [],
      [],
      [],
    );
    chaiexp(res.length).to.be.equal(2);
    await manager.reset('test-seed-table-1', name, true);
    const res2 = await model.select(
      'categories',
      false,
      [],
      [],
      [],
      '',
      -1,
      -1,
      [],
      [],
      [],
    );
    chaiexp(res2.length).to.be.equal(0);
  });

  afterEach(async (done) => {
    await model.removeTable('categories');
    await model.removeTable('migrations');
    done();
  });
});
