import { AttrAndAlias, Attribute, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import GlobalSqlModel from './global.sql';
import mssql from 'mssql';
export default class GlobalMicrosoftModel extends GlobalSqlModel {
    protected pool: mssql.ConnectionPool | null;
    protected transactionConnection: mssql.Transaction | null;
    query: (query: string, params?: string[] | undefined, throwErrors?: boolean) => Promise<mssql.IResult<any> | null>;
    insert: (tableName: string, attributes: Attribute[]) => Promise<mssql.IResult<any> | null>;
    select: (tableName: string, distinct: boolean, attributes: AttrAndAlias[], wheres: (WhereAttribute | WhereKeyWord)[], sorts: SortAttribute[], limit: number, offset?: number) => Promise<mssql.IResult<any> | null>;
    update: (tableName: string, attributes: Attribute[], wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<number | undefined>;
    delete: (tableName: string, wheres: (WhereAttribute | WhereKeyWord)[]) => Promise<number | undefined>;
    startTransaction: () => Promise<boolean>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
    setPool: (config: mssql.config) => Promise<void>;
}
