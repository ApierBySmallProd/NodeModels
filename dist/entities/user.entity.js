"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const property_1 = require("./decorators/property");
const other_1 = require("./decorators/other");
const fieldtype_1 = require("./decorators/fieldtype");
const entity_1 = __importDefault(require("./entity"));
const entitymanager_1 = __importDefault(require("./entitymanager"));
let UserEntity = class UserEntity extends entity_1.default {
    constructor(firstname, lastname, email, birthDate) {
        super();
        this.id = -1;
        this.articles = [];
        this.addArticle = (article) => {
            this.articles.push(article);
        };
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.birthDate = birthDate;
        this.age = 0;
    }
};
__decorate([
    other_1.Id(),
    property_1.PrimaryKey(),
    property_1.AutoIncrement(),
    fieldtype_1.BigInt()
], UserEntity.prototype, "id", void 0);
__decorate([
    fieldtype_1.Varchar(50)
], UserEntity.prototype, "firstname", void 0);
__decorate([
    fieldtype_1.Varchar(50)
], UserEntity.prototype, "lastname", void 0);
__decorate([
    fieldtype_1.Varchar(50),
    property_1.Unique()
], UserEntity.prototype, "email", void 0);
__decorate([
    fieldtype_1.Date(),
    property_1.AllowNull()
], UserEntity.prototype, "birthDate", void 0);
__decorate([
    other_1.NonPersistent()
], UserEntity.prototype, "age", void 0);
__decorate([
    property_1.ManyToMany('article', true)
], UserEntity.prototype, "articles", void 0);
UserEntity = __decorate([
    other_1.Table('user'),
    other_1.AutoCreateNUpdate()
], UserEntity);
exports.default = UserEntity;
entitymanager_1.default.registerEntity(UserEntity);
