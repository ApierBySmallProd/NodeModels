"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Field = void 0;
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
        this.setType = (type) => {
            this.type = type;
            return this;
        };
        this.getType = () => this.type;
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
            return `\`${this.name}\` ${this.type}${this.len !== 0 ? `(${this.len})` : ''}${this.null ? '' : ' NOT NULL'}${this.mustBeUnique || this.primaryKey ? ' UNIQUE' : ''}${this.ai ? ' AUTO_INCREMENT' : ''}${this.defaultValue
                ? ` DEFAULT ${this.defaultValue.isSystem
                    ? `${this.defaultValue.value}()`
                    : `'${this.defaultValue.value}'`}`
                : ''}${this.checkValue ? ` CHECK (${this.name}${this.checkValue})` : ''}`;
        };
        this.equal = (field) => {
            return (this.name === field.name &&
                this.null === field.null &&
                field.type === this.type &&
                this.len === field.len &&
                field.ai === this.ai &&
                field.primaryKey === this.primaryKey &&
                field.mustBeUnique === this.mustBeUnique &&
                field.checkValue === this.checkValue &&
                this.defaultValueEquals(field));
        };
        this.formatConstraint = (tableName) => {
            const constraints = [];
            if (this.foreignKey) {
                constraints.push(`ALTER TABLE \`${tableName}\` ADD CONSTRAINT fk_${tableName.toLowerCase()}_${this.name.toLowerCase()} FOREIGN KEY (${this.name}) REFERENCES ${this.foreignKey.table}(\`${this.foreignKey.column}\`)`);
            }
            return constraints;
        };
        this.generateMigrationFile = () => {
            return `.addField('${this.name}', '${this.type}')${this.ai ? '.autoIncrement()' : ''}${this.checkValue ? `.check('${this.checkValue}')` : ''}${this.defaultValue
                ? `.default('${this.defaultValue.value}', ${this.defaultValue.isSystem})`
                : ''}${this.foreignKey
                ? `.foreign('${this.foreignKey.table}', '${this.foreignKey.column}')`
                : ''}${this.len ? `.length(${this.len})` : ''}${this.mustBeUnique ? '.unique()' : ''}${this.null ? '.allowNull()' : ''}${this.primaryKey ? '.primary()' : ''}`;
        };
        this.defaultValueEquals = (field) => {
            if (!this.defaultValue || !field.defaultValue) {
                return this.defaultValue === field.defaultValue;
            }
            return (this.defaultValue.isSystem === field.defaultValue.isSystem &&
                this.defaultValue.value === field.defaultValue.value);
        };
        this.name = name;
        this.type = type;
    }
}
exports.Field = Field;
