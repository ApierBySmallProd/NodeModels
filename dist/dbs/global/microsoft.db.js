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
const global_sql_1 = __importDefault(require("./global.sql"));
const mssql_1 = __importDefault(require("mssql"));
class GlobalMicrosoftModel extends global_sql_1.default {
    constructor() {
        super(...arguments);
        this.pool = null;
        this.transactionConnection = null;
        this.query = (query, params, throwErrors = false) => __awaiter(this, void 0, void 0, function* () {
            if (!this.pool) {
                if (throwErrors)
                    throw Error('No pool');
                if (GlobalMicrosoftModel.debug)
                    console.error('No pool');
                return null;
            }
            let request;
            if (this.transactionConnection) {
                request = new mssql_1.default.Request(this.transactionConnection);
            }
            else {
                request = new mssql_1.default.Request(this.pool);
            }
            if (params) {
                params.forEach((param, index) => {
                    request.input(index.toString(), param);
                });
            }
            try {
                return yield request.query(query);
            }
            catch (err) {
                if (GlobalMicrosoftModel.debug)
                    console.error(err);
            }
            return null;
        });
        this.insert = (tableName, attributes) => __awaiter(this, void 0, void 0, function* () {
            const columns = attributes.map((a) => `\`${a.column}\``).join(', ');
            const params = attributes.map((a, index) => `@${index + 1}`).join(', ');
            const query = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${params})`;
            return yield this.query(query, attributes.map((a) => a.value));
        });
        this.select = (tableName, distinct, attributes, wheres, sorts, tableAlias, limit, offset = 0) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT${distinct ? ' DISTINCT' : ''}${this.computeAttributes(attributes)} FROM \`${tableName}\` AS ${tableAlias} ${this.computeWhere(wheres, '@', true)}${this.computeSort(sorts)}${limit !== -1
                ? ` OFFSET ${offset} ROWS FETCH NEXT ${offset} ROWS ONLY`
                : ''}`;
            return yield this.query(query, this.getWhereAttributes(wheres));
        });
        this.update = (tableName, attributes, wheres) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const columns = attributes.map((a) => `\`${a.column}\` = ?`).join(', ');
            const query = `UPDATE \`${tableName}\` SET ${columns} ${this.computeWhere(wheres, '@', true)}`;
            return (_a = (yield this.query(query, attributes.map((a) => a.value).concat(this.getWhereAttributes(wheres))))) === null || _a === void 0 ? void 0 : _a.rowsAffected.length;
        });
        this.delete = (tableName, wheres) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const query = `DELETE FROM \`${tableName}\` ${this.computeWhere(wheres, '@', true)}`;
            return (_b = (yield this.query(query, this.getWhereAttributes(wheres)))) === null || _b === void 0 ? void 0 : _b.rowsAffected.length;
        });
        this.startTransaction = () => __awaiter(this, void 0, void 0, function* () {
            if (this.transactionConnection) {
                if (GlobalMicrosoftModel.debug)
                    console.error('Already in a transaction');
                return false;
            }
            if (!this.pool) {
                if (GlobalMicrosoftModel.debug)
                    console.error('No pool');
                return false;
            }
            const transaction = new mssql_1.default.Transaction(this.pool);
            try {
                yield transaction.begin();
                this.transactionConnection = transaction;
                return true;
            }
            catch (err) {
                if (GlobalMicrosoftModel.debug)
                    console.error(err);
                return false;
            }
        });
        this.commit = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.transactionConnection) {
                if (GlobalMicrosoftModel.debug)
                    console.error('Not in a transaction');
                return;
            }
            try {
                yield this.transactionConnection.commit();
            }
            catch (err) {
                if (GlobalMicrosoftModel.debug)
                    console.error(err);
            }
        });
        this.rollback = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.transactionConnection) {
                if (GlobalMicrosoftModel.debug)
                    console.error('Not in a transaction');
                return;
            }
            try {
                yield this.transactionConnection.rollback();
            }
            catch (err) {
                if (GlobalMicrosoftModel.debug)
                    console.error(err);
            }
        });
        this.setPool = (config) => __awaiter(this, void 0, void 0, function* () {
            const p = yield getPool(config);
            if (p) {
                this.pool = p;
            }
        });
    }
}
exports.default = GlobalMicrosoftModel;
const getPool = (config) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = new mssql_1.default.ConnectionPool(config);
        yield pool.connect();
        return pool;
    }
    catch (err) {
        if (GlobalMicrosoftModel.debug)
            console.error(err);
    }
    return null;
});
