import { Field } from '../../migration/types/createtable';

export function getField(target: any, key: string) {
  if (!target.constructor.columns) target.constructor.columns = [];
  let field = target.constructor.columns.find((f: Field) => f.name === key);
  if (!field) {
    field = new Field(key, 'tinyint');
    target.constructor.columns.push(field);
  }
  return field;
}
