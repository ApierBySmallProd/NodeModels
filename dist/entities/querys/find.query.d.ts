import Query, { WhereOperator } from './query';
export default class FindQuery extends Query {
    private attributes;
    private wheres;
    private sorts;
    private isDistinct;
    private lim;
    private offset;
    private afterExec;
    constructor(tableName: string, afterExec?: (res: any[]) => any);
    limit: (limit: number, offset?: number) => this;
    join: (table: string, alias: string) => this;
    where: (column: string, operator: WhereOperator, value: any) => this;
    distinct: () => this;
    addAttribute: (attr: string, alias?: string, func?: "MIN" | "MAX" | "COUNT" | "AVG" | "SUM" | null) => this;
    addAttributes: (attr: string[]) => this;
    and: () => this;
    or: () => this;
    not: () => this;
    group: () => this;
    endGroup: () => this;
    sort: (attr: string, method?: "ASC" | "DESC") => this;
    exec: (dbName?: string | null) => Promise<any>;
}
