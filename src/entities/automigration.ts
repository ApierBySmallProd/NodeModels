import AlterTable from '../migration/types/altertable';
import CreateTable from '../migration/types/createtable';
import DbManager from '../dbs/dbmanager';
import EntityManager from './entitymanager';
import FieldEntity from './field.entity';
import Migration from '../migration/migration';
import MigrationEntity from './migration.entity';
import MigrationType from '../migration/types/migrationtype';
import { Relationship } from './types';
import fs from 'fs';
import path from 'path';

export const makeMigrations = async (constructor: any, dbName?: string) => {
  let relationship: Relationship;
  const relationFields: FieldEntity[] = [];
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
        EntityManager.initializedEntities.includes(relationship.entity)
      ) {
        const relationId: FieldEntity = relationEntity.entity.columns.find(
          (f: FieldEntity) => f.key === relationEntity.entity.id.key,
        );
        if (!relationId) {
          throw Error(`Unknown id`);
        }
        const field = new FieldEntity(
          `${relationship.fieldName}_id`,
          relationId.type,
        );
        field.foreign(
          relationEntity.entity.tableName,
          relationEntity.entity.id.fieldName,
        );
        relationFields.push(field);
      } else {
        throw Error(`Undefined entity for table ${relationship.entity}`);
      }
    } else if (relationship.type === 'manytomany') {
      if (relationEntity && relationEntity.entity.ready) {
        if (relationEntity.entity.initialized && relationship.relationTable) {
          const relationId: FieldEntity = relationEntity.entity.columns.find(
            (f: FieldEntity) => f.key === relationEntity.entity.id.key,
          );
          if (!relationId) {
            throw Error(`Unknown id`);
          }
          const field = new FieldEntity(
            `${relationEntity.entity.tableName}_id`,
            relationId.type,
          );
          field.foreign(
            relationEntity.entity.tableName,
            relationEntity.entity.id.fieldName,
          );
          const myId: FieldEntity = constructor.columns.find(
            (f: FieldEntity) => f.key === constructor.id.key,
          );
          if (!myId) {
            throw Error(`Unknown id`);
          }
          const otherfield = new FieldEntity(
            `${constructor.tableName}_id`,
            myId.type,
          );
          otherfield.foreign(constructor.tableName, constructor.id.fieldName);
          manyToMany.push({
            name: relationship.relationTable,
            fields: [field, otherfield],
          });
          EntityManager.registerManyToManyTable(
            constructor.tableName,
            relationEntity.entity.tableName,
            relationship.relationTable,
          );
        }
      } else {
        throw Error(`Undefined entity for table ${relationship.entity}`);
      }
    }
  }
  EntityManager.initializedEntities.push(constructor.tableName);
  await checkAndMigrate(
    constructor.tableName,
    constructor.columns.concat(relationFields),
    constructor.dbName || dbName,
  );
  await manyToMany.reduce(async (prev: any, cur: any) => {
    await prev;
    await checkAndMigrate(cur.name, cur.fields, constructor.dbName || dbName);
  }, Promise.resolve());
};

const analyzeMigrations = async (tableName: string) => {
  const model = DbManager.getInstance().get();
  const config = DbManager.getInstance().getConfig();
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

const createMigration = async (
  migration: CreateTable | AlterTable,
  dbName?: string,
) => {
  const config = DbManager.getInstance().getConfig();
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
  const model = DbManager.getInstance().get(dbName);
  if (!model) {
    throw new Error('Database not found');
  }
  await migr.execute(model, true);
};

const checkAndMigrate = async (
  tableName: string,
  columns: FieldEntity[],
  dbName?: string,
) => {
  const globalMigration = await analyzeMigrations(tableName);
  const newSchema = new CreateTable(tableName);
  newSchema.fields = columns.map((field: FieldEntity) =>
    field.convertToMigrationField(),
  );
  const migration = globalMigration.compareSchema(newSchema);
  if (migration) {
    await createMigration(migration, dbName);
  }
};
