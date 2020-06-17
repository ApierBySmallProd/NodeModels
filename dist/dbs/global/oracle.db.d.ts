import { AttrAndAlias, Attribute, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import { IJoin } from '../../entities/querys/find.query';
import GlobalSqlModel from './global.sql';
import oracle from 'oracledb';
export default class GlobalOracleModel extends GlobalSqlModel {
    protected pool: oracle.Pool | null;
    protected transactionConnection: oracle.Connection | null;
    query: (query: string, params?: string[] | undefined, throwErrors?: boolean) => Promise<oracle.Result<unknown> | null>;
    insert: (tableName: string, attributes: Attribute[]) => Promise<oracle.Result<unknown> | null>;
    select: (tableName: string, distinct: boolean, attributes: AttrAndAlias[], wheres: (WhereAttribute | WhereKeyWord)[], sorts: SortAttribute[], tableAlias: string, limit: number, offset: number | undefined, joins: IJoin[], groups: string[], havings: (WhereAttribute | WhereKeyWord)[]) => Promise<oracle.Result<unknown> | null>;
    update: (tableName: string, attributes: Attribute[], wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<number | undefined>;
    delete: (tableName: string, wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<number | undefined>;
    startTransaction: () => Promise<boolean>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
    setPool: (config: oracle.PoolAttributes) => Promise<void>;
}
