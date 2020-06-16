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
    const db = DbManager.get().get(dbName);
    if (!db) throw Error('Database not found');
    return await db.delete(this.tableName, this.wheres);
  };
}
