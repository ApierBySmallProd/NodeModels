import { DefaultValue, Field, FieldType, ForeignKey } from '../migration/field';

export default class FieldEntity {
  public key: string;
  public type: FieldType;
  public fieldName: string;
  public isUnique = false;
  public isAutoIncremented = false;
  public isNullAllowed = false;
  public isPrimary = false;
  public checkConstraint: string | null = null;
  public defaultConstraint: DefaultValue | null = null;
  public foreignKey: ForeignKey | null = null;
  public fieldLength = 0;

  public constructor(key: string, type: FieldType) {
    this.key = key;
    this.type = type;
    this.fieldName = key;
  }

  public length = (length: number) => {
    this.fieldLength = length;
  };

  public setType = (type: FieldType) => {
    this.type = type;
  };

  public name = (name: string) => {
    this.fieldName = name;
  };

  public unique = () => {
    this.isUnique = true;
  };

  public autoIncrement = () => {
    this.isAutoIncremented = true;
  };

  public allowNull = () => {
    this.isNullAllowed = true;
  };

  public primary = () => {
    this.isPrimary = true;
  };

  public default = (value: string, isSystem: boolean) => {
    this.defaultConstraint = { value, isSystem };
  };

  public check = (check: string) => {
    this.checkConstraint = check;
  };

  public foreign = (table: string, column: string) => {
    this.foreignKey = { table, column };
  };

  public convertToMigrationField = (): Field => {
    const field = new Field(this.fieldName, this.type);

    if (this.fieldLength) field.length(this.fieldLength);
    if (this.isUnique) field.unique();
    if (this.isAutoIncremented) field.autoIncrement();
    if (this.isNullAllowed) field.allowNull();
    if (this.isPrimary) field.primary();
    if (this.checkConstraint) field.check(this.checkConstraint);
    if (this.defaultConstraint)
      field.default(
        this.defaultConstraint.value,
        this.defaultConstraint.isSystem,
      );
    if (this.foreignKey)
      field.foreign(this.foreignKey.table, this.foreignKey.column);

    return field;
  };
}
