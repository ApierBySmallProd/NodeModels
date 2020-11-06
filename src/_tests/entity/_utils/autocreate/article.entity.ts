import {
  AutoCreateNUpdate,
  AutoIncrement,
  BigInt,
  Check,
  Date,
  Default,
  Entity,
  EntityContext,
  FieldName,
  Id,
  Int,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Table,
  Varchar,
} from '../../../..';

import CategoryEntity from './category.entity';
import UserEntity from './user.entity';

@AutoCreateNUpdate()
@Table('articles')
export default class ArticleEntity extends Entity {
  @Id()
  @PrimaryKey()
  @BigInt()
  @AutoIncrement()
  private id = 0;

  @Varchar(50)
  private title: string;

  @Date()
  @FieldName('publishedat')
  private publishedAt: Date;

  @Int()
  @Check('> 0')
  @Default('10')
  @FieldName('nbpages')
  private nbPages: number;

  @ManyToMany('users', 'article_authors', false)
  private authors: UserEntity[] = [];

  @ManyToOne('categories', true)
  private category: CategoryEntity | null = null;

  public constructor(
    title: string,
    publishedAt: Date,
    nbPages: number,
    category: CategoryEntity,
    authors: UserEntity[] = [],
  ) {
    super();
    this.title = title;
    this.publishedAt = publishedAt;
    this.nbPages = nbPages;
    this.category = category;
    this.authors = authors;
  }

  public getId = () => this.id;
  public getCategory = () => this.category;
  public getAuthors = () => this.authors;

  public setCategory = (category: CategoryEntity) => (this.category = category);
  public setAuthors = (authors: UserEntity[]) => (this.authors = authors);

  public fetchAuthors = (context: EntityContext, dbName: string) =>
    this.fetch('authors', context, dbName);
}
