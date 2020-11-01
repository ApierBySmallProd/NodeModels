import FieldEntity from '../field.entity';
export function getField(target: any, key: string): FieldEntity {
  if (!target.constructor.columns) target.constructor.columns = [];
  let field = target.constructor.columns.find(
    (f: FieldEntity) => f.key === key,
  );
  if (!field) {
    field = new FieldEntity(key, 'tinyint');
    target.constructor.columns.push(field);
  }
  return field;
}
