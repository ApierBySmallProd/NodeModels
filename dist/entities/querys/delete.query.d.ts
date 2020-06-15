import WhereQuery from './where.query';
export default class DeleteQuery extends WhereQuery {
    exec: (dbName?: string | null) => Promise<number | undefined>;
}
