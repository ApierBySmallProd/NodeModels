import AlterTable from './types/altertable';
import CreateTable from './types/createtable';
import DropTable from './types/droptable';
import GlobalModel from '../dbs/global/global.db';
import SeedTable from './types/seed';
export default class Migration {
    private migrations;
    createTable: (name: string) => CreateTable;
    dropTable: (name: string) => DropTable;
    alterTable: (name: string) => AlterTable;
    seedTable: (tableName: string) => SeedTable;
    execute: (db: GlobalModel) => Promise<void>;
}
