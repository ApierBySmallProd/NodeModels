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
const migration_1 = __importDefault(require("./migration"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class MigrationManager {
    constructor(config) {
        this.migrate = (targetMigration) => __awaiter(this, void 0, void 0, function* () {
            const res = fs_1.default.readdirSync(this.config.migrationPath);
            const migration = new migration_1.default();
            res.sort();
            res.forEach((migrationFile) => {
                const migrationPath = path_1.default.resolve(this.config.migrationPath, migrationFile);
                const migrationRequired = require(migrationPath);
                if (!targetMigration || targetMigration === migrationRequired.name) {
                    migrationRequired.up(migration);
                }
            });
            yield migration.execute(this.config.database);
        });
        this.reset = (targetMigration) => __awaiter(this, void 0, void 0, function* () {
            const res = fs_1.default.readdirSync(this.config.migrationPath);
            const migration = new migration_1.default();
            res.sort();
            res.forEach((migrationFile) => {
                const migrationPath = path_1.default.resolve(this.config.migrationPath, migrationFile);
                const migrationRequired = require(migrationPath);
                if (!targetMigration || targetMigration === migrationRequired.name) {
                    migrationRequired.down(migration);
                }
            });
            yield migration.execute(this.config.database);
        });
        this.config = config;
    }
}
exports.default = MigrationManager;
