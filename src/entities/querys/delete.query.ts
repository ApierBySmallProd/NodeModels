import Query, { Attribute } from './query';

import DbManager from '../../dbs/dbmanager';

export default class DeleteQuery extends Query {
  private wheres: Attribute[] = [];

  public where = (column: string, value: any) => {
    this.wheres.push({ column, value });
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
