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
const mysql_1 = __importDefault(require("mysql"));
const getPool = (config) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const pool = mysql_1.default.createPool(config);
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            }
            else {
                connection.query('RESET QUERY CACHE', () => {
                    connection.release();
                    resolve(pool);
                });
            }
        });
    });
});
class GlobalMariaModel extends global_sql_1.default {
    constructor() {
        super(...arguments);
        this.pool = null;
        this.transactionConnection = null;
        this.query = (query, params, throwErrors = false) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                if (!this.pool) {
                    if (GlobalMariaModel.debug)
                        console.error('No pool');
                    if (throwErrors)
                        throw Error('No pool');
                    return resolve(null);
                }
                let connection;
                if (this.transactionConnection) {
                    connection = this.transactionConnection;
                }
                else {
                    connection = yield this.getConnection();
                }
                if (!connection) {
                    if (GlobalMariaModel.debug)
                        console.error('Cannot get connection');
                    if (throwErrors) {
                        throw Error('Cannot get connection');
                    }
                    return resolve(null);
                }
                connection.query(query, params, (error, results, fields) => {
                    if (connection && !this.transactionConnection)
                        connection.release();
                    if (error) {
                        if (GlobalMariaModel.debug)
                            console.error(error);
                        if (throwErrors) {
                            throw error;
                        }
                        return resolve(null);
                    }
                    resolve(results);
                });
            }));
        });
        this.insert = (tableName, attributes) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const columns = attributes.map((a) => `\`${a.column}\``).join(', ');
            const params = attributes.map((a, index) => `?`).join(', ');
            const query = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${params})`;
            return (_a = (yield this.query(query, attributes.map((a) => a.value)))) === null || _a === void 0 ? void 0 : _a.insertId;
        });
        this.select = (tableName, distinct, attributes, wheres, sorts, tableAlias, limit, offset = 0, joins, groups, havings) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT${distinct ? ' DISTINCT' : ''}${this.computeAttributes(attributes)} FROM \`${tableName}\` AS ${tableAlias} ${this.computeJoins(joins)}${this.computeWhere(wheres, '?', false)}${this.computeGroupBy(groups)}${this.computeWhere(havings, '?', false, 'HAVING')}${this.computeSort(sorts)}${limit !== -1 ? ` LIMIT ${offset}, ${limit}` : ''}`;
            const havingAttr = this.getWhereAttributes(havings);
            return yield this.query(query, havingAttr.concat(this.getWhereAttributes(wheres)));
        });
        this.update = (tableName, attributes, wheres) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const columns = attributes.map((a) => `\`${a.column}\` = ?`).join(', ');
            const query = `UPDATE \`${tableName}\` SET ${columns} ${this.computeWhere(wheres, '?', false)}`;
            return (_b = (yield this.query(query, attributes.map((a) => a.value).concat(this.getWhereAttributes(wheres))))) === null || _b === void 0 ? void 0 : _b.affectedRows;
        });
        this.delete = (tableName, wheres) => __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE FROM \`${tableName}\` ${this.computeWhere(wheres, '?', false)}`;
            return yield this.query(query, this.getWhereAttributes(wheres));
        });
        this.startTransaction = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.transactionConnection) {
                    if (GlobalMariaModel.debug)
                        console.error('Already in a transaction');
                    return resolve(false);
                }
                if (!this.pool) {
                    if (GlobalMariaModel.debug)
                        console.error('No pool');
                    return resolve(false);
                }
                this.pool.getConnection((err, connection) => {
                    if (err) {
                        if (GlobalMariaModel.debug)
                            console.error(err);
                        return resolve(false);
                    }
                    connection.beginTransaction((error) => {
                        if (error) {
                            return resolve(false);
                        }
                        this.transactionConnection = connection;
                        return resolve(true);
                    });
                });
            });
        });
        this.commit = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.transactionConnection) {
                    if (GlobalMariaModel.debug)
                        console.error('Not in a transaction');
                    return resolve();
                }
                this.transactionConnection.commit((err) => {
                    var _a;
                    if (err) {
                        if (GlobalMariaModel.debug)
                            console.error(err);
                        (_a = this.transactionConnection) === null || _a === void 0 ? void 0 : _a.rollback(() => {
                            this.transactionConnection = null;
                            resolve();
                        });
                    }
                    this.transactionConnection = null;
                    resolve();
                });
            });
        });
        this.rollback = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (!this.transactionConnection) {
                    if (GlobalMariaModel.debug)
                        console.error('Not in a transaction');
                    return resolve();
                }
                this.transactionConnection.rollback((err) => {
                    this.transactionConnection = null;
                    if (err) {
                        if (GlobalMariaModel.debug)
                            console.error(err);
                    }
                    resolve();
                });
            });
        });
        this.setPool = (config) => __awaiter(this, void 0, void 0, function* () {
            try {
                const p = yield getPool(config);
                if (p) {
                    this.pool = p;
                }
            }
            catch (err) {
                console.error('Cannot connect to database');
                console.error(err);
            }
        });
        this.getConnection = () => {
            return new Promise((resolve, reject) => {
                var _a;
                (_a = this.pool) === null || _a === void 0 ? void 0 : _a.getConnection((err, connection) => {
                    if (err) {
                        return resolve(null);
                    }
                    return resolve(connection);
                });
            });
        };
    }
}
exports.default = GlobalMariaModel;
