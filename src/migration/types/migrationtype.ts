export default abstract class MigrationType {
  public tableName: string;
  public type: string;
  constructor(tableName: string, type: string) {
    this.tableName = tableName;
    this.type = type;
  }
  public abstract formatQuery(): {
    query?: string[];
    constraints?: string[];
    seeds?: string[];
  };
}
