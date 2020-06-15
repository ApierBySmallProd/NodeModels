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
const dbmanager_1 = __importDefault(require("../../dbs/dbmanager"));
const where_query_1 = __importDefault(require("./where.query"));
class DeleteQuery extends where_query_1.default {
    constructor() {
        super(...arguments);
        this.exec = (dbName = null) => __awaiter(this, void 0, void 0, function* () {
            const db = dbmanager_1.default.get().get(dbName);
            if (!db)
                throw Error('Database not found');
            return yield db.delete(this.tableName, this.wheres);
        });
    }
}
exports.default = DeleteQuery;
