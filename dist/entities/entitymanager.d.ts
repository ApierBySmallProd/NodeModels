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
    static registerEntity<T extends {
        tableName: string;
        new (...args: any[]): Entity;
    }>(entity: T): void;
    static registerEntities<T extends {
        tableName: string;
        new (...args: any[]): Entity;
    }>(entities: T[]): void;
    static registerManyToManyTable: (table1: string, table2: string, relationTable: string) => void;
    static addEntity: (entity: Entity) => void;
    static findEntity: (table: string, id?: any) => Entity | Entity[] | undefined;
    private static allEntities;
    private static registeredEntities;
    private static initializingEntities;
}
