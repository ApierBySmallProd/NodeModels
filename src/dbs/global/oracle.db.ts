import {
  AttrAndAlias,
  Attribute,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
} from '../../entities/querys/query';

import GlobalSqlModel from './global.sql';
import oracle from 'oracledb';

export default class GlobalOracleModel extends GlobalSqlModel {
  protected pool: oracle.Pool | null = null;
  protected transactionConnection: oracle.Connection | null = null;

  /* Query */
  public query = async (
    query: string,
    params?: string[],
    throwErrors = false,
  ): Promise<oracle.Result<unknown> | null> => {
    if (!this.pool) {
      if (throwErrors) {
        throw Error('No pool');
      }
      if (GlobalOracleModel.debug) console.error('No pool');
      return null;
    }
    try {
      if (!this.transactionConnection) {
        const conn = await this.pool.getConnection();
        const resu = await conn.execute(query, params ?? []);
        await conn.commit();
        return resu;
      }
      const res = await this.transactionConnection.execute(query, params ?? []);
      return res;
    } catch (err) {
      if (GlobalOracleModel.debug) console.error(err);
      if (throwErrors) throw err;
      return null;
    }
  };

  public insert = async (tableName: string, attributes: Attribute[]) => {
    const columns = attributes.map((a) => `\`${a.column}\``).join(', ');
    const params = attributes.map((a, index) => `:${index + 1}`).join(', ');
    const query = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${params})`;
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
    )} FROM \`${tableName}\` AS default_table ${this.computeWhere(
      wheres,
      ':',
      true,
    )}${this.computeSort(sorts)}${
      limit !== -1 ? ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY` : ''
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
      ':',
      true,
    )}`;
    return (
      await this.query(
        query,
        attributes.map((a) => a.value).concat(this.getWhereAttributes(wheres)),
      )
    )?.rowsAffected;
  };

  public delete = async (
    tableName: string,
    wheres: (WhereAttribute | WhereKeyWord)[],
  ) => {
    const query = `DELETE FROM \`${tableName}\` ${this.computeWhere(
      wheres,
      ':',
      true,
    )}`;
    return (await this.query(query, this.getWhereAttributes(wheres)))
      ?.rowsAffected;
  };

  /* Transaction */
  public startTransaction = async (): Promise<boolean> => {
    if (!this.pool) {
      if (GlobalOracleModel.debug) console.error('No pool');
      return false;
    }
    if (this.transactionConnection) {
      if (GlobalOracleModel.debug) console.error('Already in a transaction');
      return false;
    }
    try {
      this.transactionConnection = await this.pool.getConnection();
      return true;
    } catch (err) {
      if (GlobalOracleModel.debug) {
        console.error(err);
      }
      return false;
    }
  };

  public commit = async (): Promise<void> => {
    if (!this.transactionConnection) {
      if (GlobalOracleModel.debug) console.error('No transaction started');
      return;
    }
    try {
      await this.transactionConnection.commit();
    } catch (err) {
      if (GlobalOracleModel.debug) console.error(err);
    } finally {
      this.transactionConnection = null;
    }
  };

  public rollback = async (): Promise<void> => {
    if (!this.transactionConnection) {
      if (GlobalOracleModel.debug) console.error('No transaction started');
      return;
    }
    try {
      await this.transactionConnection.rollback();
    } catch (err) {
      if (GlobalOracleModel.debug) console.error(err);
    } finally {
      this.transactionConnection = null;
    }
  };

  public setPool = async (config: oracle.PoolAttributes) => {
    const p = await getPool(config);
    if (p) {
      this.pool = p;
    }
  };
}

const getPool = async (
  config: oracle.PoolAttributes,
): Promise<oracle.Pool | null> => {
  try {
    const pool = await oracle.createPool(config);

    return pool;
  } catch (err) {
    if (GlobalOracleModel.debug) {
      console.error('Unexpected error on postgres database');
      console.error(err);
    }
  }
  return null;
};
