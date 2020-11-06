import Entity from './entity';
import MigrationEntity from './migration.entity';
import { makeMigrations } from './automigration';

export interface IEntity {
  tableName: string;
  entity: any;
}

export default class EntityManager {
  public static waitingEntities: any[] = [];
  public static entities: IEntity[] = [];
  public static manyToManyTables: any[] = [];
  public static initializedEntities: string[] = [];
  public static initialize = async (dbName?: string) => {
    MigrationEntity.reset();
    EntityManager.initializingEntities = true;
    while (EntityManager.waitingEntities.length) {
      await makeMigrations(EntityManager.waitingEntities.pop(), dbName);
    }
    EntityManager.initializingEntities = false;
  };

  public static createContext = (): Context => {
    let id: string;
    do {
      id = Math.floor(Math.random() * 10000 + 1).toString();
    } while (EntityManager.contexts.find((c) => c.id === id));
    const newContext: Context = {
      id,
      entities: [],
    };
    EntityManager.contexts.push(newContext);
    return newContext;
  };

  public static closeContext = (context: Context) => {
    EntityManager.contexts = EntityManager.contexts.filter(
      (c) => c.id !== context.id,
    );
  };

  public static clearContext = (context: Context) => {
    context.entities = [];
  };

  public static registerEntity<
    T extends { tableName: string; new (...args: any[]): Entity }
  >(entity: T) {
    this.registeredEntities.push(entity);
    new (entity as any)();
  }

  public static registerEntities<
    T extends { tableName: string; new (...args: any[]): Entity }
  >(entities: T[]) {
    this.registeredEntities = this.registeredEntities.concat(entities);
    entities.forEach((entity: any) => new entity());
  }

  public static clearRegisteredEntities() {
    this.registeredEntities = [];
  }

  public static registerManyToManyTable = (
    table1: string,
    table2: string,
    relationTable: string,
  ) => {
    EntityManager.manyToManyTables.push({ table1, table2, relationTable });
  };

  public static addEntity = (entity: Entity, context?: Context) => {
    if (!context) {
      context = EntityManager.contexts[0];
    }
    context.entities.push(entity);
  };

  public static findEntity = (
    table: string,
    id: any = null,
    context?: Context,
  ) => {
    if (!context) {
      context = EntityManager.contexts[0];
    }
    if (id) {
      return context.entities.find(
        (f: any) =>
          f.constructor.tableName === table && f[f.constructor.id] === id,
      );
    }
    return context.entities.filter(
      (f: any) => f.constructor.tableName === table,
    );
  };

  public static removeEntity = (entity: Entity, context?: Context) => {
    if (!context) {
      context = EntityManager.contexts[0];
    }
    const ent = entity as any;
    context.entities = context.entities.filter(
      (e: any) =>
        e.constructor.tableName === ent.constructor.tableName &&
        e[e.constructor.id] === ent[ent.constructor.id],
    );
  };
  private static contexts: Context[] = [{ entities: [], id: 'default' }];
  private static registeredEntities: any[] = [];
  private static initializingEntities = false;
}

export interface Context {
  entities: Entity[];
  id: string;
}
