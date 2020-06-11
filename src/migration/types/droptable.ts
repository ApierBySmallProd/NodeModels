import MigrationType from './migrationtype';

export default class DropTable extends MigrationType {
  constructor(tableName: string) {
    super(tableName, 'droptable');
  }

  public formatQuery = () => {
    const query = [`DROP TABLE ${this.tableName}`];
    return {
      query,
    };
  };
}
