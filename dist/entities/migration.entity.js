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
class MigrationEntity {
}
exports.default = MigrationEntity;
MigrationEntity.getAll = (model) => __awaiter(void 0, void 0, void 0, function* () {
    yield MigrationEntity.checkQuery(model);
    return model.select('migration', false, [], [], [
        { attribute: 'migrated_at', mode: 'DESC' },
        { attribute: 'id', mode: 'DESC' },
    ], 'default_table', -1, -1, [], [], []);
});
MigrationEntity.create = (model, name) => __awaiter(void 0, void 0, void 0, function* () {
    yield MigrationEntity.checkQuery(model);
    return model.insert('migration', [{ column: 'name', value: name }]);
});
MigrationEntity.delete = (model, name) => __awaiter(void 0, void 0, void 0, function* () {
    yield MigrationEntity.checkQuery(model);
    return model.delete('migration', [
        { column: 'name', operator: '=', value: name },
    ]);
});
MigrationEntity.canQuery = false;
MigrationEntity.checkQuery = (model) => __awaiter(void 0, void 0, void 0, function* () {
    if (!MigrationEntity.canQuery) {
        const res = yield model.query('SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = "migration"');
        if (!res || !res.length) {
            yield model.query('CREATE TABLE `migration` (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE, migrated_at DATETIME DEFAULT NOW())');
        }
    }
    MigrationEntity.canQuery = true;
});
