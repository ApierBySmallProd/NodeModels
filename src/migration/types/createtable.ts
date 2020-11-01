import { Field, FieldType } from '../field';

import AlterTable from './altertable';
import MigrationType from './migrationtype';

export default class CreateTable extends MigrationType {
  public fields: Field[] = [];
  constructor(tableName: string) {
    super(tableName, 'createtable');
  }

  public addField = (name: string, type: FieldType) => {
    const newField = new Field(name, type);
    this.fields.push(newField);
    return newField;
  };

  public formatQuery = () => {
    const fieldsString = this.fields.map((f) => f.formatField()).join(', ');

    let fieldsConstraints: string[] = [];
    this.fields.forEach((cur) => {
      fieldsConstraints = fieldsConstraints.concat(
        cur.formatConstraint(this.tableName),
      );
    });
    const query = [`CREATE TABLE \`${this.tableName}\` (${fieldsString})`];
    return {
      query,
      constraints: fieldsConstraints,
    };
  };

  public applyMigration = (migration: MigrationType) => {
    if (migration.type === 'droptable') {
      this.fields = [];
    } else if (migration.type === 'createtable') {
      const mig = migration as CreateTable;
      this.fields = mig.fields;
    } else if (migration.type === 'altertable') {
      const mig = migration as AlterTable;
      mig.removedFields.forEach((f) => {
        this.fields = this.fields.filter((fi) => fi.name !== f);
      });
      mig.addedFields.forEach((f) => {
        this.fields.push(f);
      });
    }
  };

  public compareSchema = (schema: CreateTable) => {
    if (!this.fields.length) {
      return schema;
    }
    const migration = new AlterTable(this.tableName);
    const fieldNames: string[] = [];
    schema.fields.forEach((field) => {
      const curField = this.fields.find((f) => f.name === field.name);
      if (curField) {
        if (!curField.equal(field)) {
          migration.removeField(field.name);
          migration.addedFields.push(field);
        }
      } else {
        migration.addedFields.push(field);
      }
      fieldNames.push(field.name);
    });
    const toRemove = this.fields.filter((f) => !fieldNames.includes(f.name));
    toRemove.forEach((f) => {
      migration.removeField(f.name);
    });
    if (!migration.addedFields.length && !migration.removedFields.length)
      return null;
    return migration;
  };

  public generateMigrationFile = (name: string) => {
    let file = `const Migration = require('@smallprod/models').Migration;\n\n /**\n *\n * @param {Migration} migration\n */\nconst up = (migration) => {\n    const newTable = migration.createTable('${this.tableName}');\n\n`;
    this.fields.forEach((field) => {
      file = `${file}   newTable${field.generateMigrationFile()};\n`;
    });
    file = `${file}};\n\n`;
    file = `${file}/*\n * @param {Migration} migration\n */\nconst down = (migration) => {\n    migration.dropTable('${this.tableName}');\n};\n\n`;
    file = `${file}module.exports = {\n   name: '${this.getName()}-${name}',\n    up,\n   down,\n};`;
    return file;
  };

  public getName = () => {
    return `create-table-${this.tableName.toLowerCase()}`;
  };
}
