import GlobalMariaModel from './global/maria.db';
import GlobalModel from './global/global.db';
import GlobalPostgreModel from './global/postgres.db';

export type Sgbd = 'postgre' | 'mariadb';

export interface Config {
  migrationPath: string;
}

const defaultConfig: Config = {
  migrationPath: 'database/migrations',
};

export default class DbManager {
  public static get = () => {
    if (!DbManager._instance) {
      DbManager._instance = new DbManager();
    }
    return DbManager._instance;
  };
  private static _instance: DbManager;

  private config: Config = defaultConfig;
  private dbs: Db[] = [];
  private constructor() {}

  public setConfig = (config: Config) => {
    this.config = { ...this.config, ...config };
  };

  public getConfig = () => this.config;

  public add = async (
    sgbd: Sgbd,
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    name = '',
    debug = false,
  ) => {
    switch (sgbd) {
      case 'mariadb': {
        const ndb = new GlobalMariaModel(debug);
        await ndb.setPool({
          host,
          user,
          port,
          database,
          password,
        });
        this.dbs.push({ name, db: ndb });
        break;
      }
      case 'postgre': {
        const ndb = new GlobalPostgreModel(debug);
        await ndb.setPool({
          host,
          port,
          user,
          password,
          database,
        });
        break;
      }
      default: {
        console.error('Unknown sgbd');
      }
    }
  };

  public get = (name: string | null = null): GlobalModel | null => {
    if (!this.dbs.length) return null;
    if (!name) return this.dbs[0].db;
    const db = this.dbs.find((d) => d.name === name);
    if (db) return db.db;
    return null;
  };
}

export interface Db {
  name: string;
  db: GlobalModel;
}
