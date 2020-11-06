import { Relationship, RelationshipType } from '../types';

import Entity from '../entity';
import EntityManager from '../entitymanager';
import FieldEntity from '../field.entity';
import { FieldType } from '../../migration/field';
import { getField } from './utils';

// tslint:disable-next-line: function-name
export function Table(tableName: string) {
  return <
    T extends {
      ready: boolean;
      create: () => any;
      tableName: string;
      autoCreateNUpdate: boolean;
      new (...args: any[]): Entity;
    }
  >(
    constructor: T,
  ) => {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        constructor.create = () => new constructor();
        constructor.tableName = tableName;
        constructor.ready = true;
        EntityManager.entities.push({ tableName, entity: constructor });
        if (constructor.autoCreateNUpdate) {
          EntityManager.waitingEntities.push(constructor);
        }
      }
    };
  };
}

// tslint:disable-next-line: function-name
export function AutoCreateNUpdate() {
  return <
    T extends {
      autoCreateNUpdate: boolean;
      tableName: string;
      new (...args: any[]): Entity;
    }
  >(
    constructor: T,
  ) => {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
        constructor.autoCreateNUpdate = true;
        if (constructor.tableName) {
          EntityManager.waitingEntities.push(constructor);
        }
      }
    };
  };
}

// tslint:disable-next-line: function-name
export function NonPersistent() {
  return (target: any, key: string) => {
    if (!target.constructor.nonPersistentColumns)
      target.constructor.nonPersistentColumns = [];
    target.constructor.nonPersistentColumns.push(key);
  };
}

// tslint:disable-next-line: function-name
export function Id() {
  return (target: any, key: string) => {
    const field: FieldEntity = getField(target, key);
    if (target.constructor.id) {
      console.error(
        `The entity ${target.constructor.name} has multiple id! This is not allowed!`,
      );
    } else {
      target.constructor.id = field;
    }
  };
}

export interface IFieldConfig {
  name?: string;
  type?:
    | FieldType
    | {
        type: FieldType;
        length: number;
      };
  primary?: boolean;
  nullable?: boolean;
  id?: boolean;
  unique?: boolean;
  autoIncrement?: boolean;
  default?: {
    value: string;
    isSystem?: boolean;
  };
  check?: string;
  relation?: {
    type: RelationshipType;
    entity: string;
    autoFetch?: boolean;
    relationTable?: string;
  };
}

// tslint:disable-next-line: function-name
export function Field(config: IFieldConfig) {
  return (target: any, key: string) => {
    const field: FieldEntity = getField(target, key);
    if (config.type) {
      const type = config.type as any;
      if (type.type && type.length) {
        field.setType(type.type as FieldType);
        field.length(config.type.length);
      } else {
        field.setType(config.type as FieldType);
      }
    }
    if (config.name) field.name(config.name);
    if (config.primary) {
      if (!target.constructor.primaryKeys) target.constructor.primaryKeys = [];
      target.constructor.primaryKeys.push(key);
      field.primary();
    }
    if (config.nullable) field.allowNull();
    if (config.unique) field.unique();
    if (config.autoIncrement) field.autoIncrement;
    if (config.default)
      field.default(config.default.value, config.default.isSystem || false);
    if (config.check) field.check(config.check);
    if (config.relation) {
      const relation: Relationship = {
        autoFetch: config.relation.autoFetch || false,
        entity: config.relation.entity,
        type: config.relation.type,
        data: null,
        fieldName: key,
        relationTable: config.relation.relationTable,
      };
      if (!target.constructor.relations) target.constructor.relations = [];
      target.constructor.relations.push(relation);
    }
    if (config.id) {
      if (target.constructor.id) {
        console.error(
          `The entity ${target.constructor.name} has multiple id! This is not allowed!`,
        );
      } else {
        target.constructor.id = field;
      }
    }
  };
}
