import {
  AutoCreateNUpdate,
  Entity,
  Field,
  OneToMany,
  Table,
} from '../../../..';

import ArticleEntity from './article.entity';

@AutoCreateNUpdate()
@Table('categories')
export default class CategoryEntity extends Entity {
  @Field({
    type: 'bigint',
    autoIncrement: true,
    id: true,
    name: 'id',
    primary: true,
  })
  private id = 0;

  @Field({
    type: {
      type: 'varchar',
      length: 50,
    },
    unique: true,
  })
  private label: string;

  @OneToMany('articles', false)
  private articles: ArticleEntity[] = [];

  public constructor(label: string) {
    super();
    this.label = label;
  }

  public fetchArticles = async () => {
    return await this.fetch('articles');
  };

  public getId = () => this.id;
  public getLabel = () => this.label;

  public setLabel = (label: string) => (this.label = label);
}
