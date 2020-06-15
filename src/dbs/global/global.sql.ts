import {
  AttrAndAlias,
  SortAttribute,
  WhereAttribute,
  WhereKeyWord,
} from '../../entities/querys/query';

import GlobalModel from './global.db';

export default abstract class GlobalSqlModel extends GlobalModel {
  protected getWhereAttributes = (wheres: any[]) => {
    const newWheres: WhereAttribute[] = wheres.filter((w) =>
      this.isWhereAttribute(w),
    );
    return newWheres.map((w) => w.value);
  };

  protected computeAttributes = (attributes: AttrAndAlias[]) => {
    if (!attributes.length) return ' *';
    const query = attributes.map(
      (a) =>
        `${
          a.function
            ? `${this.computeAttributeFunction(a)}(\`${a.attribute}\`)${
                a.alias ? ` AS ${a.alias}` : ''
              }`
            : `\`${a.attribute}\`${a.alias ? ` AS ${a.alias}` : ''}`
        }`,
    );
    return ` ${query}`;
  };

  protected computeWhere = (
    wheres: (WhereAttribute | WhereKeyWord)[],
    keyword: string,
    number: boolean,
  ) => {
    let where = wheres.length ? ' WHERE ' : '';
    const alias = {
      keyword,
      number,
      nb: 0,
    };
    wheres.forEach((w) => {
      if (this.isWhereAttribute(w)) {
        w = w as WhereAttribute;
        where = `${where} ${this.computeWhereAttribute(w, alias)}`;
      } else {
        w = w as WhereKeyWord;
        where = `${where} ${this.computeWhereKeyWord(w)}`;
      }
    });
    return where;
  };

  protected computeSort = (sorts: SortAttribute[]) => {
    const sortsString = sorts
      .map((s) => `\`${s.attribute}\` ${this.computeSortMode(s)}`)
      .join(', ');
    return sorts.length ? ` ORDER BY ${sortsString}` : '';
  };

  private computeAttributeFunction = (attribute: AttrAndAlias) => {
    switch (attribute.function) {
      case 'AVG': {
        return 'AVG';
      }
      case 'COUNT': {
        return 'COUNT';
      }
      case 'MAX': {
        return 'MAX';
      }
      case 'MIN': {
        return 'MIN';
      }
      case 'SUM': {
        return 'SUM';
      }
      default: {
        throw new Error(`Unknown function ${attribute.function}`);
      }
    }
  };

  private computeSortMode = (sort: SortAttribute) => {
    switch (sort.mode) {
      case 'ASC': {
        return 'ASC';
      }
      case 'DESC': {
        return 'DESC';
      }
      default: {
        throw new Error(`Unkonwn sort mode ${sort.mode}`);
      }
    }
  };

  private isWhereAttribute = (where: any) => {
    return 'operator' in where;
  };

  private computeWhereAttribute = (attribute: WhereAttribute, alias: any) => {
    switch (attribute.operator) {
      case '<': {
        alias.nb += 1;
        return `\`${attribute.column}\` < ${alias.keyword}${
          alias.number ? alias.nb : ''
        }`;
      }
      case '<=': {
        alias.nb += 1;
        return `\`${attribute.column}\` <= ${alias.keyword}${
          alias.number ? alias.nb : ''
        }`;
      }
      case '<>': {
        alias.nb += 1;
        return `\`${attribute.column}\` <> ${alias.keyword}${
          alias.number ? alias.nb : ''
        }`;
      }
      case '=': {
        alias.nb += 1;
        return `\`${attribute.column}\` = ${alias.keyword}${
          alias.number ? alias.nb : ''
        }`;
      }
      case '>': {
        alias.nb += 1;
        return `\`${attribute.column}\` > ${alias.keyword}${
          alias.number ? alias.nb : ''
        }`;
      }
      case '>=': {
        alias.nb += 1;
        return `\`${attribute.column}\` >= ${alias.keyword}${
          alias.number ? alias.nb : ''
        }`;
      }
      case 'BETWEEN': {
        alias.nb += 2;
        return `\`${attribute.column}\` BETWEEN ${alias.keyword}${
          alias.number ? alias.nb : ''
        } AND ${alias.keyword}${alias.number ? alias.nb : ''}`;
      }
      case 'IN': {
        return `\`${attribute.column}\` IN (${attribute.value
          .map(() => {
            alias.nb += 1;
            return `${alias.keyword}${alias.number ? alias.nb : ''}`;
          })
          .join(', ')})`;
      }
      case 'LIKE': {
        alias.nb += 1;
        return `\`${attribute.column}\` LIKE ${alias.keyword}${
          alias.number ? alias.nb : ''
        }`;
      }
      default: {
        throw new Error(`Invalid operator ${attribute.operator}`);
      }
    }
  };

  private computeWhereKeyWord = (keyword: WhereKeyWord) => {
    switch (keyword.keyword) {
      case 'AND': {
        return ' AND ';
      }
      case 'OR': {
        return ' OR ';
      }
      case 'NOT': {
        return 'NOT';
      }
      case 'STARTGROUP': {
        return ' ( ';
      }
      case 'ENDGROUP': {
        return ' ) ';
      }
      default: {
        throw new Error(`Invalid keyword ${keyword.keyword}`);
      }
    }
  };
}
