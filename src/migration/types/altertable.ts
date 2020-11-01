import { Field, FieldType } from '../field';

import MigrationType from './migrationtype';

export default class AlterTable extends MigrationType {
  public addedFields: Field[] = [];
  public removedFields: string[] = [];
  constructor(tableName: string) {
    super(tableName, 'altertable');
  }

  public addField = (fieldName: string, fieldType: FieldType) => {
    const field = new Field(fieldName, fieldType);
    this.addedFields.push(field);
    return field;
  };

  public removeField = (fieldName: string) => {
    this.removedFields.push(fieldName);
  };

  public formatQuery = () => {
    const toAdd = this.addedFields.map(
      (f) => `ALTER TABLE \`${this.tableName}\` ADD ${f.formatField()}`,
    );
    const toRemove = this.removedFields.map(
      (f) => `ALTER TABLE \`${this.tableName}\` DROP COLUMN \`${f}\``,
    );
    let fieldsConstraints: string[] = [];
    this.addedFields.forEach((cur) => {
      fieldsConstraints = fieldsConstraints.concat(
        cur.formatConstraint(this.tableName),
      );
    });
    return {
      query: [...toRemove, ...toAdd],
      constraints: fieldsConstraints,
    };
  };

  public generateMigrationFile = (name: string) => {
    let file = `const Migration = require('@smallprod/models').Migration;\n\n /**\n *\n * @param {Migration} migration\n */\nconst up = (migration) => {\n    const alter = migration.alterTable('${this.tableName}');\n\n`;
    this.removedFields.forEach((field) => {
      file = `${file}   alter.removeField('${field}');\n`;
    });
    this.addedFields.forEach((field) => {
      file = `${file}   alter${field.generateMigrationFile()};\n`;
    });
    file = `${file}};\n\n`;
    file = `${file}/*\n * @param {Migration} migration\n */\nconst down = (migration) => {\n    migration.dropTable('${this.tableName}');\n};\n\n`; // ! TODO change this to avoid errors
    file = `${file}module.exports = {\n   name: '${this.getName()}-${name}',\n    up,\n   down,\n};`;
    return file;
  };

  public getName = () => {
    return `alter-table-${this.tableName.toLowerCase()}`;
  };
}
