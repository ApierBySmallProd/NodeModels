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
Object.defineProperty(exports, "__esModule", { value: true });
const automigration_1 = require("./automigration");
class EntityManager {
    static registerEntity(entity) {
        this.registeredEntities.push(entity);
        new entity();
    }
    static registerEntities(entities) {
        this.registeredEntities = this.registeredEntities.concat(entities);
        entities.forEach((entity) => new entity());
    }
}
exports.default = EntityManager;
EntityManager.waitingEntities = [];
EntityManager.entities = [];
EntityManager.manyToManyTables = [];
EntityManager.initialize = () => __awaiter(void 0, void 0, void 0, function* () {
    EntityManager.initializingEntities = true;
    while (EntityManager.waitingEntities.length) {
        yield automigration_1.makeMigrations(EntityManager.waitingEntities.pop());
    }
    EntityManager.initializingEntities = false;
});
EntityManager.registerManyToManyTable = (table1, table2, relationTable) => {
    EntityManager.manyToManyTables.push({ table1, table2, relationTable });
};
EntityManager.addEntity = (entity) => {
    EntityManager.allEntities.push(entity);
};
EntityManager.findEntity = (table, id = null) => {
    if (id) {
        return EntityManager.allEntities.find((f) => f.constructor.tableName === table && f[f.constructor.id] === id);
    }
    return EntityManager.allEntities.filter((f) => f.constructor.tableName === table);
};
EntityManager.allEntities = [];
EntityManager.registeredEntities = [];
EntityManager.initializingEntities = false;
