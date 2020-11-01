"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getField = void 0;
const field_entity_1 = __importDefault(require("../field.entity"));
function getField(target, key) {
    if (!target.constructor.columns)
        target.constructor.columns = [];
    let field = target.constructor.columns.find((f) => f.key === key);
    if (!field) {
        field = new field_entity_1.default(key, 'tinyint');
        target.constructor.columns.push(field);
    }
    return field;
}
exports.getField = getField;
