import Query, { WhereAttribute, WhereKeyWord } from './query';
export default abstract class WhereQuery extends Query {
    protected wheres: (WhereAttribute | WhereKeyWord)[];
    and: () => this;
    or: () => this;
    not: () => this;
    group: () => this;
    endGroup: () => this;
}
