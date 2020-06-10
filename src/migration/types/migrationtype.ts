export default abstract class MigrationType {
  public abstract formatQuery(): {
    query?: string[];
    constraints?: string[];
    seeds?: string[];
  };
}
