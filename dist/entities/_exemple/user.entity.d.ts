import Entity from '../entity';
export default class UserEntity extends Entity {
    static titi(): boolean;
    private static toto;
    private id;
    private email;
    private createdAt;
    private age;
    private someProperty;
    constructor(email: string, age: number);
    getEmail: () => string;
    setEmail: (email: string) => void;
    setId(id: number): void;
}
