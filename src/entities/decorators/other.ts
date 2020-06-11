import CreateTable from '../../migration/types/createtable';
import DbManager from '../../dbs/dbmanager';
import Entity from '../entity';
import MigrationManager from '../../migration/migration.manager';

// tslint:disable-next-line: function-name
export function Table(tableName: string) {
  return <
    T extends {
      tableName: string;
      autoCreateNUpdate: boolean;
      create: () => any;
      new (...args: any[]): Entity;
    }
  >(
    constructor: T,
  ) => {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        constructor.tableName = tableName;
        constructor.create = () => new constructor();
        if (constructor.autoCreateNUpdate) {
          makeMigrations(constructor);
        }
      }
    };
  };
}

// tslint:disable-next-line: function-name
export function AutoCreateNUpdate() {
  return <
    T extends {
      autoCreateNUpdate: boolean;
      tableName: string;
      new (...args: any[]): Entity;
    }
  >(
    constructor: T,
  ) => {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        constructor.autoCreateNUpdate = true;
        if (constructor.tableName) {
          makeMigrations(constructor);
        }
      }
    };
  };
}

// tslint:disable-next-line: function-name
export function NonPersistent() {
  return (target: any, key: string) => {
    target.constructor.nonPersistentColumns.push(key);
  };
}

// tslint:disable-next-line: function-name
export function Id() {
  return (target: any, key: string) => {
    target.constructor.id = key;
  };
}

const makeMigrations = async (constructor: any) => {
  const manager = new MigrationManager(DbManager.get().getConfig());
  const globalMigration = await manager.analyzeMigrations(
    constructor.tableName,
  );
  const newSchema = new CreateTable(constructor.tableName);
  newSchema.fields = constructor.columns;
  const migration = globalMigration.compareSchema(newSchema);
  if (migration) {
    await manager.createMigration(migration);
  }
};
