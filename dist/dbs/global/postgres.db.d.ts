import { AttrAndAlias, Attribute, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import { IJoin } from '../../entities/querys/find.query';
import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';
import GlobalSqlModel from './global.sql';
export default class GlobalPostgreModel extends GlobalSqlModel {
    protected pool: Pool | null;
    protected transactionConnection: PoolClient | null;
    protected transactionDone: (() => void) | null;
    query: (query: string, params?: string[] | undefined, throwErrors?: boolean) => Promise<QueryResult | null>;
    insert: (tableName: string, attributes: Attribute[]) => Promise<QueryResult<any> | null>;
    select: (tableName: string, distinct: boolean, attributes: AttrAndAlias[], wheres: (WhereAttribute | WhereKeyWord)[], sorts: SortAttribute[], tableAlias: string, limit: number, offset: number | undefined, joins: IJoin[], groups: string[], havings: (WhereAttribute | WhereKeyWord)[]) => Promise<QueryResult<any> | null>;
    update: (tableName: string, attributes: Attribute[], wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<number | undefined>;
    delete: (tableName: string, wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<number | undefined>;
    startTransaction: () => Promise<boolean>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
    setPool: (config: PoolConfig) => Promise<void>;
}
