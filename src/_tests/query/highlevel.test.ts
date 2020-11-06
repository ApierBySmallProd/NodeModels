import {
  CreateQuery,
  DbManager,
  DeleteQuery,
  EntityManager,
  FindQuery,
  GlobalModel,
  UpdateQuery,
} from '../..';

import { expect as chaiexp } from 'chai';
import query from '../_utils/query';

describe.each([
  ['MariaDB', 'maria'],
  ['MySql', 'mysql'],
  ['PostgresSql', 'postgres'],
])('High level CRUD query tests with %s', (dbName: string, name: string) => {
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
    const createQuery = new CreateQuery('categories');
    createQuery.setAttribute('label', 'test');
    const res = await createQuery.exec(name);
    chaiexp(res).to.be.equal(1);
  });

  test('An update query should update a row', async () => {
    // * Insert a data inside the db
    await new CreateQuery('categories')
      .setAttribute('label', 'test')
      .exec(name);
    // * Update the data
    const upRes = await new UpdateQuery('categories')
      .setAttribute('label', 'toto')
      .where('label', '=', 'test')
      .exec(name);
    chaiexp(upRes).to.be.equal(1);
    // * Check by selecting the data
    const res = await new FindQuery('categories').distinct().exec(name);
    chaiexp(res).to.be.deep.equal([{ id: 2, label: 'toto' }]);
  });

  test('A delete query should delete a row', async () => {
    // * Insert a data inside the db
    await new CreateQuery('categories')
      .setAttribute('label', 'test')
      .exec(name);
    // * Delete the data
    const delRes = await new DeleteQuery('categories')
      .where('label', '=', 'test')
      .exec(name);
    chaiexp(delRes).to.be.equal(1);
    // * Check by selecting the data
    const res = await new FindQuery('categories').distinct().exec(name);
    chaiexp(res.length).to.be.equal(0);
  });

  describe('SELECT', () => {
    test('Simple select', async () => {
      // * Insert a data inside the db
      await new CreateQuery('categories')
        .setAttribute('label', 'test')
        .exec(name);

      const res = await new FindQuery('categories').exec(name);
      chaiexp(res.length).to.be.equal(1);
    });

    test('Distinct select', async () => {
      // * Insert data inside the db
      await new CreateQuery('categories')
        .setAttribute('label', 'test')
        .exec(name);
      await new CreateQuery('categories')
        .setAttribute('label', 'test')
        .exec(name);
      const res1 = await new FindQuery('categories')
        .addAttribute('label')
        .exec(name);
      chaiexp(res1.length).to.be.equal(2);
      const res2 = await new FindQuery('categories')
        .addAttribute('label')
        .distinct()
        .exec(name);
      chaiexp(res2.length).to.be.equal(1);
    });

    test('Attributes selection', async () => {
      // * Insert some data
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #1')
        .setAttribute('nbpages', 100)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #2')
        .setAttribute('nbpages', 50)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #3')
        .setAttribute('nbpages', 25)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #4')
        .setAttribute('nbpages', 75)
        .exec(name);

      const res1 = await new FindQuery('articles')
        .addAttribute('nbpages', 'avg', 'AVG')
        .addAttribute('nbpages', 'sum', 'SUM')
        .addAttribute('nbpages', 'max', 'MAX')
        .addAttribute('nbpages', 'min', 'MIN')
        .addAttribute('*', 'count', 'COUNT')
        .exec(name);
      chaiexp(parseFloat(res1[0].avg).toFixed(1)).to.be.equal('62.5');
      chaiexp(parseFloat(res1[0].sum)).to.be.equal(250);
      chaiexp(parseFloat(res1[0].max)).to.be.equal(100);
      chaiexp(parseFloat(res1[0].min)).to.be.equal(25);
      chaiexp(parseFloat(res1[0].count)).to.be.equal(4);
      const res2 = await new FindQuery('articles')
        .addAttribute('nbpages', 'pages')
        .exec(name);
      chaiexp(res2[0].pages).not.to.be.undefined;
    });

    test('Where clause', async () => {
      // * Insert some data
      await new CreateQuery('users')
        .setAttribute('firstname', 'John')
        .setAttribute('lastname', 'Doe')
        .setAttribute('email', 'test@test.com')
        .setAttribute('birthdate', '1997-09-17')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'Jane')
        .setAttribute('lastname', 'Doe')
        .setAttribute('email', 'jane@test.com')
        .setAttribute('birthdate', '1998-09-17')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'Jack')
        .setAttribute('lastname', 'Lang')
        .setAttribute('email', 'jack@test.com')
        .setAttribute('birthdate', '1995-09-17')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'JJ')
        .setAttribute('lastname', 'Bob')
        .setAttribute('email', 'jj@test.com')
        .setAttribute('birthdate', '2000-01-01')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'Ane')
        .setAttribute('lastname', 'Harris')
        .setAttribute('email', 'ane@test.com')
        .setAttribute('birthdate', '1990-01-01')
        .exec(name);

      const res1 = await new FindQuery('users')
        .where('firstname', '=', 'Jack')
        .or()
        .group()
        .where('lastname', '=', 'Doe')
        .and()
        .where('email', 'LIKE', 'test%')
        .endGroup()
        .or()
        .not()
        .where('firstname', 'LIKE', 'J%')
        .exec(name);
      chaiexp(res1.length).to.be.equal(3);

      const res2 = await new FindQuery('users')
        .where('birthdate', '<=', '1990-01-01')
        .or()
        .where('birthdate', '>=', '2000-01-01')
        .or()
        .group()
        .where('birthdate', '>', '1995-01-01')
        .and()
        .where('birthdate', '<', '1996-01-01')
        .endGroup()
        .exec(name);
      chaiexp(res2.length).to.be.equal(3);

      const res3 = await new FindQuery('users')
        .where('birthdate', '<>', '2000-01-01')
        .exec(name);
      chaiexp(res3.length).to.be.equal(4);

      const res4 = await new FindQuery('users')
        .where('birthdate', 'BETWEEN', ['1995-01-01', '1996-01-01'])
        .exec(name);
      chaiexp(res4.length).to.be.equal(1);

      const res5 = await new FindQuery('users')
        .where('birthdate', 'IN', ['1997-09-17', '1998-09-17', '1995-09-17'])
        .exec(name);
      chaiexp(res5.length).to.be.equal(3);
    });

    test('Sort clause', async () => {
      // * Insert some data
      await new CreateQuery('users')
        .setAttribute('firstname', 'John')
        .setAttribute('lastname', 'Doe')
        .setAttribute('email', 'test@test.com')
        .setAttribute('birthdate', '1997-09-17')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'Jane')
        .setAttribute('lastname', 'Doe')
        .setAttribute('email', 'jane@test.com')
        .setAttribute('birthdate', '1998-09-17')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'Jack')
        .setAttribute('lastname', 'Lang')
        .setAttribute('email', 'jack@test.com')
        .setAttribute('birthdate', '1995-09-17')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'JJ')
        .setAttribute('lastname', 'Bob')
        .setAttribute('email', 'jj@test.com')
        .setAttribute('birthdate', '2000-01-01')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'Ane')
        .setAttribute('lastname', 'Harris')
        .setAttribute('email', 'ane@test.com')
        .setAttribute('birthdate', '1990-01-01')
        .exec(name);

      const res1 = await new FindQuery('users')
        .sort('birthdate', 'ASC')
        .exec(name);
      chaiexp(res1[0].firstname).to.be.equal('Ane');
      chaiexp(res1[res1.length - 1].firstname).to.be.equal('JJ');

      const res2 = await new FindQuery('users')
        .sort('firstname', 'DESC')
        .exec(name);
      chaiexp(res2[0].firstname).to.be.equal('John');
      chaiexp(res2[res2.length - 1].firstname).to.be.equal('Ane');
    });

    test('Limit and offset', async () => {
      // * Insert some data
      await new CreateQuery('users')
        .setAttribute('firstname', 'John')
        .setAttribute('lastname', 'Doe')
        .setAttribute('email', 'test@test.com')
        .setAttribute('birthdate', '1997-09-17')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'Jane')
        .setAttribute('lastname', 'Doe')
        .setAttribute('email', 'jane@test.com')
        .setAttribute('birthdate', '1998-09-17')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'Jack')
        .setAttribute('lastname', 'Lang')
        .setAttribute('email', 'jack@test.com')
        .setAttribute('birthdate', '1995-09-17')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'JJ')
        .setAttribute('lastname', 'Bob')
        .setAttribute('email', 'jj@test.com')
        .setAttribute('birthdate', '2000-01-01')
        .exec(name);
      await new CreateQuery('users')
        .setAttribute('firstname', 'Ane')
        .setAttribute('lastname', 'Harris')
        .setAttribute('email', 'ane@test.com')
        .setAttribute('birthdate', '1990-01-01')
        .exec(name);

      const res1 = await new FindQuery('users')
        .sort('birthdate', 'ASC')
        .limit(2, 0)
        .exec(name);
      chaiexp(res1.length).to.be.equal(2);
      chaiexp(res1[0].firstname).to.be.equal('Ane');

      const res2 = await new FindQuery('users')
        .sort('birthdate', 'ASC')
        .limit(3, 1)
        .exec(name);
      chaiexp(res2.length).to.be.equal(3);
      chaiexp(res2[0].firstname).to.be.equal('Jack');
    });

    test('Join clause', async () => {
      // * Insert some data
      const cat1Id = await new CreateQuery('categories')
        .setAttribute('label', 'Cat#1')
        .exec(name);
      const cat2Id = await new CreateQuery('categories')
        .setAttribute('label', 'Cat#2')
        .exec(name);
      const cat3Id = await new CreateQuery('categories')
        .setAttribute('label', 'Cat#3')
        .exec(name);

      await new CreateQuery('articles')
        .setAttribute('title', 'Article #1')
        .setAttribute('nbpages', 100)
        .setAttribute('category_id', cat1Id)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #2')
        .setAttribute('nbpages', 50)
        .setAttribute('category_id', cat1Id)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #3')
        .setAttribute('category_id', cat2Id)
        .setAttribute('nbpages', 25)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #4')
        .setAttribute('nbpages', 75)
        .setAttribute('category_id', cat2Id)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #5')
        .setAttribute('nbpages', 75)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #6')
        .setAttribute('nbpages', 75)
        .exec(name);

      const res1 = await new FindQuery('articles')
        .distinct()
        .alias('a')
        .join('categories', 'c')
        .on('a.category_id', '=', 'c.id')
        .endJoin()
        .exec(name);
      chaiexp(res1.length).to.be.equal(4);
      expect(res1.map((r: any) => r.title)).toEqual(
        expect.arrayContaining([
          'Article #1',
          'Article #2',
          'Article #3',
          'Article #4',
        ]),
      );

      const res2 = await new FindQuery('articles')
        .distinct()
        .alias('a')
        .join('categories', 'c')
        .left()
        .on('a.category_id', '=', 'c.id')
        .endJoin()
        .exec(name);
      chaiexp(res2.length).to.be.equal(6);
      expect(res2.map((r: any) => r.title)).toEqual(
        expect.arrayContaining([
          'Article #1',
          'Article #2',
          'Article #3',
          'Article #4',
          'Article #5',
          'Article #6',
        ]),
      );

      const res3 = await new FindQuery('articles')
        .distinct()
        .alias('a')
        .join('categories', 'c')
        .right()
        .on('a.category_id', '=', 'c.id')
        .endJoin()
        .exec(name);
      chaiexp(res3.length).to.be.equal(5);
      expect(res3.map((r: any) => r.label)).toEqual(
        expect.arrayContaining(['Cat#1', 'Cat#2', 'Cat#3', 'Cat#1', 'Cat#2']),
      );
    });

    test('Group by', async () => {
      // * Insert some data
      const cat1Id = await new CreateQuery('categories')
        .setAttribute('label', 'Cat#1')
        .exec(name);
      const cat2Id = await new CreateQuery('categories')
        .setAttribute('label', 'Cat#2')
        .exec(name);
      const cat3Id = await new CreateQuery('categories')
        .setAttribute('label', 'Cat#3')
        .exec(name);

      await new CreateQuery('articles')
        .setAttribute('title', 'Article #1')
        .setAttribute('nbpages', 100)
        .setAttribute('category_id', cat1Id)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #2')
        .setAttribute('nbpages', 50)
        .setAttribute('category_id', cat1Id)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #3')
        .setAttribute('category_id', cat2Id)
        .setAttribute('nbpages', 25)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #4')
        .setAttribute('nbpages', 75)
        .setAttribute('category_id', cat2Id)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #5')
        .setAttribute('nbpages', 75)
        .setAttribute('category_id', cat2Id)
        .exec(name);
      await new CreateQuery('articles')
        .setAttribute('title', 'Article #6')
        .setAttribute('nbpages', 75);

      const res1 = await new FindQuery('articles')
        .alias('a')
        .addAttribute('c.label')
        .addAttribute('*', 'count', 'COUNT')
        .join('categories', 'c')
        .on('a.category_id', '=', 'c.id')
        .endJoin()
        .groupBy('c.label')
        .exec(name);
      chaiexp(res1.length).to.be.equal(2);
      chaiexp(
        res1.map((r: any) => ({
          label: r.label,
          count: parseInt(r.count, 10),
        })),
      ).to.be.deep.equal([
        { label: 'Cat#1', count: 2 },
        { label: 'Cat#2', count: 3 },
      ]);

      const res2 = await new FindQuery('articles')
        .alias('a')
        .addAttribute('c.label')
        .addAttribute('*', 'count', 'COUNT')
        .join('categories', 'c')
        .on('a.category_id', '=', 'c.id')
        .endJoin()
        .groupBy('c.label')
        .having('COUNT(*)', '>=', '3')
        .endHaving()
        .exec(name);
      chaiexp(res2.length).to.be.equal(1);
      chaiexp(
        res2.map((r: any) => ({
          label: r.label,
          count: parseInt(r.count, 10),
        })),
      ).to.be.deep.equal([{ label: 'Cat#2', count: 3 }]);
    });
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
