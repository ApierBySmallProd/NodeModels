import DbManager from './dbs/dbmanager';
import Entity from './entities/entity';
import Maria from './dbs/global/maria.db';
import Migration from './migration/migration';
import MigrationManager from './migration/migration.manager';
import PG from './dbs/global/postgres.db';
import UserEntity from './entities/user.entity';

export default {
  Entity,
  DbManager,
  db: {
    PG,
    Maria,
  },
  migration: {
    MigrationManager,
    Migration,
  },
};

export { default as Entity } from './entities/entity';
export { default as DbManager } from './dbs/dbmanager';
export { default as MigrationManager } from './migration/migration.manager';
export { default as Migration } from './migration/migration';

/* Decorators */
export {
  BigInt,
  Binary,
  Bit,
  Blob,
  Bool,
  Char,
  Date,
  DateTime,
  Decimal,
  Double,
  Float,
  Int,
  LongBlob,
  LongText,
  MediumBlob,
  MediumInt,
  SmallInt,
  Text,
  Time,
  Timestamp,
  TinyBlob,
  TinyText,
  Tinyint,
  VarBinary,
  Varchar,
  Year,
} from './entities/decorators/fieldtype';
export {
  AutoCreateNUpdate,
  Id,
  NonPersistent,
  Table,
} from './entities/decorators/other';
export {
  AllowNull,
  AutoIncrement,
  Check,
  Default,
  PrimaryKey,
  Unique,
} from './entities/decorators/property';

/*
(async () => {
  const dbManager = DbManager.get(); // Get the database manager
  dbManager.setConfig({ migrationPath: 'migrationexemple' });

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
  const user = new UserEntity('toto', 'doe', 'email', 'birthdate');
  console.log(user);
})();
*/
