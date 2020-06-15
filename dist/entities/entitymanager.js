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
EntityManager.createContext = () => {
    let id;
    do {
        id = Math.floor(Math.random() * 10000 + 1).toString();
    } while (EntityManager.contexts.find((c) => c.id === id));
    const newContext = {
        id,
        entities: [],
    };
    EntityManager.contexts.push(newContext);
    return newContext;
};
EntityManager.closeContext = (context) => {
    EntityManager.contexts = EntityManager.contexts.filter((c) => c.id !== context.id);
};
EntityManager.registerManyToManyTable = (table1, table2, relationTable) => {
    EntityManager.manyToManyTables.push({ table1, table2, relationTable });
};
EntityManager.addEntity = (entity, context) => {
    if (!context) {
        context = EntityManager.contexts[0];
    }
    context.entities.push(entity);
};
EntityManager.findEntity = (table, id = null, context) => {
    if (!context) {
        context = EntityManager.contexts[0];
    }
    if (id) {
        return context.entities.find((f) => f.constructor.tableName === table && f[f.constructor.id] === id);
    }
    return context.entities.filter((f) => f.constructor.tableName === table);
};
EntityManager.removeEntity = (entity, context) => {
    if (!context) {
        context = EntityManager.contexts[0];
    }
    const ent = entity;
    context.entities = context.entities.filter((e) => e.constructor.tableName === ent.constructor.tableName &&
        e[e.constructor.id] === ent[ent.contructor.id]);
};
EntityManager.contexts = [{ entities: [], id: 'default' }];
EntityManager.registeredEntities = [];
EntityManager.initializingEntities = false;
