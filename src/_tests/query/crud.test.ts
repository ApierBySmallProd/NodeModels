import { DbManager, EntityManager, GlobalModel } from '../..';

import { expect as chaiexp } from 'chai';
import query from '../_utils/query';

describe.each([
  ['MariaDB', 'maria'],
  ['MySql', 'mysql'],
  ['PostgresSql', 'postgres'],
])('CRUD query tests with %s', (dbName: string, name: string) => {
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
    const res = await model.insert('categories', [
      { column: 'label', value: 'test' },
    ]);
    chaiexp(res).to.be.equal(1);
  });

  test('An update query should update a row', async () => {
    await model.insert('categories', [{ column: 'label', value: 'test' }]);
    const upRes = await model.update(
      'categories',
      [{ column: 'label', value: 'toto' }],
      [{ column: 'label', operator: '=', value: 'test' }],
    );
    chaiexp(upRes).to.be.equal(1);
    const res = await model.select(
      'categories',
      true,
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
    chaiexp(res).to.be.deep.equal([{ id: 2, label: 'toto' }]);
  });

  test('A delete query should delete a row', async () => {
    await model.insert('categories', [{ column: 'label', value: 'test' }]);
    const delRes = await model.delete('categories', [
      { column: 'label', operator: '=', value: 'test' },
    ]);
    chaiexp(delRes).to.be.equal(1);
    const res = await model.select(
      'categories',
      true,
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
    chaiexp(res.length).to.be.equal(0);
  });

  describe('SELECT', () => {
    test('Simple select', async () => {
      await model.insert('categories', [{ column: 'label', value: 'test' }]);
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
      chaiexp(res.length).to.be.equal(1);
    });

    test('Distinct select', async () => {
      await model.insert('categories', [{ column: 'label', value: 'test' }]);
      await model.insert('categories', [{ column: 'label', value: 'test' }]);
      const res1 = await model.select(
        'categories',
        false,
        [{ attribute: 'label' }],
        [],
        [],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res1.length).to.be.equal(2);
      const res2 = await model.select(
        'categories',
        true,
        [{ attribute: 'label' }],
        [],
        [],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res2.length).to.be.equal(1);
    });

    test('Attributes selection', async () => {
      await model.insert('articles', [
        { column: 'title', value: 'Article #1' },
        { column: 'nbpages', value: 100 },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #2' },
        { column: 'nbpages', value: 50 },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #3' },
        { column: 'nbpages', value: 25 },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #4' },
        { column: 'nbpages', value: 75 },
      ]);
      const res1 = await model.select(
        'articles',
        false,
        [
          { attribute: 'nbpages', function: 'AVG', alias: 'avg' },
          { attribute: 'nbpages', function: 'SUM', alias: 'sum' },
          { attribute: 'nbpages', function: 'MAX', alias: 'max' },
          { attribute: 'nbpages', function: 'MIN', alias: 'min' },
          { attribute: '*', function: 'COUNT', alias: 'count' },
        ],
        [],
        [],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(parseFloat(res1[0].avg).toFixed(1)).to.be.equal('62.5');
      chaiexp(parseFloat(res1[0].sum)).to.be.equal(250);
      chaiexp(parseFloat(res1[0].max)).to.be.equal(100);
      chaiexp(parseFloat(res1[0].min)).to.be.equal(25);
      chaiexp(parseFloat(res1[0].count)).to.be.equal(4);
      const res2 = await model.select(
        'articles',
        false,
        [{ attribute: 'nbpages', alias: 'pages' }],
        [],
        [],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res2[0].pages).not.to.be.undefined;
    });

    test('Where clause', async () => {
      await model.insert('users', [
        { column: 'firstname', value: 'John' },
        { column: 'lastname', value: 'Doe' },
        { column: 'email', value: 'test@test.com' },
        { column: 'birthdate', value: '1997-09-17' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'Jane' },
        { column: 'lastname', value: 'Doe' },
        { column: 'email', value: 'jane@test.com' },
        { column: 'birthdate', value: '1998-09-17' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'Jack' },
        { column: 'lastname', value: 'Lang' },
        { column: 'email', value: 'jack@test.com' },
        { column: 'birthdate', value: '1995-09-17' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'JJ' },
        { column: 'lastname', value: 'Bob' },
        { column: 'email', value: 'jj@test.com' },
        { column: 'birthdate', value: '2000-01-01' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'Ane' },
        { column: 'lastname', value: 'Harris' },
        { column: 'email', value: 'ane@test.com' },
        { column: 'birthdate', value: '1990-01-01' },
      ]);
      const res1 = await model.select(
        'users',
        false,
        [],
        [
          { column: 'firstname', operator: '=', value: 'Jack' },
          { keyword: 'OR' },
          { keyword: 'STARTGROUP' },
          { column: 'lastname', operator: '=', value: 'Doe' },
          { keyword: 'AND' },
          { column: 'email', operator: 'LIKE', value: 'test%' },
          { keyword: 'ENDGROUP' },
          { keyword: 'OR' },
          { keyword: 'NOT' },
          { column: 'firstname', operator: 'LIKE', value: 'J%' },
        ],
        [],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res1.length).to.be.equal(3);
      const res2 = await model.select(
        'users',
        false,
        [],
        [
          { column: 'birthdate', operator: '<=', value: '1990-01-01' },
          { keyword: 'OR' },
          { column: 'birthdate', operator: '>=', value: '2000-01-01' },
          { keyword: 'OR' },
          { keyword: 'STARTGROUP' },
          { column: 'birthdate', operator: '>', value: '1995-01-01' },
          { keyword: 'AND' },
          { column: 'birthdate', operator: '<', value: '1996-01-01' },
          { keyword: 'ENDGROUP' },
        ],
        [],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res2.length).to.be.equal(3);
      const res3 = await model.select(
        'users',
        false,
        [],
        [{ column: 'birthdate', operator: '<>', value: '2000-01-01' }],
        [],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res3.length).to.be.equal(4);
      const res4 = await model.select(
        'users',
        false,
        [],
        [
          {
            column: 'birthdate',
            operator: 'BETWEEN',
            value: ['1995-01-01', '1996-01-01'],
          },
        ],
        [],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res4.length).to.be.equal(1);
      const res5 = await model.select(
        'users',
        false,
        [],
        [
          {
            column: 'birthdate',
            operator: 'IN',
            value: ['1997-09-17', '1998-09-17', '1995-09-17'],
          },
        ],
        [],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res5.length).to.be.equal(3);
    });

    test('Sort clause', async () => {
      await model.insert('users', [
        { column: 'firstname', value: 'John' },
        { column: 'lastname', value: 'Doe' },
        { column: 'email', value: 'test@test.com' },
        { column: 'birthdate', value: '1997-09-17' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'Jane' },
        { column: 'lastname', value: 'Doe' },
        { column: 'email', value: 'jane@test.com' },
        { column: 'birthdate', value: '1998-09-17' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'Jack' },
        { column: 'lastname', value: 'Lang' },
        { column: 'email', value: 'jack@test.com' },
        { column: 'birthdate', value: '1995-09-17' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'JJ' },
        { column: 'lastname', value: 'Bob' },
        { column: 'email', value: 'jj@test.com' },
        { column: 'birthdate', value: '2000-01-01' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'Ane' },
        { column: 'lastname', value: 'Harris' },
        { column: 'email', value: 'ane@test.com' },
        { column: 'birthdate', value: '1990-01-01' },
      ]);
      const res1 = await model.select(
        'users',
        false,
        [],
        [],
        [{ attribute: 'birthdate', mode: 'ASC' }],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res1[0].firstname).to.be.equal('Ane');
      chaiexp(res1[res1.length - 1].firstname).to.be.equal('JJ');
      const res2 = await model.select(
        'users',
        false,
        [],
        [],
        [{ attribute: 'firstname', mode: 'DESC' }],
        '',
        -1,
        -1,
        [],
        [],
        [],
      );
      chaiexp(res2[0].firstname).to.be.equal('John');
      chaiexp(res2[res2.length - 1].firstname).to.be.equal('Ane');
    });

    test('Limit and offset', async () => {
      await model.insert('users', [
        { column: 'firstname', value: 'John' },
        { column: 'lastname', value: 'Doe' },
        { column: 'email', value: 'test@test.com' },
        { column: 'birthdate', value: '1997-09-17' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'Jane' },
        { column: 'lastname', value: 'Doe' },
        { column: 'email', value: 'jane@test.com' },
        { column: 'birthdate', value: '1998-09-17' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'Jack' },
        { column: 'lastname', value: 'Lang' },
        { column: 'email', value: 'jack@test.com' },
        { column: 'birthdate', value: '1995-09-17' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'JJ' },
        { column: 'lastname', value: 'Bob' },
        { column: 'email', value: 'jj@test.com' },
        { column: 'birthdate', value: '2000-01-01' },
      ]);
      await model.insert('users', [
        { column: 'firstname', value: 'Ane' },
        { column: 'lastname', value: 'Harris' },
        { column: 'email', value: 'ane@test.com' },
        { column: 'birthdate', value: '1990-01-01' },
      ]);
      const res1 = await model.select(
        'users',
        false,
        [],
        [],
        [{ attribute: 'birthdate', mode: 'ASC' }],
        '',
        2,
        0,
        [],
        [],
        [],
      );
      chaiexp(res1.length).to.be.equal(2);
      chaiexp(res1[0].firstname).to.be.equal('Ane');
      const res2 = await model.select(
        'users',
        false,
        [],
        [],
        [{ attribute: 'birthdate', mode: 'ASC' }],
        '',
        3,
        1,
        [],
        [],
        [],
      );
      chaiexp(res2.length).to.be.equal(3);
      chaiexp(res2[0].firstname).to.be.equal('Jack');
    });

    test('Join clause', async () => {
      const cat1Id = await model.insert('categories', [
        { column: 'label', value: 'Cat#1' },
      ]);
      const cat2Id = await model.insert('categories', [
        { column: 'label', value: 'Cat#2' },
      ]);
      const cat3Id = await model.insert('categories', [
        { column: 'label', value: 'Cat#3' },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #1' },
        { column: 'nbpages', value: 100 },
        { column: 'category_id', value: cat1Id },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #2' },
        { column: 'nbpages', value: 50 },
        { column: 'category_id', value: cat1Id },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #3' },
        { column: 'nbpages', value: 25 },
        { column: 'category_id', value: cat2Id },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #4' },
        { column: 'nbpages', value: 75 },
        { column: 'category_id', value: cat2Id },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #5' },
        { column: 'nbpages', value: 75 },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #6' },
        { column: 'nbpages', value: 75 },
      ]);
      const res1 = await model.select(
        'articles',
        true,
        [],
        [],
        [],
        'a',
        -1,
        -1,
        [
          {
            tableName: 'categories',
            alias: 'c',
            method: 'inner',
            wheres: [{ column: 'a.category_id', operator: '=', value: 'c.id' }],
          },
        ],
        [],
        [],
      );
      chaiexp(res1.length).to.be.equal(4);
      expect(res1.map((r: any) => r.title)).toEqual(
        expect.arrayContaining([
          'Article #1',
          'Article #2',
          'Article #3',
          'Article #4',
        ]),
      );
      const res2 = await model.select(
        'articles',
        true,
        [],
        [],
        [],
        'a',
        -1,
        -1,
        [
          {
            tableName: 'categories',
            alias: 'c',
            method: 'left',
            wheres: [{ column: 'a.category_id', operator: '=', value: 'c.id' }],
          },
        ],
        [],
        [],
      );
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
      const res3 = await model.select(
        'articles',
        true,
        [],
        [],
        [],
        'a',
        -1,
        -1,
        [
          {
            tableName: 'categories',
            alias: 'c',
            method: 'right',
            wheres: [{ column: 'a.category_id', operator: '=', value: 'c.id' }],
          },
        ],
        [],
        [],
      );
      chaiexp(res3.length).to.be.equal(5);
      expect(res3.map((r: any) => r.label)).toEqual(
        expect.arrayContaining(['Cat#1', 'Cat#2', 'Cat#3', 'Cat#1', 'Cat#2']),
      );
    });

    test('Group by', async () => {
      const cat1Id = await model.insert('categories', [
        { column: 'label', value: 'Cat#1' },
      ]);
      const cat2Id = await model.insert('categories', [
        { column: 'label', value: 'Cat#2' },
      ]);
      const cat3Id = await model.insert('categories', [
        { column: 'label', value: 'Cat#3' },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #1' },
        { column: 'nbpages', value: 100 },
        { column: 'category_id', value: cat1Id },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #2' },
        { column: 'nbpages', value: 50 },
        { column: 'category_id', value: cat1Id },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #3' },
        { column: 'nbpages', value: 25 },
        { column: 'category_id', value: cat2Id },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #4' },
        { column: 'nbpages', value: 75 },
        { column: 'category_id', value: cat2Id },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #5' },
        { column: 'nbpages', value: 75 },
        { column: 'category_id', value: cat2Id },
      ]);
      await model.insert('articles', [
        { column: 'title', value: 'Article #6' },
        { column: 'nbpages', value: 75 },
      ]);
      const res1 = await model.select(
        'articles',
        false,
        [
          { attribute: 'c.label' },
          { attribute: '*', function: 'COUNT', alias: 'count' },
        ],
        [],
        [],
        'a',
        -1,
        -1,
        [
          {
            tableName: 'categories',
            alias: 'c',
            method: 'inner',
            wheres: [{ column: 'a.category_id', operator: '=', value: 'c.id' }],
          },
        ],
        ['c.label'],
        [],
      );
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
      const res2 = await model.select(
        'articles',
        false,
        [
          { attribute: 'c.label' },
          { attribute: '*', function: 'COUNT', alias: 'count' },
        ],
        [],
        [],
        'a',
        -1,
        -1,
        [
          {
            tableName: 'categories',
            alias: 'c',
            method: 'inner',
            wheres: [{ column: 'a.category_id', operator: '=', value: 'c.id' }],
          },
        ],
        ['c.label'],
        [{ column: 'COUNT(*)', operator: '>=', value: 3 }],
      );
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
