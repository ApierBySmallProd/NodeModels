import Entity, { Id, NonPersistent, PrimaryKey, Table } from '../entity';

@Table('user')
export default class UserEntity extends Entity {
  public static titi() {
    return false;
  }

  private static toto = () => {
    return true;
  };

  @Id()
  @PrimaryKey()
  private id = -1;
  private email: string;
  @NonPersistent()
  private createdAt = '';
  private age: number;

  @NonPersistent()
  private someProperty = '120';

  constructor(email: string, age: number) {
    super();
    this.email = email;
    this.age = age;
  }

  public getEmail = () => {
    return this.email;
  };

  public setEmail = (email: string) => {
    this.email = email;
  };

  public setId(id: number) {
    this.id = id;
  }
}
