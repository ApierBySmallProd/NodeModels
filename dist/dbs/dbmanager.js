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
const maria_db_1 = __importDefault(require("./global/maria.db"));
const postgres_db_1 = __importDefault(require("./global/postgres.db"));
const defaultConfig = {
    migrationPath: 'database/migrations',
};
class DbManager {
    constructor() {
        this.config = defaultConfig;
        this.dbs = [];
        this.setConfig = (config) => {
            this.config = Object.assign(Object.assign({}, this.config), config);
        };
        this.getConfig = () => this.config;
        this.add = (sgbd, host, port, user, password, database, name = '', debug = false) => __awaiter(this, void 0, void 0, function* () {
            switch (sgbd) {
                case 'mariadb': {
                    const ndb = new maria_db_1.default(debug);
                    yield ndb.setPool({
                        host,
                        user,
                        port,
                        database,
                        password,
                    });
                    this.dbs.push({ name, db: ndb });
                    break;
                }
                case 'postgre': {
                    const ndb = new postgres_db_1.default(debug);
                    yield ndb.setPool({
                        host,
                        port,
                        user,
                        password,
                        database,
                    });
                    break;
                }
                default: {
                    console.error('Unknown sgbd');
                }
            }
        });
        this.get = (name = null) => {
            if (!this.dbs.length)
                return null;
            if (!name)
                return this.dbs[0].db;
            const db = this.dbs.find((d) => d.name === name);
            if (db)
                return db.db;
            return null;
        };
    }
}
exports.default = DbManager;
DbManager.get = () => {
    if (!DbManager._instance) {
        DbManager._instance = new DbManager();
    }
    return DbManager._instance;
};
