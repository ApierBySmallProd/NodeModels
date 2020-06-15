import { AttrAndAlias, Attribute, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import GlobalModel from './global.db';
import mysql from 'mysql';
export default class GlobalMariaModel extends GlobalModel {
    protected pool: mysql.Pool | null;
    private transactionConnection;
    query: (query: string, params?: string[] | undefined, throwErrors?: boolean) => Promise<any>;
    insert: (tableName: string, attributes: Attribute[]) => Promise<any>;
    select: (tableName: string, distinct: boolean, attributes: AttrAndAlias[], wheres: (WhereAttribute | WhereKeyWord)[], sorts: SortAttribute[], limit: number, offset?: number) => Promise<any>;
    update: (tableName: string, attributes: Attribute[], wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<any>;
    delete: (tableName: string, wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<any>;
    startTransaction: () => Promise<boolean>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
    setPool: (config: mysql.PoolConfig) => Promise<void>;
    private getConnection;
    private getWhereAttributes;
    private computeAttributes;
    private computeAttributeFunction;
    private computeWhere;
    private computeSort;
    private computeSortMode;
    private isWhereAttribute;
    private computeWhereAttribute;
    private computeWhereKeyWord;
}
