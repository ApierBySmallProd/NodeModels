import EntityManager, { Context } from './entitymanager';

import CreateQuery from './querys/create.query';
import DeleteQuery from './querys/delete.query';
import { Field } from '../migration/types/createtable';
import FindQuery from './querys/find.query';
import { Relationship } from './types';
import UpdateQuery from './querys/update.query';

export default abstract class Entity {
  public static tableName: string;
  public static columns: Field[];
  public static nonPersistentColumns: string[];
  public static primaryKeys: string[];
  public static id: string;
  public static autoCreateNUpdate: boolean;
  public static initialized: boolean;
  public static ready: boolean;
  public static relations: Relationship[];

  public static create = (): any => {
    /**/
  };

  public static findOne(context?: Context) {
    const query = new FindQuery(this.tableName, async (res: any[]) => {
      if (res.length) {
        return await this.generateEntity(res[0], context);
      }
      return null;
    });
    query.limit(1);
    return query;
  }

  public static findMany(context?: Context) {
    const query = new FindQuery(this.tableName, async (res: any[]) => {
      const result: Entity[] = [];
      await res.reduce(async (prev: any, r: any) => {
        await prev;
        result.push(await this.generateEntity(r, context));
      }, Promise.resolve());
      return result;
    });
    return query;
  }

  public static async findById(id: any, context?: Context) {
    if (!this.id) throw new Error('No id specified');
    const entity = EntityManager.findEntity(this.tableName, id);
    if (entity) return entity;
    const query = new FindQuery(this.tableName);
    query.where(this.id, '=', id);
    const res = await query.exec();
    if (res.length) {
      return await this.generateEntity(res[0], context);
    }
    return null;
  }

  public static async deleteById(id: any) {
    const query = new DeleteQuery(this.tableName);
    if (!this.id) throw new Error('No id specified');
    query.where(this.id, '=', id);
    return await query.exec();
  }

  public static delete() {
    const query = new DeleteQuery(this.tableName);
    return query;
  }

  private static async generateEntity(res: any, context?: Context) {
    const newObj: any = this.create();
    newObj.persisted = true;
    for (const [key, value] of Object.entries(res)) {
      const field: Field | undefined = this.columns.find(
        (f: Field) => f.name === key,
      );
      if (field) {
        switch (field.getType()) {
          case 'date':
          case 'datetime':
          case 'timestamp':
          case 'time':
            newObj[key] = new Date(value as any);
            break;
          default:
            newObj[key] = value;
        }
      } else {
        newObj[key] = value;
      }
    }
    const entity = EntityManager.findEntity(
      newObj.constructor.tableName,
      newObj[newObj.constructor.id],
      context,
    );
    if (entity) {
      return entity;
    }
    EntityManager.addEntity(newObj, context);
    await this.relations.reduce(async (prev: any, cur: Relationship) => {
      await prev;
      if (cur.autoFetch) {
        const relationEntity = EntityManager.entities.find(
          (e) => e.tableName === cur.entity,
        );
        if (relationEntity) {
          const ent: typeof Entity = relationEntity.entity;
          switch (cur.type) {
            case 'manytomany': {
              const relationTable = EntityManager.manyToManyTables.find(
                (m) =>
                  (m.table1 === this.tableName && m.table2 === cur.entity) ||
                  (m.table1 === cur.entity && m.table2 === this.tableName),
              );
              if (relationTable) {
                const relations = await new FindQuery(
                  relationTable.relationTable,
                )
                  .where(`${this.tableName}_id`, '=', res[this.id])
                  .exec();
                if (relations && relations.length) {
                  newObj.relations.push({
                    entity: cur.entity,
                    data: relations,
                  });
                  newObj[cur.fieldName] = await ent
                    .findMany(context)
                    .where(
                      ent.id,
                      'IN',
                      relations.map((r: any) => r[`${ent.tableName}_id`]),
                    )
                    .exec();
                } else {
                  newObj[cur.fieldName] = [];
                }
              }
              break;
            }
            case 'manytoone': {
              if (res[`${cur.entity}_id`]) {
                newObj[cur.fieldName] = await ent.findById(
                  res[`${cur.entity}_id`],
                  context,
                );
              }
              break;
            }
            case 'onetomany': {
              newObj[cur.fieldName] = await ent
                .findMany(context)
                .where(`${this.tableName}_id`, '=', res[this.id])
                .exec();
              break;
            }
            default:
          }
        }
      }
    }, Promise.resolve());
    return newObj;
  }

  public persisted = false;
  public relations: any[] = [];

  public create = async (dbName: string | null = null, context?: Context) => {
    const base = this as any;
    const query = new CreateQuery(base.constructor.tableName);
    const nonPersistentColumns: string[] =
      base.constructor.nonPersistentColumns ?? [];
    const primaryKeys: string[] = base.constructor.primaryKeys ?? [];
    for (const [key, value] of Object.entries(this)) {
      if (
        !nonPersistentColumns.includes(key) &&
        !primaryKeys.includes(key) &&
        !(base[key] instanceof Array) &&
        typeof base[key] !== 'function' &&
        key !== 'persisted'
      ) {
        if (typeof base[key] !== 'object' || typeof base[key] === null) {
          query.setAttribute(key, value);
        } else if (base[key] instanceof Date) {
          const field: Field = base.constructor.columns.find(
            (f: Field) => f.name === key,
          );
          if (field) {
            const d = value as Date;
            let formattedD = '';
            switch (field.getType()) {
              case 'date': {
                formattedD = `${d.getFullYear()}-${
                  d.getMonth() + 1
                }-${d.getDate()}`;
                break;
              }
              case 'datetime': {
                formattedD = `${d.getFullYear()}-${
                  d.getMonth() + 1
                }-${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                break;
              }
              case 'timestamp': {
                formattedD = d.getTime().toString();
                break;
              }
              case 'time': {
                formattedD = `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
                break;
              }
              default: {
                formattedD = '';
              }
            }
            if (formattedD) {
              query.setAttribute(key, formattedD);
            }
          }
        }
      }
    }
    const manyToManyQueries: CreateQuery[] = [];
    base.constructor.relations.forEach((relation: Relationship) => {
      if (base[relation.fieldName]) {
        switch (relation.type) {
          case 'manytomany':
            const rel = this.relations.find(
              (r: any) => r.entity === relation.entity,
            );
            const relData = rel ? rel.data : [];
            const relationTable = EntityManager.manyToManyTables.find(
              (m) =>
                (m.table1 === base.constructor.tableName &&
                  m.table2 === relation.entity) ||
                (m.table1 === relation.entity &&
                  m.table2 === base.constructor.tableName),
            );
            if (relationTable) {
              base[relation.fieldName].forEach((elem: any) => {
                if (
                  elem.persisted &&
                  !relData.includes(elem[elem.constructor.id])
                ) {
                  const manyToManyQuery = new CreateQuery(
                    relationTable.relationTable,
                  );
                  manyToManyQuery.setAttribute(
                    `${elem.constructor.tableName}_id`,
                    elem[elem.constructor.id],
                  );
                  manyToManyQueries.push(manyToManyQuery);
                }
              });
            }
            break;
          case 'manytoone':
            if (base[relation.fieldName].persisted) {
              query.setAttribute(
                `${relation.fieldName}_id`,
                base[relation.fieldName][
                  base[relation.fieldName].constructor.id
                ],
              );
            }
            break;
          case 'onetomany':
            break;
          default:
        }
      }
    });
    const res = await query.exec(dbName);
    if (res) {
      if (base.constructor.id) {
        this.persisted = true;
        base[base.constructor.id] = res;
        EntityManager.addEntity(this, context);
        await manyToManyQueries.reduce(async (prev: any, cur: CreateQuery) => {
          await prev;
          cur.setAttribute(
            `${base.constructor.tableName}_id`,
            base[base.constructor.id],
          );
          await cur.exec();
        }, Promise.resolve());
      }
      return this;
    }
    return null;
  };

  public update = async (dbName: string | null = null) => {
    const base = this as any;
    const query = new UpdateQuery(base.constructor.tableName); // TODO fix this
    const nonPersistentColumns: string[] =
      base.constructor.nonPersistentColumns ?? [];
    const primaryKeys: string[] = base.constructor.primaryKeys ?? [];
    for (const [key, value] of Object.entries(this)) {
      if (
        !nonPersistentColumns.includes(key) &&
        !primaryKeys.includes(key) &&
        !(base[key] instanceof Array) &&
        (typeof base[key] !== 'object' || typeof base[key] === null) &&
        typeof base[key] !== 'function' &&
        key !== 'persisted'
      ) {
        query.setAttribute(key, value);
      }
    }
    if (base.constructor.id) {
      query.where(base.constructor.id, '=', base[base.constructor.id]);
    } else {
      throw new Error('No specified id');
    }
    await base.constructor.relations.reduce(
      async (prev: any, relation: Relationship) => {
        await prev;
        console.log(relation);
        console.log(base);
        if (base[relation.fieldName]) {
          switch (relation.type) {
            case 'manytomany': {
              const rel = this.relations.find(
                (r: any) => r.entity === relation.entity,
              );
              const relData = rel ? rel.data : [];
              const relationTable = EntityManager.manyToManyTables.find(
                (m) =>
                  (m.table1 === base.constructor.tableName &&
                    m.table2 === relation.entity) ||
                  (m.table1 === relation.entity &&
                    m.table2 === base.constructor.tableName),
              );
              console.log(EntityManager.manyToManyTables);
              console.log(relationTable);
              if (relationTable) {
                await base[relation.fieldName].reduce(
                  async (previous: any, elem: any) => {
                    await previous;
                    if (
                      elem.persisted &&
                      !relData.includes(elem[elem.constructor.id])
                    ) {
                      const manyToManyQuery = new CreateQuery(
                        relationTable.relationTable,
                      );
                      manyToManyQuery.setAttribute(
                        `${elem.constructor.tableName}_id`,
                        elem[elem.constructor.id],
                      );
                      manyToManyQuery.setAttribute(
                        `${base.constructor.tableName}_id`,
                        base[base.constructor.id],
                      );
                      await manyToManyQuery.exec();
                    }
                  },
                  Promise.resolve(),
                );
              }
              break;
            }
            case 'manytoone':
              if (base[relation.fieldName].persisted) {
                query.setAttribute(
                  `${relation.entity}_id`,
                  base[relation.fieldName][
                    base[relation.fieldName].constructor.id
                  ],
                );
              }
              break;
            case 'onetomany':
              break;
            default:
          }
        }
      },
      Promise.resolve(),
    );
    const res = await query.exec(dbName);
    if (res) {
      return this;
    }
    return null;
  };

  public delete = async (dbName: string | null = null, context?: Context) => {
    const base = this as any;
    const query = new DeleteQuery(base.constructor.tableName); // TODO fix this
    if (!base.constructor.id) {
      throw new Error('No id specified');
    }
    query.where(base.constructor.id, '=', base[base.constructor.id]);
    const res = await query.exec(dbName);
    if (res) {
      EntityManager.removeEntity(this, context);
      return true;
    }
    return false;
  };

  public fetch = async (field: string, context?: Context) => {
    const base = this as any;
    const relation: Relationship = base.constructor.relations.find(
      (r: Relationship) => r.fieldName === field,
    );
    if (relation) {
      const rel = EntityManager.entities.find(
        (e) => e.tableName === relation.entity,
      );
      if (rel) {
        const ent: typeof Entity = rel.entity;
        switch (relation.type) {
          case 'manytomany': {
            const relationTable = EntityManager.manyToManyTables.find(
              (m) =>
                (m.table1 === base.constructor.tableName &&
                  m.table2 === relation.entity) ||
                (m.table1 === relation.entity &&
                  m.table2 === base.constructor.tableName),
            );
            if (relationTable) {
              const relations = await new FindQuery(relationTable.relationTable)
                .where(
                  `${base.constructor.tableName}_id`,
                  '=',
                  base[base.constructor.id],
                )
                .exec();
              if (relations && relations.length) {
                this.relations.push({
                  entity: relation.entity,
                  data: relations,
                });
                base[relation.fieldName] = await ent
                  .findMany(context)
                  .where(
                    ent.id,
                    'IN',
                    relations.map((r: any) => r[`${ent.tableName}_id`]),
                  )
                  .exec();
              } else {
                base[field] = [];
              }
            }
            break;
          }
          case 'manytoone': {
            if (base[`${relation.entity}_id`]) {
              base[field] = await ent.findById(
                base[`${relation.entity}_id`],
                context,
              );
            }
            break;
          }
          case 'onetomany': {
            base[field] = await ent
              .findMany(context)
              .where(
                `${base.constructor.tableName}_id`,
                '=',
                base[base.constructor.id],
              )
              .exec();
            break;
          }
          default:
        }
      }
    }
  };
}
