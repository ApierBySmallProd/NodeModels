import Entity from '../entity';
export declare function Table(tableName: string): <T extends {
    new (...args: any[]): Entity;
    ready: boolean;
    create: () => any;
    tableName: string;
    autoCreateNUpdate: boolean;
}>(constructor: T) => {
    new (...args: any[]): {
        persisted: boolean;
        relations: any[];
        create: (dbName?: string | null) => Promise<any | null>;
        update: (dbName?: string | null) => Promise<any | null>;
        delete: (dbName?: string | null) => Promise<boolean>;
        fetch: (field: string) => Promise<void>;
    };
    ready: boolean;
    create: () => any;
    tableName: string;
    autoCreateNUpdate: boolean;
} & T;
export declare function AutoCreateNUpdate(): <T extends {
    new (...args: any[]): Entity;
    autoCreateNUpdate: boolean;
    tableName: string;
}>(constructor: T) => {
    new (...args: any[]): {
        persisted: boolean;
        relations: any[];
        create: (dbName?: string | null) => Promise<any | null>;
        update: (dbName?: string | null) => Promise<any | null>;
        delete: (dbName?: string | null) => Promise<boolean>;
        fetch: (field: string) => Promise<void>;
    };
    autoCreateNUpdate: boolean;
    tableName: string;
} & T;
export declare function NonPersistent(): (target: any, key: string) => void;
export declare function Id(): (target: any, key: string) => void;
