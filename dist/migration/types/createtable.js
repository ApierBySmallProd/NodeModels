"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const altertable_1 = __importDefault(require("./altertable"));
const migrationtype_1 = __importDefault(require("./migrationtype"));
class CreateTable extends migrationtype_1.default {
    constructor(tableName) {
        super(tableName, 'createtable');
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
                fieldsConstraints = fieldsConstraints.concat(cur.formatConstraint(this.tableName));
            });
            const query = [`CREATE TABLE \`${this.tableName}\` (${fieldsString})`];
            return {
                query,
                constraints: fieldsConstraints,
            };
        };
        this.applyMigration = (migration) => {
            if (migration.type === 'droptable') {
                this.fields = [];
            }
            else if (migration.type === 'createtable') {
                const mig = migration;
                this.fields = mig.fields;
            }
            else if (migration.type === 'altertable') {
                const mig = migration;
                mig.removedFields.forEach((f) => {
                    this.fields = this.fields.filter((fi) => fi.name !== f);
                });
                mig.addedFields.forEach((f) => {
                    this.fields.push(f);
                });
            }
        };
        this.compareSchema = (schema) => {
            if (!this.fields.length) {
                return schema;
            }
            const migration = new altertable_1.default(this.tableName);
            const fieldNames = [];
            schema.fields.forEach((field) => {
                const curField = this.fields.find((f) => f.name === field.name);
                if (curField) {
                    if (!curField.equal(field)) {
                        migration.removeField(field.name);
                        migration.addedFields.push(field);
                    }
                }
                else {
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
        this.generateMigrationFile = (name) => {
            let file = `const Migration = require('@smallprod/models').Migration;\n\n /**\n *\n * @param {Migration} migration\n */\nconst up = (migration) => {\n    const newTable = migration.createTable('${this.tableName}');\n\n`;
            this.fields.forEach((field) => {
                file = `${file}   newTable${field.generateMigrationFile()};\n`;
            });
            file = `${file}};\n\n`;
            file = `${file}/*\n * @param {Migration} migration\n */\nconst down = (migration) => {\n    migration.dropTable('${this.tableName}');\n};\n\n`;
            file = `${file}module.exports = {\n   name: '${this.getName()}-${name}',\n    up,\n   down,\n};`;
            return file;
        };
        this.getName = () => {
            return `create-table-${this.tableName.toLowerCase()}`;
        };
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
