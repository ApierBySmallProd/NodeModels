# Models by SmallProd

## Presentation

This library has been made to help you with the model part of your application. We provide several things like Entities, Migrations or Query management.

## Installation

First, you will need to install our package, here are the ways to do it:

```bash
yarn add @smallprod/models
# or
npm install @smallprod/models
```

That's it!

## DbManager

### Initialization

The **DbManager** will store all your database connections so it's the centered element of this library. You should first initialize it like this:

```ts
import { DbManager } from '@smallprod/models';

const dbManager = DbManager.get();
await dbManager.add(
  'mariadb',
  'localhost',
  3306,
  'user',
  'pass',
  'database',
  '',
  true,
); // This will add a new database
```

The first argument to add a database is the dbms you use, we currently support:

- **Mariadb / Mysql** (with the mysql package)
- **PostgreSQL** (with the pg package)
- **MSSql** (with the mssql package)
- **OracleDB** (with the oracledb package)

Then you must put the **host**, the **port**, the **username**, the **password** and the **database name**. After that you can specify a name for this connection which is essential if you have mutliple connections and finally you can specify if you want to be in debug mode or not wich will show you every error that occurs.

With the **DbManager** you can also set the configuration which must be used. Currently, you can just specify the path to the migrations like so:

```ts
dbManager.setConfig({ migrationPath: 'my path to migrations' });
```

Finally you can get a connection by it's name or the default connection like this:

```ts
const model = dbManager.get('connection name');
```

The parameter is optionnal. This method will return you a **GlobalModel** object. With this object you can do several things that we will see together now.

### Make some queries

To execute queries with your **GlobalModel** object, you can use different methods:

- **query()**
- **insert()**
- **update()**
- **delete()**
- **select()**

### query()

The query function allows you to execute SQL requests directly. It takes three arguments but only the first one is required. First, you should specify the SQL request as a string. After you can specify an array of string represneting the parameters of the request and finally you can specify wether the function should throw errors or not.

Here is an exemple:

```ts
const email = 'john@doe.com';
const response = await model.query(
  'SELECT * FROM `user` WHERE `email` = ?',
  [email],
  false,
);
```

This method is dbms specific which means you must formed your request depending the dbms you use. The response will also be dbms specific.

This method can be usefull to make some specific queries but this is not the recommended way to work as when you change dbms, you may need to rewrite your queries.

### insert()

The insert function allows you to add datas in your database easily and most importantly it's dbms independent.

This method takes two arguments, the first one is the name of the table/collection you want to populate and the second one is an array of columns and values to insert.

Here is an exemple:

```ts
const insertedId = await model.insert('user', [
  { column: 'pseudo', value: 'JDoe' },
  { column: 'email', value: 'john@doe.com' },
]);
```

This method returns the inserted id or null if an error occured.

### update()

The update function allows you to modify datas in your database easily and most importantly it's dbms independent.

This method takes three arguments, the first two are the same as the **insert** method so the table/collection name and the attributes with values to update and the third one is the where clause.

Here is an exemple:

```ts
const updatedRows = await model.update(
  'user',
  [{ column: 'pseudo', value: 'JohnD' }],
  [{ column: 'id', operator: '=', value: 12 }],
);
```

In this exemple, we change the pseudo of the user with the id 12 to JohnD.

The where clause can be huge, if you want to combine different where clauses you can use keywords like this:

```ts
const updatedRows = await model.update(
  'user',
  [{ column: 'pseudo', value: 'JohnD' }],
  [
    { column: 'id', operator: '=', value: 12 },
    { keyword: 'AND' },
    { column: 'age', operator: '<', value: 18 },
  ],
);
```

The list of operators which can be used is this one:

- <
- \>
- <=
- \>=
- <>
- =
- BETWEEN
- IN
- LIKE

For **BETWEEN** and **IN** you must specify an array for the value.

The list of keywords available is this one:

- AND
- OR
- NOT
- STARTGROUP
- ENDGROUP

The **STARGROUP** AND **ENDGROUP** are used to wrap some clauses inside parenthesis.

### delete()

The delete function allows you to remove datas from your database easily and most importantly it's dbms independent.

This method takes two arguments, the first one is the table/collection name and the second one is the where clause just like the **update** method.

Here is an exemple:

```ts
const deletedRows = await model.delete('user', [
  { column: 'id', operator: '=', value: 12 },
  { keyword: 'AND' },
  { column: 'age', operator: '<', value: 18 },
]);
```

This method returns a promise of a number.

### select()

The select function allows you to retrieve datas from your database easily and most importantly it's dbms independent.

This method takes 11 arguments.

Here is an exemple:

```ts
const result = await model.select(
  'user',
  false,
  [{ attribute: 'email', alias: 'user_email', function: null }],
  [],
  [],
  'default_table',
  -1,
  0,
  [],
  [],
  [],
);
```

This is a really simple query wich will retrieve the email of every user.

To get distinct results, just put the second argument to true.
To get all the attributes just put an empty array for the third parameter.
The where clause, (the fourth parameter) is just like the one for the **update** method.
To sort the results, just add some sorting properties in the fifth parameter.
To sixth attribute allows you to add an alias for the table.
Then you can specify limit and offset as the seventh and eighth attributes.
After that we have the joins as the nineth. Finally we have the group by and having as the tenth and eleventh.

Here is a more complex request:

```ts
const result = await model.select(
  'user',
  true,
  [],
  [
    { column: 'name', operator: 'LIKE', value: '%j%' },
    { keyword: 'AND' },
    { column: 'age', operator: '>=', value: 18 },
  ],
  [
    { attribute: 'name', mode: 'ASC' },
    { attribute: 'age', mode: 'DESC' },
  ],
  'default_table',
  10,
  0,
);
```

To use Join, Group by and having, here is an exemple:

```ts
const result = await model.select(
  'order',
  true,
  [
    { attribute: 'e.lastname', alias: null, function: null },
    { attribute: 'o.id', alias: 'numberoforders', function: 'COUNT' },
  ],
  [
    { column: 'e.lastname', operator: '=', value: 'Davolio' },
    { keyword: 'OR' },
    { column: 'e.lastname', operator: '=', value: 'Fuller' },
  ],
  [],
  'o',
  -1,
  0,
  [
    {
      alias: 'e',
      method: 'inner',
      tableName: 'employee',
      wheres: [{ column: 'o.employee_id', operator: '=', value: 'e.id' }],
    },
  ],
  ['e.lastname'],
  [{ column: 'COUNT(o.id)', operator: '>', value: 25 }],
);
```

Here we are translating this SQL query:

```sql
SELECT e.lastname, COUNT(o.id) AS numberoforders
FROM order o
INNER JOIN employee e ON o.employee_id = e.id
WHERE e.lastname = 'Davolio' OR e.lastname = 'Fuller'
GROUP BY e.lastname
HAVING COUNT(o.id) > 25;
```

So that was cool but kind of complex, you can use this but there's a simpler way to do it and that's what we will see next.

## Query

We made for you three classes which will help you to create your queries:

- CreateQuery
- FindQuery
- UpdateQuery
- DeleteQuery

To instantiate those classes, you must provide the table/collection name that you are targetting.

After you did your stuff, you can call the **exec** method which accepts a connection name and wich will return you a promise for your result.

### CreateQuery

Let's start with the beginning and the **CreateQuery**. First we will instantiate a new object:

```ts
const createQuery = new CreateQuery('user');
```

With our new object, we can now execute some methods. For the create query, there's actually only one method that is usefull and it's the **setAttribute**. This method takes two arguments, the column name and the value to insert. As this method returns the current object, you can chain the methods.

Here is an exemple:

```ts
createQuery
  .setAttribute('pseudo', 'JDoe')
  .setAttribute('email', 'john@doe.com');
```

Finally we can execute the query with **exec**.

```ts
const insertedId = await createQuery.exec('my connection');
```

### FindQuery

Let's instantiate a new query.

```ts
const findQuery = new FindQuery('user');
```

With our new object we can do some stuff:

- addAttribute(attributeName: string) to add a column to retrieve
- addAttributes(attributeNames: string[]) to add columns to retrieve
- alias(aliasName: string) to add an alias to the table
- distinct() to select distinct values
- limit(limit: number, offset?: number) to limit and offset the results
- sort(attributeName: string, mode: 'ASC' | 'DESC') to sort the results
- join(tableName: string, alias: string): Join to join a table
- groupBy(column: string) to group by a column
- having(column: string, operator: string, value: any): Having to add having clause

These methods are specific to the FindQuery object and are obviously chainable.

Then we have some methods which are commons to **FindQuery**, **UpdateQuery** and **DeleteQuery**, everything for the where clause.

- where(attributeName: string, operator: string, value: any) to add a where clause
- and() to add a and between where clauses
- or() to add a or between where clauses
- not() to add a not before a where clause
- group() to start a group of where clauses
- endgroup() to stop a group of where clauses

Here is an exemple:

```ts
findQuery
  .distinct()
  .where('name', 'LIKE', '%j%')
  .and()
  .where('age', '>=', 18)
  .sort('name', 'ASC')
  .sort('age', 'DESC')
  .limit(10, 0);
```

Here is a more complex exemple with join, groupBy and having

```ts
const findQuery = new FindQuery('order');
findQuery
  .distinct()
  .alias('o')
  .join('employee', 'e')
  .on('o.employee_id', '=', 'e.id')
  .endJoin()
  .where('e.lastname', '=', 'Davolio')
  .or()
  .where('e.lastname', '=', 'Fuller')
  .groupBy('e.lastname')
  .having('COUNT(o.id)', '>', '25')
  .endHaving()
  .addAttribute('e.lastname')
  .addAttribute('o.id', 'numberoforders', 'COUNT');
```

Finally we can execute the query with **exec**.

```ts
const results = await findQuery.exec('my connection');
```

### UpdateQuery

Let's instantiate a new query.

```ts
const updateQuery = new UpdateQuery('user');
```

We can now do some stuff, so we can do all the where things as the **FindQuery** but we can also use the method **setAttribute** to set the attributes we want to update.

Here is an exemple:

```ts
updateQuery
  .setAttribute('pseudo', 'JohnD')
  .where('id', '=', 12)
  .and()
  .where('age', '<', 18);
```

Finally we can execute the query with **exec**.

```ts
const updatedRows = await findQuery.exec('my connection');
```

### DeleteQuery

Let's instantiate a new query.

```ts
const deleteQuery = new DeleteQuery('user');
```

We can now do some stuff, so we can do all the _where_ things as the **FindQuery** and that's it.

Here is an exemple:

```ts
deleteQuery.where('id', '=', 12).and().where('age', '<', 18);
```

Finally we can execute the query with **exec**.

```ts
const updatedRows = await deleteQuery.exec('my connection');
```

---

That's it you are now able to make some queries easily. But we can go even further.

## Entities

**So let's talk about entities!** The entity system is based on two things, the abstract class **Entity** and the **EntityManager**.

The principles of entities is that for each type of object you want to persist to your database, you will create a new entity. Once you've done that, you will be able to create, find, update and delete data easily.

### Create an entity

Let's take an exemple, imagine we want to make an application in which there are some users which can write articles which are all in a category. For our exemple, we will only see the article entity but the others entities are available in the **exemples/entities** folder.

So let's code!

```ts
import { Entity } from '@smallprod/models';

export default class ArticleEntity extends Entity {}
```

That's a start. Here we just create a new class which is an entity, but it is kind of empty, let's fill it.

```ts
import { Entity } from '@smallprod/models';

export default class ArticleEntity extends Entity {
  public id: number;
  public title: string;
  public publishedAt: Date;
  public authors: UserEntity[];
  public category: CategoryEntity;

  // Imagine we have a constructor here
}
```

So that's better but it is not linked to our database for now. Let's fix this.

```ts
import { Entity, Table, DateTime, Id } from '@smallprod/models';

@Table('article')
export default class ArticleEntity extends Entity {
  @Id()
  public id: number;

  public title: string;

  @DateTime()
  public publishedAt: Date;

  public authors: UserEntity[];
  public category: CategoryEntity;

  // Imagine we have a constructor here
}
```

Cool! So here what we did is, first, explicitly say, this is an entity and it's linked to the table named _article_, then we said that the id was the id of the table which is really important as you will see after, finally we said the the publishedAt is a datetime column.

But we still need to specify the relationship to the **UserEntity** and the **CategoryEntity**.

```ts
import {
  Entity,
  Table,
  DateTime,
  Id,
  ManyToMany,
  ManyToOne,
} from '@smallprod/models';

@Table('article')
export default class ArticleEntity extends Entity {
  @Id()
  public id: number;

  public title: string;

  @DateTime()
  public publishedAt: Date;

  @ManyToMany('user', false)
  public authors: UserEntity[];

  @ManyToOne('category', true)
  public category: CategoryEntity;

  // Imagine we have a constructor here
}
```

Here what we did is that we said that authors is a many to many relationship to the table _user_, we also said with the _false_ that we did not want to auto fetch all the authors when we retrieve an author. We did the same thing for the category but with a many to one relationship and an auto fetch.

The problem is that if we do not have auto fetch, we cannot retrieve the authors of an article for now so let's fix this.

```ts
import {
  Entity,
  Table,
  DateTime,
  Id,
  ManyToMany,
  ManyToOne,
} from '@smallprod/models';

@Table('article')
export default class ArticleEntity extends Entity {
  @Id()
  public id: number;

  public title: string;

  @DateTime()
  public publishedAt: Date;

  @ManyToMany('user', false)
  public authors: UserEntity[];

  @ManyToOne('category', true)
  public category: CategoryEntity;

  // Imagine we have a constructor here

  public fetchAuthors = async () => {
    return await this.fetch('authors');
  };
}
```

Perfect! So what we did is just had a new method which will retrieve the authors, be carefull that the parameter of the **fetch** method must be the name of the attribute (here _authors_).

We just need one more thing for our entity to work, register it to the **EntityManager**. This can be done in two ways:

```ts
EntityManager.registerEntity(ArticleEntity);
/* Or */
EntityManager.registerEntities([ArticleEntity, UserEntity, CategoryEntity]);
```

The first method can be much easier as you do it in the file of the class. But the second one is more recommended to be sure every entities are registered even though not every entity file has been imported.

That's it for our entity, we can now make some requests.

### Making requests from our entity

The **Entity** class gives you some usefull methods:

Some static ones:

- findOne(context?: Context): FindQuery exec will return an Entity
- findById(id: any, context?: Context): Entity | null
- findMany(context?: Context): FindQuery exec will return an array of Entity

We will talk about the context later but remember that you can use it here.

So we can easily find some entities like that:

```ts
const femaleUsers: UserEntity[] = await UserEntity.findMany()
  .where('gender', '=', 'female')
  .exec();

const userWithId12: UserEntity | null = await UserEntity.findById(12);

const firstMaleUser: UserEntity | null = await UserEntity.findOne()
  .where('gender', '=', 'male')
  .exec();
```

But there are also non static methods given by the **Entity** class:

- create(dbName?: string, context?: string)
- update(dbName?:string)
- delete(dbName?: string, context?: string)

Thoses methods will manage your entity easily.

We can imagine something like this:

```ts
// Function to create an article
const article = new ArticleEntity(title, Date.now(), authors, category);
const newArticle = await article.create();
if (!newArticle) {
  throw Error('Unexpected error');
}
return newArticle;

// Function to update an article
const article = await ArticleEntity.findById(articleId);
if (!article) {
  return null;
}
article.title = newTitle;
if (!(await article.update())) {
  throw Error('Unexpected error');
}
return article;

// Function to delete an article
const article = await ArticleEntity.findById(articleId);
if (article) {
  await article.delete();
}

// Function to find all articles
const articles = await ArticleEntity.findMany().exec();
return articles;
```

### Context(s)

Contexts are essential especially when you work with many to many relationships which are defined to be auto fetched. Contexts will prevent any endless loop to happened when fetching the relationships.
But context can also be very usefull to separate different execution on a web server or when working with multi-threading.

By default, if you didn't specify any context when working with entities, you will use a default common context.

Let's create a new context:

```ts
const context = EntityManager.createContext();
```

Then we can use it in some methods for our entities and finally, when we are done, we can close it.

```ts
EntityManager.closeContext(context);
```

For **express** users, we made a middleware to make it easy for you.

In your route, you will use it like so:

```ts
import { withContext } from '@smallprod/models';

router.post('/user', withContext(userController));
```

And the **userController** may look like this:

```ts
const userController = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const context = res.locals.modelContext;

  // Use the context as you want
  // You do not need to create or close it anywhere
};
```

### Auto create and update table schema

A feature that can be really usefull with entities is the automation of the creation and the modification of the table schema.

Let's get back our **ArticleEntity**:

```ts
import {
  Entity,
  Table,
  DateTime,
  Id,
  ManyToMany,
  ManyToOne,
} from '@smallprod/models';

@Table('article')
export default class ArticleEntity extends Entity {
  @Id()
  public id: number;

  public title: string;

  @DateTime()
  public publishedAt: Date;

  @ManyToMany('user', false)
  public authors: UserEntity[];

  @ManyToOne('category', true)
  public category: CategoryEntity;

  // Imagine we have a constructor here

  public fetchAuthors = async () => {
    return await this.fetch('authors');
  };
}
```

The first thing we should do is to put the type of the attributes.

```ts
import {
  Entity,
  Table,
  DateTime,
  Id,
  ManyToMany,
  ManyToOne,
  BigInt,
  Varchar,
} from '@smallprod/models';

@Table('article')
export default class ArticleEntity extends Entity {
  @Id()
  @BigInt()
  public id: number;

  @Varchar(50)
  public title: string;

  @DateTime()
  public publishedAt: Date;

  @ManyToMany('user', false)
  public authors: UserEntity[];

  @ManyToOne('category', true)
  public category: CategoryEntity;

  // Imagine we have a constructor here

  public fetchAuthors = async () => {
    return await this.fetch('authors');
  };
}
```

So we didn't do so much here, we now need to specify how our id works.

```ts
import {
  Entity,
  Table,
  DateTime,
  Id,
  ManyToMany,
  ManyToOne,
  BigInt,
  Varchar,
  AutoIncrement,
  PrimaryKey,
} from '@smallprod/models';

@Table('article')
export default class ArticleEntity extends Entity {
  @Id()
  @BigInt()
  @AutoIncrement()
  @PrimaryKey()
  public id: number;

  @Varchar(50)
  public title: string;

  @DateTime()
  public publishedAt: Date;

  @ManyToMany('user', false)
  public authors: UserEntity[];

  @ManyToOne('category', true)
  public category: CategoryEntity;

  // Imagine we have a constructor here

  public fetchAuthors = async () => {
    return await this.fetch('authors');
  };
}
```

We can use other things like **@Unique()** or **@Default()**, it's pretty straight forward so we won't talk about them here but feel free to ask if you have any question.

Now we just need to say that the schema must be auto created and updated

```ts
import {
  Entity,
  Table,
  DateTime,
  Id,
  ManyToMany,
  ManyToOne,
  BigInt,
  Varchar,
  AutoIncrement,
  PrimaryKey,
  AutoCreateNUpdate,
} from '@smallprod/models';

@Table('article')
@AutoCreateNUpdate()
export default class ArticleEntity extends Entity {
  @Id()
  @BigInt()
  @AutoIncrement()
  @PrimaryKey()
  public id: number;

  @Varchar(50)
  public title: string;

  @DateTime()
  public publishedAt: Date;

  @ManyToMany('user', false)
  public authors: UserEntity[];

  @ManyToOne('category', true)
  public category: CategoryEntity;

  // Imagine we have a constructor here

  public fetchAuthors = async () => {
    return await this.fetch('authors');
  };
}
```

That's it, every time you will start your application the system will analyze if some tables must be created or modified and will act in consequence. It will also generate migration files.

---

That's it you are now ready to use the entity system and the query system.

## Migrations

The migration process is not simple but we are working on it.

The first thing you should do is to copy the file **exemples/migration.js** into your workspace. You will then be able to run some commands, two actually:

- node ./path to migration.js migrate
- node ./path to migration.js reset

In the **migration.js** file you should change some things like the migration path and the informations about your connection(s).

After you done that, you can create some migrations, in your migration folder (migration path) you can create as many migrations as you want.

A migration file should be a Js file and should look like this:

```js
const Migration = require('@smallprod/models').Migration;

/**
 * @param {Migration} migration
 */
const up = (migration) => {};

/**
 * @param {Migration} migration
 */
const down = (migration) => {};

module.exports = {
  up,
  down,
  name: 'migrationname',
};
```

The first important thing here is the name of the migration, it should be unique and should not change.

Then we have those two functions **up** and **down** which take a migration as parameter.

The up function will be called if you run the **migrate** command and the down function will be called if you run the **reset** command.

So in the up, you should do what you want, create a table, alter a table, drop a table or seed a table and in the down, you should put back the database as it was before the up.

So now, let's see what we can do!

From the **migration** parameter, you have access to severel methods:

- createTable(tableName: string): CreateTable
- alterTable(tableName: string): AlterTable
- seedTable(tableName: string): SeedTable
- dropTable(tableName: string): DropTable

Now let's see the different object you can use.

### CreateTable

Let's start by instantiating our object.

```js
const createTable = migration.createTable('user');
```

Now we have a **CreateTable** object in the **createTable** variable. With this object, you can call one method which is **addField()** to add a field (a column) to your table.

This **addField** method will return you a **Field** object, we will see just after what we can do with this object. But first **addField**, this method must be called with two parameter, the name of the field and the type of the field.

Let's talk about the **Field** object now, here we have a lot of methods to call, here is the list:

- allowNull()
- unique()
- default(defaultValue: string, systemFunction: boolean = false) to set the default value of the field, this can be a system function
- check(checkValue: string) add a check constraint to the field
- length(len: number) to set the max length of the value of the field
- autoIncrement()
- primary()
- foreign(table: string, column: string) add a foreign key constraint with

This can be hard to understand so let's see an exemple:

```js
createTable.addField('id', 'bigint').autoIncrement().primary();
createTable.addField('pseudo', 'varchar').length(50);
createTable.addField('email', 'varchar').length(50).unique();
createTable.addField('gender', 'boolean').allowNull();
createTable.addField('createdAt', 'datetime').default('NOW', true);
createTable.addField('age', 'int').default('18').check('>=18');
createTable.addField('job_id', 'bigint').foreign('job', 'id');
```

You can see that it's quite simple to read. We have a primary key named id which will be auto incremented. A datetime field named createdAt which will have as default value the actual date and time, an age field which has a default value of 18 and wich must be greater or equal than 18. Finally we have a foreign key named job_id wich references the field id of the table job.

### AlterTable

Let's start by instantiating our object.

```js
const alterTable = migration.alterTable('user');
```

With our new object we have access to two methods which are **addField** and **removeField**. So if you want to modify a field you should remove it and add it again with your modifications.

The **addField** method is the same as the one in **CreateTable** so you have access to the same methods. The **removeField** method takes only one argument which is the name of the field to remove.

Here is an exemple:

```js
alterTable.removeField('age');
alterTable.removeField('pseudo');
alterTable.addField('pseudo', 'varchar').length(50).unique();
alterTable.addField('birthDate', 'date');
```

That's it for the **AlterTable**!

### SeedTable

Let's start by instantiating our object.

```js
const seedTable = migration.seedTable('user');
```

With our new object, we have access to two methods, **addRow** and **clearTable**, for now there's no method to remove a row but we are working on it.

Let's start with **addRow**, this method takes no parameter and return a **SeedRow** object which gives you access to a method named **add** which allows you to set a column and value for the row.

Let's see an exemple:

```js
seedTable
  .addRow()
  .add('pseudo', 'JDoe')
  .add('email', 'john@doe.com')
  .add('job_id', 2);
```

Here we just add one row and we set the pseudo, the email and the job of a new user.

Then we have the **clearTable** method which is quite simple as it will remove all the datas from the table.

### DropTable

Let's start by instantiating our object.

```js
const seedTable = migration.seedTable('user');
```

Well that's it, you just removed the table user.

---

That's it for this documentation! If you have any question feel free to ask at this address apier@smallprod.com or add an issue on GitHub.
