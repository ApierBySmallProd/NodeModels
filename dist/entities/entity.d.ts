import DeleteQuery from './querys/delete.query';
import { Field } from '../migration/types/createtable';
import FindQuery from './querys/find.query';
import { Relationship } from './types';
export default abstract class Entity {
    static tableName: string;
    static columns: Field[];
    static nonPersistentColumns: string[];
    static primaryKeys: string[];
    static id: string;
    static autoCreateNUpdate: boolean;
    static initialized: boolean;
    static ready: boolean;
    static relations: Relationship[];
    static create: () => any;
    static findOne(): FindQuery;
    static findMany(): FindQuery;
    static findById(id: any): Promise<any>;
    static deleteById(id: any): Promise<number | undefined>;
    static delete(): DeleteQuery;
    private static generateEntity;
    persisted: boolean;
    relations: any[];
    create: (dbName?: string | null) => Promise<this | null>;
    update: (dbName?: string | null) => Promise<this | null>;
    delete: (dbName?: string | null) => Promise<boolean>;
    fetch: (field: string) => Promise<void>;
}
