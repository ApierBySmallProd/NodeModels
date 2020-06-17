import GlobalModel from '../dbs/global/global.db';

export default class MigrationEntity {
  public static getAll = async (model: GlobalModel) => {
    await MigrationEntity.checkQuery(model);
    return model.select(
      'migration',
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
    return model.insert('migration', [{ column: 'name', value: name }]);
  };

  public static delete = async (model: GlobalModel, name: string) => {
    await MigrationEntity.checkQuery(model);
    return model.delete('migration', [
      { column: 'name', operator: '=', value: name },
    ]);
  };

  private static canQuery = false;

  private static checkQuery = async (model: GlobalModel) => {
    if (!MigrationEntity.canQuery) {
      const res = await model.query(
        'SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = "migration"',
      ); // ! TODO make this platform independent
      if (!res || !res.length) {
        await model.query(
          'CREATE TABLE `migration` (id BIGINT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE, migrated_at DATETIME DEFAULT NOW())',
        ); // ! TODO this as well
      }
    }
    MigrationEntity.canQuery = true;
  };
}
