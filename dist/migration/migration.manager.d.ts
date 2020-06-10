export interface Config {
    migrationPath: string;
}
export default class MigrationManager {
    private config;
    constructor(config: Config);
    migrate: (targetMigration?: string | undefined, dbName?: string | undefined) => Promise<void>;
    reset: (targetMigration?: string | undefined, dbName?: string | undefined) => Promise<void>;
}
