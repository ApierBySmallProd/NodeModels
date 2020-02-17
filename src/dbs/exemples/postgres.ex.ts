import GlobalPostgreModel from '../global/postgres.db';

const config = {
  db: {
    pg: {
      user: '',
      host: '',
      database: '',
      password: '',
      port: 0,
    },
  },
};

export const ConnectDb = async () => {
  await PostgreModel.GetModel().setPool({
    user: config.db.pg.user,
    host: config.db.pg.host,
    database: config.db.pg.database,
    password: config.db.pg.password,
    port: config.db.pg.port,
  });
};

export default class PostgreModel extends GlobalPostgreModel {
  static singleton: PostgreModel | null = null;

  static GetModel = () => {
    if (!PostgreModel.singleton) {
      PostgreModel.singleton = new PostgreModel();
    }
    return PostgreModel.singleton;
  };

  private constructor() {
    super();
  }
}
