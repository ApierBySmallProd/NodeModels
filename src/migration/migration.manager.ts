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
    const res = fs.readdirSync(this.config.migrationPath);
    const migration = new Migration();
    res.sort();
    res.forEach((migrationFile) => {
      const migrationPath = path.resolve(
        this.config.migrationPath,
        migrationFile,
      );
      const migrationRequired = require(migrationPath);
      if (!targetMigration || targetMigration === migrationRequired.name) {
        migrationRequired.up(migration);
      }
    });
    const model = DbManager.get().get(dbName);
    if (!model) {
      throw new Error('Database not found');
    }
    await migration.execute(model);
  };

  /**
   * Reset all migrations or given targetMigration
   * (call the down function of every migrations)
   */
  public reset = async (targetMigration?: string, dbName?: string) => {
    const res = fs.readdirSync(this.config.migrationPath);
    const migration = new Migration();
    res.sort();
    res.forEach((migrationFile) => {
      const migrationPath = path.resolve(
        this.config.migrationPath,
        migrationFile,
      );
      const migrationRequired = require(migrationPath);
      if (!targetMigration || targetMigration === migrationRequired.name) {
        migrationRequired.down(migration);
      }
    });
    const model = DbManager.get().get(dbName);
    if (!model) {
      throw new Error('Database not found');
    }
    await migration.execute(model);
  };
}
