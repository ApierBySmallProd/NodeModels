import DbManager from './dbs/dbmanager';
import Entity from './entities/entity';
import Maria from './dbs/global/maria.db';
import Migration from './migration/migration';
import MigrationManager from './migration/migration.manager';
import PG from './dbs/global/postgres.db';
declare const _default: {
    Entity: typeof Entity;
    DbManager: typeof DbManager;
    db: {
        PG: typeof PG;
        Maria: typeof Maria;
    };
    migration: {
        MigrationManager: typeof MigrationManager;
        Migration: typeof Migration;
    };
};
export default _default;
export { default as Entity, Id, NonPersistent, PrimaryKey, Table, } from './entities/entity';
export { default as DbManager } from './dbs/dbmanager';
