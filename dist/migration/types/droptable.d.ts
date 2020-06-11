import MigrationType from './migrationtype';
export default class DropTable extends MigrationType {
    constructor(tableName: string);
    formatQuery: () => {
        query: string[];
    };
}
