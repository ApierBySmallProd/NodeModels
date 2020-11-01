"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const field_1 = require("../field");
const altertable_1 = __importDefault(require("./altertable"));
const migrationtype_1 = __importDefault(require("./migrationtype"));
class CreateTable extends migrationtype_1.default {
    constructor(tableName) {
        super(tableName, 'createtable');
        this.fields = [];
        this.addField = (name, type) => {
            const newField = new field_1.Field(name, type);
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
