import Entity from './entity';
export interface IEntity {
    tableName: string;
    entity: any;
}
export default class EntityManager {
    static waitingEntities: any[];
    static entities: IEntity[];
    static manyToManyTables: any[];
    static initialize: () => Promise<void>;
    static createContext: () => Context;
    static closeContext: (context: Context) => void;
    static registerEntity<T extends {
        tableName: string;
        new (...args: any[]): Entity;
    }>(entity: T): void;
    static registerEntities<T extends {
        tableName: string;
        new (...args: any[]): Entity;
    }>(entities: T[]): void;
    static registerManyToManyTable: (table1: string, table2: string, relationTable: string) => void;
    static addEntity: (entity: Entity, context?: Context | undefined) => void;
    static findEntity: (table: string, id?: any, context?: Context | undefined) => Entity | Entity[] | undefined;
    static removeEntity: (entity: Entity, context?: Context | undefined) => void;
    private static contexts;
    private static registeredEntities;
    private static initializingEntities;
}
export interface Context {
    entities: Entity[];
    id: string;
}
