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
import mysql from 'mysql';

const getPool = async (config: mysql.PoolConfig): Promise<mysql.Pool> => {
  return new Promise((resolve, reject) => {
    const pool = mysql.createPool(config);
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      resolve(pool);
    });
  });
};

export default class GlobalMariaModel extends GlobalSqlModel {
  protected pool: mysql.Pool | null = null;
  private transactionConnection: mysql.PoolConnection | null = null;

  public disconnect = async () => {
    this.pool?.end();
    return Promise.resolve();
  };

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
          if (GlobalMariaModel.debug) {
            console.error(error);
          }
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
      '?',
      false,
      '`',
    )}${this.computeGroupBy(groups)}${this.computeWhere(
      havings,
      '?',
      false,
      '`',
      'HAVING',
    )}${this.computeSort(sorts, '`')}${
      limit !== -1 ? ` LIMIT ${offset}, ${limit}` : ''
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
      '?',
      false,
      '`',
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
      '`',
    )}`;
    return (await this.query(query, this.getWhereAttributes(wheres)))
      .affectedRows;
  };

  /* Table management */
  public createTable = async (tableName: string, fields: Field[]) => {
    // * Create the new table
    const query = `CREATE TABLE ${tableName} (${fields
      .map((f: Field) => this.formatFieldForTableManagement(f))
      .join(', ')})`;
    await this.query(query);
    // * Add the constraints
    await fields.reduce(async (prevField, curField) => {
      await prevField;
      const constraints = this.getFieldConstraintsForTableManagement(
        curField,
        tableName,
      );
      await constraints.reduce(async (prevConst, curConst) => {
        await prevConst;
        await this.query(curConst);
      }, Promise.resolve());
    }, Promise.resolve());
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
      await this.query(query);
      const constraints = this.getFieldConstraintsForTableManagement(
        cur,
        tableName,
      );
      await constraints.reduce(async (prevConst, curConst) => {
        await prevConst;
        await this.query(curConst);
      }, Promise.resolve());
    }, Promise.resolve());
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
            this.transactionConnection?.release();
            this.transactionConnection = null;
            resolve();
          });
        } else {
          this.transactionConnection?.release();
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
        this.transactionConnection?.release();
        this.transactionConnection = null;
        if (err) {
          if (GlobalMariaModel.debug) console.error(err);
        }
        resolve();
      });
    });
  };

  /* Migration management */
  public checkMigrationTable = async () => {
    const res = await this.query(
      'SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = "migrations"',
    );
    return res && res.length;
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
      console.log(config);
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

  private formatFieldForTableManagement = (field: Field) => {
    const fInfos = field.getAll();
    return `${fInfos.name} ${fInfos.type}${
      fInfos.len !== 0 ? `(${fInfos.len})` : ''
    }${fInfos.null ? '' : ' NOT NULL'}${fInfos.ai ? ' AUTO_INCREMENT' : ''}${
      fInfos.primaryKey ? ' PRIMARY KEY' : ''
    }`;
  };

  private getFieldConstraintsForTableManagement = (
    field: Field,
    tableName: string,
  ) => {
    const fieldInfos = field.getAll();
    const constraints = [];
    if (fieldInfos.mustBeUnique || fieldInfos.primaryKey) {
      constraints.push(
        `ALTER TABLE ${tableName} ADD CONSTRAINT unique_${tableName.toLowerCase()}_${fieldInfos.name.toLowerCase()} UNIQUE (${
          fieldInfos.name
        })`,
      );
    }
    if (fieldInfos.checkValue) {
      constraints.push(
        `ALTER TABLE ${tableName} ADD CONSTRAINT check_${tableName.toLowerCase()}_${fieldInfos.name.toLowerCase()} CHECK(${
          fieldInfos.name
        }${fieldInfos.checkValue})`,
      );
    }
    if (fieldInfos.defaultValue) {
      constraints.push(
        `ALTER TABLE ${tableName} ALTER ${fieldInfos.name} SET DEFAULT ${
          fieldInfos.defaultValue.isSystem
            ? `${fieldInfos.defaultValue.value}`
            : `'${fieldInfos.defaultValue.value}'`
        };`,
      );
    }
    if (fieldInfos.foreignKey) {
      constraints.push(
        `ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName.toLowerCase()}_${fieldInfos.name.toLowerCase()} FOREIGN KEY (${
          fieldInfos.name
        }) REFERENCES ${fieldInfos.foreignKey.table}(${
          fieldInfos.foreignKey.column
        })`,
      );
    }
    return constraints;
  };
}
