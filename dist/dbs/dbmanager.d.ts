import GlobalModel from './global/global.db';
export declare type Dbms = 'postgre' | 'mariadb' | 'oracle' | 'mssql';
export interface Config {
    migrationPath: string;
}
export default class DbManager {
    static get: () => DbManager;
    private static _instance;
    private config;
    private dbs;
    private constructor();
    setConfig: (config: Config) => void;
    getConfig: () => Config;
    add: (dbms: Dbms, host: string, port: number, user: string, password: string, database: string, name?: string, debug?: boolean) => Promise<void>;
    get: (name?: string | null) => GlobalModel | null;
}
export interface Db {
    name: string;
    db: GlobalModel;
}
