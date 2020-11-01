import { AttributeFunction, WhereAttribute, WhereKeyWord, WhereOperator } from './query';
import WhereQuery from './where.query';
export default class FindQuery extends WhereQuery {
    private attributes;
    private sorts;
    private isDistinct;
    private lim;
    private offset;
    private tableAlias;
    private afterExec;
    private joins;
    private groups;
    private havings;
    constructor(tableName: string, afterExec?: (res: any[]) => any);
    where: (column: string, operator: WhereOperator, value: any) => this;
    limit: (limit: number, offset?: number) => this;
    join: (table: string, alias: string) => Join;
    distinct: () => this;
    alias: (alias: string) => this;
    addAttribute: (attr: string, alias?: string, func?: AttributeFunction | null) => this;
    addAttributes: (attr: string[]) => this;
    sort: (attr: string, method?: 'ASC' | 'DESC') => this;
    groupBy: (column: string) => this;
    having: (column: string, operator: WhereOperator, value: string) => Having;
    exec: (dbName?: string | null) => Promise<any>;
}
export declare class Join extends WhereQuery {
    alias: string;
    method: 'inner' | 'left' | 'right' | 'full';
    private query;
    constructor(tableName: string, alias: string, query: FindQuery);
    on: (column: string, operator: WhereOperator, value: string) => this;
    endJoin: () => FindQuery;
    left: () => this;
    right: () => this;
    full: () => this;
    getInterface: () => IJoin;
}
export interface IJoin {
    alias: string;
    tableName: string;
    method: 'inner' | 'left' | 'right' | 'full';
    wheres: (WhereAttribute | WhereKeyWord)[];
}
export declare class Having extends WhereQuery {
    private query;
    constructor(query: FindQuery);
    having: (column: string, operator: WhereOperator, value: string) => this;
    endHaving: () => FindQuery;
    getWheres: () => (WhereAttribute | WhereKeyWord)[];
}
