import Query from './query';
export default class UpdateQuery extends Query {
    private attributes;
    private wheres;
    setAttribute: (column: string, value: any) => this;
    where: (column: string, value: any) => this;
    exec: (dbName?: string | null) => Promise<number | undefined>;
}
