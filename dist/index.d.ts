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
export { default as Entity } from './entities/entity';
export { default as DbManager } from './dbs/dbmanager';
export { default as MigrationManager } from './migration/migration.manager';
export { default as Migration } from './migration/migration';
export { BigInt, Binary, Bit, Blob, Bool, Char, Date, DateTime, Decimal, Double, Float, Int, LongBlob, LongText, MediumBlob, MediumInt, SmallInt, Text, Time, Timestamp, TinyBlob, TinyText, Tinyint, VarBinary, Varchar, Year, } from './entities/decorators/fieldtype';
export { AutoCreateNUpdate, Id, NonPersistent, Table, } from './entities/decorators/other';
export { AllowNull, AutoIncrement, Check, Default, PrimaryKey, Unique, } from './entities/decorators/property';
