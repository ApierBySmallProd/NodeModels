import {
  AttrAndAlias,
  AttributeFunction,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
  WhereOperator,
} from './query';

import DbManager from '../../dbs/dbmanager';
import EntityManager from '../entitymanager';
import WhereQuery from './where.query';

export default class FindQuery extends WhereQuery {
  private attributes: AttrAndAlias[] = [];
  private sorts: SortAttribute[] = [];
  private isDistinct = false;
  private lim = -1;
  private offset = -1;
  private tableAlias = 'default_table';
  private afterExec: ((res: any[]) => any) | undefined;
  private joins: Join[] = [];
  private groups: string[] = [];
  private havings: Having | null = null;

  constructor(tableName: string, afterExec?: (res: any[]) => any) {
    super(tableName);
    this.afterExec = afterExec;
  }

  public where = (column: string, operator: WhereOperator, value: any) => {
    this.wheres.push({ column, value, operator });
    return this;
  };

  public limit = (limit: number, offset: number = 0) => {
    this.lim = limit;
    this.offset = offset;
    return this;
  };

  public join = (table: string, alias: string) => {
    const join = new Join(table, alias, this);
    this.joins.push(join);
    return join;
  };

  public distinct = () => {
    this.isDistinct = true;
    return this;
  };

  public alias = (alias: string) => {
    this.tableAlias = alias;
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

  public groupBy = (column: string) => {
    this.groups.push(column);
    return this;
  };

  public having = (column: string, operator: WhereOperator, value: string) => {
    const having = new Having(this);
    this.havings = having;
    return having.having(column, operator, value);
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
      this.tableAlias,
      this.lim,
      this.offset,
      this.joins.map((j) => j.getInterface()),
      this.groups,
      this.havings ? this.havings.getWheres() : [],
    );
    if (this.afterExec) {
      return this.afterExec(res);
    }
    return res;
  };
}

export class Join extends WhereQuery {
  public alias: string;
  public method: 'inner' | 'left' | 'right' | 'full' = 'inner';
  private query: FindQuery;

  constructor(tableName: string, alias: string, query: FindQuery) {
    super(tableName);
    this.alias = alias;
    this.query = query;
  }

  public on = (column: string, operator: WhereOperator, value: string) => {
    this.wheres.push({ column, value, operator });
    return this;
  };

  public endJoin = () => {
    return this.query;
  };

  public left = () => {
    this.method = 'left';
    return this;
  };

  public right = () => {
    this.method = 'right';
    return this;
  };

  public full = () => {
    this.method = 'full';
    return this;
  };

  public getInterface = (): IJoin => ({
    alias: this.alias,
    tableName: this.tableName,
    method: this.method,
    wheres: this.wheres,
  });
}

export interface IJoin {
  alias: string;
  tableName: string;
  method: 'inner' | 'left' | 'right' | 'full';
  wheres: (WhereAttribute | WhereKeyWord)[];
}

export class Having extends WhereQuery {
  private query: FindQuery;
  constructor(query: FindQuery) {
    super('');
    this.query = query;
  }

  public having = (column: string, operator: WhereOperator, value: string) => {
    this.wheres.push({ column, value, operator });
    return this;
  };

  public endHaving = () => {
    return this.query;
  };

  public getWheres = () => this.wheres;
}
