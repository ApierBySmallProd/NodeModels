import AlterTable from './types/altertable';
import CreateTable from './types/createtable';
import DropTable from './types/droptable';
import GlobalModel from '../dbs/global/global.db';
import MigrationType from './types/migrationtype';
import SeedTable from './types/seed';

export default class Migration {
  private migrations: MigrationType[] = [];

  /**
   * Create a new table
   */
  public createTable = (name: string) => {
    const createTableMigration = new CreateTable(name);
    this.migrations.push(createTableMigration);
    return createTableMigration;
  };

  /**
   * Drop given table
   */
  public dropTable = (name: string) => {
    const dropTableMigration = new DropTable(name);
    this.migrations.push(dropTableMigration);
    return dropTableMigration;
  };

  /**
   * Alter given table
   */
  public alterTable = (name: string) => {
    const alterTableMigration = new AlterTable(name);
    this.migrations.push(alterTableMigration);
    return alterTableMigration;
  };

  /**
   * Seed given table
   */
  public seedTable = (tableName: string) => {
    const seedTableMigration = new SeedTable(tableName);
    this.migrations.push(seedTableMigration);
    return seedTableMigration;
  };

  public execute = async (db: GlobalModel) => {
    const results = this.migrations.map((m) => m.formatQuery());
    await results.reduce(async (prev, cur) => {
      await prev;
      if (cur.query && cur.query.length) {
        await cur.query.reduce(async (p, c) => {
          await p;
          await db.query(c);
        }, Promise.resolve());
      }
    }, Promise.resolve());
    await results.reduce(async (prev, cur) => {
      await prev;
      if (cur.constraints && cur.constraints.length) {
        await cur.constraints.reduce(async (p, c) => {
          await p;
          await db.query(c);
        }, Promise.resolve());
      }
    }, Promise.resolve());
    await results.reduce(async (prev, cur) => {
      await prev;
      if (cur.seeds && cur.seeds.length) {
        await cur.seeds.reduce(async (p, c) => {
          await p;
          await db.query(c);
        }, Promise.resolve());
      }
    }, Promise.resolve());
  };
}
