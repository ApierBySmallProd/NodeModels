/* Exemple of an entity class */
/* There are some warnings becouse you must enable decorators in your tsconfig file */

import {
  AllowNull,
  AutoIncrement,
  ManyToMany,
  PrimaryKey,
  Unique,
} from './decorators/property';
import {
  AutoCreateNUpdate,
  Id,
  NonPersistent,
  Table,
} from './decorators/other';
import { BigInt, Date, Varchar } from './decorators/fieldtype';

import ArticleEntity from './article.entity';
import Entity from './entity';
import EntityManager from './entitymanager';

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

  @ManyToMany('article', true)
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

EntityManager.registerEntity(UserEntity);
