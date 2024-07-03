import { Role } from 'src/enums';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Parent {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  fullName: string;

  @Column()
  age: number;

  @Column({ enum: Role, default: Role.Un })
  role: Role;

  @ManyToOne((type) => User, (user) => user.parents, { lazy: true })
  user: User;
}
