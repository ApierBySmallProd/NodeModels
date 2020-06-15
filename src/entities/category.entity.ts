import { AutoCreateNUpdate, Id, Table } from './decorators/other';
import {
  AutoIncrement,
  OneToMany,
  PrimaryKey,
  Unique,
} from './decorators/property';
import { BigInt, Varchar } from './decorators/fieldtype';

import ArticleEntity from './article.entity';
import Entity from './entity';
import EntityManager from './entitymanager';

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
