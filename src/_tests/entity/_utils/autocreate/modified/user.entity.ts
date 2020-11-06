import {
  AllowNull,
  AutoCreateNUpdate,
  AutoIncrement,
  BigInt,
  Date,
  Entity,
  FieldName,
  Id,
  ManyToMany,
  NonPersistent,
  PrimaryKey,
  Table,
  Unique,
  Varchar,
} from '../../../../..';

import ArticleEntity from './article.entity';

@AutoCreateNUpdate()
@Table('users')
export default class UserEntity extends Entity {
  @Id()
  @PrimaryKey()
  @AutoIncrement()
  @BigInt()
  private id = -1; // This attribute is a primary key and is treated has the id for findById(), delete() and update()
  @Varchar(50)
  private firstname: string;
  @Varchar(50)
  private lastname: string;
  @Varchar(50)
  @Unique()
  private email: string;
  @Date()
  @AllowNull()
  @FieldName('birthdate')
  private birthDate: Date;
  @NonPersistent()
  private age: number; // This attribute is not persisted in the table

  @ManyToMany('articles', 'article_authors', true) // The second parameter specifies if the ORM should always fetch articles or not
  private articles: ArticleEntity[] = [];

  public constructor(
    firstname: string,
    lastname: string,
    email: string,
    birthDate: Date,
  ) {
    super();
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.birthDate = birthDate;
    this.age = 0; // Imagine we compute the age from the birthDate
  }

  public addArticle = (article: ArticleEntity) => this.articles.push(article);

  public getId = () => this.id;
  public getArticles = () => this.articles;
}
