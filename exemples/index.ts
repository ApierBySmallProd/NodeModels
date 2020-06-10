import { DbManager } from '@smallprod/models';
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

  const user = new UserEntity('John', 'Doe', 'john@doe.com', '1990-01-01');

  // await user.create(); // Use this to persist a new user in the database

  // user.setEmail('pablo_mo@orange.fr');
  // await user.update(); // Use this to update a user in the database

  // await user.delete(); // Use this to delete a user in the database

  // const foundUser = await UserEntity.findById(12); // User this to find a user in the database

  // await user.find().setAttributes(['id', 'email', 'age']).where('age', '=', '18') // You can make massive request if you want
  process.exit(0);
})();
