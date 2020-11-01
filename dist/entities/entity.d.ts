import { Context } from './entitymanager';
import DeleteQuery from './querys/delete.query';
import FieldEntity from './field.entity';
import FindQuery from './querys/find.query';
import { Relationship } from './types';
export default abstract class Entity {
    static tableName: string;
    static columns: FieldEntity[];
    static nonPersistentColumns: string[];
    static primaryKeys: string[];
    static id: FieldEntity | null;
    static autoCreateNUpdate: boolean;
    static initialized: boolean;
    static ready: boolean;
    static relations: Relationship[];
    static create: () => any;
    static findOne(context?: Context): FindQuery;
    static findMany(context?: Context): FindQuery;
    static findById(id: any, context?: Context): Promise<any>;
    static deleteById(id: any): Promise<number | undefined>;
    static delete(): DeleteQuery;
    private static generateEntity;
    persisted: boolean;
    relations: any[];
    create: (dbName?: string | null, context?: Context | undefined) => Promise<this | null>;
    update: (dbName?: string | null) => Promise<this | null>;
    delete: (dbName?: string | null, context?: Context | undefined) => Promise<boolean>;
    fetch: (field: string, context?: Context | undefined) => Promise<void>;
}
