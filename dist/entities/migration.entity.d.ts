import GlobalModel from '../dbs/global/global.db';
export default class MigrationEntity {
    static getAll: (model: GlobalModel) => Promise<any>;
    static create: (model: GlobalModel, name: string) => Promise<any>;
    static delete: (model: GlobalModel, name: string) => Promise<number | undefined>;
    private static canQuery;
    private static checkQuery;
}
