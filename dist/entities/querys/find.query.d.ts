import WhereQuery from './where.query';
export default class FindQuery extends WhereQuery {
    private attributes;
    private sorts;
    private isDistinct;
    private lim;
    private offset;
    private afterExec;
    constructor(tableName: string, afterExec?: (res: any[]) => any);
    limit: (limit: number, offset?: number) => this;
    join: (table: string, alias: string) => this;
    distinct: () => this;
    addAttribute: (attr: string, alias?: string, func?: "MIN" | "MAX" | "COUNT" | "AVG" | "SUM" | null) => this;
    addAttributes: (attr: string[]) => this;
    sort: (attr: string, method?: "ASC" | "DESC") => this;
    exec: (dbName?: string | null) => Promise<any>;
}
