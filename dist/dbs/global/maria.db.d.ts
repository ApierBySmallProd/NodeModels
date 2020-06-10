import { AttrAndAlias, Attribute, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import GlobalModel from './global.db';
import mysql from 'mysql';
export default class GlobalMariaModel extends GlobalModel {
    protected pool: mysql.Pool | null;
    query: (query: string, params?: string[] | undefined) => Promise<any>;
    insert: (tableName: string, attributes: Attribute[]) => Promise<any>;
    select: (tableName: string, distinct: boolean, attributes: AttrAndAlias[], wheres: (WhereAttribute | WhereKeyWord)[], sorts: SortAttribute[], limit: number, offset?: number) => Promise<any>;
    update: (tableName: string, attributes: Attribute[], wheres: Attribute[]) => Promise<any>;
    delete: (tableName: string, wheres: Attribute[]) => Promise<any>;
    setPool: (config: mysql.PoolConfig) => Promise<void>;
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
