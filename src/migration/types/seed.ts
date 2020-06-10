import MigrationType from './migrationtype';

export default class SeedTable extends MigrationType {
  private tableName: string;
  private rows: SeedRow[] = [];
  private clear = false;
  constructor(tableName: string) {
    super();
    this.tableName = tableName;
  }

  public addRow = () => {
    const row = new SeedRow();
    this.rows.push(row);
    return row;
  };

  public clearTable = () => {
    this.clear = true;
  };

  public formatQuery = () => {
    if (this.clear) {
      return { query: [`DELETE FROM ${this.tableName}`] };
    }
    const seeds = this.rows.map((r) => r.formatRow(this.tableName));
    return {
      seeds,
    };
  };
}

export class SeedRow {
  private datas: RowData[] = [];
  public add = (columnName: string, value: any) => {
    this.datas.push({ value, column: columnName });
    return this;
  };

  public formatRow = (tableName: string) => {
    const columns = this.datas.map((d) => d.column).join(', ');
    const values = this.datas.map((d) => `'${d.value}'`).join(', ');
    return `INSERT INTO ${tableName} (${columns}) VALUES (${values})`;
  };
}

export interface RowData {
  column: string;
  value: any;
}
