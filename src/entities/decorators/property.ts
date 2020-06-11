import { getField } from './utils';

// tslint:disable-next-line: function-name
export function Unique() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.unique();
  };
}

// tslint:disable-next-line: function-name
export function AllowNull() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.allowNull();
  };
}

// tslint:disable-next-line: function-name
export function AutoIncrement() {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.autoIncrement();
  };
}

// tslint:disable-next-line: function-name
export function PrimaryKey() {
  return (target: any, key: string) => {
    target.constructor.primaryKeys.push(key);
    const field = getField(target, key);
    field.primary();
  };
}

// tslint:disable-next-line: function-name
export function Default(value: string, isSystem: boolean = false) {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.default(value, isSystem);
  };
}

// tslint:disable-next-line: function-name
export function Check(value: string) {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.check(value);
  };
}
