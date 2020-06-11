import CreateTable, { Field } from '../migration/types/createtable';

import CreateQuery from './querys/create.query';
import DbManager from '../dbs/dbmanager';
import DeleteQuery from './querys/delete.query';
import FindQuery from './querys/find.query';
import { MigrationManager } from '..';
import UpdateQuery from './querys/update.query';

export default abstract class Entity {
  public static tableName = '';
  public static nonPersistentColumns: string[] = [];
  public static columns: Field[] = [];
  public static primaryKeys: string[] = [];
  public static id = '';
  public static autoCreateNUpdate = false;

  public static create = () => {
    /**/
  };

  public static findOne() {
    const query = new FindQuery(this.tableName, (res: any[]) => {
      if (res.length) {
        const newObj: any = this.create();
        for (const [key, value] of Object.entries(res[0])) {
          newObj[key] = value;
        }
        return newObj;
      }
      return null;
    });
    query.limit(1);
    return query;
  }

  public static findMany() {
    const query = new FindQuery(this.tableName, (res: any[]) => {
      const result: Entity[] = [];
      res.forEach((r) => {
        const newObj: any = this.create();
        for (const [key, value] of Object.entries(r)) {
          newObj[key] = value;
        }
        result.push(newObj);
      });
      return result;
    });
    return query;
  }

  public static async findById(id: any) {
    const query = new FindQuery(this.tableName);
    if (!this.id) throw new Error('No id specified');
    query.where(this.id, '=', id);
    const res = await query.exec();
    if (res.length) {
      const newObj: any = this.create();
      for (const [key, value] of Object.entries(res[0])) {
        newObj[key] = value;
      }
      return newObj;
    }
    return null;
  }

  public create = async (dbName: string | null = null) => {
    const base = this as any;
    const query = new CreateQuery(base.constructor.tableName);
    const nonPersistentColumns: string[] =
      base.constructor.nonPersistentColumns;
    const primaryKeys: string[] = base.constructor.primaryKeys;
    for (const [key, value] of Object.entries(this)) {
      if (
        !nonPersistentColumns.includes(key) &&
        !primaryKeys.includes(key) &&
        !(base[key] instanceof Array) &&
        (typeof base[key] !== 'object' || typeof base[key] === null) &&
        typeof base[key] !== 'function'
      ) {
        query.setAttribute(key, value);
      }
    }
    const res = await query.exec(dbName);
    if (res) {
      if (base.constructor.id) {
        base[base.constructor.id] = res;
      }
      return this;
    }
    return null;
  };

  public update = async (dbName: string | null = null) => {
    const base = this as any;
    const query = new UpdateQuery(base.constructor.tableName);
    const nonPersistentColumns: string[] =
      base.constructor.nonPersistentColumns;
    const primaryKeys: string[] = base.constructor.primaryKeys;
    for (const [key, value] of Object.entries(this)) {
      if (
        !nonPersistentColumns.includes(key) &&
        !primaryKeys.includes(key) &&
        !(base[key] instanceof Array) &&
        (typeof base[key] !== 'object' || typeof base[key] === null) &&
        typeof base[key] !== 'function'
      ) {
        query.setAttribute(key, value);
      }
    }
    if (base.constructor.id) {
      query.where(base.constructor.id, base[base.constructor.id]);
    }
    const res = await query.exec(dbName);
    if (res) {
      return this;
    }
    return null;
  };

  public delete = async (dbName: string | null = null) => {
    const base = this as any;
    const query = new DeleteQuery(base.constructor.tableName);
    if (!base.constructor.id) {
      throw new Error('No id specified');
    }
    query.where(base.constructor.id, base[base.constructor.id]);
    const res = await query.exec(dbName);
    if (res) {
      return true;
    }
    return false;
  };
}
