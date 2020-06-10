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
const query_1 = __importDefault(require("./query"));
const dbmanager_1 = __importDefault(require("../../dbs/dbmanager"));
class FindQuery extends query_1.default {
    constructor(tableName, afterExec) {
        super(tableName);
        this.attributes = [];
        this.wheres = [];
        this.sorts = [];
        this.isDistinct = false;
        this.lim = -1;
        this.offset = -1;
        this.limit = (limit, offset = 0) => {
            this.lim = limit;
            this.offset = offset;
            return this;
        };
        this.join = (table, alias) => {
            return this;
        };
        this.where = (column, operator, value) => {
            this.wheres.push({ column, value, operator });
            return this;
        };
        this.distinct = () => {
            this.isDistinct = true;
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
        this.and = () => {
            this.wheres.push({ keyword: 'AND' });
            return this;
        };
        this.or = () => {
            this.wheres.push({ keyword: 'OR' });
            return this;
        };
        this.not = () => {
            this.wheres.push({ keyword: 'NOT' });
            return this;
        };
        this.group = () => {
            this.wheres.push({ keyword: 'STARTGROUP' });
            return this;
        };
        this.endGroup = () => {
            this.wheres.push({ keyword: 'ENDGROUP' });
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
            const res = yield db.select(this.tableName, this.isDistinct, this.attributes, this.wheres, this.sorts, this.lim, this.offset);
            if (this.afterExec) {
                return this.afterExec(res);
            }
            return res;
        });
        this.afterExec = afterExec;
    }
}
exports.default = FindQuery;
