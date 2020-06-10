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
const postgres_db_1 = __importDefault(require("../global/postgres.db"));
const config = {
    db: {
        pg: {
            user: '',
            host: '',
            database: '',
            password: '',
            port: 0,
        },
    },
};
exports.ConnectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    yield PostgreModel.GetModel().setPool({
        user: config.db.pg.user,
        host: config.db.pg.host,
        database: config.db.pg.database,
        password: config.db.pg.password,
        port: config.db.pg.port,
    });
});
class PostgreModel extends postgres_db_1.default {
    constructor() {
        super();
    }
}
exports.default = PostgreModel;
PostgreModel.singleton = null;
PostgreModel.GetModel = () => {
    if (!PostgreModel.singleton) {
        PostgreModel.singleton = new PostgreModel();
    }
    return PostgreModel.singleton;
};
