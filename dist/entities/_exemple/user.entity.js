"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = __importStar(require("../entity"));
let UserEntity = class UserEntity extends entity_1.default {
    constructor(email, age) {
        super();
        this.id = -1;
        this.createdAt = '';
        this.someProperty = '120';
        this.getEmail = () => {
            return this.email;
        };
        this.setEmail = (email) => {
            this.email = email;
        };
        this.email = email;
        this.age = age;
    }
    static titi() {
        return false;
    }
    setId(id) {
        this.id = id;
    }
};
UserEntity.toto = () => {
    return true;
};
__decorate([
    entity_1.Id(),
    entity_1.PrimaryKey()
], UserEntity.prototype, "id", void 0);
__decorate([
    entity_1.NonPersistent()
], UserEntity.prototype, "createdAt", void 0);
__decorate([
    entity_1.NonPersistent()
], UserEntity.prototype, "someProperty", void 0);
UserEntity = __decorate([
    entity_1.Table('user')
], UserEntity);
exports.default = UserEntity;
