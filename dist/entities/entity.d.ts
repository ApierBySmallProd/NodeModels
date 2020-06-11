import { Field } from '../migration/types/createtable';
import FindQuery from './querys/find.query';
export default abstract class Entity {
    static tableName: string;
    static nonPersistentColumns: string[];
    static columns: Field[];
    static primaryKeys: string[];
    static id: string;
    static autoCreateNUpdate: boolean;
    static create: () => void;
    static findOne(): FindQuery;
    static findMany(): FindQuery;
    static findById(id: any): Promise<any>;
    create: (dbName?: string | null) => Promise<this | null>;
    update: (dbName?: string | null) => Promise<this | null>;
    delete: (dbName?: string | null) => Promise<boolean>;
}
