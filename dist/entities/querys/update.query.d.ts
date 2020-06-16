import { WhereOperator } from './query';
import WhereQuery from './where.query';
export default class UpdateQuery extends WhereQuery {
    private attributes;
    where: (column: string, operator: WhereOperator, value: any) => this;
    setAttribute: (column: string, value: any) => this;
    exec: (dbName?: string | null) => Promise<number | undefined>;
}
