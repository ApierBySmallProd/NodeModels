import GlobalModel from './global/global.db';

export type Dbms = 'postgre' | 'mariadb' | 'oracle' | 'mssql';

export interface Config {
  migrationPath: string;
}

const defaultConfig: Config = {
  migrationPath: 'database/migrations',
};

export default class DbManager {
  public static getInstance = () => {
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
    dbms: Dbms,
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    name = '',
    debug = false,
  ) => {
    switch (dbms) {
      case 'mariadb': {
        const GlobalMariaModel = (await import('./global/maria.db')).default;
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
        const GlobalPostgreModel = (await import('./global/postgres.db'))
          .default;
        const ndb = new GlobalPostgreModel(debug);
        await ndb.setPool({
          host,
          port,
          user,
          password,
          database,
        });
        this.dbs.push({ name, db: ndb });
        break;
      }
      case 'oracle': {
        const GlobalOracleModel = (await import('./global/oracle.db')).default;
        const ndb = new GlobalOracleModel(debug);
        await ndb.setPool({
          user,
          password,
          connectString: `${host}:${port}/${database}`,
        });
        this.dbs.push({ name, db: ndb });
        break;
      }
      case 'mssql': {
        const GlobalMicrosoftModel = (await import('./global/microsoft.db'))
          .default;
        const ndb = new GlobalMicrosoftModel(debug);
        await ndb.setPool({
          port,
          user,
          password,
          database,
          server: host,
        });
        this.dbs.push({ name, db: ndb });
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

  public clear = async () => {
    await this.dbs.reduce(async (previous, current) => {
      await previous;
      await current.db.disconnect();
    }, Promise.resolve());
    this.dbs = [];
  };
}

export interface Db {
  name: string;
  db: GlobalModel;
}
