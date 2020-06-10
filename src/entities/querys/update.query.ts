import Query, { Attribute } from './query';

import DbManager from '../../dbs/dbmanager';

export default class UpdateQuery extends Query {
  private attributes: Attribute[] = [];
  private wheres: Attribute[] = [];
  public setAttribute = (column: string, value: any) => {
    this.attributes.push({ column, value });
    return this;
  };

  public where = (column: string, value: any) => {
    this.wheres.push({ column, value });
    return this;
  };

  /**
   * Execute the update query and return the number of updated rows
   */
  public exec = async (dbName: string | null = null) => {
    const db = DbManager.get().get(dbName);
    if (!db) throw Error('Database not found');
    return await db.update(this.tableName, this.attributes, this.wheres);
  };
}
