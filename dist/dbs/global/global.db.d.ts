import { AttrAndAlias, Attribute, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import { IJoin } from '../../entities/querys/find.query';
export default abstract class GlobalModel {
    static debug: boolean | undefined;
    protected pool: any;
    constructor(debug?: boolean | undefined);
    abstract query(query: string, params?: string[], throwErrors?: boolean): Promise<any>;
    abstract setPool(config: any): Promise<void>;
    abstract insert(tableName: string, attributes: Attribute[]): Promise<any>;
    abstract update(tableName: string, attributes: Attribute[], wheres: (WhereAttribute | WhereKeyWord)[]): Promise<number | undefined>;
    abstract delete(tableName: string, wheres: (WhereAttribute | WhereKeyWord)[]): Promise<number | undefined>;
    abstract select(tableName: string, distinct: boolean, attributes: AttrAndAlias[], wheres: (WhereAttribute | WhereKeyWord)[], sorts: SortAttribute[], tableAlias: string, limit: number, offset: number, joins: IJoin[], groups: string[], havings: (WhereAttribute | WhereKeyWord)[]): Promise<any>;
    abstract startTransaction(): Promise<boolean>;
    abstract commit(): Promise<void>;
    abstract rollback(): Promise<void>;
}
