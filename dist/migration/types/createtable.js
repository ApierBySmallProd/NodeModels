"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const migrationtype_1 = __importDefault(require("./migrationtype"));
class CreateTable extends migrationtype_1.default {
    constructor(name) {
        super();
        this.fields = [];
        this.addField = (name, type) => {
            const newField = new Field(name, type);
            this.fields.push(newField);
            return newField;
        };
        this.formatQuery = () => {
            const fieldsString = this.fields.map((f) => f.formatField()).join(', ');
            let fieldsConstraints = [];
            this.fields.forEach((cur) => {
                fieldsConstraints = fieldsConstraints.concat(cur.formatConstraint(this.name));
            });
            const query = [`CREATE TABLE ${this.name} (${fieldsString})`];
            return {
                query,
                constraints: fieldsConstraints,
            };
        };
        this.name = name;
    }
}
exports.default = CreateTable;
class Field {
    constructor(name, type) {
        this.null = false;
        this.len = 0;
        this.ai = false;
        this.foreignKey = null;
        this.primaryKey = false;
        this.mustBeUnique = false;
        this.defaultValue = null;
        this.checkValue = null;
        this.allowNull = () => {
            this.null = true;
            return this;
        };
        this.length = (len) => {
            this.len = len;
            return this;
        };
        this.autoIncrement = () => {
            this.ai = true;
            return this;
        };
        this.foreign = (table, column) => {
            this.foreignKey = { table, column };
            return this;
        };
        this.primary = () => {
            this.primaryKey = true;
            return this;
        };
        this.unique = () => {
            this.mustBeUnique = true;
            return this;
        };
        this.default = (defaultValue, systemFunction = false) => {
            this.defaultValue = { value: defaultValue, isSystem: systemFunction };
            return this;
        };
        this.check = (checkValue) => {
            this.checkValue = checkValue;
            return this;
        };
        this.getAll = () => ({
            name: this.name,
            type: this.type,
            null: this.null,
            len: this.len,
            ai: this.ai,
            foreign: this.foreignKey,
            primary: this.primaryKey,
        });
        this.formatField = () => {
            return `${this.name} ${this.type}${this.len !== 0 ? `(${this.len})` : ''}${this.null ? '' : ' NOT NULL'}${this.mustBeUnique || this.primaryKey ? ' UNIQUE' : ''}${this.ai ? ' AUTO_INCREMENT' : ''}${this.defaultValue
                ? ` DEFAULT ${this.defaultValue.isSystem
                    ? `${this.defaultValue.value}()`
                    : `'${this.defaultValue.value}'`}`
                : ''}${this.checkValue ? ` CHECK (${this.name}${this.checkValue})` : ''}`;
        };
        this.formatConstraint = (tableName) => {
            const constraints = [];
            if (this.primaryKey) {
                constraints.push(`ALTER TABLE ${tableName} ADD CONSTRAINT pk_${tableName.toLowerCase()}_${this.name.toLowerCase()} PRIMARY KEY (${this.name})`);
            }
            if (this.foreignKey) {
                constraints.push(`ALTER TABLE ${tableName} ADD CONSTRAINT fk_${tableName.toLowerCase()}_${this.name.toLowerCase()} FOREIGN KEY (${this.name}) REFRENCES ${this.foreignKey.table}(${this.foreignKey.column})`);
            }
            return constraints;
        };
        this.name = name;
        this.type = type;
    }
}
exports.Field = Field;
