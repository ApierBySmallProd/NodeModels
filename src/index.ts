import DbManager from './dbs/dbmanager';
import Entity from './entities/entity';
import EntityManager from './entities/entitymanager';
import Maria from './dbs/global/maria.db';
import Migration from './migration/migration';
import MigrationManager from './migration/migration.manager';
import PG from './dbs/global/postgres.db';

export default {
  Entity,
  EntityManager,
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
export { default as EntityManager } from './entities/entitymanager';

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
  ManyToMany,
  ManyToOne,
  OneToMany,
} from './entities/decorators/property';
