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
const maria_db_1 = __importDefault(require("../global/maria.db"));
const config = {
    db: {
        maria: {
            user: '',
            host: '',
            database: '',
            password: '',
            port: 0,
        },
    },
};
exports.ConnectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    yield MariaModel.GetModel().setPool({
        user: config.db.maria.user,
        host: config.db.maria.host,
        database: config.db.maria.database,
        password: config.db.maria.password,
        port: config.db.maria.port,
    });
});
class MariaModel extends maria_db_1.default {
    constructor() {
        super();
    }
}
exports.default = MariaModel;
MariaModel.singleton = null;
MariaModel.GetModel = () => {
    if (!MariaModel.singleton) {
        MariaModel.singleton = new MariaModel();
    }
    return MariaModel.singleton;
};
