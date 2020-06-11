import AlterTable from './types/altertable';
import CreateTable from './types/createtable';
import DropTable from './types/droptable';
import GlobalModel from '../dbs/global/global.db';
import MigrationType from './types/migrationtype';
import SeedTable from './types/seed';
export default class Migration {
    private migrations;
    private migrationName;
    private type;
    constructor(migrationName: string, type: 'up' | 'down');
    createTable: (name: string) => CreateTable;
    dropTable: (name: string) => DropTable;
    alterTable: (name: string) => AlterTable;
    seedTable: (tableName: string) => SeedTable;
    findByTableName: (tableName: string) => MigrationType[];
    execute: (db: GlobalModel) => Promise<void>;
}
