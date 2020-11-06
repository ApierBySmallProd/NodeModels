import EntityManager, { Context } from './entitymanager';

import CreateQuery from './querys/create.query';
import DeleteQuery from './querys/delete.query';
import FieldEntity from './field.entity';
import FindQuery from './querys/find.query';
import { Relationship } from './types';
import UpdateQuery from './querys/update.query';

export default class Entity {
  public static tableName: string;
  public static dbName?: string;
  public static columns: FieldEntity[];
  public static nonPersistentColumns: string[];
  public static primaryKeys: string[];
  public static id: FieldEntity | null;
  public static autoCreateNUpdate: boolean;
  public static initialized = false;
  public static ready: boolean;
  public static relations: Relationship[];

  public static create = (): any => {
    /**/
  };

  public static findOne(context?: Context) {
    const query = new FindQuery(
      this.tableName,
      async (res: any[]) => {
        if (res.length) {
          return await this.generateEntity(res[0], context);
        }
        return null;
      },
      this.dbName,
    );
    query.limit(1);
    return query;
  }

  public static findMany(context?: Context, dbName?: string) {
    const query = new FindQuery(
      this.tableName,
      async (res: any[]) => {
        const result: Entity[] = [];
        await res.reduce(async (prev: any, r: any) => {
          await prev;
          result.push(await this.generateEntity(r, context, dbName));
        }, Promise.resolve());
        return result;
      },
      this.dbName,
    );
    return query;
  }

  public static async findById(id: any, context?: Context, dbName?: string) {
    if (!this.id) throw new Error('No id specified');
    const entity = EntityManager.findEntity(this.tableName, id);
    if (entity) return entity;
    const query = new FindQuery(this.tableName);
    query.where(this.id.fieldName, '=', id);
    const res = await query.exec(dbName);
    if (res.length) {
      return await this.generateEntity(res[0], context, dbName);
    }
    return null;
  }

  public static async deleteById(id: any, context?: Context, dbName?: string) {
    const query = new DeleteQuery(this.tableName);
    if (!this.id) throw new Error('No id specified');
    query.where(this.id.fieldName, '=', id);
    const res = await query.exec(dbName);
    if (res) {
      const entity: any = EntityManager.findEntity(this.tableName, id, context);
      if (entity) EntityManager.removeEntity(entity, context);
    }
    return res;
  }

  private static async generateEntity(
    res: any,
    context?: Context,
    dbName?: string,
  ) {
    const newObj: any = this.create();
    newObj.persisted = true;
    for (const [key, value] of Object.entries(res)) {
      const field: FieldEntity | undefined = this.columns.find(
        (f: FieldEntity) => f.fieldName === key,
      );
      if (field) {
        switch (field.type) {
          case 'date':
          case 'datetime':
          case 'timestamp':
          case 'time':
            newObj[field.key] = new Date(value as any);
            break;
          default:
            newObj[field.key] = value;
        }
      } else {
        newObj[key] = value;
      }
    }
    const entity = EntityManager.findEntity(
      newObj.constructor.tableName,
      newObj[newObj.constructor.id.key],
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
              const relationTable = cur.relationTable;
              if (relationTable) {
                const relations = await new FindQuery(relationTable)
                  .where(
                    `${
                      this.tableName.endsWith('s')
                        ? this.tableName.substr(0, this.tableName.length - 1)
                        : this.tableName
                    }_id`,
                    '=',
                    res[this.id?.fieldName || ''],
                  )
                  .exec(dbName);
                if (relations && relations.length) {
                  newObj.relations.push({
                    entity: cur.entity,
                    data: relations,
                  });
                  newObj[cur.fieldName] = await ent
                    .findMany(context, dbName)
                    .where(
                      ent.id?.fieldName || '',
                      'IN',
                      relations.map(
                        (r: any) =>
                          r[
                            `${
                              ent.tableName.endsWith('s')
                                ? ent.tableName.substr(
                                    0,
                                    ent.tableName.length - 1,
                                  )
                                : ent.tableName
                            }_id`
                          ],
                      ),
                    )
                    .exec(dbName);
                } else {
                  newObj[cur.fieldName] = [];
                }
              }
              break;
            }
            case 'manytoone': {
              if (res[`${cur.fieldName}_id`]) {
                newObj[cur.fieldName] = await ent.findById(
                  res[`${cur.fieldName}_id`],
                  context,
                  dbName,
                );
              }
              break;
            }
            case 'onetomany': {
              newObj[cur.fieldName] = await ent
                .findMany(context)
                .where(
                  `${this.tableName}_id`,
                  '=',
                  res[this.id?.fieldName || ''],
                )
                .exec(dbName);
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
    let column: FieldEntity;
    for (column of base.constructor.columns) {
      if (
        !primaryKeys.includes(column.key) &&
        !(base[column.key] instanceof Array) &&
        typeof base[column.key] !== 'function'
      ) {
        if (
          typeof base[column.key] !== 'object' ||
          typeof base[column.key] === null
        ) {
          query.setAttribute(column.fieldName, base[column.key]);
        } else if (base[column.key] instanceof Date) {
          const field: FieldEntity = base.constructor.columns.find(
            (f: FieldEntity) => f.name === column.name,
          );
          if (field) {
            const d = base[column.key] as Date;
            let formattedD = '';
            switch (field.type) {
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
              query.setAttribute(column.fieldName, formattedD);
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
            const relationTable = relation.relationTable;
            if (relationTable) {
              base[relation.fieldName].forEach((elem: any) => {
                if (
                  elem.persisted &&
                  !relData.includes(elem[elem.constructor.id.key])
                ) {
                  const manyToManyQuery = new CreateQuery(relationTable);
                  const tableName: string = elem.constructor.tableName;
                  manyToManyQuery.setAttribute(
                    `${
                      tableName.endsWith('s')
                        ? tableName.substr(0, tableName.length - 1)
                        : tableName
                    }_id`,
                    elem[elem.constructor.id.key],
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
                  base[relation.fieldName].constructor.id.key
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
        base[base.constructor.id.key] = res;
        EntityManager.addEntity(this, context);
        await manyToManyQueries.reduce(async (prev: any, cur: CreateQuery) => {
          await prev;
          const tableName: string = base.constructor.tableName;
          cur.setAttribute(
            `${
              tableName.endsWith('s')
                ? tableName.substr(0, tableName.length - 1)
                : tableName
            }_id`,
            base[base.constructor.id.key],
          );
          await cur.exec(dbName);
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
    let column: FieldEntity;
    for (column of base.constructor.columns) {
      if (
        !primaryKeys.includes(column.key) &&
        !(base[column.key] instanceof Array) &&
        typeof base[column.key] !== 'function'
      ) {
        if (
          typeof base[column.key] !== 'object' ||
          typeof base[column.key] === null
        ) {
          query.setAttribute(column.fieldName, base[column.key]);
        } else if (base[column.key] instanceof Date) {
          const field: FieldEntity = base.constructor.columns.find(
            (f: FieldEntity) => f.key === column.key,
          );
          if (field) {
            const d = base[column.key] as Date;
            let formattedD = '';
            switch (field.type) {
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
              query.setAttribute(column.fieldName, formattedD);
            }
          }
        }
      }
    }
    if (base.constructor.id) {
      query.where(
        base.constructor.id.fieldName,
        '=',
        base[base.constructor.id.key],
      );
    } else {
      throw new Error('No specified id');
    }
    await base.constructor.relations.reduce(
      async (prev: any, relation: Relationship) => {
        await prev;
        if (base[relation.fieldName]) {
          switch (relation.type) {
            case 'manytomany': {
              const rel = this.relations.find(
                (r: any) => r.entity === relation.entity,
              );
              const relData = rel ? rel.data : [];
              const relationTable = relation.relationTable;
              if (relationTable) {
                const curTableName: string = base.constructor.tableName;
                const curTableField = `${
                  curTableName.endsWith('s')
                    ? curTableName.substr(0, curTableName.length - 1)
                    : curTableName
                }_id`;
                const removeOldQuery = new DeleteQuery(relationTable);
                removeOldQuery.where(
                  curTableField,
                  '=',
                  base[base.constructor.id.key],
                );
                await removeOldQuery.exec(dbName);
                await base[relation.fieldName].reduce(
                  async (previous: any, elem: any) => {
                    await previous;
                    if (
                      elem.persisted &&
                      !relData.includes(elem[elem.constructor.id.key])
                    ) {
                      const tableName: string = elem.constructor.tableName;
                      const tableField = `${
                        tableName.endsWith('s')
                          ? tableName.substr(0, tableName.length - 1)
                          : tableName
                      }_id`;
                      const manyToManyQuery = new CreateQuery(relationTable);

                      manyToManyQuery.setAttribute(
                        tableField,
                        elem[elem.constructor.id.key],
                      );

                      manyToManyQuery.setAttribute(
                        curTableField,
                        base[base.constructor.id.key],
                      );
                      await manyToManyQuery.exec(dbName);
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
                  `${relation.fieldName}_id`,
                  base[relation.fieldName][
                    base[relation.fieldName].constructor.id.key
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
    await base.constructor.relations.reduce(
      async (prev: any, relation: Relationship) => {
        await prev;
        if (relation.type === 'manytomany' && relation.relationTable) {
          const curTableName: string = base.constructor.tableName;
          const curTableField = `${
            curTableName.endsWith('s')
              ? curTableName.substr(0, curTableName.length - 1)
              : curTableName
          }_id`;

          const deleteQuery = new DeleteQuery(relation.relationTable);
          deleteQuery.where(curTableField, '=', base[base.constructor.id.key]);
          await deleteQuery.exec(dbName);
        }
      },
      Promise.resolve(),
    );
    query.where(
      base.constructor.id.fieldName,
      '=',
      base[base.constructor.id.key],
    );
    const res = await query.exec(dbName);
    if (res) {
      EntityManager.removeEntity(this, context);
      return true;
    }
    return false;
  };

  public fetch = async (field: string, context?: Context, dbName?: string) => {
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
            const relationTable = relation.relationTable;
            if (relationTable) {
              const tableName: string = base.constructor.tableName;
              const relations = await new FindQuery(relationTable)
                .where(
                  `${
                    tableName.endsWith('s')
                      ? tableName.substr(0, tableName.length - 1)
                      : tableName
                  }_id`,
                  '=',
                  base[base.constructor.id.key],
                )
                .exec(dbName);
              if (relations && relations.length) {
                this.relations.push({
                  entity: relation.entity,
                  data: relations,
                });
                base[relation.fieldName] = await ent
                  .findMany(context, dbName)
                  .where(
                    ent.id?.fieldName || '',
                    'IN',
                    relations.map(
                      (r: any) =>
                        r[
                          `${
                            ent.tableName.endsWith('s')
                              ? ent.tableName.substr(
                                  0,
                                  ent.tableName.length - 1,
                                )
                              : ent.tableName
                          }_id`
                        ],
                    ),
                  )
                  .exec(dbName);
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
                dbName,
              );
            }
            break;
          }
          case 'onetomany': {
            base[field] = await ent
              .findMany(context, dbName)
              .where(
                `${base.constructor.tableName}_id`,
                '=',
                base[base.constructor.id.key],
              )
              .exec(dbName);
            break;
          }
          default:
        }
      }
    }
  };
}
