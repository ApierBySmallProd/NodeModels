export default abstract class Query {
  protected tableName: string;
  constructor(tableName: string) {
    this.tableName = tableName;
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
  alias: string;
  function: AttributeFunction | null;
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
