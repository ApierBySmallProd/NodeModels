# Models by SmallProd

## Presentation

This library has been made to help for the development of application which need connections to a database.

You can find exemple in the folder **src/dbs/exemples**.

## Supported Database engine

- Postgres

## How to use it ??

### Postgres

1. In your model folder add a file just like the one presented in the exemple, just change the informations about your database

2. In the root of your application call this method:

```ts
import { ConnectDb } from './models/postgremodel';
(async () => {
  await ConnectDb();
})();
```

3. In your model folder add a file for handling database requests like so:

```ts
import PostgreModel from '../postgremodel';
const model = PostgreModel.GetModel();

const getUsers = async () => {
  return await model.query('SELECT * FROM User');
};

const getUserById = async (id: number) => {
  return await model.query('SELECT * FROM User WHERE Id = $1', [id]);
};
```

That's it !!
