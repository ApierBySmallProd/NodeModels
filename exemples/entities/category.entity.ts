import {
  AutoCreateNUpdate,
  AutoIncrement,
  BigInt,
  Entity,
  EntityManager,
  Id,
  OneToMany,
  PrimaryKey,
  Table,
  Unique,
  Varchar,
} from '@smallprod/models';

import ArticleEntity from './article.entity';

@Table('category')
@AutoCreateNUpdate()
export default class CategoryEntity extends Entity {
  @Id()
  @PrimaryKey()
  @BigInt()
  @AutoIncrement()
  private id = 0;

  @Varchar(50)
  @Unique()
  private label: string;

  @OneToMany('article')
  private articles: ArticleEntity[] = [];

  constructor(label: string) {
    super();
    this.label = label;
  }

  public fetchArticles = async () => {
    return await this.fetch('articles');
  };
}

EntityManager.registerEntity(CategoryEntity);
