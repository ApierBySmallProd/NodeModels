import {
  AttrAndAlias,
  Attribute,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
} from '../../entities/querys/query';
import { Field, FieldType } from '../../migration/field';
import { Having, IJoin, Join } from '../../entities/querys/find.query';
import pg, { Pool, PoolClient, PoolConfig, QueryResult } from 'pg';

import GlobalSqlModel from './global.sql';

const getPool = async (
  config: PoolConfig,
  quitOnFail = false,
): Promise<Pool | null> => {
  pg.types.setTypeParser(20, Number);
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
    resolve(pool);
  });
};

export default class GlobalPostgreModel extends GlobalSqlModel {
  protected pool: Pool | null = null;
  protected transactionConnection: PoolClient | null = null;
  protected transactionDone: (() => void) | null = null;

  public disconnect = async () => {
    await this.pool?.end();
  };

  /* Querying */
  public query = async (
    query: string,
    params?: string[],
    throwErrors = false,
  ): Promise<QueryResult | null> => {
    if (!this.pool) {
      if (throwErrors) {
        throw Error('No pool');
      }
      return null;
    }
    try {
      if (!this.transactionConnection) {
        return await this.pool.query(query, params);
      }
      return await this.transactionConnection.query(query, params);
    } catch (err) {
      if (GlobalPostgreModel.debug) {
        console.error(
          `An error occured while executing ${query} with parameters:`,
          params,
        );
        console.error(err);
      }
      if (throwErrors) {
        throw err;
      }
      return null;
    }
  };
  public insert = async (tableName: string, attributes: Attribute[]) => {
    const columns = attributes.map((a) => `"${a.column}"`).join(', ');
    const params = attributes.map((a, index) => `$${index + 1}`).join(', ');
    const query = `INSERT INTO "${tableName}" (${columns}) VALUES (${params}) RETURNING *`;
    const res = await this.query(
      query,
      attributes.map((a) => a.value),
    );
    return res?.rows[0].id;
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
      '"',
    )} FROM "${tableName}" ${
      tableAlias ? `${tableAlias}` : ''
    } ${this.computeJoins(joins, '"', '')}${this.computeWhere(
      wheres,
      '$',
      true,
      '"',
    )}${this.computeGroupBy(groups)}${this.computeWhere(
      havings,
      '$',
      true,
      '"',
      'HAVING',
      wheres.filter((w: any) => !w.keyword).length,
    )}${this.computeSort(sorts, '"')}${
      limit !== -1 ? ` LIMIT ${limit} OFFSET ${offset}` : ''
    }`;
    const havingAttr = this.getWhereAttributes(havings);
    return (
      await this.query(
        query,
        havingAttr.concat(this.getWhereAttributes(wheres)),
      )
    )?.rows;
  };

  public update = async (
    tableName: string,
    attributes: Attribute[],
    wheres: (WhereAttribute | WhereKeyWord)[],
  ) => {
    const columns = attributes
      .map((a, index) => `"${a.column}" = $${index + 1}`)
      .join(', ');
    const query = `UPDATE "${tableName}" SET ${columns} ${this.computeWhere(
      wheres,
      '$',
      true,
      '"',
      'WHERE',
      attributes.length,
    )}`;
    return (
      await this.query(
        query,
        attributes.map((a) => a.value).concat(this.getWhereAttributes(wheres)),
      )
    )?.rowCount;
  };

  public delete = async (
    tableName: string,
    wheres: (WhereAttribute | WhereKeyWord)[],
  ) => {
    const query = `DELETE FROM "${tableName}" ${this.computeWhere(
      wheres,
      '$',
      true,
      '"',
    )}`;
    return (await this.query(query, this.getWhereAttributes(wheres)))?.rowCount;
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
        if (GlobalPostgreModel.debug) console.error('Already in a transaction');
        return resolve(false);
      }
      if (!this.pool) {
        if (GlobalPostgreModel.debug) console.error('No pool');
        return resolve(false);
      }
      this.pool.connect((err, client, done) => {
        if (err) {
          if (GlobalPostgreModel.debug) console.error(err);
          return resolve(false);
        }
        client.query('BEGIN', (error) => {
          if (error) {
            done();
            return resolve(false);
          }
          this.transactionDone = done;
          this.transactionConnection = client;
          resolve(true);
        });
      });
    });
  };
  public commit = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!this.transactionConnection) {
        if (GlobalPostgreModel.debug) console.error('Not in a transaction');
        return resolve();
      }
      this.transactionConnection.query('COMMIT', (err) => {
        if (err) {
          if (GlobalPostgreModel.debug) console.error(err);
          this.transactionConnection?.query('ROLLBACK', (e) => {
            this.transactionConnection = null;
            if (e) {
              if (GlobalPostgreModel.debug) console.error(e);
            }
            resolve();
          });
        }
        if (this.transactionDone) {
          this.transactionDone();
          this.transactionDone = null;
        }
        this.transactionConnection = null;
        resolve();
      });
    });
  };
  public rollback = async (): Promise<void> => {
    return new Promise((resolve) => {
      if (!this.transactionConnection) {
        if (GlobalPostgreModel.debug) console.error('Not in a transaction');
        return resolve();
      }
      this.transactionConnection.query('ROLLBACK', (err) => {
        this.transactionConnection = null;
        if (err) {
          if (GlobalPostgreModel.debug) console.error(err);
        }
        if (this.transactionDone) {
          this.transactionDone();
          this.transactionDone = null;
        }
        resolve();
      });
    });
  };

  /* Migration management */
  public checkMigrationTable = async () => {
    const res = await this.query(
      'SELECT table_name FROM information_schema.tables WHERE table_name = $1',
      ['migrations'],
    );
    return res && res.rowCount ? true : false;
  };

  public setPool = async (config: PoolConfig) => {
    const p = await getPool(config);
    if (p) {
      this.pool = p;
    }
  };

  private formatFieldForTableManagement = (field: Field) => {
    const fInfos = field.getAll();
    if (fInfos.ai) {
      return `${fInfos.name} ${
        fInfos.type === 'bigint'
          ? 'BIGSERIAL'
          : fInfos.type === 'smallint'
          ? 'SMALLSERIAL'
          : 'SERIAL'
      }${fInfos.len !== 0 ? `(${fInfos.len})` : ''}${
        fInfos.null ? '' : ' NOT NULL'
      }`;
    }
    return `${fInfos.name} ${this.getCorrespondingType(fInfos.type)}${
      fInfos.len !== 0 ? `(${fInfos.len})` : ''
    }${fInfos.null ? '' : ' NOT NULL'}`;
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
    if (fieldInfos.primaryKey) {
      constraints.push(
        `ALTER TABLE ${tableName} ADD CONSTRAINT pk_${tableName.toLowerCase()}_${fieldInfos.name.toLowerCase()} PRIMARY KEY (${
          fieldInfos.name
        })`,
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

  private getCorrespondingType = (type: FieldType): string => {
    switch (type) {
      case 'binary':
        return 'bytea';
      case 'blob':
        return 'bytea';
      case 'datetime':
        return 'timestamp';
      case 'float':
        return 'double';
      case 'longblob':
        return 'bytea';
      case 'longtext':
        return 'text';
      case 'mediumblob':
        return 'bytea';
      case 'mediumint':
        return 'int';
      case 'tinyint':
        return 'smallint';
      case 'mediumtext':
        return 'text';
      case 'tinyblob':
        return 'bytea';
      case 'tinytext':
        return 'text';
      case 'varbinary':
        return 'bytea';
      default:
        return type;
    }
  };
}
