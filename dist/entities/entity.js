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
const create_query_1 = __importDefault(require("./querys/create.query"));
const delete_query_1 = __importDefault(require("./querys/delete.query"));
const find_query_1 = __importDefault(require("./querys/find.query"));
const update_query_1 = __importDefault(require("./querys/update.query"));
class Entity {
    constructor() {
        this.create = (dbName = null) => __awaiter(this, void 0, void 0, function* () {
            const base = this;
            const query = new create_query_1.default(base.constructor.tableName);
            const nonPersistentColumns = base.constructor.nonPersistentColumns;
            const primaryKeys = base.constructor.primaryKeys;
            for (const [key, value] of Object.entries(this)) {
                if (!nonPersistentColumns.includes(key) &&
                    !primaryKeys.includes(key) &&
                    !(base[key] instanceof Array) &&
                    (typeof base[key] !== 'object' || typeof base[key] === null) &&
                    typeof base[key] !== 'function') {
                    query.setAttribute(key, value);
                }
            }
            const res = yield query.exec(dbName);
            if (res) {
                if (base.constructor.id) {
                    base[base.constructor.id] = res;
                }
                return this;
            }
            return null;
        });
        this.update = (dbName = null) => __awaiter(this, void 0, void 0, function* () {
            const base = this;
            const query = new update_query_1.default(base.constructor.tableName);
            const nonPersistentColumns = base.constructor.nonPersistentColumns;
            const primaryKeys = base.constructor.primaryKeys;
            for (const [key, value] of Object.entries(this)) {
                if (!nonPersistentColumns.includes(key) &&
                    !primaryKeys.includes(key) &&
                    !(base[key] instanceof Array) &&
                    (typeof base[key] !== 'object' || typeof base[key] === null) &&
                    typeof base[key] !== 'function') {
                    query.setAttribute(key, value);
                }
            }
            if (base.constructor.id) {
                query.where(base.constructor.id, base[base.constructor.id]);
            }
            const res = yield query.exec(dbName);
            if (res) {
                return this;
            }
            return null;
        });
        this.delete = (dbName = null) => __awaiter(this, void 0, void 0, function* () {
            const base = this;
            const query = new delete_query_1.default(base.constructor.tableName);
            if (!base.constructor.id) {
                throw new Error('No id specified');
            }
            query.where(base.constructor.id, base[base.constructor.id]);
            const res = yield query.exec(dbName);
            if (res) {
                return true;
            }
            return false;
        });
    }
    static findOne() {
        const query = new find_query_1.default(this.tableName, (res) => {
            if (res.length) {
                const newObj = this.create();
                for (const [key, value] of Object.entries(res[0])) {
                    newObj[key] = value;
                }
                return newObj;
            }
            return null;
        });
        query.limit(1);
        return query;
    }
    static findMany() {
        const query = new find_query_1.default(this.tableName, (res) => {
            const result = [];
            res.forEach((r) => {
                const newObj = this.create();
                for (const [key, value] of Object.entries(r)) {
                    newObj[key] = value;
                }
                result.push(newObj);
            });
            return result;
        });
        return query;
    }
    static findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new find_query_1.default(this.tableName);
            if (!this.id)
                throw new Error('No id specified');
            query.where(this.id, '=', id);
            const res = yield query.exec();
            if (res.length) {
                const newObj = this.create();
                for (const [key, value] of Object.entries(res[0])) {
                    newObj[key] = value;
                }
                return newObj;
            }
            return null;
        });
    }
}
exports.default = Entity;
Entity.tableName = '';
Entity.nonPersistentColumns = [];
Entity.primaryKeys = [];
Entity.id = '';
Entity.create = () => {
};
function Table(tableName) {
    return (constructor) => {
        return class extends constructor {
            constructor(...args) {
                super(...args);
                constructor.tableName = tableName;
                constructor.create = () => new constructor();
            }
        };
    };
}
exports.Table = Table;
function NonPersistent() {
    return (target, key) => {
        target.constructor.nonPersistentColumns.push(key);
    };
}
exports.NonPersistent = NonPersistent;
function PrimaryKey() {
    return (target, key) => {
        target.constructor.primaryKeys.push(key);
    };
}
exports.PrimaryKey = PrimaryKey;
function Id() {
    return (target, key) => {
        target.constructor.id = key;
    };
}
exports.Id = Id;
