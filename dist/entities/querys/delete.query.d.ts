import { WhereOperator } from './query';
import WhereQuery from './where.query';
export default class DeleteQuery extends WhereQuery {
    where: (column: string, operator: WhereOperator, value: any) => this;
    exec: (dbName?: string | null) => Promise<number | undefined>;
}
