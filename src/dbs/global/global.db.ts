import {
  AttrAndAlias,
  Attribute,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
} from '../../entities/querys/query';

export default abstract class GlobalModel {
  public static debug: boolean | undefined;
  protected pool: any;

  constructor(debug: boolean | undefined = undefined) {
    GlobalModel.debug = debug;
    if (debug === undefined) {
      GlobalModel.debug =
        process.env.DEBUG_DB && process.env.DEBUG_DB === 'true' ? true : false;
    }
  }

  /* Querying */
  public abstract query(
    query: string,
    params?: string[],
    throwErrors?: boolean,
  ): Promise<any>;
  public abstract setPool(config: any): Promise<void>;

  public abstract insert(
    tableName: string,
    attributes: Attribute[],
  ): Promise<any>;

  public abstract update(
    tableName: string,
    attributes: Attribute[],
    wheres: (WhereAttribute | WhereKeyWord)[],
  ): Promise<number | undefined>;

  public abstract delete(
    tableName: string,
    wheres: (WhereAttribute | WhereKeyWord)[],
  ): Promise<number | undefined>;

  public abstract select(
    tableName: string,
    distinct: boolean,
    attributes: AttrAndAlias[],
    wheres: (WhereAttribute | WhereKeyWord)[],
    sorts: SortAttribute[],
    tableAlias: string,
    limit: number,
    offset: number,
  ): Promise<any>;

  /* Transactions */
  public abstract startTransaction(): Promise<boolean>;
  public abstract commit(): Promise<void>;
  public abstract rollback(): Promise<void>;
}
