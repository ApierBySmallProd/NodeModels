import { DefaultValue, Field, FieldType, ForeignKey } from '../migration/field';
export default class FieldEntity {
    key: string;
    type: FieldType;
    fieldName: string;
    isUnique: boolean;
    isAutoIncremented: boolean;
    isNullAllowed: boolean;
    isPrimary: boolean;
    checkConstraint: string | null;
    defaultConstraint: DefaultValue | null;
    foreignKey: ForeignKey | null;
    fieldLength: number;
    constructor(key: string, type: FieldType);
    length: (length: number) => void;
    setType: (type: FieldType) => void;
    name: (name: string) => void;
    unique: () => void;
    autoIncrement: () => void;
    allowNull: () => void;
    primary: () => void;
    default: (value: string, isSystem: boolean) => void;
    check: (check: string) => void;
    foreign: (table: string, column: string) => void;
    convertToMigrationField: () => Field;
}
