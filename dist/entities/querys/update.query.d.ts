import WhereQuery from './where.query';
export default class UpdateQuery extends WhereQuery {
    private attributes;
    setAttribute: (column: string, value: any) => this;
    exec: (dbName?: string | null) => Promise<number | undefined>;
}
