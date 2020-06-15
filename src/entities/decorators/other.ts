import Entity from '../entity';
import EntityManager from '../entitymanager';

// tslint:disable-next-line: function-name
export function Table(tableName: string) {
  return <
    T extends {
      ready: boolean;
      create: () => any;
      tableName: string;
      autoCreateNUpdate: boolean;
      new (...args: any[]): Entity;
    }
  >(
    constructor: T,
  ) => {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        constructor.create = () => new constructor();
        constructor.tableName = tableName;
        constructor.ready = true;
        EntityManager.entities.push({ tableName, entity: constructor });
        if (constructor.autoCreateNUpdate) {
          EntityManager.waitingEntities.push(constructor);
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
          EntityManager.waitingEntities.push(constructor);
        }
      }
    };
  };
}

// tslint:disable-next-line: function-name
export function NonPersistent() {
  return (target: any, key: string) => {
    if (!target.constructor.nonPersistentColumns)
      target.constructor.nonPersistentColumns = [];
    target.constructor.nonPersistentColumns.push(key);
  };
}

// tslint:disable-next-line: function-name
export function Id() {
  return (target: any, key: string) => {
    target.constructor.id = key;
  };
}
