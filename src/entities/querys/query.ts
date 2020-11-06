export default abstract class Query {
  protected tableName: string;
  protected dbName?: string;

  public constructor(tableName: string, dbName?: string) {
    this.tableName = tableName;
    this.dbName = dbName;
  }
}

export interface Attribute {
  column: string;
  value: any;
}

export interface WhereAttribute extends Attribute {
  operator: WhereOperator;
}

export interface WhereKeyWord {
  keyword: 'AND' | 'OR' | 'NOT' | 'STARTGROUP' | 'ENDGROUP';
}

export interface SortAttribute {
  attribute: string;
  mode: 'ASC' | 'DESC';
}

export interface AttrAndAlias {
  attribute: string;
  alias?: string;
  function?: AttributeFunction | null;
}

export type WhereOperator =
  | '='
  | '<'
  | '>'
  | '<='
  | '>='
  | '<>'
  | 'LIKE'
  | 'IN'
  | 'BETWEEN';

export type AttributeFunction = 'MIN' | 'MAX' | 'COUNT' | 'AVG' | 'SUM';
