import {
  AttrAndAlias,
  Attribute,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
} from '../../entities/querys/query';

import GlobalSqlModel from './global.sql';
import mysql from 'mysql';

const getPool = async (config: mysql.PoolConfig): Promise<mysql.Pool> => {
  return new Promise((resolve, reject) => {
    const pool = mysql.createPool(config);
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
      } else {
        connection.query('RESET QUERY CACHE', () => {
          connection.release();
          resolve(pool);
        });
      }
    });
  });
};

export default class GlobalMariaModel extends GlobalSqlModel {
  protected pool: mysql.Pool | null = null;
  private transactionConnection: mysql.PoolConnection | null = null;

  /* Querying */
  public query = async (
    query: string,
    params?: string[],
    throwErrors = false,
  ): Promise<any> => {
    return new Promise(async (resolve) => {
      if (!this.pool) {
        if (GlobalMariaModel.debug) console.error('No pool');
        if (throwErrors) throw Error('No pool');
        return resolve(null);
      }
      let connection: mysql.PoolConnection | null;
      if (this.transactionConnection) {
        connection = this.transactionConnection;
      } else {
        connection = await this.getConnection();
      }
      if (!connection) {
        if (GlobalMariaModel.debug) console.error('Cannot get connection');
        if (throwErrors) {
          throw Error('Cannot get connection');
        }
        return resolve(null);
      }
      connection.query(query, params, (error, results, fields) => {
        if (connection && !this.transactionConnection) connection.release();
        if (error) {
          if (GlobalMariaModel.debug) console.error(error);
          if (throwErrors) {
            throw error;
          }
          return resolve(null);
        }
        resolve(results);
      });
    });
  };

  public insert = async (tableName: string, attributes: Attribute[]) => {
    const columns = attributes.map((a) => `\`${a.column}\``).join(', ');
    const params = attributes.map((a, index) => `?`).join(', ');
    const query = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${params})`;
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
    tableAlias: string,
    limit: number,
    offset = 0,
  ) => {
    const query = `SELECT${distinct ? ' DISTINCT' : ''}${this.computeAttributes(
      attributes,
    )} FROM \`${tableName}\` AS ${tableAlias} ${this.computeWhere(
      wheres,
      '?',
      false,
    )}${this.computeSort(sorts)}${
      limit !== -1 ? ` LIMIT ${offset}, ${limit}` : ''
    }`;
    return await this.query(query, this.getWhereAttributes(wheres));
  };

  public update = async (
    tableName: string,
    attributes: Attribute[],
    wheres: (WhereAttribute | WhereKeyWord)[],
  ) => {
    const columns = attributes.map((a) => `\`${a.column}\` = ?`).join(', ');
    const query = `UPDATE \`${tableName}\` SET ${columns} ${this.computeWhere(
      wheres,
      '?',
      false,
    )}`;
    return (
      await this.query(
        query,
        attributes.map((a) => a.value).concat(this.getWhereAttributes(wheres)),
      )
    )?.affectedRows;
  };

  public delete = async (
    tableName: string,
    wheres: (WhereAttribute | WhereKeyWord)[],
  ) => {
    const query = `DELETE FROM \`${tableName}\` ${this.computeWhere(
      wheres,
      '?',
      false,
    )}`;
    return await this.query(query, this.getWhereAttributes(wheres));
  };

  /* Transaction */
  public startTransaction = async (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (this.transactionConnection) {
        if (GlobalMariaModel.debug) console.error('Already in a transaction');
        return resolve(false);
      }
      if (!this.pool) {
        if (GlobalMariaModel.debug) console.error('No pool');
        return resolve(false);
      }
      this.pool.getConnection((err, connection) => {
        if (err) {
          if (GlobalMariaModel.debug) console.error(err);
          return resolve(false);
        }
        connection.beginTransaction((error) => {
          if (error) {
            return resolve(false);
          }
          this.transactionConnection = connection;
          return resolve(true);
        });
      });
    });
  };
  public commit = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!this.transactionConnection) {
        if (GlobalMariaModel.debug) console.error('Not in a transaction');
        return resolve();
      }
      this.transactionConnection.commit((err) => {
        if (err) {
          if (GlobalMariaModel.debug) console.error(err);
          this.transactionConnection?.rollback(() => {
            this.transactionConnection = null;
            resolve();
          });
        }
        this.transactionConnection = null;
        resolve();
      });
    });
  };
  public rollback = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (!this.transactionConnection) {
        if (GlobalMariaModel.debug) console.error('Not in a transaction');
        return resolve();
      }
      this.transactionConnection.rollback((err) => {
        this.transactionConnection = null;
        if (err) {
          if (GlobalMariaModel.debug) console.error(err);
        }
        resolve();
      });
    });
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

  private getConnection = (): Promise<mysql.PoolConnection | null> => {
    return new Promise((resolve, reject) => {
      this.pool?.getConnection((err, connection) => {
        if (err) {
          return resolve(null);
        }
        return resolve(connection);
      });
    });
  };
}
