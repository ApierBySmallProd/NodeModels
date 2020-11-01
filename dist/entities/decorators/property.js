"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManyToMany = exports.OneToMany = exports.ManyToOne = exports.Check = exports.Default = exports.PrimaryKey = exports.AutoIncrement = exports.AllowNull = exports.Unique = void 0;
const utils_1 = require("./utils");
function Unique() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.unique();
    };
}
exports.Unique = Unique;
function AllowNull() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.allowNull();
    };
}
exports.AllowNull = AllowNull;
function AutoIncrement() {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.autoIncrement();
    };
}
exports.AutoIncrement = AutoIncrement;
function PrimaryKey() {
    return (target, key) => {
        if (!target.constructor.primaryKeys)
            target.constructor.primaryKeys = [];
        target.constructor.primaryKeys.push(key);
        const field = utils_1.getField(target, key);
        field.primary();
    };
}
exports.PrimaryKey = PrimaryKey;
function Default(value, isSystem = false) {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.default(value, isSystem);
    };
}
exports.Default = Default;
function Check(value) {
    return (target, key) => {
        const field = utils_1.getField(target, key);
        field.check(value);
    };
}
exports.Check = Check;
function ManyToOne(entity, autoFetch = false) {
    return (target, key) => {
        const relationship = {
            entity,
            autoFetch,
            data: null,
            type: 'manytoone',
            fieldName: key,
        };
        if (!target.constructor.relations)
            target.constructor.relations = [];
        target.constructor.relations.push(relationship);
    };
}
exports.ManyToOne = ManyToOne;
function OneToMany(entity, autoFetch = false) {
    return (target, key) => {
        const relationship = {
            entity,
            autoFetch,
            data: null,
            type: 'onetomany',
            fieldName: key,
        };
        if (!target.constructor.relations)
            target.constructor.relations = [];
        target.constructor.relations.push(relationship);
    };
}
exports.OneToMany = OneToMany;
function ManyToMany(entity, autoFetch = false) {
    return (target, key) => {
        const relationship = {
            entity,
            autoFetch,
            data: null,
            type: 'manytomany',
            fieldName: key,
        };
        if (!target.constructor.relations)
            target.constructor.relations = [];
        target.constructor.relations.push(relationship);
    };
}
exports.ManyToMany = ManyToMany;
