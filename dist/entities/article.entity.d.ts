import CategoryEntity from './category.entity';
import Entity from './entity';
export default class ArticleEntity extends Entity {
    private id;
    private title;
    private publishedAt;
    private authors;
    private category;
    constructor(title: string, publishedAt: Date, category: CategoryEntity);
    fetchAuthors: () => Promise<void>;
    fetchCategory: () => Promise<void>;
}
