import Query from './query';
export default class DeleteQuery extends Query {
    private wheres;
    where: (column: string, value: any) => this;
    exec: (dbName?: string | null) => Promise<number | undefined>;
}
