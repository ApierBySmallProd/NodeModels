import { AttrAndAlias, Attribute, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import { PoolClient, PoolConfig, QueryResult } from 'pg';
import GlobalModel from './global.db';
export default class GlobalPostgreModel extends GlobalModel {
    protected pool: PoolClient | null;
    insert: (tableName: string, attributes: Attribute[]) => Promise<QueryResult<any> | null>;
    select: (tableName: string, distinct: boolean, attributes: AttrAndAlias[], wheres: (WhereAttribute | WhereKeyWord)[], sorts: SortAttribute[], limit: number, offset?: number) => Promise<QueryResult<any> | null>;
    update: (tableName: string, attributes: Attribute[], wheres: Attribute[]) => Promise<number | undefined>;
    delete: (tableName: string, wheres: Attribute[]) => Promise<number | undefined>;
    query: (query: string, params?: string[] | undefined) => Promise<QueryResult<any> | null>;
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
