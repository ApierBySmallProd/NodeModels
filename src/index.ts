import DbManager from './dbs/dbmanager';
import Entity from './entities/entity';
import Maria from './dbs/global/maria.db';
import Migration from './migration/migration';
import MigrationManager from './migration/migration.manager';
import PG from './dbs/global/postgres.db';

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

export {
  default as Entity,
  Id,
  NonPersistent,
  PrimaryKey,
  Table,
} from './entities/entity';
export { default as DbManager } from './dbs/dbmanager';
