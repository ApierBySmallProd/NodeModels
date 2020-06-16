"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbmanager_1 = __importDefault(require("../../dbs/dbmanager"));
const where_query_1 = __importDefault(require("./where.query"));
class FindQuery extends where_query_1.default {
    constructor(tableName, afterExec) {
        super(tableName);
        this.attributes = [];
        this.sorts = [];
        this.isDistinct = false;
        this.lim = -1;
        this.offset = -1;
        this.tableAlias = 'default_table';
        this.where = (column, operator, value) => {
            this.wheres.push({ column, value, operator });
            return this;
        };
        this.limit = (limit, offset = 0) => {
            this.lim = limit;
            this.offset = offset;
            return this;
        };
        this.join = (table, alias) => {
            const join = new Join(table, alias, this);
            return join;
        };
        this.distinct = () => {
            this.isDistinct = true;
            return this;
        };
        this.alias = (alias) => {
            this.tableAlias = alias;
            return this;
        };
        this.addAttribute = (attr, alias = '', func = null) => {
            this.attributes.push({ alias, attribute: attr, function: func });
            return this;
        };
        this.addAttributes = (attr) => {
            this.attributes = this.attributes.concat(attr.map((a) => ({ attribute: a, alias: '', function: null })));
            return this;
        };
        this.sort = (attr, method = 'ASC') => {
            this.sorts.push({ attribute: attr, mode: method });
            return this;
        };
        this.exec = (dbName = null) => __awaiter(this, void 0, void 0, function* () {
            const db = dbmanager_1.default.get().get(dbName);
            if (!db)
                throw Error('Database not found');
            const res = yield db.select(this.tableName, this.isDistinct, this.attributes, this.wheres, this.sorts, this.tableAlias, this.lim, this.offset);
            if (this.afterExec) {
                return this.afterExec(res);
            }
            return res;
        });
        this.afterExec = afterExec;
    }
}
exports.default = FindQuery;
class Join extends where_query_1.default {
    constructor(tableName, alias, query) {
        super(tableName);
        this.method = 'inner';
        this.on = (column, operator, value) => {
            this.wheres.push({ column, value, operator });
            return this;
        };
        this.endJoin = () => {
            return this.query;
        };
        this.left = () => {
            this.method = 'left';
            return this;
        };
        this.right = () => {
            this.method = 'right';
            return this;
        };
        this.full = () => {
            this.method = 'full';
            return this;
        };
        this.alias = alias;
        this.query = query;
    }
}
exports.Join = Join;
