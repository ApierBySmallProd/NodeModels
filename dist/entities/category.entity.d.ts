import Entity from './entity';
export default class CategoryEntity extends Entity {
    private id;
    private label;
    private articles;
    constructor(label: string);
    fetchArticles: () => Promise<void>;
}
