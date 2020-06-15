import Query, { WhereAttribute, WhereKeyWord, WhereOperator } from './query';
export default abstract class WhereQuery extends Query {
    protected wheres: (WhereAttribute | WhereKeyWord)[];
    where: (column: string, operator: WhereOperator, value: any) => this;
    and: () => this;
    or: () => this;
    not: () => this;
    group: () => this;
    endGroup: () => this;
}
