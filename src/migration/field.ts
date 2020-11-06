export class Field {
  public name: string;
  private type: FieldType;
  private null = false;
  private len = 0;
  private ai = false;
  private foreignKey: ForeignKey | null = null;
  private primaryKey = false;
  private mustBeUnique = false;
  private defaultValue: DefaultValue | null = null;
  private checkValue: string | null = null;

  public constructor(name: string, type: FieldType) {
    this.name = name;
    this.type = type;
  }

  public setType = (type: FieldType) => {
    this.type = type;
    return this;
  };

  public getType = () => this.type;

  public allowNull = () => {
    this.null = true;
    return this;
  };

  public length = (len: number) => {
    this.len = len;
    return this;
  };

  public autoIncrement = () => {
    this.ai = true;
    return this;
  };

  public foreign = (table: string, column: string) => {
    this.foreignKey = { table, column };
    return this;
  };

  public primary = () => {
    this.primaryKey = true;
    return this;
  };

  public unique = () => {
    this.mustBeUnique = true;
    return this;
  };

  public default = (defaultValue: string, system = false) => {
    this.defaultValue = { value: defaultValue, isSystem: system };
    return this;
  };

  public check = (checkValue: string) => {
    this.checkValue = checkValue;
    return this;
  };

  public getAll = () => ({
    name: this.name,
    type: this.type,
    null: this.null,
    len: this.len,
    ai: this.ai,
    foreignKey: this.foreignKey,
    primaryKey: this.primaryKey,
    mustBeUnique: this.mustBeUnique,
    defaultValue: this.defaultValue,
    checkValue: this.checkValue,
  });

  public equal = (field: Field) => {
    return (
      this.name === field.name &&
      this.null === field.null &&
      field.type === this.type &&
      this.len === field.len &&
      field.ai === this.ai &&
      field.primaryKey === this.primaryKey &&
      field.mustBeUnique === this.mustBeUnique &&
      field.checkValue === this.checkValue &&
      this.defaultValueEquals(field)
    );
  };

  public generateMigrationFile = (): string => {
    return `.addField('${this.name}', '${this.type}')${
      this.ai ? '.autoIncrement()' : ''
    }${this.checkValue ? `.check('${this.checkValue}')` : ''}${
      this.defaultValue
        ? `.default('${this.defaultValue.value}', ${this.defaultValue.isSystem})`
        : ''
    }${
      this.foreignKey
        ? `.foreign('${this.foreignKey.table}', '${this.foreignKey.column}')`
        : ''
    }${this.len ? `.length(${this.len})` : ''}${
      this.mustBeUnique ? '.unique()' : ''
    }${this.null ? '.allowNull()' : ''}${this.primaryKey ? '.primary()' : ''}`;
  };

  private defaultValueEquals = (field: Field) => {
    if (!this.defaultValue || !field.defaultValue) {
      return this.defaultValue === field.defaultValue;
    }
    return (
      this.defaultValue.isSystem === field.defaultValue.isSystem &&
      this.defaultValue.value === field.defaultValue.value
    );
  };
}

export interface ForeignKey {
  table: string;
  column: string;
}

export interface DefaultValue {
  value: string;
  isSystem: boolean;
}

export type FieldType =
  | 'tinyint'
  | 'boolean'
  | 'smallint'
  | 'mediumint'
  | 'int'
  | 'bigint'
  | 'decimal'
  | 'float'
  | 'double'
  | 'bit'
  | 'date'
  | 'time'
  | 'datetime'
  | 'timestamp'
  | 'char'
  | 'varchar'
  | 'binary'
  | 'varbinary'
  | 'tinyblob'
  | 'blob'
  | 'mediumblob'
  | 'longblob'
  | 'tinytext'
  | 'text'
  | 'mediumtext'
  | 'longtext';
