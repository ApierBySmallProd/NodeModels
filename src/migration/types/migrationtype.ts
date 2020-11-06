import { GlobalModel } from '../..';

export default abstract class MigrationType {
  public tableName: string;
  public type: string;

  public constructor(tableName: string, type: string) {
    this.tableName = tableName;
    this.type = type;
  }

  public abstract execute(model: GlobalModel): Promise<void>;
}
