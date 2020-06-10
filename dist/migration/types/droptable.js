"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const migrationtype_1 = __importDefault(require("./migrationtype"));
class DropTable extends migrationtype_1.default {
    constructor(name) {
        super();
        this.formatQuery = () => {
            const query = [`DROP TABLE ${this.name}`];
            return {
                query,
            };
        };
        this.name = name;
    }
}
exports.default = DropTable;
