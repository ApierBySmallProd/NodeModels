export declare function Unique(): (target: any, key: string) => void;
export declare function AllowNull(): (target: any, key: string) => void;
export declare function AutoIncrement(): (target: any, key: string) => void;
export declare function PrimaryKey(): (target: any, key: string) => void;
export declare function Default(value: string, isSystem?: boolean): (target: any, key: string) => void;
export declare function Check(value: string): (target: any, key: string) => void;
export declare function ManyToOne(entity: string, autoFetch?: boolean): (target: any, key: string) => void;
export declare function OneToMany(entity: string, autoFetch?: boolean): (target: any, key: string) => void;
export declare function ManyToMany(entity: string, autoFetch?: boolean): (target: any, key: string) => void;
