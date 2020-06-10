import MigrationType from './migrationtype';
export default class DropTable extends MigrationType {
    private name;
    constructor(name: string);
    formatQuery: () => {
        query: string[];
    };
}
