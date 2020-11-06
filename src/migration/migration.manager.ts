import DbManager from '../dbs/dbmanager';
import EntityManager from '../entities/entitymanager';
import Migration from './migration';
import MigrationEntity from '../entities/migration.entity';
import fs from 'fs';
import path from 'path';

export interface Config {
  migrationPath: string;
}

export default class MigrationManager {
  private config: Config;

  public constructor() {
    this.config = DbManager.getInstance().getConfig();
    MigrationEntity.reset();
  }

  /**
   * Make all migrations or given targetMigration
   * (call the up function of every migration)
   */
  public migrate = async (
    targetMigration?: string,
    dbName?: string,
    silent?: boolean,
  ) => {
    await EntityManager.initialize();
    if (!silent) console.log('\x1b[33mStarting migrations\x1b[0m');
    const model = DbManager.getInstance().get(dbName);
    if (!model) {
      throw new Error('Database not found');
    }
    const migrations = (await MigrationEntity.getAll(model)).map(
      (m: any) => m.name,
    );
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
        if (!silent)
          console.log(`\x1b[35m## Migrating ${migrationRequired.name}\x1b[0m`);
        migrationRequired.up(migration);
        await migration.execute(model, silent);
      }
    }, Promise.resolve());
  };

  /**
   * Reset all migrations or given targetMigration
   * (call the down function of every migrations)
   */
  public reset = async (
    targetMigration?: string,
    dbName?: string,
    silent?: boolean,
  ) => {
    await EntityManager.initialize();
    if (!silent) console.log('\x1b[33mStarting migrations\x1b[0m');
    const model = DbManager.getInstance().get(dbName);
    if (!model) {
      throw new Error('Database not found');
    }
    const migrations = (await MigrationEntity.getAll(model)).map(
      (m: any) => m.name,
    );
    const res = fs.readdirSync(this.config.migrationPath);
    res.sort();
    await migrations.reduce(async (prev: any, migrationName: string) => {
      await prev;
      let migrationRequired: any = null;
      res.forEach((migrationFile) => {
        const migrationPath = path.resolve(
          this.config.migrationPath,
          migrationFile,
        );
        const req = require(migrationPath);
        if (
          req.name === migrationName &&
          (!targetMigration || targetMigration === req.name)
        ) {
          migrationRequired = req;
        }
      });
      if (migrationRequired) {
        if (!silent)
          console.log(`\x1b[35m## Migrating ${migrationRequired.name}\x1b[0m`);
        const migration = new Migration(migrationRequired.name, 'down');
        migrationRequired.down(migration);
        await migration.execute(model, silent);
      }
    }, Promise.resolve());
  };
}
