import {
  DbManager,
  EntityContext,
  EntityManager,
  FindQuery,
  GlobalModel,
} from '../..';

import ArticleEntity from './_utils/article.entity';
import CategoryEntity from './_utils/category.entity';
import UserEntity from './_utils/user.entity';
import { expect as chaiexp } from 'chai';
import query from '../_utils/query';

describe.each([
  ['MariaDB', 'maria'],
  ['MySql', 'mysql'],
  ['PostgresSql', 'postgres'],
])('Entity CRUD tests with %s', (dbName: string, name: string) => {
  let dbManager: DbManager;
  let model: GlobalModel;
  let context: EntityContext;

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
    context = EntityManager.createContext();
    done();
  });

  describe('Create', () => {
    test('Create a simple entity', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      chaiexp(cat1.getId()).not.to.be.equal(0);

      const res = await new FindQuery('categories').exec(name);
      chaiexp(res.length).to.be.equal(1);
    });

    test('Create an entity linked to another one', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      const article1 = await new ArticleEntity(
        'Article#1',
        new Date('01/01/2020'),
        100,
        cat1,
      ).create(name, context);
      chaiexp(article1).not.to.be.null;
      if (!article1) return;

      chaiexp(article1.getId()).not.to.be.equal(0);
      const res = await new FindQuery('articles').exec(name);
      chaiexp(res.length).to.be.equal(1);
      chaiexp(res[0].category_id).to.be.equal(cat1.getId());
    });

    test('Create an entity with a many to many relationship', async () => {
      const user1 = await new UserEntity(
        'John',
        'Doe',
        'john@doe.fr',
        new Date('01/01/1980'),
      ).create(name, context);
      chaiexp(user1).not.to.be.null;
      if (!user1) return;
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      const article1 = await new ArticleEntity(
        'Article#1',
        new Date('01/01/2020'),
        100,
        cat1,
        [user1],
      ).create(name, context);
      if (!article1) return;

      const res = await new FindQuery('article_authors').exec(name);
      chaiexp(res.length).to.be.equal(1);
      chaiexp(res[0].user_id).to.be.equal(user1.getId());
      chaiexp(res[0].article_id).to.be.equal(article1.getId());
    });
  });

  describe('Update', () => {
    test('Update a simple entity', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      chaiexp(cat1.getId()).not.to.be.equal(0);

      const res = await new FindQuery('categories').exec(name);
      chaiexp(res.length).to.be.equal(1);
      chaiexp(res[0].label).to.be.equal('Cat#1');

      cat1.setLabel('Category 1');
      await cat1.update(name);

      const res2 = await new FindQuery('categories').exec(name);
      chaiexp(res2.length).to.be.equal(1);
      chaiexp(res2[0].label).to.be.equal('Category 1');
    });

    test('Update an entity linked to another one', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      const cat2 = await new CategoryEntity('Cat#2').create(name, context);
      if (!cat2) return;
      const article1 = await new ArticleEntity(
        'Article#1',
        new Date('01/01/2020'),
        100,
        cat1,
      ).create(name, context);
      chaiexp(article1).not.to.be.null;
      if (!article1) return;

      chaiexp(article1.getId()).not.to.be.equal(0);
      const res = await new FindQuery('articles').exec(name);
      chaiexp(res.length).to.be.equal(1);
      chaiexp(res[0].category_id).to.be.equal(cat1.getId());

      article1.setCategory(cat2);
      await article1.update(name);

      const res2 = await new FindQuery('articles').exec(name);
      chaiexp(res2.length).to.be.equal(1);
      chaiexp(res2[0].category_id).to.be.equal(cat2.getId());
    });

    test('Update an entity with a many to many relationship', async () => {
      const user1 = await new UserEntity(
        'John',
        'Doe',
        'john@doe.fr',
        new Date('01/01/1980'),
      ).create(name, context);
      chaiexp(user1).not.to.be.null;
      if (!user1) return;
      const user2 = await new UserEntity(
        'Jane',
        'Doe',
        'jane@doe.fr',
        new Date('01/01/1980'),
      ).create(name, context);
      if (!user2) return;
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      const article1 = await new ArticleEntity(
        'Article#1',
        new Date('01/01/2020'),
        100,
        cat1,
        [user1],
      ).create(name, context);
      if (!article1) return;

      const res = await new FindQuery('article_authors').exec(name);
      chaiexp(res.length).to.be.equal(1);
      chaiexp(res[0].user_id).to.be.equal(user1.getId());
      chaiexp(res[0].article_id).to.be.equal(article1.getId());

      article1.setAuthors([user1, user2]);
      await article1.update(name);

      const res2 = await new FindQuery('article_authors')
        .where('article_id', '=', article1.getId())
        .exec(name);
      chaiexp(res2.length).to.be.equal(2);
    });
  });

  describe('Delete', () => {
    test('Delete a simple entity', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      chaiexp(cat1.getId()).not.to.be.equal(0);

      const res = await new FindQuery('categories').exec(name);
      chaiexp(res.length).to.be.equal(1);

      await cat1.delete(name, context);

      const res2 = await new FindQuery('categories').exec(name);
      chaiexp(res2.length).to.be.equal(0);
    });

    test('Delete an entity with a many to many relationship', async () => {
      const user1 = await new UserEntity(
        'John',
        'Doe',
        'john@doe.fr',
        new Date('01/01/1980'),
      ).create(name, context);
      chaiexp(user1).not.to.be.null;
      if (!user1) return;
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      const article1 = await new ArticleEntity(
        'Article#1',
        new Date('01/01/2020'),
        100,
        cat1,
        [user1],
      ).create(name, context);
      if (!article1) return;

      const res = await new FindQuery('article_authors').exec(name);
      chaiexp(res.length).to.be.equal(1);
      chaiexp(res[0].user_id).to.be.equal(user1.getId());
      chaiexp(res[0].article_id).to.be.equal(article1.getId());

      await article1.delete(name, context);

      const res2 = await new FindQuery('articles').exec(name);
      chaiexp(res2.length).to.be.equal(0);

      const res3 = await new FindQuery('article_authors').exec(name);
      chaiexp(res3.length).to.be.equal(0);
    });

    test('Delete by id', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      chaiexp(cat1.getId()).not.to.be.equal(0);

      const res = await new FindQuery('categories').exec(name);
      chaiexp(res.length).to.be.equal(1);

      await CategoryEntity.deleteById(cat1.getId(), context, name);

      const res2 = await new FindQuery('categories').exec(name);
      chaiexp(res2.length).to.be.equal(0);
    });
  });

  describe('Find', () => {
    test('Find one', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;

      EntityManager.clearContext(context);

      const cat: CategoryEntity = await CategoryEntity.findOne(context)
        .where('label', '=', 'Cat#1')
        .exec(name);
      chaiexp(cat).not.to.be.null;
      chaiexp(cat.getId()).to.be.equal(cat1.getId());
    });

    test('Find many', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      const cat2 = await new CategoryEntity('Cat#2').create(name, context);
      if (!cat2) return;
      const cat3 = await new CategoryEntity('Cat#3').create(name, context);

      EntityManager.clearContext(context);

      const categories: CategoryEntity[] = await CategoryEntity.findMany(
        context,
      )
        .where('label', 'IN', ['Cat#1', 'Cat#3'])
        .exec(name);
      chaiexp(categories.length).to.be.equal(2);
    });

    test('Find one by id', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;

      EntityManager.clearContext(context);

      const cat: CategoryEntity = await CategoryEntity.findById(
        cat1.getId(),
        context,
        name,
      );
      chaiexp(cat).not.to.be.null;
      chaiexp(cat.getId()).to.be.equal(cat1.getId());
    });

    test('Find one with a relationship with another entity', async () => {
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      const article1 = await new ArticleEntity(
        'Article#1',
        new Date('01/01/2020'),
        100,
        cat1,
      ).create(name, context);
      chaiexp(article1).not.to.be.null;
      if (!article1) return;

      EntityManager.clearContext(context);

      const article: ArticleEntity = await ArticleEntity.findById(
        article1.getId(),
        context,
        name,
      );
      const category = article.getCategory();
      if (!category) return;
      chaiexp(category.getId()).to.be.equal(cat1.getId());
      chaiexp(category.getLabel()).to.be.equal(cat1.getLabel());
    });

    test('Find one with a many to many relationship', async () => {
      const user1 = await new UserEntity(
        'John',
        'Doe',
        'john@doe.fr',
        new Date('01/01/1980'),
      ).create(name, context);
      chaiexp(user1).not.to.be.null;
      if (!user1) return;
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      const article1 = await new ArticleEntity(
        'Article#1',
        new Date('01/01/2020'),
        100,
        cat1,
        [user1],
      ).create(name, context);
      if (!article1) return;

      EntityManager.clearContext(context);

      const user: UserEntity = await UserEntity.findById(
        user1.getId(),
        context,
        name,
      );
      chaiexp(user.getArticles().length).to.be.equal(1);
      chaiexp(user.getArticles()[0].getId()).to.be.equal(article1.getId());
    });

    test('Fetch', async () => {
      const user1 = await new UserEntity(
        'John',
        'Doe',
        'john@doe.fr',
        new Date('01/01/1980'),
      ).create(name, context);
      chaiexp(user1).not.to.be.null;
      if (!user1) return;
      const cat1 = await new CategoryEntity('Cat#1').create(name, context);
      chaiexp(cat1).not.to.be.null;
      if (!cat1) return;
      const article1 = await new ArticleEntity(
        'Article#1',
        new Date('01/01/2020'),
        100,
        cat1,
        [user1],
      ).create(name, context);
      if (!article1) return;

      EntityManager.clearContext(context);

      const article: ArticleEntity = await ArticleEntity.findById(
        article1.getId(),
        context,
        name,
      );
      chaiexp(article.getId()).to.be.equal(article1.getId());
      chaiexp(article.getAuthors()).to.be.deep.equal([]);

      await article.fetchAuthors(context, name);

      chaiexp(article.getAuthors().length).to.be.equal(1);
    });
  });

  afterEach(async (done) => {
    await model.rollback();
    EntityManager.closeContext(context);
    done();
  });

  afterAll(async (done) => {
    await query.delete(model);
    done();
  });
});
