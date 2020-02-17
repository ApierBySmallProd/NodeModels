import { Pool, PoolConfig, PoolClient, QueryResult } from 'pg';

const getPool = async (config: PoolConfig): Promise<PoolClient | null> => {
  try {
    const pool = new Pool(config);
    pool.on('error', err => {
      console.error('Unexpected error on postgre database', err);
      process.exit(-1);
    });
    const client = await pool.connect();
    return client;
  } catch (err) {
    console.error('Unexpected error on postgre database', err);
    process.exit(-1);
    return null;
  }
};

export default class GlobalPostgreModel {
  pool: PoolClient | null = null;

  query = async (
    query: string,
    params?: string[],
  ): Promise<QueryResult | null> => {
    if (!this.pool) return null;
    try {
      return await this.pool.query(query, params);
    } catch (err) {
      return null;
    }
  };

  setPool = async (config: PoolConfig) => {
    const p = await getPool(config);
    if (p) {
      this.pool = p;
    }
  };
}
