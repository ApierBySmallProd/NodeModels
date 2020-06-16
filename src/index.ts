import DbManager from './dbs/dbmanager';
import Entity from './entities/entity';
import EntityManager from './entities/entitymanager';
import Migration from './migration/migration';
import MigrationManager from './migration/migration.manager';

export default {
  Entity,
  EntityManager,
  DbManager,
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
export { default as FindQuery } from './entities/querys/find.query';
export { default as CreateQuery } from './entities/querys/create.query';
export { default as DeleteQuery } from './entities/querys/delete.query';
export { default as UpdateQuery } from './entities/querys/update.query';

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
