import {
  AttrAndAlias,
  Attribute,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
  WhereOperator,
} from '../../entities/querys/query';

import GlobalModel from './global.db';
import mysql from 'mysql';

const getPool = async (config: mysql.PoolConfig): Promise<mysql.Pool> => {
  return new Promise((resolve, reject) => {
    const pool = mysql.createPool(config);
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        connection.release();
        resolve(pool);
      }
    });
  });
};

export default class GlobalMariaModel extends GlobalModel {
  protected pool: mysql.Pool | null = null;

  public query = async (query: string, params?: string[]): Promise<any> => {
    return new Promise((resolve) => {
      if (!this.pool) {
        if (GlobalMariaModel.debug) console.error('No pool');
        return resolve(null);
      }
      this.pool.getConnection((err, connection) => {
        if (err) {
          if (GlobalMariaModel.debug) console.error(err);
          return resolve(null);
        }
        connection.query(query, params, (error, results, fields) => {
          connection.release();
          if (error) {
            if (GlobalMariaModel.debug) console.error(error);
            return resolve(null);
          }
          resolve(results);
        });
      });
    });
  };

  public insert = async (tableName: string, attributes: Attribute[]) => {
    const columns = attributes.map((a) => a.column).join(', ');
    const params = attributes.map((a, index) => `?`).join(', ');
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${params})`;
    return (
      await this.query(
        query,
        attributes.map((a) => a.value),
      )
    )?.insertId;
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
    )?.affectedRows;
  };

  public delete = async (tableName: string, wheres: Attribute[]) => {
    const where = wheres.map((w) => `${w.column} = ?`).join(' AND ');
    const query = `DELETE FROM ${tableName} ${
      wheres.length ? `WHERE ${where}` : ''
    }`;
    return await this.query(
      query,
      wheres.map((w) => w.value),
    );
  };

  public setPool = async (config: mysql.PoolConfig) => {
    try {
      const p = await getPool(config);
      if (p) {
        this.pool = p;
      }
    } catch (err) {
      console.error('Cannot connect to database');
      console.error(err);
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
