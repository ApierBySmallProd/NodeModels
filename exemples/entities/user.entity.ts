/* Exemple of an entity class */
/* There are some warnings becouse you must enable decorators in your tsconfig file */

import {
  Entity,
  Id,
  NonPersistent,
  PrimaryKey,
  Table,
} from '@smallprod/models';

@Table('user') // This is the table name in which are stored our users
export default class UserEntity extends Entity {
  @Id()
  @PrimaryKey()
  private id = -1; // This attribute is a primary key and is treated has the id for findById(), delete() and update()
  private firstname: string;
  private lastname: string;
  private email: string;
  private birthDate: string;
  @NonPersistent()
  private age: number; // This attribute is not persisted in the table

  constructor(
    firstname: string,
    lastname: string,
    email: string,
    birthDate: string,
  ) {
    super();
    this.firstname = firstname;
    this.lastname = lastname;
    this.email = email;
    this.birthDate = birthDate;
    this.age = 0; // Imagine we compute the age from the birthDate
  }
}
