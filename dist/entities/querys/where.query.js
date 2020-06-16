"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_1 = __importDefault(require("./query"));
class WhereQuery extends query_1.default {
    constructor() {
        super(...arguments);
        this.wheres = [];
        this.and = () => {
            this.wheres.push({ keyword: 'AND' });
            return this;
        };
        this.or = () => {
            this.wheres.push({ keyword: 'OR' });
            return this;
        };
        this.not = () => {
            this.wheres.push({ keyword: 'NOT' });
            return this;
        };
        this.group = () => {
            this.wheres.push({ keyword: 'STARTGROUP' });
            return this;
        };
        this.endGroup = () => {
            this.wheres.push({ keyword: 'ENDGROUP' });
            return this;
        };
    }
}
exports.default = WhereQuery;
