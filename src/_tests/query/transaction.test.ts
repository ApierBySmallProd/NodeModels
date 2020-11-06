import { DbManager, GlobalModel } from '../..';

import { expect as chaiexp } from 'chai';
import query from '../_utils/query';

describe.each([
  ['MariaDB', 'maria'],
  ['MySql', 'mysql'],
  ['PostgresSql', 'postgres'],
])('Transaction tests with %s', (dbName: string, name: string) => {
  let dbManager: DbManager;
  let model: GlobalModel;

  beforeAll(async (done) => {
    dbManager = DbManager.getInstance();
    const m = dbManager.get(name);
    if (m) {
      model = m;
    } else {
      throw new Error(`Database connection not found ${name}`);
    }
    await query.create(model, name);
    done();
  });

  test('Transaction with commit', async () => {
    await model.startTransaction();
    await model.query(`INSERT INTO categories (label) VALUES ('test');`);
    await model.commit();
    const res = await model.query(`SELECT * FROM categories`);
    if (res instanceof Array) {
      chaiexp(res.length).to.be.equal(1);
    } else {
      chaiexp(res.rows.length).to.be.equal(1);
    }
  });

  test('Transaction with rollback', async () => {
    await model.startTransaction();
    await model.query(`INSERT INTO categories (label) VALUES ('test');`);
    await model.rollback();
    const res = await model.query(`SELECT * FROM categories`);
    if (res instanceof Array) {
      chaiexp(res.length).to.be.equal(0);
    } else {
      chaiexp(res.rows.length).to.be.equal(0);
    }
  });

  test('Start two transactions', async () => {
    // const transac1 = await model.startTransaction();
    // chaiexp(transac1).to.be.true;
    // const transac2 = await model.startTransaction();
    // chaiexp(transac2).to.be.false;
    // await model.rollback();
  });

  afterEach(async (done) => {
    await model.query('DELETE FROM categories');
    done();
  });

  afterAll(async (done) => {
    await query.delete(model);
    done();
  });
});
