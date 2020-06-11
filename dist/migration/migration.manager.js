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
const dbmanager_1 = __importDefault(require("../dbs/dbmanager"));
const migration_1 = __importDefault(require("./migration"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MigrationManager {
    constructor(config) {
        this.migrate = (targetMigration, dbName) => __awaiter(this, void 0, void 0, function* () {
            console.log('\x1b[33mStarting migrations\x1b[0m');
            const model = dbmanager_1.default.get().get(dbName);
            if (!model) {
                throw new Error('Database not found');
            }
            const res = fs_1.default.readdirSync(this.config.migrationPath);
            res.sort();
            yield res.reduce((prev, migrationFile) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                const migrationPath = path_1.default.resolve(this.config.migrationPath, migrationFile);
                const migrationRequired = require(migrationPath);
                if (!targetMigration || targetMigration === migrationRequired.name) {
                    const migration = new migration_1.default(migrationRequired.name, 'up');
                    console.log(`\x1b[35m## Migrating ${migrationRequired.name}\x1b[0m`);
                    migrationRequired.up(migration);
                    yield migration.execute(model);
                }
            }), Promise.resolve());
        });
        this.reset = (targetMigration, dbName) => __awaiter(this, void 0, void 0, function* () {
            console.log('\x1b[33mStarting migrations\x1b[0m');
            const model = dbmanager_1.default.get().get(dbName);
            if (!model) {
                throw new Error('Database not found');
            }
            const res = fs_1.default.readdirSync(this.config.migrationPath);
            res.sort();
            yield res.reduce((prev, migrationFile) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                const migrationPath = path_1.default.resolve(this.config.migrationPath, migrationFile);
                const migrationRequired = require(migrationPath);
                if (!targetMigration || targetMigration === migrationRequired.name) {
                    console.log(`\x1b[35m## Migrating ${migrationRequired.name}\x1b[0m`);
                    const migration = new migration_1.default(migrationRequired.name, 'down');
                    migrationRequired.down(migration);
                    yield migration.execute(model);
                }
            }), Promise.resolve());
        });
        this.config = config;
    }
}
exports.default = MigrationManager;
