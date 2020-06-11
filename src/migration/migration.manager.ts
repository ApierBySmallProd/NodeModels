import AlterTable from './types/altertable';
import CreateTable from './types/createtable';
import DbManager from '../dbs/dbmanager';
import Migration from './migration';
import MigrationType from './types/migrationtype';
import fs from 'fs';
import path from 'path';

export interface Config {
  migrationPath: string;
}

export default class MigrationManager {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  public createMigration = async (migration: CreateTable | AlterTable) => {
    const now = new Date();
    const fileName = `[${now
      .toISOString()
      .replace(/T/g, '-')
      .replace(/:/g, '-')}]${migration.getName()}.js`;
    const nbFile = fs
      .readdirSync(path.resolve(this.config.migrationPath))
      .length.toString();
    fs.writeFileSync(
      path.resolve(this.config.migrationPath, fileName),
      migration.generateMigrationFile(nbFile),
    );
    const migr = new Migration(`${migration.getName()}-${nbFile}`, 'up');
    const model = DbManager.get().get();
    if (!model) {
      throw new Error('Database not found');
    }
    await migr.execute(model);
  };

  public analyzeMigrations = async (tableName: string) => {
    const model = DbManager.get().get();
    if (!model) {
      throw new Error('Database not found');
    }
    // ! TODO change this
    const migrations: string[] = (
      await model.query(
        'SELECT name FROM migration ORDER BY migrated_at ASC, id ASC',
      )
    ).map((m: any) => m.name);
    const result: MigrationType[] = [];
    const res = fs.readdirSync(this.config.migrationPath);
    res.forEach((migrationFile: string) => {
      const migrationPath = path.resolve(
        this.config.migrationPath,
        migrationFile,
      );
      const migrationRequired = require(migrationPath);
      if (migrations.includes(migrationRequired.name)) {
        const migration = new Migration(migrationRequired.name, 'up');
        migrationRequired.up(migration);
        const r = migration.findByTableName(tableName);
        r.forEach((m) => {
          result.push(m);
        });
      }
    });
    if (!result.length) return new CreateTable(tableName);
    if (result[0].type !== 'createtable') return new CreateTable(tableName);
    const globalMigration = result[0] as CreateTable;
    for (let i = 1; i < result.length; i += 1) {
      globalMigration.applyMigration(result[i]);
    }
    return globalMigration;
  };

  /**
   * Make all migrations or given targetMigration
   * (call the up function of every migration)
   */
  public migrate = async (targetMigration?: string, dbName?: string) => {
    console.log('\x1b[33mStarting migrations\x1b[0m');
    const model = DbManager.get().get(dbName);
    if (!model) {
      throw new Error('Database not found');
    }
    // ! TODO change this
    const migrations: string[] = (
      await model.query(
        'SELECT name FROM migration ORDER BY migrated_at ASC, id ASC',
      )
    ).map((m: any) => m.name);
    const res = fs.readdirSync(this.config.migrationPath);
    res.sort();
    await res.reduce(async (prev, migrationFile) => {
      await prev;
      const migrationPath = path.resolve(
        this.config.migrationPath,
        migrationFile,
      );
      const migrationRequired = require(migrationPath);
      if (
        !migrations.includes(migrationRequired.name) &&
        (!targetMigration || targetMigration === migrationRequired.name)
      ) {
        const migration = new Migration(migrationRequired.name, 'up');
        console.log(`\x1b[35m## Migrating ${migrationRequired.name}\x1b[0m`);
        migrationRequired.up(migration);
        await migration.execute(model);
      }
    }, Promise.resolve());
  };

  /**
   * Reset all migrations or given targetMigration
   * (call the down function of every migrations)
   */
  public reset = async (targetMigration?: string, dbName?: string) => {
    console.log('\x1b[33mStarting migrations\x1b[0m');
    const model = DbManager.get().get(dbName);
    if (!model) {
      throw new Error('Database not found');
    }
    const res = fs.readdirSync(this.config.migrationPath);
    res.sort();
    await res.reduce(async (prev, migrationFile) => {
      await prev;
      const migrationPath = path.resolve(
        this.config.migrationPath,
        migrationFile,
      );
      const migrationRequired = require(migrationPath);
      if (!targetMigration || targetMigration === migrationRequired.name) {
        console.log(`\x1b[35m## Migrating ${migrationRequired.name}\x1b[0m`);
        const migration = new Migration(migrationRequired.name, 'down');
        migrationRequired.down(migration);
        await migration.execute(model);
      }
    }, Promise.resolve());
  };
}
