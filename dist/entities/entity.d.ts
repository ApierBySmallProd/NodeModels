import FindQuery from './querys/find.query';
export default abstract class Entity {
    static tableName: string;
    static nonPersistentColumns: string[];
    static primaryKeys: string[];
    static id: string;
    static create: () => void;
    static findOne(): FindQuery;
    static findMany(): FindQuery;
    static findById(id: any): Promise<any>;
    create: (dbName?: string | null) => Promise<this | null>;
    update: (dbName?: string | null) => Promise<this | null>;
    delete: (dbName?: string | null) => Promise<boolean>;
}
export declare function Table(tableName: string): <T extends {
    new (...args: any[]): Entity;
    tableName: string;
    create: () => any;
}>(constructor: T) => {
    new (...args: any[]): {
        create: (dbName?: string | null) => Promise<any | null>;
        update: (dbName?: string | null) => Promise<any | null>;
        delete: (dbName?: string | null) => Promise<boolean>;
    };
    tableName: string;
    create: () => any;
} & T;
export declare function NonPersistent(): (target: any, key: string) => void;
export declare function PrimaryKey(): (target: any, key: string) => void;
export declare function Id(): (target: any, key: string) => void;
