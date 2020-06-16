import { AttrAndAlias, Attribute, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import GlobalSqlModel from './global.sql';
import mysql from 'mysql';
export default class GlobalMariaModel extends GlobalSqlModel {
    protected pool: mysql.Pool | null;
    private transactionConnection;
    query: (query: string, params?: string[] | undefined, throwErrors?: boolean) => Promise<any>;
    insert: (tableName: string, attributes: Attribute[]) => Promise<any>;
    select: (tableName: string, distinct: boolean, attributes: AttrAndAlias[], wheres: (WhereAttribute | WhereKeyWord)[], sorts: SortAttribute[], tableAlias: string, limit: number, offset?: number) => Promise<any>;
    update: (tableName: string, attributes: Attribute[], wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<any>;
    delete: (tableName: string, wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<any>;
    startTransaction: () => Promise<boolean>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
    setPool: (config: mysql.PoolConfig) => Promise<void>;
    private getConnection;
}
