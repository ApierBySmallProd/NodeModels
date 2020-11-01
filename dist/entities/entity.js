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
const entitymanager_1 = __importDefault(require("./entitymanager"));
const create_query_1 = __importDefault(require("./querys/create.query"));
const delete_query_1 = __importDefault(require("./querys/delete.query"));
const find_query_1 = __importDefault(require("./querys/find.query"));
const update_query_1 = __importDefault(require("./querys/update.query"));
class Entity {
    constructor() {
        this.persisted = false;
        this.relations = [];
        this.create = (dbName = null, context) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const base = this;
            const query = new create_query_1.default(base.constructor.tableName);
            const nonPersistentColumns = (_a = base.constructor.nonPersistentColumns) !== null && _a !== void 0 ? _a : [];
            const primaryKeys = (_b = base.constructor.primaryKeys) !== null && _b !== void 0 ? _b : [];
            let column;
            for (column of base.constructor.columns) {
                if (!primaryKeys.includes(column.key) &&
                    !(base[column.key] instanceof Array) &&
                    typeof base[column.key] !== 'function') {
                    if (typeof base[column.key] !== 'object' ||
                        typeof base[column.key] === null) {
                        query.setAttribute(column.fieldName, base[column.key]);
                    }
                    else if (base[column.key] instanceof Date) {
                        const field = base.constructor.columns.find((f) => f.name === column.name);
                        if (field) {
                            const d = base[column.key];
                            let formattedD = '';
                            switch (field.type) {
                                case 'date': {
                                    formattedD = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                                    break;
                                }
                                case 'datetime': {
                                    formattedD = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                                    break;
                                }
                                case 'timestamp': {
                                    formattedD = d.getTime().toString();
                                    break;
                                }
                                case 'time': {
                                    formattedD = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                                    break;
                                }
                                default: {
                                    formattedD = '';
                                }
                            }
                            if (formattedD) {
                                query.setAttribute(column.fieldName, formattedD);
                            }
                        }
                    }
                }
            }
            const manyToManyQueries = [];
            base.constructor.relations.forEach((relation) => {
                if (base[relation.fieldName]) {
                    switch (relation.type) {
                        case 'manytomany':
                            const rel = this.relations.find((r) => r.entity === relation.entity);
                            const relData = rel ? rel.data : [];
                            const relationTable = entitymanager_1.default.manyToManyTables.find((m) => (m.table1 === base.constructor.tableName &&
                                m.table2 === relation.entity) ||
                                (m.table1 === relation.entity &&
                                    m.table2 === base.constructor.tableName));
                            if (relationTable) {
                                base[relation.fieldName].forEach((elem) => {
                                    if (elem.persisted &&
                                        !relData.includes(elem[elem.constructor.id.key])) {
                                        const manyToManyQuery = new create_query_1.default(relationTable.relationTable);
                                        manyToManyQuery.setAttribute(`${elem.constructor.tableName}_id`, elem[elem.constructor.id.key]);
                                        manyToManyQueries.push(manyToManyQuery);
                                    }
                                });
                            }
                            break;
                        case 'manytoone':
                            if (base[relation.fieldName].persisted) {
                                query.setAttribute(`${relation.fieldName}_id`, base[relation.fieldName][base[relation.fieldName].constructor.id.key]);
                            }
                            break;
                        case 'onetomany':
                            break;
                        default:
                    }
                }
            });
            const res = yield query.exec(dbName);
            if (res) {
                if (base.constructor.id) {
                    this.persisted = true;
                    base[base.constructor.id.key] = res;
                    entitymanager_1.default.addEntity(this, context);
                    yield manyToManyQueries.reduce((prev, cur) => __awaiter(this, void 0, void 0, function* () {
                        yield prev;
                        cur.setAttribute(`${base.constructor.tableName}_id`, base[base.constructor.id.key]);
                        yield cur.exec();
                    }), Promise.resolve());
                }
                return this;
            }
            return null;
        });
        this.update = (dbName = null) => __awaiter(this, void 0, void 0, function* () {
            var _c, _d;
            const base = this;
            const query = new update_query_1.default(base.constructor.tableName);
            const nonPersistentColumns = (_c = base.constructor.nonPersistentColumns) !== null && _c !== void 0 ? _c : [];
            const primaryKeys = (_d = base.constructor.primaryKeys) !== null && _d !== void 0 ? _d : [];
            let column;
            for (column of base.constructor.columns) {
                if (!primaryKeys.includes(column.key) &&
                    !(base[column.key] instanceof Array) &&
                    typeof base[column.key] !== 'function') {
                    if (typeof base[column.key] !== 'object' ||
                        typeof base[column.key] === null) {
                        query.setAttribute(column.fieldName, base[column.key]);
                    }
                    else if (base[column.key] instanceof Date) {
                        const field = base.constructor.columns.find((f) => f.key === column.key);
                        if (field) {
                            const d = base[column.key];
                            let formattedD = '';
                            switch (field.type) {
                                case 'date': {
                                    formattedD = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
                                    break;
                                }
                                case 'datetime': {
                                    formattedD = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                                    break;
                                }
                                case 'timestamp': {
                                    formattedD = d.getTime().toString();
                                    break;
                                }
                                case 'time': {
                                    formattedD = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                                    break;
                                }
                                default: {
                                    formattedD = '';
                                }
                            }
                            if (formattedD) {
                                query.setAttribute(column.fieldName, formattedD);
                            }
                        }
                    }
                }
            }
            if (base.constructor.id) {
                query.where(base.constructor.id.fieldName, '=', base[base.constructor.id.key]);
            }
            else {
                throw new Error('No specified id');
            }
            yield base.constructor.relations.reduce((prev, relation) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                console.log(relation);
                console.log(base);
                if (base[relation.fieldName]) {
                    switch (relation.type) {
                        case 'manytomany': {
                            const rel = this.relations.find((r) => r.entity === relation.entity);
                            const relData = rel ? rel.data : [];
                            const relationTable = entitymanager_1.default.manyToManyTables.find((m) => (m.table1 === base.constructor.tableName &&
                                m.table2 === relation.entity) ||
                                (m.table1 === relation.entity &&
                                    m.table2 === base.constructor.tableName));
                            console.log(entitymanager_1.default.manyToManyTables);
                            console.log(relationTable);
                            if (relationTable) {
                                yield base[relation.fieldName].reduce((previous, elem) => __awaiter(this, void 0, void 0, function* () {
                                    yield previous;
                                    if (elem.persisted &&
                                        !relData.includes(elem[elem.constructor.id.key])) {
                                        const manyToManyQuery = new create_query_1.default(relationTable.relationTable);
                                        manyToManyQuery.setAttribute(`${elem.constructor.tableName}_id`, elem[elem.constructor.id.key]);
                                        manyToManyQuery.setAttribute(`${base.constructor.tableName}_id`, base[base.constructor.id.key]);
                                        yield manyToManyQuery.exec();
                                    }
                                }), Promise.resolve());
                            }
                            break;
                        }
                        case 'manytoone':
                            if (base[relation.fieldName].persisted) {
                                query.setAttribute(`${relation.fieldName}_id`, base[relation.fieldName][base[relation.fieldName].constructor.id.key]);
                            }
                            break;
                        case 'onetomany':
                            break;
                        default:
                    }
                }
            }), Promise.resolve());
            const res = yield query.exec(dbName);
            if (res) {
                return this;
            }
            return null;
        });
        this.delete = (dbName = null, context) => __awaiter(this, void 0, void 0, function* () {
            const base = this;
            const query = new delete_query_1.default(base.constructor.tableName);
            if (!base.constructor.id) {
                throw new Error('No id specified');
            }
            query.where(base.constructor.id.fieldName, '=', base[base.constructor.id.key]);
            const res = yield query.exec(dbName);
            if (res) {
                entitymanager_1.default.removeEntity(this, context);
                return true;
            }
            return false;
        });
        this.fetch = (field, context) => __awaiter(this, void 0, void 0, function* () {
            var _e;
            const base = this;
            const relation = base.constructor.relations.find((r) => r.fieldName === field);
            if (relation) {
                const rel = entitymanager_1.default.entities.find((e) => e.tableName === relation.entity);
                if (rel) {
                    const ent = rel.entity;
                    switch (relation.type) {
                        case 'manytomany': {
                            const relationTable = entitymanager_1.default.manyToManyTables.find((m) => (m.table1 === base.constructor.tableName &&
                                m.table2 === relation.entity) ||
                                (m.table1 === relation.entity &&
                                    m.table2 === base.constructor.tableName));
                            if (relationTable) {
                                const relations = yield new find_query_1.default(relationTable.relationTable)
                                    .where(`${base.constructor.tableName}_id`, '=', base[base.constructor.id.key])
                                    .exec();
                                if (relations && relations.length) {
                                    this.relations.push({
                                        entity: relation.entity,
                                        data: relations,
                                    });
                                    base[relation.fieldName] = yield ent
                                        .findMany(context)
                                        .where(((_e = ent.id) === null || _e === void 0 ? void 0 : _e.fieldName) || '', 'IN', relations.map((r) => r[`${ent.tableName}_id`]))
                                        .exec();
                                }
                                else {
                                    base[field] = [];
                                }
                            }
                            break;
                        }
                        case 'manytoone': {
                            if (base[`${relation.entity}_id`]) {
                                base[field] = yield ent.findById(base[`${relation.entity}_id`], context);
                            }
                            break;
                        }
                        case 'onetomany': {
                            base[field] = yield ent
                                .findMany(context)
                                .where(`${base.constructor.tableName}_id`, '=', base[base.constructor.id.key])
                                .exec();
                            break;
                        }
                        default:
                    }
                }
            }
        });
    }
    static findOne(context) {
        const query = new find_query_1.default(this.tableName, (res) => __awaiter(this, void 0, void 0, function* () {
            if (res.length) {
                return yield this.generateEntity(res[0], context);
            }
            return null;
        }));
        query.limit(1);
        return query;
    }
    static findMany(context) {
        const query = new find_query_1.default(this.tableName, (res) => __awaiter(this, void 0, void 0, function* () {
            const result = [];
            yield res.reduce((prev, r) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                result.push(yield this.generateEntity(r, context));
            }), Promise.resolve());
            return result;
        }));
        return query;
    }
    static findById(id, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.id)
                throw new Error('No id specified');
            const entity = entitymanager_1.default.findEntity(this.tableName, id);
            if (entity)
                return entity;
            const query = new find_query_1.default(this.tableName);
            query.where(this.id.fieldName, '=', id);
            const res = yield query.exec();
            if (res.length) {
                return yield this.generateEntity(res[0], context);
            }
            return null;
        });
    }
    static deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = new delete_query_1.default(this.tableName);
            if (!this.id)
                throw new Error('No id specified');
            query.where(this.id.fieldName, '=', id);
            return yield query.exec();
        });
    }
    static delete() {
        const query = new delete_query_1.default(this.tableName);
        return query;
    }
    static generateEntity(res, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const newObj = this.create();
            newObj.persisted = true;
            for (const [key, value] of Object.entries(res)) {
                const field = this.columns.find((f) => f.fieldName === key);
                if (field) {
                    switch (field.type) {
                        case 'date':
                        case 'datetime':
                        case 'timestamp':
                        case 'time':
                            newObj[field.key] = new Date(value);
                            break;
                        default:
                            newObj[field.key] = value;
                    }
                }
                else {
                    newObj[key] = value;
                }
            }
            const entity = entitymanager_1.default.findEntity(newObj.constructor.tableName, newObj[newObj.constructor.id.key], context);
            if (entity) {
                return entity;
            }
            entitymanager_1.default.addEntity(newObj, context);
            yield this.relations.reduce((prev, cur) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                yield prev;
                if (cur.autoFetch) {
                    const relationEntity = entitymanager_1.default.entities.find((e) => e.tableName === cur.entity);
                    if (relationEntity) {
                        const ent = relationEntity.entity;
                        switch (cur.type) {
                            case 'manytomany': {
                                const relationTable = entitymanager_1.default.manyToManyTables.find((m) => (m.table1 === this.tableName && m.table2 === cur.entity) ||
                                    (m.table1 === cur.entity && m.table2 === this.tableName));
                                if (relationTable) {
                                    const relations = yield new find_query_1.default(relationTable.relationTable)
                                        .where(`${this.tableName}_id`, '=', res[((_a = this.id) === null || _a === void 0 ? void 0 : _a.fieldName) || ''])
                                        .exec();
                                    if (relations && relations.length) {
                                        newObj.relations.push({
                                            entity: cur.entity,
                                            data: relations,
                                        });
                                        newObj[cur.fieldName] = yield ent
                                            .findMany(context)
                                            .where(((_b = ent.id) === null || _b === void 0 ? void 0 : _b.fieldName) || '', 'IN', relations.map((r) => r[`${ent.tableName}_id`]))
                                            .exec();
                                    }
                                    else {
                                        newObj[cur.fieldName] = [];
                                    }
                                }
                                break;
                            }
                            case 'manytoone': {
                                if (res[`${cur.fieldName}_id`]) {
                                    newObj[cur.fieldName] = yield ent.findById(res[`${cur.fieldName}_id`], context);
                                }
                                break;
                            }
                            case 'onetomany': {
                                newObj[cur.fieldName] = yield ent
                                    .findMany(context)
                                    .where(`${this.tableName}_id`, '=', res[((_c = this.id) === null || _c === void 0 ? void 0 : _c.fieldName) || ''])
                                    .exec();
                                break;
                            }
                            default:
                        }
                    }
                }
            }), Promise.resolve());
            return newObj;
        });
    }
}
exports.default = Entity;
Entity.create = () => {
};
