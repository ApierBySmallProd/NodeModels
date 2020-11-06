import AlterTable from './types/altertable';
import CreateTable from './types/createtable';
import DropTable from './types/droptable';
import GlobalModel from '../dbs/global/global.db';
import MigrationEntity from '../entities/migration.entity';
import MigrationType from './types/migrationtype';
import SeedTable from './types/seed';

export default class Migration {
  private migrations: MigrationType[] = [];
  private migrationName: string;
  private type: 'up' | 'down';

  public constructor(
    migrationName: string,
    type: 'up' | 'down',
    migrations: MigrationType[] = [],
  ) {
    this.migrationName = migrationName;
    this.type = type;
    this.migrations = migrations;
  }
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

  public findByTableName = (tableName: string) => {
    return this.migrations.filter(
      (m) => m.tableName === tableName && m.type !== 'seed',
    );
  };

  public execute = async (db: GlobalModel, silent?: boolean) => {
    if (!(await db.startTransaction())) {
      console.error('Transaction cannot be started');
      console.log('\x1b[31m  → Failure\x1b[0m');
      throw new Error();
      return;
    }
    try {
      // Execute the migration
      await this.migrations.reduce(async (prev, cur) => {
        await prev;
        await cur.execute(db);
      }, Promise.resolve());

      // Save the status in db
      if (this.type === 'up') {
        await MigrationEntity.create(db, this.migrationName);
      } else {
        await MigrationEntity.delete(db, this.migrationName);
      }
      await db.commit();
      if (!silent) console.log('\x1b[32m  → Success\x1b[0m');
    } catch (error) {
      await db.rollback();
      console.error(error);
      console.log('\x1b[31m  → Failure\x1b[0m');
      throw new Error();
    }
  };
}
