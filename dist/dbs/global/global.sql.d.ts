import { AttrAndAlias, SortAttribute, WhereAttribute, WhereKeyWord } from '../../entities/querys/query';
import { IJoin } from '../../entities/querys/find.query';
import GlobalModel from './global.db';
export default abstract class GlobalSqlModel extends GlobalModel {
    protected getWhereAttributes: (wheres: any[]) => any[];
    protected computeAttributes: (attributes: AttrAndAlias[]) => string;
    protected computeWhere: (wheres: (WhereAttribute | WhereKeyWord)[], keyword: string, number: boolean, name?: string) => string;
    protected computeJoins: (joins: IJoin[]) => string;
    protected computeGroupBy: (groups: string[]) => string;
    protected computeSort: (sorts: SortAttribute[]) => string;
    private computeJoinWheres;
    private getJoinType;
    private computeAttributeFunction;
    private computeSortMode;
    private isWhereAttribute;
    private computeWhereAttribute;
    private computeWhereKeyWord;
}
