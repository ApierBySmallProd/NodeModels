import CreateTable from '../migration/types/createtable';
import GlobalModel from '../dbs/global/global.db';

export default class MigrationEntity {
  public static getAll = async (model: GlobalModel) => {
    await MigrationEntity.checkQuery(model);
    return model.select(
      'migrations',
      false,
      [],
      [],
      [
        { attribute: 'migrated_at', mode: 'DESC' },
        { attribute: 'id', mode: 'DESC' },
      ],
      'default_table',
      -1,
      -1,
      [],
      [],
      [],
    );
  };

  public static create = async (model: GlobalModel, name: string) => {
    await MigrationEntity.checkQuery(model);
    return model.insert('migrations', [{ column: 'name', value: name }]);
  };

  public static delete = async (model: GlobalModel, name: string) => {
    await MigrationEntity.checkQuery(model);
    return model.delete('migrations', [
      { column: 'name', operator: '=', value: name },
    ]);
  };

  public static reset = () => {
    MigrationEntity.canQuery = [];
  };

  private static canQuery: GlobalModel[] = [];

  private static checkQuery = async (model: GlobalModel) => {
    if (!MigrationEntity.canQuery.includes(model)) {
      const res = await model.checkMigrationTable();
      if (!res) {
        const createMigrationTable = new CreateTable('migrations');
        createMigrationTable.addField('id', 'bigint').autoIncrement().primary();
        createMigrationTable.addField('name', 'varchar').length(255).unique();
        createMigrationTable
          .addField('migrated_at', 'datetime')
          .default('(DATE(CURRENT_TIMESTAMP))', true);
        await createMigrationTable.execute(model);
      }
      MigrationEntity.canQuery.push(model);
    }
  };
}
