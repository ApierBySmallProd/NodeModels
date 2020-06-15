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
const global_db_1 = __importDefault(require("./global.db"));
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
class GlobalMariaModel extends global_db_1.default {
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
        this.select = (tableName, distinct, attributes, wheres, sorts, limit, offset = 0) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT${distinct ? ' DISTINCT' : ''}${this.computeAttributes(attributes)} FROM \`${tableName}\` AS default_table ${this.computeWhere(wheres)}${this.computeSort(sorts)}${limit !== -1 ? ` LIMIT ${offset}, ${limit}` : ''}`;
            return yield this.query(query, this.getWhereAttributes(wheres));
        });
        this.update = (tableName, attributes, wheres) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const columns = attributes.map((a) => `\`${a.column}\` = ?`).join(', ');
            const query = `UPDATE \`${tableName}\` SET ${columns} ${this.computeWhere(wheres)}`;
            return (_b = (yield this.query(query, attributes.map((a) => a.value).concat(this.getWhereAttributes(wheres))))) === null || _b === void 0 ? void 0 : _b.affectedRows;
        });
        this.delete = (tableName, wheres) => __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE FROM \`${tableName}\` ${this.computeWhere(wheres)}`;
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
        this.getWhereAttributes = (wheres) => {
            const newWheres = wheres.filter((w) => this.isWhereAttribute(w));
            return newWheres.map((w) => w.value);
        };
        this.computeAttributes = (attributes) => {
            if (!attributes.length)
                return ' *';
            const query = attributes.map((a) => `${a.function
                ? `${this.computeAttributeFunction(a)}(\`${a.attribute}\`)${a.alias ? ` AS ${a.alias}` : ''}`
                : `\`${a.attribute}\`${a.alias ? ` AS ${a.alias}` : ''}`}`);
            return ` ${query}`;
        };
        this.computeAttributeFunction = (attribute) => {
            switch (attribute.function) {
                case 'AVG': {
                    return 'AVG';
                }
                case 'COUNT': {
                    return 'COUNT';
                }
                case 'MAX': {
                    return 'MAX';
                }
                case 'MIN': {
                    return 'MIN';
                }
                case 'SUM': {
                    return 'SUM';
                }
                default: {
                    throw new Error(`Unknown function ${attribute.function}`);
                }
            }
        };
        this.computeWhere = (wheres) => {
            let where = wheres.length ? ' WHERE ' : '';
            wheres.forEach((w) => {
                if (this.isWhereAttribute(w)) {
                    w = w;
                    where = `${where} ${this.computeWhereAttribute(w)}`;
                }
                else {
                    w = w;
                    where = `${where} ${this.computeWhereKeyWord(w)}`;
                }
            });
            return where;
        };
        this.computeSort = (sorts) => {
            const sortsString = sorts
                .map((s) => `\`${s.attribute}\` ${this.computeSortMode(s)}`)
                .join(', ');
            return sorts.length ? ` ORDER BY ${sortsString}` : '';
        };
        this.computeSortMode = (sort) => {
            switch (sort.mode) {
                case 'ASC': {
                    return 'ASC';
                }
                case 'DESC': {
                    return 'DESC';
                }
                default: {
                    throw new Error(`Unkonwn sort mode ${sort.mode}`);
                }
            }
        };
        this.isWhereAttribute = (where) => {
            return 'operator' in where;
        };
        this.computeWhereAttribute = (attribute) => {
            switch (attribute.operator) {
                case '<': {
                    return `\`${attribute.column}\` < ?`;
                }
                case '<=': {
                    return `\`${attribute.column}\` <= ?`;
                }
                case '<>': {
                    return `\`${attribute.column}\` <> ?`;
                }
                case '=': {
                    return `\`${attribute.column}\` = ?`;
                }
                case '>': {
                    return `\`${attribute.column}\` > ?`;
                }
                case '>=': {
                    return `\`${attribute.column}\` >= ?`;
                }
                case 'BETWEEN': {
                    return `\`${attribute.column}\` BETWEEN ? AND ?`;
                }
                case 'IN': {
                    return `\`${attribute.column}\` IN (${attribute.value
                        .map(() => '?')
                        .join(', ')})`;
                }
                case 'LIKE': {
                    return `\`${attribute.column}\` LIKE ?`;
                }
                default: {
                    throw new Error(`Invalid operator ${attribute.operator}`);
                }
            }
        };
        this.computeWhereKeyWord = (keyword) => {
            switch (keyword.keyword) {
                case 'AND': {
                    return ' AND ';
                }
                case 'OR': {
                    return ' OR ';
                }
                case 'NOT': {
                    return 'NOT';
                }
                case 'STARTGROUP': {
                    return ' ( ';
                }
                case 'ENDGROUP': {
                    return ' ) ';
                }
                default: {
                    throw new Error(`Invalid keyword ${keyword.keyword}`);
                }
            }
        };
    }
}
exports.default = GlobalMariaModel;
