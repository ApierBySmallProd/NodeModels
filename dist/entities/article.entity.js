"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const other_1 = require("./decorators/other");
const property_1 = require("./decorators/property");
const fieldtype_1 = require("./decorators/fieldtype");
const entity_1 = __importDefault(require("./entity"));
const entitymanager_1 = __importDefault(require("./entitymanager"));
let ArticleEntity = class ArticleEntity extends entity_1.default {
    constructor(title, publishedAt, category) {
        super();
        this.id = 0;
        this.authors = [];
        this.category = null;
        this.fetchAuthors = () => __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch('authors');
        });
        this.fetchCategory = () => __awaiter(this, void 0, void 0, function* () {
            return yield this.fetch('category');
        });
        this.title = title;
        this.publishedAt = publishedAt;
        this.category = category;
    }
};
__decorate([
    other_1.Id(),
    property_1.PrimaryKey(),
    fieldtype_1.BigInt(),
    property_1.AutoIncrement()
], ArticleEntity.prototype, "id", void 0);
__decorate([
    fieldtype_1.Varchar(50)
], ArticleEntity.prototype, "title", void 0);
__decorate([
    fieldtype_1.Date()
], ArticleEntity.prototype, "publishedAt", void 0);
__decorate([
    property_1.ManyToMany('user', true)
], ArticleEntity.prototype, "authors", void 0);
__decorate([
    property_1.ManyToOne('category')
], ArticleEntity.prototype, "category", void 0);
ArticleEntity = __decorate([
    other_1.Table('article'),
    other_1.AutoCreateNUpdate()
], ArticleEntity);
exports.default = ArticleEntity;
entitymanager_1.default.registerEntity(ArticleEntity);
