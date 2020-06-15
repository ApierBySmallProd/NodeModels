import { Attribute } from './query';
import DbManager from '../../dbs/dbmanager';
import WhereQuery from './where.query';

export default class UpdateQuery extends WhereQuery {
  private attributes: Attribute[] = [];

  public setAttribute = (column: string, value: any) => {
    this.attributes.push({ column, value });
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
