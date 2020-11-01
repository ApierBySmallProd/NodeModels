"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        this.add = (dbms, host, port, user, password, database, name = '', debug = false) => __awaiter(this, void 0, void 0, function* () {
            switch (dbms) {
                case 'mariadb': {
                    const GlobalMariaModel = (yield Promise.resolve().then(() => __importStar(require('./global/maria.db')))).default;
                    const ndb = new GlobalMariaModel(debug);
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
                    const GlobalPostgreModel = (yield Promise.resolve().then(() => __importStar(require('./global/postgres.db'))))
                        .default;
                    const ndb = new GlobalPostgreModel(debug);
                    yield ndb.setPool({
                        host,
                        port,
                        user,
                        password,
                        database,
                    });
                    this.dbs.push({ name, db: ndb });
                    break;
                }
                case 'oracle': {
                    const GlobalOracleModel = (yield Promise.resolve().then(() => __importStar(require('./global/oracle.db')))).default;
                    const ndb = new GlobalOracleModel(debug);
                    yield ndb.setPool({
                        user,
                        password,
                        connectString: `${host}:${port}/${database}`,
                    });
                    this.dbs.push({ name, db: ndb });
                    break;
                }
                case 'mssql': {
                    const GlobalMicrosoftModel = (yield Promise.resolve().then(() => __importStar(require('./global/microsoft.db'))))
                        .default;
                    const ndb = new GlobalMicrosoftModel(debug);
                    yield ndb.setPool({
                        port,
                        user,
                        password,
                        database,
                        server: host,
                    });
                    this.dbs.push({ name, db: ndb });
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
