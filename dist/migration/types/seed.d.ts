import MigrationType from './migrationtype';
export default class SeedTable extends MigrationType {
    private rows;
    private clear;
    constructor(tableName: string);
    addRow: () => SeedRow;
    clearTable: () => void;
    formatQuery: () => {
        query: string[];
        seeds?: undefined;
    } | {
        seeds: string[];
        query?: undefined;
    };
}
export declare class SeedRow {
    private datas;
    add: (columnName: string, value: any) => this;
    formatRow: (tableName: string) => string;
}
export interface RowData {
    column: string;
    value: any;
}
