import {
  CreateQuery,
  DbManager,
  DeleteQuery,
  FindQuery,
  UpdateQuery,
} from '@smallprod/models';

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

  await model.select(
    'user',
    true,
    [{ attribute: 'email', alias: 'user_email', function: null }],
    [],
    [{ attribute: '', mode: 'ASC' }],
    'default_table',
    -1,
    0,
    [],
    [],
    [],
  );

  const updatedRows = await model.update(
    'user',
    [{ column: 'pseudo', value: 'JohnD' }],
    [
      { column: 'id', operator: '=', value: 12 },
      { keyword: 'AND' },
      { column: 'age', operator: '<', value: 18 },
    ],
  );

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
    [],
    [],
    [],
  );

  // await user.create(); // Use this to persist a new user in the database

  // user.setEmail('pablo_mo@orange.fr');
  // await user.update(); // Use this to update a user in the database

  // await user.delete(); // Use this to delete a user in the database

  // const foundUser = await UserEntity.findById(12); // User this to find a user in the database

  // await user.find().setAttributes(['id', 'email', 'age']).where('age', '=', '18') // You can make massive request if you want
  new FindQuery('user').alias('u').join('job', 'j');
  process.exit(0);
})();
