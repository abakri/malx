import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity({name: 'user'})
export class User extends BaseEntity {
  @Column({type: 'varchar', length: 255, unique: true})
  username: string;

  @Column({type: 'varchar', length: 255})
  access_token: string;

  @Column({type: 'varchar', length: 255})
  refresh_token: string;
}
