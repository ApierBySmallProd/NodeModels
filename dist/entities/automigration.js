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
exports.makeMigrations = void 0;
const createtable_1 = __importDefault(require("../migration/types/createtable"));
const dbmanager_1 = __importDefault(require("../dbs/dbmanager"));
const entitymanager_1 = __importDefault(require("./entitymanager"));
const field_entity_1 = __importDefault(require("./field.entity"));
const migration_1 = __importDefault(require("../migration/migration"));
const migration_entity_1 = __importDefault(require("./migration.entity"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.makeMigrations = (constructor) => __awaiter(void 0, void 0, void 0, function* () {
    let relationship;
    const relationFields = [];
    const manyToMany = [];
    if (!constructor.relations)
        constructor.relations = [];
    for (relationship of constructor.relations) {
        const relationEntity = entitymanager_1.default.entities.find((e) => e.tableName === relationship.entity);
        if (relationship.type === 'manytoone') {
            if (relationEntity &&
                relationEntity.entity.ready &&
                relationEntity.entity.initialized) {
                const relationId = relationEntity.entity.columns.find((f) => f.key === relationEntity.entity.id);
                if (!relationId) {
                    throw Error(`Unknown id`);
                }
                const field = new field_entity_1.default(`${relationship.fieldName}_id`, relationId.type);
                field.foreign(relationEntity.entity.tableName, relationEntity.entity.id.fieldName);
                relationFields.push(field);
            }
            else {
                throw Error(`Undefined entity for table ${relationship.entity}`);
            }
        }
        else if (relationship.type === 'manytomany') {
            if (relationEntity && relationEntity.entity.ready) {
                if (relationEntity.entity.initialized) {
                    const relationId = relationEntity.entity.columns.find((f) => f.key === relationEntity.entity.id.key);
                    if (!relationId) {
                        throw Error(`Unknown id`);
                    }
                    const field = new field_entity_1.default(`${relationEntity.entity.tableName}_id`, relationId.type);
                    field.foreign(relationEntity.entity.tableName, relationEntity.entity.id.fieldName);
                    const myId = constructor.columns.find((f) => f.key === constructor.id.key);
                    if (!myId) {
                        throw Error(`Unknown id`);
                    }
                    const otherfield = new field_entity_1.default(`${constructor.tableName}_id`, myId.type);
                    otherfield.foreign(constructor.tableName, constructor.id.fieldName);
                    manyToMany.push({
                        name: `relation_${constructor.tableName}_${relationEntity.entity.tableName}`,
                        fields: [field, otherfield],
                    });
                    entitymanager_1.default.registerManyToManyTable(constructor.tableName, relationEntity.entity.tableName, `relation_${constructor.tableName}_${relationEntity.entity.tableName}`);
                }
            }
            else {
                throw Error(`Undefined entity for table ${relationship.entity}`);
            }
        }
    }
    constructor.initialized = true;
    yield checkAndMigrate(constructor.tableName, constructor.columns.concat(relationFields));
    yield manyToMany.reduce((prev, cur) => __awaiter(void 0, void 0, void 0, function* () {
        yield prev;
        yield checkAndMigrate(cur.name, cur.fields);
    }), Promise.resolve());
});
const analyzeMigrations = (tableName) => __awaiter(void 0, void 0, void 0, function* () {
    const model = dbmanager_1.default.get().get();
    const config = dbmanager_1.default.get().getConfig();
    if (!model) {
        throw new Error('Database not found');
    }
    const migrations = (yield migration_entity_1.default.getAll(model)).map((m) => m.name);
    const result = [];
    const res = fs_1.default.readdirSync(config.migrationPath);
    res.forEach((migrationFile) => {
        const migrationPath = path_1.default.resolve(config.migrationPath, migrationFile);
        const migrationRequired = require(migrationPath);
        if (migrations.includes(migrationRequired.name)) {
            const migration = new migration_1.default(migrationRequired.name, 'up');
            migrationRequired.up(migration);
            const r = migration.findByTableName(tableName);
            r.forEach((m) => {
                result.push(m);
            });
        }
    });
    if (!result.length)
        return new createtable_1.default(tableName);
    if (result[0].type !== 'createtable')
        return new createtable_1.default(tableName);
    const globalMigration = result[0];
    for (let i = 1; i < result.length; i += 1) {
        globalMigration.applyMigration(result[i]);
    }
    return globalMigration;
});
const createMigration = (migration) => __awaiter(void 0, void 0, void 0, function* () {
    const config = dbmanager_1.default.get().getConfig();
    const now = new Date();
    const fileName = `[${now
        .toISOString()
        .replace(/T/g, '-')
        .replace(/:/g, '-')}]${migration.getName()}.js`;
    const nbFile = fs_1.default
        .readdirSync(path_1.default.resolve(config.migrationPath))
        .length.toString();
    fs_1.default.writeFileSync(path_1.default.resolve(config.migrationPath, fileName), migration.generateMigrationFile(nbFile));
    const migr = new migration_1.default(`${migration.getName()}-${nbFile}`, 'up', [
        migration,
    ]);
    const model = dbmanager_1.default.get().get();
    if (!model) {
        throw new Error('Database not found');
    }
    yield migr.execute(model);
});
const checkAndMigrate = (tableName, columns) => __awaiter(void 0, void 0, void 0, function* () {
    const globalMigration = yield analyzeMigrations(tableName);
    const newSchema = new createtable_1.default(tableName);
    newSchema.fields = columns.map((field) => field.convertToMigrationField());
    const migration = globalMigration.compareSchema(newSchema);
    if (migration) {
        yield createMigration(migration);
    }
});
