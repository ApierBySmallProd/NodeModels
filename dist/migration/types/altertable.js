"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createtable_1 = require("./createtable");
const migrationtype_1 = __importDefault(require("./migrationtype"));
class AlterTable extends migrationtype_1.default {
    constructor(tableName) {
        super(tableName, 'altertable');
        this.addedFields = [];
        this.removedFields = [];
        this.addField = (fieldName, fieldType) => {
            const field = new createtable_1.Field(fieldName, fieldType);
            this.addedFields.push(field);
            return field;
        };
        this.removeField = (fieldName) => {
            this.removedFields.push(fieldName);
        };
        this.formatQuery = () => {
            const toAdd = this.addedFields.map((f) => `ALTER TABLE \`${this.tableName}\` ADD ${f.formatField()}`);
            const toRemove = this.removedFields.map((f) => `ALTER TABLE \`${this.tableName}\` DROP COLUMN \`${f}\``);
            return {
                query: [...toRemove, ...toAdd],
            };
        };
        this.generateMigrationFile = (name) => {
            let file = `const Migration = require('@smallprod/models').Migration;\n\n /**\n *\n * @param {Migration} migration\n */\nconst up = (migration) => {\n    const alter = migration.alterTable('${this.tableName}');\n\n`;
            this.removedFields.forEach((field) => {
                file = `${file}   alter.removeField('${field}');\n`;
            });
            this.addedFields.forEach((field) => {
                file = `${file}   alter${field.generateMigrationFile()};\n`;
            });
            file = `${file}};\n\n`;
            file = `${file}/*\n * @param {Migration} migration\n */\nconst down = (migration) => {\n    migration.dropTable('${this.tableName}');\n};\n\n`;
            file = `${file}module.exports = {\n   name: '${this.getName()}-${name}',\n    up,\n   down,\n};`;
            return file;
        };
        this.getName = () => {
            return `alter-table-${this.tableName.toLowerCase()}`;
        };
    }
}
exports.default = AlterTable;
