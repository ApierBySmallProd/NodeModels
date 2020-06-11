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
    const query = [`CREATE TABLE ${this.tableName} (${fieldsString})`];
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

export class Field {
  public name: string;
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

  public setType = (type: FieldType) => {
    this.type = type;
    return this;
  };

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
    return `\`${this.name}\` ${this.type}${
      this.len !== 0 ? `(${this.len})` : ''
    }${this.null ? '' : ' NOT NULL'}${
      this.mustBeUnique || this.primaryKey ? ' UNIQUE' : ''
    }${this.ai ? ' AUTO_INCREMENT' : ''}${
      this.defaultValue
        ? ` DEFAULT ${
            this.defaultValue.isSystem
              ? `${this.defaultValue.value}()`
              : `'${this.defaultValue.value}'`
          }`
        : ''
    }${this.checkValue ? ` CHECK (${this.name}${this.checkValue})` : ''}`;
  };

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

  public formatConstraint = (tableName: string) => {
    const constraints = [];
    // Maybe put this again later
    /*
    if (this.primaryKey) {
      constraints.push(
        `ALTER TABLE \`${tableName}\` ADD CONSTRAINT \`pk_${tableName.toLowerCase()}_${this.name.toLowerCase()}\` PRIMARY KEY (\`${
          this.name
        }\`)`,
      );
    }
    */
    if (this.foreignKey) {
      constraints.push(
        `ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName.toLowerCase()}_${this.name.toLowerCase()} FOREIGN KEY (${
          this.name
        }) REFRENCES ${this.foreignKey.table}(${this.foreignKey.column})`,
      );
    }
    return constraints;
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
