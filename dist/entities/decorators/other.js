"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Id = exports.NonPersistent = exports.AutoCreateNUpdate = exports.Table = void 0;
const entitymanager_1 = __importDefault(require("../entitymanager"));
function Table(tableName) {
    return (constructor) => {
        return class extends constructor {
            constructor(...args) {
                super(...args);
                constructor.create = () => new constructor();
                constructor.tableName = tableName;
                constructor.ready = true;
                entitymanager_1.default.entities.push({ tableName, entity: constructor });
                if (constructor.autoCreateNUpdate) {
                    entitymanager_1.default.waitingEntities.push(constructor);
                }
            }
        };
    };
}
exports.Table = Table;
function AutoCreateNUpdate() {
    return (constructor) => {
        return class extends constructor {
            constructor(...args) {
                super(...args);
                constructor.autoCreateNUpdate = true;
                if (constructor.tableName) {
                    entitymanager_1.default.waitingEntities.push(constructor);
                }
            }
        };
    };
}
exports.AutoCreateNUpdate = AutoCreateNUpdate;
function NonPersistent() {
    return (target, key) => {
        if (!target.constructor.nonPersistentColumns)
            target.constructor.nonPersistentColumns = [];
        target.constructor.nonPersistentColumns.push(key);
    };
}
exports.NonPersistent = NonPersistent;
function Id() {
    return (target, key) => {
        target.constructor.id = key;
    };
}
exports.Id = Id;
