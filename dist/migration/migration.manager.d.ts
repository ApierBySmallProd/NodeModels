import AlterTable from './types/altertable';
import CreateTable from './types/createtable';
export interface Config {
    migrationPath: string;
}
export default class MigrationManager {
    private config;
    constructor(config: Config);
    createMigration: (migration: AlterTable | CreateTable) => Promise<void>;
    analyzeMigrations: (tableName: string) => Promise<CreateTable>;
    migrate: (targetMigration?: string | undefined, dbName?: string | undefined) => Promise<void>;
    reset: (targetMigration?: string | undefined, dbName?: string | undefined) => Promise<void>;
}
