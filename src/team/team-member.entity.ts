import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'team_members' })
export class TeamMemberEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  imageUrl: string;

  @Column({ default: 0 })
  sortOrder: number;
}
