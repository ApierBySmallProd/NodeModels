import GlobalModel from './global/global.db';
export declare type Sgbd = 'postgre' | 'mariadb';
export default class DbManager {
    static get: () => DbManager;
    private static _instance;
    private dbs;
    private constructor();
    add: (sgbd: Sgbd, host: string, port: number, user: string, password: string, database: string, name?: string, debug?: boolean) => Promise<void>;
    get: (name?: string | null) => GlobalModel | null;
}
export interface Db {
    name: string;
    db: GlobalModel;
}
