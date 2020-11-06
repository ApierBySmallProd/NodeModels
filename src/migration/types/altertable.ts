import { Field, FieldType } from '../field';

import { GlobalModel } from '../..';
import MigrationType from './migrationtype';

export default class AlterTable extends MigrationType {
  public addedFields: Field[] = [];
  public removedFields: string[] = [];

  public constructor(tableName: string) {
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

  public execute = async (model: GlobalModel) => {
    model.alterTable(this.tableName, this.addedFields, this.removedFields);
  };
}
