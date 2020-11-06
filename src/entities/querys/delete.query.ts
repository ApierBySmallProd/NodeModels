import { Attribute, WhereOperator } from './query';

import DbManager from '../../dbs/dbmanager';
import WhereQuery from './where.query';

export default class DeleteQuery extends WhereQuery {
  public where = (column: string, operator: WhereOperator, value: any) => {
    this.wheres.push({ column, value, operator });
    return this;
  };
  /**
   * Execute the delete query and return the number of deleted rows
   */
  public exec = async (dbName: string | null = null) => {
    let dbConnName = dbName;
    if (!dbConnName && this.dbName) dbConnName = this.dbName;
    const db = DbManager.getInstance().get(dbConnName);
    if (!db) throw Error('Database not found');
    return await db.delete(this.tableName, this.wheres);
  };
}
