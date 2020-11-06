import { DbManager, EntityManager, GlobalModel } from '../..';

import { expect as chaiexp } from 'chai';
import query from '../_utils/query';

describe.each([
  ['MariaDB', 'maria'],
  ['MySql', 'mysql'],
  ['PostgresSql', 'postgres'],
])('Text query tests with %s', (dbName: string, name: string) => {
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

  beforeEach(async (done) => {
    await model.startTransaction();
    done();
  });

  test('An insert query should add a row in the database', async () => {
    await model.query(`INSERT INTO categories (label) VALUES ('test');`);
    const res = await model.query(`SELECT * FROM categories`);
    if (res instanceof Array) {
      chaiexp(res.length).to.be.equal(1);
    } else {
      chaiexp(res.rows.length).to.be.equal(1);
    }
  });

  test('Query with parameters', async () => {
    await model.query(
      `INSERT INTO categories (label) VALUES ('toast'), ('toto'), ('titi')`,
    );
    const res = await model.query(
      `SELECT * FROM categories WHERE label LIKE ${
        name === 'postgres' ? '$1' : '?'
      }`,
      ['to%'],
    );
    if (res instanceof Array) {
      chaiexp(res.length).to.be.equal(2);
    } else {
      chaiexp(res.rows.length).to.be.equal(2);
    }
  });

  afterEach(async (done) => {
    await model.rollback();
    done();
  });

  afterAll(async (done) => {
    await query.delete(model);
    done();
  });
});
