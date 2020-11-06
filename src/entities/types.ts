export type RelationshipType = 'manytomany' | 'manytoone' | 'onetomany';
export interface Relationship {
  entity: any;
  type: RelationshipType;
  data: any;
  fieldName: string;
  autoFetch: boolean;
  relationTable?: string;
}
