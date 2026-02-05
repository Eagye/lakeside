import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'greenhouse_video' })
export class GreenhouseVideoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  url: string;

  @Column()
  createdAt: string;
}
