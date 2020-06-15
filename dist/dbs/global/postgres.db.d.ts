import { AttrAndAlias, Attribute, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';
import GlobalModel from './global.db';
export default class GlobalPostgreModel extends GlobalModel {
    protected pool: Pool | null;
    protected transactionConnection: PoolClient | null;
    protected transactionDone: (() => void) | null;
    query: (query: string, params?: string[] | undefined, throwErrors?: boolean) => Promise<QueryResult<any> | null>;
    insert: (tableName: string, attributes: Attribute[]) => Promise<QueryResult<any> | null>;
    select: (tableName: string, distinct: boolean, attributes: AttrAndAlias[], wheres: (WhereAttribute | WhereKeyWord)[], sorts: SortAttribute[], limit: number, offset?: number) => Promise<QueryResult<any> | null>;
    update: (tableName: string, attributes: Attribute[], wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<number | undefined>;
    delete: (tableName: string, wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<number | undefined>;
    startTransaction: () => Promise<boolean>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
    setPool: (config: PoolConfig) => Promise<void>;
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
