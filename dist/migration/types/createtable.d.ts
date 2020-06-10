import MigrationType from './migrationtype';
export default class CreateTable extends MigrationType {
    name: string;
    fields: Field[];
    constructor(name: string);
    addField: (name: string, type: FieldType) => Field;
    formatQuery: () => {
        query: string[];
        constraints: string[];
    };
}
export declare class Field {
    private name;
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
    formatConstraint: (tableName: string) => string[];
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
