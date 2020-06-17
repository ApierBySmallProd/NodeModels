import { CreateQuery, DbManager } from '@smallprod/models';

import UserEntity from './entities/user.entity';

(async () => {
  const dbManager = DbManager.get(); // Get the database manager
  await dbManager.add(
    'mariadb',
    'localhost',
    3306,
    'make_admin',
    'secret',
    'make_db',
    '', // This is the name of the connection which is usefull if you have multiple databases
    true,
  ); // Add a new database connection

  dbManager.setConfig({ migrationPath: 'my path to migrations' });
  const model = dbManager.get();
  const response = await model.query('');
  const deletedRows = await model.delete('user', [
    { column: 'id', operator: '=', value: 12 },
    { keyword: 'AND' },
    { column: 'age', operator: '<', value: 18 },
  ]);

  await model.select(
    'user',
    true,
    [{ attribute: 'email', alias: 'user_email', function: null }],
    [],
    [{ attribute: '', mode: '' }],
    'default_table',
    -1,
    0,
  );

  await model.delete('user');

  const user = new UserEntity('John', 'Doe', 'john@doe.com', '1990-01-01');

  // await user.create(); // Use this to persist a new user in the database

  // user.setEmail('pablo_mo@orange.fr');
  // await user.update(); // Use this to update a user in the database

  // await user.delete(); // Use this to delete a user in the database

  // const foundUser = await UserEntity.findById(12); // User this to find a user in the database

  // await user.find().setAttributes(['id', 'email', 'age']).where('age', '=', '18') // You can make massive request if you want
  new FindQuery('user').alias('u').join('job', 'j');
  process.exit(0);
})();
