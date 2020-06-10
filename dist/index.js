"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dbmanager_1 = __importDefault(require("./dbs/dbmanager"));
const entity_1 = __importDefault(require("./entities/entity"));
const maria_db_1 = __importDefault(require("./dbs/global/maria.db"));
const migration_1 = __importDefault(require("./migration/migration"));
const migration_manager_1 = __importDefault(require("./migration/migration.manager"));
const postgres_db_1 = __importDefault(require("./dbs/global/postgres.db"));
exports.default = {
    Entity: entity_1.default,
    DbManager: dbmanager_1.default,
    db: {
        PG: postgres_db_1.default,
        Maria: maria_db_1.default,
    },
    migration: {
        MigrationManager: migration_manager_1.default,
        Migration: migration_1.default,
    },
};
var entity_2 = require("./entities/entity");
exports.Entity = entity_2.default;
exports.Id = entity_2.Id;
exports.NonPersistent = entity_2.NonPersistent;
exports.PrimaryKey = entity_2.PrimaryKey;
exports.Table = entity_2.Table;
var dbmanager_2 = require("./dbs/dbmanager");
exports.DbManager = dbmanager_2.default;
