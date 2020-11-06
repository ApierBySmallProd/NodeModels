import { DbManager, GlobalModel, MigrationManager, TableField } from '../..';

import { expect as chaiexp } from 'chai';

describe.each([
  ['MariaDB', 'maria'],
  ['MySql', 'mysql'],
  ['PostgresSql', 'postgres'],
])('Create table migration tests with %s', (dbName: string, name: string) => {
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

  test('Create two tables with a relation between them', async () => {
    const manager = new MigrationManager();
    await manager.migrate('test-create-table-1', name, true);
    await manager.migrate('test-create-table-2', name, true);
  });

  test('Rollback the creation of the articles table', async () => {
    const manager = new MigrationManager();
    await manager.migrate('test-create-table-1', name, true);
    await manager.migrate('test-create-table-2', name, true);
    await manager.reset('test-create-table-2', name, true);
    const fakeField = new TableField('id', 'bigint');
    await model.createTable('articles', [fakeField]);
  });

  afterEach(async (done) => {
    await model.removeTable('articles');
    await model.removeTable('categories');
    await model.removeTable('migrations');
    done();
  });
});
