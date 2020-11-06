import { DbManager, Dbms } from '../..';

export interface DBConfig {
  dbms: Dbms;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  name: string;
}

const mariaConfig: DBConfig = {
  dbms: 'mariadb',
  database: 'test',
  host: '127.0.0.1',
  user: 'test',
  password: 'secret',
  port: 3306,
  name: 'maria',
};

const mysqlConfig: DBConfig = {
  dbms: 'mariadb',
  database: 'test',
  host: '127.0.0.1',
  user: 'root',
  password: 'secret123',
  port: 3307,
  name: 'mysql',
};

const postgresConfig: DBConfig = {
  dbms: 'postgre',
  database: 'test',
  host: '127.0.0.1',
  user: 'postgres',
  password: 'secret',
  port: 5432,
  name: 'postgres',
};

const mssqlConfig: DBConfig = {
  dbms: 'mssql',
  database: 'test',
  host: '127.0.0.1',
  user: 'SA',
  password: 'secret123',
  port: 1433,
  name: 'mssql',
};

export default {
  mariaConfig,
  mysqlConfig,
  postgresConfig,
  mssqlConfig,
};

export const addDatabases = async (dbManager: DbManager) => {
  await dbManager.add(
    mariaConfig.dbms,
    mariaConfig.host,
    mariaConfig.port,
    mariaConfig.user,
    mariaConfig.password,
    mariaConfig.database,
    'maria',
    true,
  );
  await dbManager.add(
    mysqlConfig.dbms,
    mysqlConfig.host,
    mysqlConfig.port,
    mysqlConfig.user,
    mysqlConfig.password,
    mysqlConfig.database,
    'mysql',
    true,
  );
  await dbManager.add(
    postgresConfig.dbms,
    postgresConfig.host,
    postgresConfig.port,
    postgresConfig.user,
    postgresConfig.password,
    postgresConfig.database,
    'postgres',
    true,
  );
  // await dbManager.add(
  //   mssqlConfig.dbms,
  //   mssqlConfig.host,
  //   mssqlConfig.port,
  //   mssqlConfig.user,
  //   mssqlConfig.password,
  //   mssqlConfig.database,
  //   'mssql',
  // );
};
