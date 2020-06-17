/* Exemple of an entity class */
/* There are some warnings becouse you must enable decorators in your tsconfig file */

import {
  AllowNull,
  AutoCreateNUpdate,
  AutoIncrement,
  BigInt,
  Date,
  Entity,
  EntityManager,
  Id,
  ManyToMany,
  NonPersistent,
  PrimaryKey,
  Table,
  Unique,
  Varchar,
} from '@smallprod/models';

import ArticleEntity from './article.entity';

@Table('user') // This is the table name in which are stored our users
@AutoCreateNUpdate()
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
  private birthDate: Date;
  @NonPersistent()
  private age: number; // This attribute is not persisted in the table

  @ManyToMany('article', true) // The second parameter specifies if the ORM should always fetch articles or not
  private articles: ArticleEntity[] = [];

  constructor(
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

  public addArticle = (article: ArticleEntity) => {
    this.articles.push(article);
  };
}

EntityManager.registerEntity(UserEntity); // This is really important but it can also be done with EntityManager.registerEntities([all your entities]) wich can be easier
