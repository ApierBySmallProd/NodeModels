import {
  AutoCreateNUpdate,
  AutoIncrement,
  BigInt,
  Date,
  Entity,
  EntityManager,
  Id,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Table,
  Varchar,
} from '@smallprod/models';

import CategoryEntity from './category.entity';
import UserEntity from './user.entity';
import { Field } from '@smallprod/models/migration/types/createtable';

@Table('article')
@AutoCreateNUpdate()
export default class ArticleEntity extends Entity {
  @Id()
  @PrimaryKey()
  @BigInt()
  @AutoIncrement()
  @FieldName('article_id')
  @Field({
    name: 'article_id',
    type: 'BigInt',
    primary: true,
    autoIncrement: true,
    id: true,
  })
  private id = 0;

  @Varchar(50)
  private title: string;

  @Date()
  private publishedAt: Date;

  @ManyToMany('user', true)
  private authors: UserEntity[] = [];

  @ManyToOne('category')
  private category: CategoryEntity | null = null;

  constructor(title: string, publishedAt: Date, category: CategoryEntity) {
    super();
    this.title = title;
    this.publishedAt = publishedAt;
    this.category = category;
  }

  public fetchAuthors = async () => {
    return await this.fetch('authors');
  };

  public fetchCategory = async () => {
    return await this.fetch('category');
  };
}

EntityManager.registerEntity(ArticleEntity);
