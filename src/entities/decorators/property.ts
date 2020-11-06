import { Relationship } from '../types';
import { getField } from './utils';

// tslint:disable-next-line: function-name
export function FieldName(name: string) {
  return (target: any, key: string) => {
    const field = getField(target, key);
    field.name(name);
  };
}

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
    if (!target.constructor.primaryKeys) target.constructor.primaryKeys = [];
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

// tslint:disable-next-line: function-name
export function ManyToOne(entity: string, autoFetch: boolean = false) {
  return (target: any, key: string) => {
    const relationship: Relationship = {
      entity,
      autoFetch,
      data: null,
      type: 'manytoone',
      fieldName: key,
    };
    if (!target.constructor.relations) target.constructor.relations = [];
    target.constructor.relations.push(relationship);
  };
}

// tslint:disable-next-line: function-name
export function OneToMany(entity: string, autoFetch: boolean = false) {
  return (target: any, key: string) => {
    const relationship: Relationship = {
      entity,
      autoFetch,
      data: null,
      type: 'onetomany',
      fieldName: key,
    };
    if (!target.constructor.relations) target.constructor.relations = [];
    target.constructor.relations.push(relationship);
  };
}

// tslint:disable-next-line: function-name
export function ManyToMany(
  entity: string,
  relationTable: string,
  autoFetch: boolean = false,
) {
  return (target: any, key: string) => {
    const relationship: Relationship = {
      entity,
      autoFetch,
      relationTable,
      data: null,
      type: 'manytomany',
      fieldName: key,
    };
    if (!target.constructor.relations) target.constructor.relations = [];
    target.constructor.relations.push(relationship);
  };
}
