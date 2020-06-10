import Query, {
  AttrAndAlias,
  Attribute,
  AttributeFunction,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
  WhereOperator,
} from './query';

import DbManager from '../../dbs/dbmanager';

export default class FindQuery extends Query {
  private attributes: AttrAndAlias[] = [];
  private wheres: (WhereAttribute | WhereKeyWord)[] = [];
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

  public where = (column: string, operator: WhereOperator, value: any) => {
    this.wheres.push({ column, value, operator });
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

  public and = () => {
    this.wheres.push({ keyword: 'AND' });
    return this;
  };

  public or = () => {
    this.wheres.push({ keyword: 'OR' });
    return this;
  };

  public not = () => {
    this.wheres.push({ keyword: 'NOT' });
    return this;
  };

  public group = () => {
    this.wheres.push({ keyword: 'STARTGROUP' });
    return this;
  };

  public endGroup = () => {
    this.wheres.push({ keyword: 'ENDGROUP' });
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
