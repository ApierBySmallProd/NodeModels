"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedRow = void 0;
const migrationtype_1 = __importDefault(require("./migrationtype"));
class SeedTable extends migrationtype_1.default {
    constructor(tableName) {
        super(tableName, 'seed');
        this.rows = [];
        this.clear = false;
        this.addRow = () => {
            const row = new SeedRow();
            this.rows.push(row);
            return row;
        };
        this.clearTable = () => {
            this.clear = true;
        };
        this.formatQuery = () => {
            if (this.clear) {
                return { query: [`DELETE FROM ${this.tableName}`] };
            }
            const seeds = this.rows.map((r) => r.formatRow(this.tableName));
            return {
                seeds,
            };
        };
    }
}
exports.default = SeedTable;
class SeedRow {
    constructor() {
        this.datas = [];
        this.add = (columnName, value) => {
            this.datas.push({ value, column: columnName });
            return this;
        };
        this.formatRow = (tableName) => {
            const columns = this.datas.map((d) => d.column).join(', ');
            const values = this.datas.map((d) => `'${d.value}'`).join(', ');
            return `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
        };
    }
}
exports.SeedRow = SeedRow;
