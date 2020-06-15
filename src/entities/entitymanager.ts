import Entity from './entity';
import { makeMigrations } from './automigration';

export interface IEntity {
  tableName: string;
  entity: any;
}

export default class EntityManager {
  public static waitingEntities: any[] = [];
  public static entities: IEntity[] = [];
  public static manyToManyTables: any[] = [];
  public static initialize = async () => {
    EntityManager.initializingEntities = true;
    while (EntityManager.waitingEntities.length) {
      await makeMigrations(EntityManager.waitingEntities.pop());
    }
    EntityManager.initializingEntities = false;
  };

  public static registerEntity<
    T extends { tableName: string; new (...args: any[]): Entity }
  >(entity: T) {
    this.registeredEntities.push(entity);
    new entity();
  }

  public static registerEntities<
    T extends { tableName: string; new (...args: any[]): Entity }
  >(entities: T[]) {
    this.registeredEntities = this.registeredEntities.concat(entities);
    entities.forEach((entity) => new entity());
  }

  public static registerManyToManyTable = (
    table1: string,
    table2: string,
    relationTable: string,
  ) => {
    EntityManager.manyToManyTables.push({ table1, table2, relationTable });
  };

  public static addEntity = (entity: Entity) => {
    EntityManager.allEntities.push(entity);
  };

  public static findEntity = (table: string, id: any = null) => {
    if (id) {
      return EntityManager.allEntities.find(
        (f: any) =>
          f.constructor.tableName === table && f[f.constructor.id] === id,
      );
    }
    return EntityManager.allEntities.filter(
      (f: any) => f.constructor.tableName === table,
    );
  };

  private static allEntities: Entity[] = [];
  private static registeredEntities: any[] = [];
  private static initializingEntities = false;
}
