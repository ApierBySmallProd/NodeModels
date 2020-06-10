import GlobalModel from '../dbs/global/global.db';
export interface Config {
    migrationPath: string;
    database: GlobalModel;
}
export default class MigrationManager {
    private config;
    constructor(config: Config);
    migrate: (targetMigration?: string | undefined) => Promise<void>;
    reset: (targetMigration?: string | undefined) => Promise<void>;
}
