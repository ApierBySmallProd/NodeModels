"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createtable_1 = require("./createtable");
const migrationtype_1 = __importDefault(require("./migrationtype"));
class AlterTable extends migrationtype_1.default {
    constructor(tableName) {
        super();
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
            const toAdd = this.addedFields.map((f) => `ALTER TABLE ${this.tableName} ADD ${f.formatField()}`);
            const toRemove = this.removedFields.map((f) => `ALTER TABLE ${this.tableName} DROP COLUMN ${f}`);
            return {
                query: [...toRemove, ...toAdd],
            };
        };
        this.tableName = tableName;
    }
}
exports.default = AlterTable;
