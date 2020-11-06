import {
  AttrAndAlias,
  Attribute,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
} from '../../entities/querys/query';
import { Having, IJoin, Join } from '../../entities/querys/find.query';

import { Field } from '../../migration/field';
import GlobalSqlModel from './global.sql';
import oracle from 'oracledb';

export default class GlobalOracleModel extends GlobalSqlModel {
  protected pool: oracle.Pool | null = null;
  protected transactionConnection: oracle.Connection | null = null;

  public disconnect = async () => {
    await this.pool?.close();
  };

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
    distinct: boolean = false,
    attributes: AttrAndAlias[] = [],
    wheres: (WhereAttribute | WhereKeyWord)[] = [],
    sorts: SortAttribute[] = [],
    tableAlias: string = '',
    limit: number = -1,
    offset = 0,
    joins: IJoin[] = [],
    groups: string[] = [],
    havings: (WhereAttribute | WhereKeyWord)[] = [],
  ) => {
    const query = `SELECT${distinct ? ' DISTINCT' : ''}${this.computeAttributes(
      attributes,
      '`',
    )} FROM \`${tableName}\` ${
      tableAlias ? `AS ${tableAlias}` : ''
    } ${this.computeJoins(joins, '`', 'AS')}${this.computeWhere(
      wheres,
      ':',
      true,
      '`',
    )}${this.computeGroupBy(groups)}${this.computeWhere(
      havings,
      '?',
      false,
      '`',
      'HAVING',
    )}${this.computeSort(sorts, '`')}${
      limit !== -1 ? ` OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY` : ''
    }`;
    const havingAttr = this.getWhereAttributes(havings);
    return await this.query(
      query,
      havingAttr.concat(this.getWhereAttributes(wheres)),
    );
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
      '`',
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
      '`',
    )}`;
    return (await this.query(query, this.getWhereAttributes(wheres)))
      ?.rowsAffected;
  };

  /* Table management */
  public createTable = async (tableName: string, fields: Field[]) => {
    const query = `CREATE TABLE ${tableName} (${fields
      .map((f: Field) => this.formatFieldForTableManagement(f))
      .join(', ')})`;
    // TODO add constraints
    return await this.query(query);
  };

  public removeTable = async (tableName: string) => {
    const query = `DROP TABLE ${tableName}`;
    return await this.query(query);
  };

  public alterTable = async (
    tableName: string,
    fieldsToAdd: Field[],
    fieldsToRemove: string[],
  ) => {
    await fieldsToRemove.reduce(async (prev, cur) => {
      await prev;
      const query = `ALTER TABLE ${tableName} DROP COLUMN ${cur}`;
      await this.query(query);
    }, Promise.resolve());
    await fieldsToAdd.reduce(async (prev, cur) => {
      await prev;
      const query = `ALTER TABLE ${tableName} ADD ${this.formatFieldForTableManagement(
        cur,
      )}`;
      // TODO add constraints
      await this.query(query);
    }, Promise.resolve());
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

  /* Migration management */
  public checkMigrationTable = async () => {
    const res = await this.query(
      'SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = "migration"',
    );
    return res && res.rows && res.rows.length ? true : false;
  };

  public setPool = async (config: oracle.PoolAttributes) => {
    const p = await getPool(config);
    if (p) {
      this.pool = p;
    }
  };

  private formatFieldForTableManagement = (field: Field) => {
    const fInfos = field.getAll();
    return `\`${fInfos.name}\` ${fInfos.type}${
      fInfos.len !== 0 ? `(${fInfos.len})` : ''
    }${fInfos.null ? '' : ' NOT NULL'}${
      fInfos.mustBeUnique || fInfos.primaryKey ? ' UNIQUE' : ''
    }${fInfos.ai ? ' AUTO_INCREMENT' : ''}${
      fInfos.defaultValue
        ? ` DEFAULT ${
            fInfos.defaultValue.isSystem
              ? `${fInfos.defaultValue.value}()`
              : `'${fInfos.defaultValue.value}'`
          }`
        : ''
    }${fInfos.checkValue ? ` CHECK (${fInfos.name}${fInfos.checkValue})` : ''}`;
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
