import MigrationType from './migrationtype';

export default class DropTable extends MigrationType {
  private name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public formatQuery = () => {
    const query = [`DROP TABLE ${this.name}`];
    return {
      query,
    };
  };
}
