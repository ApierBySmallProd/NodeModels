"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getField = void 0;
const createtable_1 = require("../../migration/types/createtable");
function getField(target, key) {
    if (!target.constructor.columns)
        target.constructor.columns = [];
    let field = target.constructor.columns.find((f) => f.name === key);
    if (!field) {
        field = new createtable_1.Field(key, 'tinyint');
        target.constructor.columns.push(field);
    }
    return field;
}
exports.getField = getField;
