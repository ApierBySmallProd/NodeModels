import CreateTable, { Field } from '../migration/types/createtable';

import AlterTable from '../migration/types/altertable';
import DbManager from '../dbs/dbmanager';
import EntityManager from './entitymanager';
import Migration from '../migration/migration';
import MigrationEntity from './migration.entity';
import MigrationType from '../migration/types/migrationtype';
import { Relationship } from './types';
import fs from 'fs';
import path from 'path';

export const makeMigrations = async (constructor: any) => {
  let relationship: Relationship;
  const relationFields: Field[] = [];
  const manyToMany = [];
  if (!constructor.relations) constructor.relations = [];
  for (relationship of constructor.relations) {
    const relationEntity = EntityManager.entities.find(
      (e) => e.tableName === relationship.entity,
    );
    if (relationship.type === 'manytoone') {
      if (
        relationEntity &&
        relationEntity.entity.ready &&
        relationEntity.entity.initialized
      ) {
        const relationId: Field = relationEntity.entity.columns.find(
          (f: Field) => f.name === relationEntity.entity.id,
        );
        if (!relationId) {
          throw Error(`Unknown id`);
        }
        const field = new Field(
          `${relationship.fieldName}_id`,
          relationId.getType(),
        );
        field.foreign(
          relationEntity.entity.tableName,
          relationEntity.entity.id,
        );
        relationFields.push(field);
      } else {
        throw Error(`Undefined entity for table ${relationship.entity}`);
      }
    } else if (relationship.type === 'manytomany') {
      if (relationEntity && relationEntity.entity.ready) {
        if (relationEntity.entity.initialized) {
          const relationId: Field = relationEntity.entity.columns.find(
            (f: Field) => f.name === relationEntity.entity.id,
          );
          if (!relationId) {
            throw Error(`Unknown id`);
          }
          const field = new Field(
            `${relationEntity.entity.tableName}_id`,
            relationId.getType(),
          );
          field.foreign(
            relationEntity.entity.tableName,
            relationEntity.entity.id,
          );
          const myId: Field = constructor.columns.find(
            (f: Field) => f.name === constructor.id,
          );
          if (!myId) {
            throw Error(`Unknown id`);
          }
          const otherfield = new Field(
            `${constructor.tableName}_id`,
            myId.getType(),
          );
          otherfield.foreign(constructor.tableName, constructor.id);
          manyToMany.push({
            name: `relation_${constructor.tableName}_${relationEntity.entity.tableName}`,
            fields: [field, otherfield],
          });
          EntityManager.registerManyToManyTable(
            constructor.tableName,
            relationEntity.entity.tableName,
            `relation_${constructor.tableName}_${relationEntity.entity.tableName}`,
          );
        }
      } else {
        throw Error(`Undefined entity for table ${relationship.entity}`);
      }
    }
  }
  constructor.initialized = true;
  await checkAndMigrate(
    constructor.tableName,
    constructor.columns.concat(relationFields),
  );
  await manyToMany.reduce(async (prev: any, cur: any) => {
    await prev;
    await checkAndMigrate(cur.name, cur.fields);
  }, Promise.resolve());
};

const analyzeMigrations = async (tableName: string) => {
  const model = DbManager.get().get();
  const config = DbManager.get().getConfig();
  if (!model) {
    throw new Error('Database not found');
  }
  const migrations = (await MigrationEntity.getAll(model)).map(
    (m: any) => m.name,
  );
  const result: MigrationType[] = [];
  const res = fs.readdirSync(config.migrationPath);
  res.forEach((migrationFile: string) => {
    const migrationPath = path.resolve(config.migrationPath, migrationFile);
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

const createMigration = async (migration: CreateTable | AlterTable) => {
  const config = DbManager.get().getConfig();
  const now = new Date();
  const fileName = `[${now
    .toISOString()
    .replace(/T/g, '-')
    .replace(/:/g, '-')}]${migration.getName()}.js`;
  const nbFile = fs
    .readdirSync(path.resolve(config.migrationPath))
    .length.toString();
  fs.writeFileSync(
    path.resolve(config.migrationPath, fileName),
    migration.generateMigrationFile(nbFile),
  );
  const migr = new Migration(`${migration.getName()}-${nbFile}`, 'up', [
    migration,
  ]);
  const model = DbManager.get().get();
  if (!model) {
    throw new Error('Database not found');
  }
  await migr.execute(model);
};

const checkAndMigrate = async (tableName: string, columns: Field[]) => {
  const globalMigration = await analyzeMigrations(tableName);
  const newSchema = new CreateTable(tableName);
  newSchema.fields = columns;
  const migration = globalMigration.compareSchema(newSchema);
  if (migration) {
    await createMigration(migration);
  }
};
