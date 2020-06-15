import { AttrAndAlias, AttributeFunction, SortAttribute } from './query';

import DbManager from '../../dbs/dbmanager';
import EntityManager from '../entitymanager';
import WhereQuery from './where.query';

export default class FindQuery extends WhereQuery {
  private attributes: AttrAndAlias[] = [];
  private sorts: SortAttribute[] = [];
  private isDistinct = false;
  private lim = -1;
  private offset = -1;
  private afterExec: ((res: any[]) => any) | undefined;

  constructor(tableName: string, afterExec?: (res: any[]) => any) {
    super(tableName);
    this.afterExec = afterExec;
  }

  public limit = (limit: number, offset: number = 0) => {
    this.lim = limit;
    this.offset = offset;
    return this;
  };

  public join = (table: string, alias: string) => {
    return this;
  };

  public distinct = () => {
    this.isDistinct = true;
    return this;
  };

  public addAttribute = (
    attr: string,
    alias: string = '',
    func: AttributeFunction | null = null,
  ) => {
    this.attributes.push({ alias, attribute: attr, function: func });
    return this;
  };

  public addAttributes = (attr: string[]) => {
    this.attributes = this.attributes.concat(
      attr.map((a) => ({ attribute: a, alias: '', function: null })),
    );
    return this;
  };

  public sort = (attr: string, method: 'ASC' | 'DESC' = 'ASC') => {
    this.sorts.push({ attribute: attr, mode: method });
    return this;
  };

  /**
   * Execute the find query and return found rows
   */
  public exec = async (dbName: string | null = null) => {
    const db = DbManager.get().get(dbName);
    if (!db) throw Error('Database not found');
    const res = await db.select(
      this.tableName,
      this.isDistinct,
      this.attributes,
      this.wheres,
      this.sorts,
      this.lim,
      this.offset,
    );
    if (this.afterExec) {
      return this.afterExec(res);
    }
    return res;
  };
}
