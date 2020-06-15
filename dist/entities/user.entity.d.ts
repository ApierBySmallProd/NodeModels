import ArticleEntity from './article.entity';
import Entity from './entity';
export default class UserEntity extends Entity {
    private id;
    private firstname;
    private lastname;
    private email;
    private birthDate;
    private age;
    private articles;
    constructor(firstname: string, lastname: string, email: string, birthDate: Date);
    addArticle: (article: ArticleEntity) => void;
}
