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
const altertable_1 = __importDefault(require("./types/altertable"));
const createtable_1 = __importDefault(require("./types/createtable"));
const droptable_1 = __importDefault(require("./types/droptable"));
const seed_1 = __importDefault(require("./types/seed"));
class Migration {
    constructor() {
        this.migrations = [];
        this.createTable = (name) => {
            const createTableMigration = new createtable_1.default(name);
            this.migrations.push(createTableMigration);
            return createTableMigration;
        };
        this.dropTable = (name) => {
            const dropTableMigration = new droptable_1.default(name);
            this.migrations.push(dropTableMigration);
            return dropTableMigration;
        };
        this.alterTable = (name) => {
            const alterTableMigration = new altertable_1.default(name);
            this.migrations.push(alterTableMigration);
            return alterTableMigration;
        };
        this.seedTable = (tableName) => {
            const seedTableMigration = new seed_1.default(tableName);
            this.migrations.push(seedTableMigration);
            return seedTableMigration;
        };
        this.execute = (db) => __awaiter(this, void 0, void 0, function* () {
            const results = this.migrations.map((m) => m.formatQuery());
            yield results.reduce((prev, cur) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                if (cur.query && cur.query.length) {
                    yield cur.query.reduce((p, c) => __awaiter(this, void 0, void 0, function* () {
                        yield p;
                        yield db.query(c);
                    }), Promise.resolve());
                }
            }), Promise.resolve());
            yield results.reduce((prev, cur) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                if (cur.constraints && cur.constraints.length) {
                    yield cur.constraints.reduce((p, c) => __awaiter(this, void 0, void 0, function* () {
                        yield p;
                        yield db.query(c);
                    }), Promise.resolve());
                }
            }), Promise.resolve());
            yield results.reduce((prev, cur) => __awaiter(this, void 0, void 0, function* () {
                yield prev;
                if (cur.seeds && cur.seeds.length) {
                    yield cur.seeds.reduce((p, c) => __awaiter(this, void 0, void 0, function* () {
                        yield p;
                        yield db.query(c);
                    }), Promise.resolve());
                }
            }), Promise.resolve());
        });
    }
}
exports.default = Migration;
