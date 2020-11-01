import { Field, FieldType } from '../field';
import AlterTable from './altertable';
import MigrationType from './migrationtype';
export default class CreateTable extends MigrationType {
    fields: Field[];
    constructor(tableName: string);
    addField: (name: string, type: FieldType) => Field;
    formatQuery: () => {
        query: string[];
        constraints: string[];
    };
    applyMigration: (migration: MigrationType) => void;
    compareSchema: (schema: CreateTable) => AlterTable | CreateTable | null;
    generateMigrationFile: (name: string) => string;
    getName: () => string;
}
