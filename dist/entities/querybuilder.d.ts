export declare type QueryMethod = 'create' | 'update' | 'delete' | 'find';
export default class QueryBuilder {
    private method;
    private tableName;
    private wheres;
    constructor(method: QueryMethod, tableName: string);
    where: (column: string, value: any) => this;
    exec: () => void;
}
export interface Where {
    column: string;
    value: any;
}
