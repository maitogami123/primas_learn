import { Parent } from 'src/parent/entities/parent.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  socialId: string;

  @Column()
  fixedAddress: string;

  @Column()
  address: string;

  @OneToMany(() => Parent, (parent) => parent.user)
  parents: Parent[];
}
