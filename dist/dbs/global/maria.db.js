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
                connection.release();
                resolve(pool);
            }
        });
    });
});
class GlobalMariaModel extends global_db_1.default {
    constructor() {
        super(...arguments);
        this.pool = null;
        this.query = (query, params) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                if (!this.pool) {
                    if (GlobalMariaModel.debug)
                        console.error('No pool');
                    return resolve(null);
                }
                this.pool.getConnection((err, connection) => {
                    if (err) {
                        if (GlobalMariaModel.debug)
                            console.error(err);
                        return resolve(null);
                    }
                    connection.query(query, params, (error, results, fields) => {
                        connection.release();
                        if (error) {
                            if (GlobalMariaModel.debug)
                                console.error(error);
                            return resolve(null);
                        }
                        resolve(results);
                    });
                });
            });
        });
        this.insert = (tableName, attributes) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const columns = attributes.map((a) => a.column).join(', ');
            const params = attributes.map((a, index) => `?`).join(', ');
            const query = `INSERT INTO ${tableName} (${columns}) VALUES (${params})`;
            return (_a = (yield this.query(query, attributes.map((a) => a.value)))) === null || _a === void 0 ? void 0 : _a.insertId;
        });
        this.select = (tableName, distinct, attributes, wheres, sorts, limit, offset = 0) => __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT${distinct ? ' DISTINCT' : ''}${this.computeAttributes(attributes)} FROM ${tableName} AS default_table ${this.computeWhere(wheres)}${this.computeSort(sorts)}${limit !== -1 ? ` LIMIT ${limit}, ${offset}` : ''}`;
            return yield this.query(query, this.getWhereAttributes(wheres));
        });
        this.update = (tableName, attributes, wheres) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            const columns = attributes.map((a) => `${a.column} = ?`).join(', ');
            const where = wheres.map((w) => `${w.column} = ?`).join(' AND ');
            const query = `UPDATE ${tableName} SET ${columns} ${wheres.length ? `WHERE ${where}` : ''}`;
            return (_b = (yield this.query(query, attributes.map((a) => a.value).concat(wheres.map((w) => w.value))))) === null || _b === void 0 ? void 0 : _b.affectedRows;
        });
        this.delete = (tableName, wheres) => __awaiter(this, void 0, void 0, function* () {
            const where = wheres.map((w) => `${w.column} = ?`).join(' AND ');
            const query = `DELETE FROM ${tableName} ${wheres.length ? `WHERE ${where}` : ''}`;
            return yield this.query(query, wheres.map((w) => w.value));
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
        this.getWhereAttributes = (wheres) => {
            const newWheres = wheres.filter((w) => this.isWhereAttribute(w));
            return newWheres.map((w) => w.value);
        };
        this.computeAttributes = (attributes) => {
            if (!attributes.length)
                return ' *';
            attributes.map((a) => `${a.function
                ? `${this.computeAttributeFunction(a)}(${a.attribute})${a.alias ? ` AS ${a.alias}` : ''}`
                : `${a.attribute}${a.alias ? ` AS ${a.alias}` : ''}`}`);
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
                .map((s) => `${s.attribute} ${this.computeSortMode(s)}`)
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
                    return `${attribute.column} < ?`;
                }
                case '<=': {
                    return `${attribute.column} <= ?`;
                }
                case '<>': {
                    return `${attribute.column} <> ?`;
                }
                case '=': {
                    return `${attribute.column} = ?`;
                }
                case '>': {
                    return `${attribute.column} > ?`;
                }
                case '>=': {
                    return `${attribute.column} >= ?`;
                }
                case 'BETWEEN': {
                    return `${attribute.column} BETWEEN ? AND ?`;
                }
                case 'IN': {
                    return `${attribute.column} IN (${attribute.value
                        .map(() => '?')
                        .join(', ')})`;
                }
                case 'LIKE': {
                    return `${attribute.column} LIKE ?`;
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
