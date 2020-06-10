"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor(method, tableName) {
        this.wheres = [];
        this.where = (column, value) => {
            this.wheres.push({ column, value });
            return this;
        };
        this.exec = () => {
            let query = '';
            switch (this.method) {
                case 'create': {
                    query = `INSERT INTO ${this.tableName}`;
                    break;
                }
                default: {
                }
            }
        };
        this.method = method;
        this.tableName = tableName;
    }
}
exports.default = QueryBuilder;
