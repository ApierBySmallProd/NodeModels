export default abstract class MigrationType {
    abstract formatQuery(): {
        query?: string[];
        constraints?: string[];
        seeds?: string[];
    };
}
