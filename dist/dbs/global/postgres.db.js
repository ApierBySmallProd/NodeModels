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
const pg_1 = require("pg");
const global_sql_1 = __importDefault(require("./global.sql"));
const getPool = (config, quitOnFail = false) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const pool = new pg_1.Pool(config);
        pool.on('error', (err) => {
            if (GlobalPostgreModel.debug) {
                console.error('Unexpected error on postgres database');
                console.error(err);
            }
            if (quitOnFail) {
                process.exit(-1);
            }
            else {
                reject(err);
            }
        });
        resolve(pool);
    }));
});
class GlobalPostgreModel extends global_sql_1.default {
    constructor() {
        super(...arguments);
        this.pool = null;
        this.transactionConnection = null;
        this.transactionDone = null;
        this.query = (query, params, throwErrors = false) => __awaiter(this, void 0, void 0, function* () {
            if (!this.pool) {
                if (throwErrors) {
                    throw Error('No pool');
                }
                return null;
            }
            try {
                if (!this.transactionConnection) {
                    return yield this.pool.query(query, params);
                }
                return yield this.transactionConnection.query(query, params);
            }
            catch (err) {
                if (GlobalPostgreModel.debug) {
                    console.error(err);
                }
                if (throwErrors) {
                    throw err;
                }
                return null;
            }
        });
        this.insert = (tableName, attributes) => __awaiter(this, void 0, void 0, function* () {
            const columns = attributes.map((a) => `\`${a.column}\``).join(', ');
            const params = attributes.map((a, index) => `$${index + 1}`).join(', ');
            const query = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${params}) RETURNING *`;
            return yield this.query(query, attributes.map((a) => a.value));
        });
        this.select = (tableName, distinct, attributes, wheres, sorts, tableAlias, limit, offset = 0, joins, groups, havings) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT${distinct ? ' DISTINCT' : ''}${this.computeAttributes(attributes)} FROM \`${tableName}\` AS ${tableAlias} ${this.computeJoins(joins)}${this.computeWhere(wheres, '$', true)}${this.computeGroupBy(groups)}${this.computeWhere(havings, '?', false, 'HAVING')}${this.computeSort(sorts)}${limit !== -1 ? ` LIMIT ${limit} OFFSET ${offset}` : ''}`;
            const havingAttr = this.getWhereAttributes(havings);
            return yield this.query(query, havingAttr.concat(this.getWhereAttributes(wheres)));
        });
        this.update = (tableName, attributes, wheres) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const columns = attributes.map((a) => `\`${a.column}\` = ?`).join(', ');
            const query = `UPDATE \`${tableName}\` SET ${columns} ${this.computeWhere(wheres, '$', true)}`;
            return (_a = (yield this.query(query, attributes.map((a) => a.value).concat(this.getWhereAttributes(wheres))))) === null || _a === void 0 ? void 0 : _a.rowCount;
        });
        this.delete = (tableName, wheres) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const query = `DELETE FROM \`${tableName}\` ${this.computeWhere(wheres, '$', true)}`;
            return (_b = (yield this.query(query, this.getWhereAttributes(wheres)))) === null || _b === void 0 ? void 0 : _b.rowCount;
        });
        this.startTransaction = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.transactionConnection) {
                    if (GlobalPostgreModel.debug)
                        console.error('Already in a transaction');
                    return resolve(false);
                }
                if (!this.pool) {
                    if (GlobalPostgreModel.debug)
                        console.error('No pool');
                    return resolve(false);
                }
                this.pool.connect((err, client, done) => {
                    if (err) {
                        if (GlobalPostgreModel.debug)
                            console.error(err);
                        return resolve(false);
                    }
                    client.query('BEGIN', (error) => {
                        if (error) {
                            done();
                            return resolve(false);
                        }
                        this.transactionConnection = client;
                        resolve(true);
                    });
                });
            });
        });
        this.commit = () => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (!this.transactionConnection) {
                    if (GlobalPostgreModel.debug)
                        console.error('Not in a transaction');
                    return resolve();
                }
                this.transactionConnection.query('COMMIT', (err) => {
                    var _a;
                    if (err) {
                        if (GlobalPostgreModel.debug)
                            console.error(err);
                        (_a = this.transactionConnection) === null || _a === void 0 ? void 0 : _a.query('ROLLBACK', (e) => {
                            this.transactionConnection = null;
                            if (e) {
                                if (GlobalPostgreModel.debug)
                                    console.error(e);
                            }
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
                    if (GlobalPostgreModel.debug)
                        console.error('Not in a transaction');
                    return resolve();
                }
                this.transactionConnection.query('ROLLBACK', (err) => {
                    this.transactionConnection = null;
                    if (err) {
                        if (GlobalPostgreModel.debug)
                            console.error(err);
                    }
                    resolve();
                });
            });
        });
        this.setPool = (config) => __awaiter(this, void 0, void 0, function* () {
            const p = yield getPool(config);
            if (p) {
                this.pool = p;
            }
        });
    }
}
exports.default = GlobalPostgreModel;
