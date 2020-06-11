import DbManager from '../dbs/dbmanager';
import Migration from './migration';
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
