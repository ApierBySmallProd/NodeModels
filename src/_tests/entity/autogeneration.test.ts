import { DbManager, EntityManager, GlobalModel } from '../..';

import ArticleEntity from './_utils/autocreate/article.entity';
import ArticleEntityModified from './_utils/autocreate/modified/article.entity';
import CategoryEntity from './_utils/autocreate/category.entity';
import CategoryEntityModified from './_utils/autocreate/modified/category.entity';
import UserEntity from './_utils/autocreate/user.entity';
import UserEntityModified from './_utils/autocreate/modified/user.entity';
import { expect as chaiexp } from 'chai';
import fs from 'fs';

describe.each([
  ['MariaDB', 'maria'],
  ['MySql', 'mysql'],
  ['PostgresSql', 'postgres'],
])('Auto generation tests with %s', (dbName: string, name: string) => {
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
    done();
  });

  beforeEach(async (done) => {
    done();
  });

  test('Auto create tables from entities', async () => {
    dbManager.setConfig({ migrationPath: 'temp/migrations' });
    EntityManager.registerEntities([UserEntity, ArticleEntity, CategoryEntity]);
    await EntityManager.initialize(name);
  });

  // test('Auto update tables from entities', async () => {
  //   dbManager.setConfig({ migrationPath: 'temp/migrations' });
  //   EntityManager.registerEntities([UserEntity, ArticleEntity, CategoryEntity]);
  //   await EntityManager.initialize(name);

  //   EntityManager.clearRegisteredEntities();
  //   EntityManager.registerEntities([
  //     UserEntityModified,
  //     ArticleEntityModified,
  //     CategoryEntityModified,
  //   ]);
  //   await EntityManager.initialize(name);
  // });

  afterEach(async (done) => {
    await model.query('DROP TABLE migrations');
    await model.query('DROP TABLE articles');
    await model.query('DROP TABLE categories');
    await model.query('DROP TABLE users');
    fs.rmdir('temp/migrations', { recursive: true }, () => {
      fs.mkdir('temp/migrations', {}, () => {
        done();
      });
    });
  });
});
