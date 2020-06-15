import { Field, FieldType } from './createtable';
import MigrationType from './migrationtype';
export default class AlterTable extends MigrationType {
    addedFields: Field[];
    removedFields: string[];
    constructor(tableName: string);
    addField: (fieldName: string, fieldType: FieldType) => Field;
    removeField: (fieldName: string) => void;
    formatQuery: () => {
        query: string[];
        constraints: string[];
    };
    generateMigrationFile: (name: string) => string;
    getName: () => string;
}
