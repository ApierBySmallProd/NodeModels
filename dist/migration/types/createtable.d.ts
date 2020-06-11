import AlterTable from './altertable';
import MigrationType from './migrationtype';
export default class CreateTable extends MigrationType {
    fields: Field[];
    constructor(tableName: string);
    addField: (name: string, type: FieldType) => Field;
    formatQuery: () => {
        query: string[];
        constraints: string[];
    };
    applyMigration: (migration: MigrationType) => void;
    compareSchema: (schema: CreateTable) => AlterTable | CreateTable | null;
    generateMigrationFile: (name: string) => string;
    getName: () => string;
}
export declare class Field {
    name: string;
    private type;
    private null;
    private len;
    private ai;
    private foreignKey;
    private primaryKey;
    private mustBeUnique;
    private defaultValue;
    private checkValue;
    constructor(name: string, type: FieldType);
    setType: (type: FieldType) => this;
    allowNull: () => this;
    length: (len: number) => this;
    autoIncrement: () => this;
    foreign: (table: string, column: string) => this;
    primary: () => this;
    unique: () => this;
    default: (defaultValue: string, systemFunction?: boolean) => this;
    check: (checkValue: string) => this;
    getAll: () => {
        name: string;
        type: FieldType;
        null: boolean;
        len: number;
        ai: boolean;
        foreign: ForeignKey | null;
        primary: boolean;
    };
    formatField: () => string;
    equal: (field: Field) => boolean;
    formatConstraint: (tableName: string) => string[];
    generateMigrationFile: () => string;
    private defaultValueEquals;
}
export interface ForeignKey {
    table: string;
    column: string;
}
export interface DefaulValue {
    value: string;
    isSystem: boolean;
}
export declare type FieldType = 'tinyint' | 'boolean' | 'smallint' | 'mediumint' | 'int' | 'bigint' | 'decimal' | 'float' | 'double' | 'bit' | 'date' | 'time' | 'datetime' | 'timestamp' | 'year' | 'char' | 'varchar' | 'binary' | 'varbinary' | 'tinyblob' | 'blob' | 'mediumblob' | 'longblob' | 'tinytext' | 'text' | 'mediumtext' | 'longtext' | 'enum' | 'set';
