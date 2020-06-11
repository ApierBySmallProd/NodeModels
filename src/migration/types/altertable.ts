import { Field, FieldType } from './createtable';

import MigrationType from './migrationtype';

export default class AlterTable extends MigrationType {
  private addedFields: Field[] = [];
  private removedFields: string[] = [];
  private tableName: string;
  constructor(tableName: string) {
    super();
    this.tableName = tableName;
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

    return {
      query: [...toRemove, ...toAdd],
    };
  };
}
