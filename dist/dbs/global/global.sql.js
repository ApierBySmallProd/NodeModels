"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const global_db_1 = __importDefault(require("./global.db"));
class GlobalSqlModel extends global_db_1.default {
    constructor() {
        super(...arguments);
        this.getWhereAttributes = (wheres) => {
            const newWheres = wheres.filter((w) => this.isWhereAttribute(w));
            return newWheres.map((w) => w.value);
        };
        this.computeAttributes = (attributes) => {
            if (!attributes.length)
                return ' *';
            const query = attributes.map((a) => `${a.function
                ? `${this.computeAttributeFunction(a)}(\`${a.attribute}\`)${a.alias ? ` AS ${a.alias}` : ''}`
                : `\`${a.attribute}\`${a.alias ? ` AS ${a.alias}` : ''}`}`);
            return ` ${query}`;
        };
        this.computeWhere = (wheres, keyword, number, name = 'WHERE') => {
            let where = wheres.length ? ` ${name} ` : '';
            const alias = {
                keyword,
                number,
                nb: 0,
            };
            wheres.forEach((w) => {
                if (this.isWhereAttribute(w)) {
                    w = w;
                    where = `${where} ${this.computeWhereAttribute(w, alias)}`;
                }
                else {
                    w = w;
                    where = `${where} ${this.computeWhereKeyWord(w)}`;
                }
            });
            return where;
        };
        this.computeJoins = (joins) => {
            let join = '';
            joins.forEach((j) => {
                join = `${join}${this.getJoinType(j)} \`${j.tableName}\` AS ${j.alias}${this.computeJoinWheres(j.wheres)} `;
            });
            return join;
        };
        this.computeGroupBy = (groups) => {
            const group = groups.length ? ` GROUP BY ${groups.join(', ')}` : '';
            return group;
        };
        this.computeSort = (sorts) => {
            const sortsString = sorts
                .map((s) => `\`${s.attribute}\` ${this.computeSortMode(s)}`)
                .join(', ');
            return sorts.length ? ` ORDER BY ${sortsString}` : '';
        };
        this.computeJoinWheres = (wheres) => {
            let where = wheres.length ? ' ON ' : '';
            wheres.forEach((w) => {
                if (this.isWhereAttribute(w)) {
                    w = w;
                    where = `${where} ${w.column} ${w.operator} ${w.value} `;
                }
                else {
                    w = w;
                    where = `${where} ${this.computeWhereKeyWord(w)}`;
                }
            });
            return where;
        };
        this.getJoinType = (join) => {
            switch (join.method) {
                case 'full':
                    return 'FULL JOIN';
                case 'inner':
                    return 'INNER JOIN';
                case 'left':
                    return 'LEFT JOIN';
                case 'right':
                    return 'RIGHT JOIN';
                default:
                    throw new Error(`Unknown join method ${join.method}`);
            }
        };
        this.computeAttributeFunction = (attribute) => {
            switch (attribute.function) {
                case 'AVG': {
                    return 'AVG';
                }
                case 'COUNT': {
                    return 'COUNT';
                }
                case 'MAX': {
                    return 'MAX';
                }
                case 'MIN': {
                    return 'MIN';
                }
                case 'SUM': {
                    return 'SUM';
                }
                default: {
                    throw new Error(`Unknown function ${attribute.function}`);
                }
            }
        };
        this.computeSortMode = (sort) => {
            switch (sort.mode) {
                case 'ASC': {
                    return 'ASC';
                }
                case 'DESC': {
                    return 'DESC';
                }
                default: {
                    throw new Error(`Unkonwn sort mode ${sort.mode}`);
                }
            }
        };
        this.isWhereAttribute = (where) => {
            return 'operator' in where;
        };
        this.computeWhereAttribute = (attribute, alias) => {
            switch (attribute.operator) {
                case '<': {
                    alias.nb += 1;
                    return `\`${attribute.column}\` < ${alias.keyword}${alias.number ? alias.nb : ''}`;
                }
                case '<=': {
                    alias.nb += 1;
                    return `\`${attribute.column}\` <= ${alias.keyword}${alias.number ? alias.nb : ''}`;
                }
                case '<>': {
                    alias.nb += 1;
                    return `\`${attribute.column}\` <> ${alias.keyword}${alias.number ? alias.nb : ''}`;
                }
                case '=': {
                    alias.nb += 1;
                    return `\`${attribute.column}\` = ${alias.keyword}${alias.number ? alias.nb : ''}`;
                }
                case '>': {
                    alias.nb += 1;
                    return `\`${attribute.column}\` > ${alias.keyword}${alias.number ? alias.nb : ''}`;
                }
                case '>=': {
                    alias.nb += 1;
                    return `\`${attribute.column}\` >= ${alias.keyword}${alias.number ? alias.nb : ''}`;
                }
                case 'BETWEEN': {
                    alias.nb += 2;
                    return `\`${attribute.column}\` BETWEEN ${alias.keyword}${alias.number ? alias.nb : ''} AND ${alias.keyword}${alias.number ? alias.nb : ''}`;
                }
                case 'IN': {
                    return `\`${attribute.column}\` IN (${attribute.value
                        .map(() => {
                        alias.nb += 1;
                        return `${alias.keyword}${alias.number ? alias.nb : ''}`;
                    })
                        .join(', ')})`;
                }
                case 'LIKE': {
                    alias.nb += 1;
                    return `\`${attribute.column}\` LIKE ${alias.keyword}${alias.number ? alias.nb : ''}`;
                }
                default: {
                    throw new Error(`Invalid operator ${attribute.operator}`);
                }
            }
        };
        this.computeWhereKeyWord = (keyword) => {
            switch (keyword.keyword) {
                case 'AND': {
                    return ' AND ';
                }
                case 'OR': {
                    return ' OR ';
                }
                case 'NOT': {
                    return 'NOT';
                }
                case 'STARTGROUP': {
                    return ' ( ';
                }
                case 'ENDGROUP': {
                    return ' ) ';
                }
                default: {
                    throw new Error(`Invalid keyword ${keyword.keyword}`);
                }
            }
        };
    }
}
exports.default = GlobalSqlModel;
