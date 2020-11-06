import { GlobalModel } from '../..';
import MigrationType from './migrationtype';

export default class SeedTable extends MigrationType {
  private rows: SeedRow[] = [];
  private clear = false;

  public constructor(tableName: string) {
    super(tableName, 'seed');
  }

  public addRow = () => {
    const row = new SeedRow();
    this.rows.push(row);
    return row;
  };

  public clearTable = () => {
    this.clear = true;
  };

  public execute = async (model: GlobalModel) => {
    if (this.clear) {
      await model.delete(this.tableName, []);
    } else {
      await this.rows.reduce(async (prev, cur) => {
        await prev;
        const attributes = cur.getData();
        await model.insert(this.tableName, attributes);
      }, Promise.resolve());
    }
  };
}

export class SeedRow {
  private data: RowData[] = [];
  public add = (columnName: string, value: any) => {
    this.data.push({ value, column: columnName });
    return this;
  };

  public getData = () => this.data;
}

export interface RowData {
  column: string;
  value: any;
}
