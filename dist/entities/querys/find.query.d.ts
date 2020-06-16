import { WhereOperator } from './query';
import WhereQuery from './where.query';
export default class FindQuery extends WhereQuery {
    private attributes;
    private sorts;
    private isDistinct;
    private lim;
    private offset;
    private tableAlias;
    private afterExec;
    constructor(tableName: string, afterExec?: (res: any[]) => any);
    where: (column: string, operator: WhereOperator, value: any) => this;
    limit: (limit: number, offset?: number) => this;
    join: (table: string, alias: string) => Join;
    distinct: () => this;
    alias: (alias: string) => this;
    addAttribute: (attr: string, alias?: string, func?: "MIN" | "MAX" | "COUNT" | "AVG" | "SUM" | null) => this;
    addAttributes: (attr: string[]) => this;
    sort: (attr: string, method?: "ASC" | "DESC") => this;
    exec: (dbName?: string | null) => Promise<any>;
}
export declare class Join extends WhereQuery {
    alias: string;
    method: string;
    private query;
    constructor(tableName: string, alias: string, query: FindQuery);
    on: (column: string, operator: WhereOperator, value: string) => this;
    endJoin: () => FindQuery;
    left: () => this;
    right: () => this;
    full: () => this;
}
