import { Field, FieldType } from './createtable';
import MigrationType from './migrationtype';
export default class AlterTable extends MigrationType {
    private addedFields;
    private removedFields;
    private tableName;
    constructor(tableName: string);
    addField: (fieldName: string, fieldType: FieldType) => Field;
    removeField: (fieldName: string) => void;
    formatQuery: () => {
        query: string[];
    };
}
