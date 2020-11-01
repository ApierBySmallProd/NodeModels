"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const field_1 = require("../migration/field");
class FieldEntity {
    constructor(key, type) {
        this.isUnique = false;
        this.isAutoIncremented = false;
        this.isNullAllowed = false;
        this.isPrimary = false;
        this.checkConstraint = null;
        this.defaultConstraint = null;
        this.foreignKey = null;
        this.fieldLength = 0;
        this.length = (length) => {
            this.fieldLength = length;
        };
        this.setType = (type) => {
            this.type = type;
        };
        this.name = (name) => {
            this.fieldName = name;
        };
        this.unique = () => {
            this.isUnique = true;
        };
        this.autoIncrement = () => {
            this.isAutoIncremented = true;
        };
        this.allowNull = () => {
            this.isNullAllowed = true;
        };
        this.primary = () => {
            this.isPrimary = true;
        };
        this.default = (value, isSystem) => {
            this.defaultConstraint = { value, isSystem };
        };
        this.check = (check) => {
            this.checkConstraint = check;
        };
        this.foreign = (table, column) => {
            this.foreignKey = { table, column };
        };
        this.convertToMigrationField = () => {
            const field = new field_1.Field(this.fieldName, this.type);
            if (this.fieldLength)
                field.length(this.fieldLength);
            if (this.isUnique)
                field.unique();
            if (this.isAutoIncremented)
                field.autoIncrement();
            if (this.isNullAllowed)
                field.allowNull();
            if (this.isPrimary)
                field.primary();
            if (this.checkConstraint)
                field.check(this.checkConstraint);
            if (this.defaultConstraint)
                field.default(this.defaultConstraint.value, this.defaultConstraint.isSystem);
            if (this.foreignKey)
                field.foreign(this.foreignKey.table, this.foreignKey.column);
            return field;
        };
        this.key = key;
        this.type = type;
        this.fieldName = key;
    }
}
exports.default = FieldEntity;
