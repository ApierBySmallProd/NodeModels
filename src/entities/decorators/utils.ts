import { Field } from '../../migration/types/createtable';

export const getField = (target: any, key: string): Field => {
  let field = target.constructor.columns.find((f: Field) => f.name === key);
  if (!field) {
    field = new Field(key, 'tinyint');
    target.constructor.columns.push(field);
  }
  return field;
};
