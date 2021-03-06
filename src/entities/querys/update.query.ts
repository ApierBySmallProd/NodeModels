import { Attribute, WhereOperator } from './query';

import DbManager from '../../dbs/dbmanager';
import WhereQuery from './where.query';

export default class UpdateQuery extends WhereQuery {
  private attributes: Attribute[] = [];

  public where = (column: string, operator: WhereOperator, value: any) => {
    this.wheres.push({ column, value, operator });
    return this;
  };

  public setAttribute = (column: string, value: any) => {
    this.attributes.push({ column, value });
    return this;
  };

  /**
   * Execute the update query and return the number of updated rows
   */
  public exec = async (dbName: string | null = null) => {
    let dbConnName = dbName;
    if (!dbConnName && this.dbName) dbConnName = this.dbName;
    const db = DbManager.getInstance().get(dbConnName);
    if (!db) throw Error('Database not found');
    return await db.update(this.tableName, this.attributes, this.wheres);
  };
}
