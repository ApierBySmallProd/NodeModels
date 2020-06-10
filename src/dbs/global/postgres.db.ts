import {
  AttrAndAlias,
  Attribute,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
} from '../../entities/querys/query';
import { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';

import GlobalModel from './global.db';

const getPool = async (
  config: PoolConfig,
  quitOnFail = false,
): Promise<PoolClient | null> => {
  return new Promise(async (resolve, reject) => {
    const pool = new Pool(config);
    pool.on('error', (err) => {
      if (GlobalPostgreModel.debug) {
        console.error('Unexpected error on postgres database');
        console.error(err);
      }
      if (quitOnFail) {
        process.exit(-1);
      } else {
        reject(err);
      }
    });
    const client = await pool.connect();
    resolve(client);
  });
};

export default class GlobalPostgreModel extends GlobalModel {
  protected pool: PoolClient | null = null;

  public insert = async (tableName: string, attributes: Attribute[]) => {
    const columns = attributes.map((a) => a.column).join(', ');
    const params = attributes.map((a, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${params}) RETURNING *`;
    return await this.query(
      query,
      attributes.map((a) => a.value),
    );
  };

  public select = async (
    tableName: string,
    distinct: boolean,
    attributes: AttrAndAlias[],
    wheres: (WhereAttribute | WhereKeyWord)[],
    sorts: SortAttribute[],
    limit: number,
    offset = 0,
  ) => {
    const query = `SELECT${distinct ? ' DISTINCT' : ''}${this.computeAttributes(
      attributes,
    )} FROM ${tableName} AS default_table ${this.computeWhere(
      wheres,
    )}${this.computeSort(sorts)}${
      limit !== -1 ? ` LIMIT ${limit}, ${offset}` : ''
    }`;
    return await this.query(query, this.getWhereAttributes(wheres));
  };

  public update = async (
    tableName: string,
    attributes: Attribute[],
    wheres: Attribute[],
  ) => {
    const columns = attributes.map((a) => `${a.column} = ?`).join(', ');
    const where = wheres.map((w) => `${w.column} = ?`).join(' AND ');
    const query = `UPDATE ${tableName} SET ${columns} ${
      wheres.length ? `WHERE ${where}` : ''
    }`;
    return (
      await this.query(
        query,
        attributes.map((a) => a.value).concat(wheres.map((w) => w.value)),
      )
    )?.rowCount;
  };

  public delete = async (tableName: string, wheres: Attribute[]) => {
    const where = wheres.map((w) => `${w.column} = ?`).join(' AND ');
    const query = `DELETE FROM ${tableName} ${
      wheres.length ? `WHERE ${where}` : ''
    }`;
    return (
      await this.query(
        query,
        wheres.map((w) => w.value),
      )
    )?.rowCount;
  };

  public query = async (
    query: string,
    params?: string[],
  ): Promise<QueryResult | null> => {
    if (!this.pool) return null;
    try {
      return await this.pool.query(query, params);
    } catch (err) {
      if (GlobalPostgreModel.debug) {
        console.error(err);
      }
      return null;
    }
  };

  public setPool = async (config: PoolConfig) => {
    const p = await getPool(config);
    if (p) {
      this.pool = p;
    }
  };

  private getWhereAttributes = (wheres: any[]) => {
    const newWheres: WhereAttribute[] = wheres.filter((w) =>
      this.isWhereAttribute(w),
    );
    return newWheres.map((w) => w.value);
  };

  private computeAttributes = (attributes: AttrAndAlias[]) => {
    if (!attributes.length) return ' *';
    attributes.map(
      (a) =>
        `${
          a.function
            ? `${this.computeAttributeFunction(a)}(${a.attribute})${
                a.alias ? ` AS ${a.alias}` : ''
              }`
            : `${a.attribute}${a.alias ? ` AS ${a.alias}` : ''}`
        }`,
    );
  };

  private computeAttributeFunction = (attribute: AttrAndAlias) => {
    switch (attribute.function) {
      case 'AVG': {
        return 'AVG';
      }
      case 'COUNT': {
        return 'COUNT';
      }
      case 'MAX': {
        return 'MAX';
      }
      case 'MIN': {
        return 'MIN';
      }
      case 'SUM': {
        return 'SUM';
      }
      default: {
        throw new Error(`Unknown function ${attribute.function}`);
      }
    }
  };

  private computeWhere = (wheres: (WhereAttribute | WhereKeyWord)[]) => {
    let where = wheres.length ? ' WHERE ' : '';
    wheres.forEach((w) => {
      if (this.isWhereAttribute(w)) {
        w = w as WhereAttribute;
        where = `${where} ${this.computeWhereAttribute(w)}`;
      } else {
        w = w as WhereKeyWord;
        where = `${where} ${this.computeWhereKeyWord(w)}`;
      }
    });
    return where;
  };

  private computeSort = (sorts: SortAttribute[]) => {
    const sortsString = sorts
      .map((s) => `${s.attribute} ${this.computeSortMode(s)}`)
      .join(', ');
    return sorts.length ? ` ORDER BY ${sortsString}` : '';
  };

  private computeSortMode = (sort: SortAttribute) => {
    switch (sort.mode) {
      case 'ASC': {
        return 'ASC';
      }
      case 'DESC': {
        return 'DESC';
      }
      default: {
        throw new Error(`Unkonwn sort mode ${sort.mode}`);
      }
    }
  };

  private isWhereAttribute = (where: any) => {
    return 'operator' in where;
  };

  private computeWhereAttribute = (attribute: WhereAttribute) => {
    switch (attribute.operator) {
      case '<': {
        return `${attribute.column} < ?`;
      }
      case '<=': {
        return `${attribute.column} <= ?`;
      }
      case '<>': {
        return `${attribute.column} <> ?`;
      }
      case '=': {
        return `${attribute.column} = ?`;
      }
      case '>': {
        return `${attribute.column} > ?`;
      }
      case '>=': {
        return `${attribute.column} >= ?`;
      }
      case 'BETWEEN': {
        return `${attribute.column} BETWEEN ? AND ?`;
      }
      case 'IN': {
        return `${attribute.column} IN (${attribute.value
          .map(() => '?')
          .join(', ')})`;
      }
      case 'LIKE': {
        return `${attribute.column} LIKE ?`;
      }
      default: {
        throw new Error(`Invalid operator ${attribute.operator}`);
      }
    }
  };

  private computeWhereKeyWord = (keyword: WhereKeyWord) => {
    switch (keyword.keyword) {
      case 'AND': {
        return ' AND ';
      }
      case 'OR': {
        return ' OR ';
      }
      case 'NOT': {
        return 'NOT';
      }
      case 'STARTGROUP': {
        return ' ( ';
      }
      case 'ENDGROUP': {
        return ' ) ';
      }
      default: {
        throw new Error(`Invalid keyword ${keyword.keyword}`);
      }
    }
  };
}
