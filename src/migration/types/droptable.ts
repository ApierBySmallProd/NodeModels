import { GlobalModel } from '../..';
import MigrationType from './migrationtype';

export default class DropTable extends MigrationType {
  public constructor(tableName: string) {
    super(tableName, 'droptable');
  }

  public execute = async (model: GlobalModel) => {
    await model.removeTable(this.tableName);
  };
}
