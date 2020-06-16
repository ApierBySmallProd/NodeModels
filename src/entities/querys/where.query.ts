import Query, { WhereAttribute, WhereKeyWord, WhereOperator } from './query';

export default abstract class WhereQuery extends Query {
  protected wheres: (WhereAttribute | WhereKeyWord)[] = [];

  public and = () => {
    this.wheres.push({ keyword: 'AND' });
    return this;
  };

  public or = () => {
    this.wheres.push({ keyword: 'OR' });
    return this;
  };

  public not = () => {
    this.wheres.push({ keyword: 'NOT' });
    return this;
  };

  public group = () => {
    this.wheres.push({ keyword: 'STARTGROUP' });
    return this;
  };

  public endGroup = () => {
    this.wheres.push({ keyword: 'ENDGROUP' });
    return this;
  };
}
