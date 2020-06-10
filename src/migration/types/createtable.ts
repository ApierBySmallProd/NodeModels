import MigrationType from './migrationtype';

export default class CreateTable extends MigrationType {
  public name: string;
  public fields: Field[] = [];
  constructor(name: string) {
    super();
    this.name = name;
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
        cur.formatConstraint(this.name),
      );
    });
    const query = [`CREATE TABLE ${this.name} (${fieldsString})`];
    return {
      query,
      constraints: fieldsConstraints,
    };
  };
}

export class Field {
  private name: string;
  private type: FieldType;
  private null = false;
  private len = 0;
  private ai = false;
  private foreignKey: ForeignKey | null = null;
  private primaryKey = false;
  private mustBeUnique = false;
  private defaultValue: DefaulValue | null = null;
  private checkValue: string | null = null;
  constructor(name: string, type: FieldType) {
    this.name = name;
    this.type = type;
  }

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

  public default = (defaultValue: string, systemFunction = false) => {
    this.defaultValue = { value: defaultValue, isSystem: systemFunction };
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
    foreign: this.foreignKey,
    primary: this.primaryKey,
  });

  public formatField = () => {
    return `${this.name} ${this.type}${this.len !== 0 ? `(${this.len})` : ''}${
      this.null ? '' : ' NOT NULL'
    }${this.mustBeUnique || this.primaryKey ? ' UNIQUE' : ''}${
      this.ai ? ' AUTO_INCREMENT' : ''
    }${
      this.defaultValue
        ? ` DEFAULT ${
            this.defaultValue.isSystem
              ? `${this.defaultValue.value}()`
              : `'${this.defaultValue.value}'`
          }`
        : ''
    }${this.checkValue ? ` CHECK (${this.name}${this.checkValue})` : ''}`;
  };

  public formatConstraint = (tableName: string) => {
    const constraints = [];
    if (this.primaryKey) {
      constraints.push(
        `ALTER TABLE ${tableName} ADD CONSTRAINT pk_${tableName.toLowerCase()}_${this.name.toLowerCase()} PRIMARY KEY (${
          this.name
        })`,
      );
    }
    if (this.foreignKey) {
      constraints.push(
        `ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName.toLowerCase()}_${this.name.toLowerCase()} FOREIGN KEY (${
          this.name
        }) REFRENCES ${this.foreignKey.table}(${this.foreignKey.column})`,
      );
    }
    return constraints;
  };
}

export interface ForeignKey {
  table: string;
  column: string;
}

export interface DefaulValue {
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
  | 'year'
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
  | 'longtext'
  | 'enum'
  | 'set';
