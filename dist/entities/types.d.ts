export interface Relationship {
    entity: any;
    type: 'manytomany' | 'manytoone' | 'onetomany';
    data: any;
    fieldName: string;
    autoFetch: boolean;
}
