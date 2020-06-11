export default abstract class MigrationType {
    tableName: string;
    type: string;
    constructor(tableName: string, type: string);
    abstract formatQuery(): {
        query?: string[];
        constraints?: string[];
        seeds?: string[];
    };
}
