import GlobalMariaModel from '../global/maria.db';

const config = {
  db: {
    maria: {
      user: '',
      host: '',
      database: '',
      password: '',
      port: 0,
    },
  },
};

export const ConnectDb = async () => {
  await MariaModel.GetModel().setPool({
    user: config.db.maria.user,
    host: config.db.maria.host,
    database: config.db.maria.database,
    password: config.db.maria.password,
    port: config.db.maria.port,
  });
};

export default class MariaModel extends GlobalMariaModel {
  static singleton: MariaModel | null = null;

  static GetModel = () => {
    if (!MariaModel.singleton) {
      MariaModel.singleton = new MariaModel();
    }
    return MariaModel.singleton;
  };

  private constructor() {
    super();
  }
}
