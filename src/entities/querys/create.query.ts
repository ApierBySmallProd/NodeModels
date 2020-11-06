import Query, { Attribute } from './query';

import DbManager from '../../dbs/dbmanager';

export default class CreateQuery extends Query {
  private attributes: Attribute[] = [];

  public setAttribute = (column: string, value: any) => {
    this.attributes.push({ column, value });
    return this;
  };

  /**
   * Execute the create query and return the inserted id
   */
  public exec = async (dbName: string | null = null) => {
    let dbConnName = dbName;
    if (!dbConnName && this.dbName) dbConnName = this.dbName;
    const db = DbManager.getInstance().get(dbConnName);
    if (!db) throw Error('Database not found');
    return await db.insert(this.tableName, this.attributes);
  };
}
