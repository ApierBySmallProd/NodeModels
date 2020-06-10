import Query from './query';
export default class CreateQuery extends Query {
    private attributes;
    setAttribute: (column: string, value: any) => this;
    exec: (dbName?: string | null) => Promise<any>;
}
